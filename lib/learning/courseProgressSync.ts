import Constants from 'expo-constants';
import {
  CourseProgress,
  getCourseCompletionPercentage,
} from './courseProgress';
import { UNDERSTANDING_HARM_COURSE } from './understandingHarmCourse';

export type ProgressSyncResult =
  | { status: 'synced'; message: string }
  | { status: 'local_only'; message: string }
  | { status: 'not_enrolled'; message: string }
  | { status: 'error'; message: string };

function hasSupabaseConfiguration(): boolean {
  return Boolean(
    Constants.expoConfig?.extra?.supabaseUrl ??
      process.env.EXPO_PUBLIC_SUPABASE_URL,
  );
}

function createReference(userId: string): string {
  return `self-${userId}-${Date.now()}`;
}

export async function syncCourseProgress(
  progress: CourseProgress,
): Promise<ProgressSyncResult> {
  if (!hasSupabaseConfiguration()) {
    return {
      status: 'local_only',
      message: 'Saved on this device. Sign in to sync course progress.',
    };
  }

  try {
    const { supabase } = require('../supabaseClient');
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        status: 'local_only',
        message: 'Saved on this device. Sign in to sync course progress.',
      };
    }

    const { data: course, error: courseError } = await supabase
      .from('learning_courses')
      .select('id')
      .eq('course_code', progress.courseId)
      .eq('course_version', 1)
      .maybeSingle();

    if (courseError) throw courseError;
    if (!course) {
      return {
        status: 'not_enrolled',
        message: 'Saved on this device. The online course is not available yet.',
      };
    }

    let { data: enrolment, error: enrolmentError } = await supabase
      .from('learning_enrolments')
      .select('id, assigned_by_user_id')
      .eq('user_id', user.id)
      .eq('course_id', course.id)
      .in('status', ['active', 'completed'])
      .order('enrolled_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (enrolmentError) throw enrolmentError;

    if (!enrolment) {
      const { data: newEnrolment, error: insertError } = await supabase
        .from('learning_enrolments')
        .insert({
          enrolment_reference: createReference(user.id),
          user_id: user.id,
          course_id: course.id,
          enrolment_type: 'voluntary',
          status: 'active',
        })
        .select('id, assigned_by_user_id')
        .single();
      if (insertError) throw insertError;
      enrolment = newEnrolment;
    }

    const latestAssessment =
      progress.assessmentAttempts[progress.assessmentAttempts.length - 1];
    const completionPercentage = getCourseCompletionPercentage(
      UNDERSTANDING_HARM_COURSE,
      progress,
    );

    const { error: progressError } = await supabase
      .from('learning_course_progress')
      .upsert(
        {
          enrolment_id: enrolment.id,
          course_id: course.id,
          lesson_count: UNDERSTANDING_HARM_COURSE.sections.length,
          required_lesson_count: UNDERSTANDING_HARM_COURSE.sections.length,
          completed_lesson_count: progress.completedLessonIds.length,
          completed_required_lesson_count: progress.completedLessonIds.length,
          completion_percentage: completionPercentage,
          status: completionPercentage === 100 ? 'completed' : 'in_progress',
          completed_at: progress.completedAt,
          assessment_score_percentage: latestAssessment?.score ?? null,
          assessment_passed: latestAssessment?.passed ?? false,
          assessment_attempts: progress.assessmentAttempts.length,
          result_source: 'client_reported_unverified',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'enrolment_id,course_id' },
      );
    if (progressError) throw progressError;

    const consentedAt = progress.shareWithPractitioner
      ? new Date().toISOString()
      : null;
    const { error: consentError } = await supabase
      .from('learning_progress_sharing_consents')
      .upsert(
        {
          enrolment_id: enrolment.id,
          user_id: user.id,
          share_with_assigned_practitioner:
            progress.shareWithPractitioner &&
            Boolean(enrolment.assigned_by_user_id),
          consented_at: consentedAt,
          withdrawn_at: progress.shareWithPractitioner
            ? null
            : new Date().toISOString(),
        },
        { onConflict: 'enrolment_id' },
      );
    if (consentError) throw consentError;

    return {
      status: 'synced',
      message:
        progress.shareWithPractitioner && enrolment.assigned_by_user_id
          ? 'Progress synced and visible to your assigned practitioner.'
          : 'Progress synced privately to your account.',
    };
  } catch (error) {
    console.error('[courseProgressSync] Unable to sync learning progress', error);
    return {
      status: 'error',
      message:
        'Saved on this device, but online sync failed. Check your connection and try again.',
    };
  }
}
