import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "yzxotxbwgxnxemkzigse";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6eG90eGJ3Z3hueGVta3ppZ3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4NjcyMDMsImV4cCI6MjA5NzQ0MzIwM30.HnxyBE-mCACCp0IEzb8jUVGou2Fsgax238t7K88Xb8k";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export class SupabaseCurriculumEngine {
  constructor(userId) {
    this.userId = userId;
  }

  async init(defaultCurriculum) {
    const { data, error } = await supabase
      .from('user_curriculum_progress')
      .select('curriculum_data')
      .eq('user_id', this.userId)
      .single();

    if (error || !data) {
      // If no progress exists yet, insert default template
      const { data: inserted, error: insertError } = await supabase
        .from('user_curriculum_progress')
        .upsert({ user_id: this.userId, curriculum_data: defaultCurriculum })
        .select('curriculum_data')
        .single();
      
      if (insertError) {
        console.error("Error initializing progress:", insertError);
        return defaultCurriculum;
      }
      return inserted.curriculum_data;
    }

    return data.curriculum_data;
  }

  // Real-time listener using Supabase Channels
  subscribe(onUpdate) {
    return supabase
      .channel('public:user_curriculum_progress')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_curriculum_progress',
          filter: `user_id=eq.${this.userId}`,
        },
        (payload) => {
          if (payload.new && payload.new.curriculum_data) {
            onUpdate(payload.new.curriculum_data);
          }
        }
      )
      .subscribe();
  }

  async completeStep(currentCurriculum, moduleId, stepId) {
    const modules = [...currentCurriculum.modules];
    const module = modules.find(m => m.moduleId === moduleId);
    if (!module || module.status === 'locked') return;

    const step = module.steps.find(s => s.stepId === stepId);
    if (step) {
      step.completed = true;
      
      // Check if all steps in module are completed
      const allDone = module.steps.every(s => s.completed);
      if (allDone) {
        module.status = 'completed';
        const currentIndex = modules.findIndex(m => m.moduleId === module.moduleId);
        if (currentIndex + 1 < modules.length) {
          modules[currentIndex + 1].status = 'in_progress';
        }
      }

      const updatedCurriculum = { ...currentCurriculum, modules };

      // Push update to Supabase
      const { error } = await supabase
        .from('user_curriculum_progress')
        .upsert({ 
          user_id: this.userId, 
          curriculum_data: updatedCurriculum,
          updated_at: new Date()
        });

      if (error) {
        console.error("Failed to update step progress:", error);
      }
    }
  }

  getProgressPercentage(curriculumData) {
    if (!curriculumData || !curriculumData.modules) return 0;
    let totalSteps = 0;
    let completedSteps = 0;
    
    curriculumData.modules.forEach(m => {
      m.steps.forEach(s => {
        totalSteps++;
        if (s.completed) completedSteps++;
      });
    });

    return totalSteps === 0 ? 0 : Math.round((completedSteps / totalSteps) * 100);
  }
}