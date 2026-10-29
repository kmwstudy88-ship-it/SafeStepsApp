import React, { useState, useEffect } from 'react';
import { initialCurriculum } from './curriculumData';
import { SupabaseCurriculumEngine } from './supabaseCurriculumEngine';

const engine = new SupabaseCurriculumEngine("user_safety_app_01");

export default function SupabaseCurriculumDashboard() {
  const [state, setState] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    async function initApp() {
      const data = await engine.init(initialCurriculum);
      setState(data);
      setProgress(engine.getProgressPercentage(data));

      const sub = engine.subscribe((updated) => {
        setState(updated);
        setProgress(engine.getProgressPercentage(updated));
      });

      return () => sub.unsubscribe();
    }
    initApp();
  }, []);

  const handleToggleStep = async (moduleId, stepId) => {
    await engine.completeStep(state, moduleId, stepId);
  };

  if (!state) return <div style={{ padding: '20px' }}>Loading Facilitator from Supabase...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '650px', fontFamily: 'sans-serif' }}>
      <h2>{state.title}</h2>
      <p style={{ fontSize: '12px', color: '#3f51b5' }}>⚡ Supabase Connected & Synchronized</p>
      
      {/* Progress Bar */}
      <div style={{ background: '#eee', borderRadius: '8px', overflow: 'hidden', margin: '15px 0' }}>
        <div style={{ width: `${progress}%`, background: '#3f51b5', height: '16px', transition: 'width 0.3s ease' }} />
      </div>
      <p style={{ fontSize: '14px', color: '#666' }}>Overall Progress: {progress}% Complete</p>
      
      {/* Badges Section */}
      <div style={{ margin: '20px 0', padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
        <h4>🏅 Unlocked Badges</h4>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
          {state.achievements?.map((badge) => (
            <div key={badge.id} style={{ 
              padding: '8px 12px', 
              background: badge.unlocked ? '#e8f5e9' : '#e0e0e0', 
              color: badge.unlocked ? '#2e7d32' : '#9e9e9e',
              border: `1px solid ${badge.unlocked ? '#a5d6a7' : '#bdbdbd'}`,
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 'bold'
            }}>
              {badge.title}
            </div>
          ))}
        </div>
      </div>

      <hr style={{ margin: '20px 0', border: '0', borderTop: '1px solid #ddd' }} />

      {/* Modules List */}
      {state.modules.map((mod) => (
        <div key={mod.moduleId} style={{ 
          opacity: mod.status === 'locked' ? 0.5 : 1,
          border: '1px solid #ccc', 
          borderRadius: '8px', 
          padding: '15px', 
          marginBottom: '15px',
          background: mod.status === 'locked' ? '#f9f9f9' : '#fff'
        }}>
          <h3>{mod.title} <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#666' }}>({mod.status})</span></h3>
          
          <ul style={{ listStyle: 'none', padding: 0, marginTop: '10px' }}>
            {mod.steps.map((step) => (
              <li key={step.stepId} style={{ margin: '8px 0', display: 'flex', alignItems: 'center' }}>
                <input 
                  type="checkbox"
                  checked={step.completed}
                  disabled={mod.status === 'locked'}
                  onChange={() => handleToggleStep(mod.moduleId, step.stepId)}
                  style={{ marginRight: '10px', transform: 'scale(1.2)' }}
                />
                <span style={{ textDecoration: step.completed ? 'line-through' : 'none', color: step.completed ? '#888' : '#000' }}>
                  {step.title}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {/* Activity / Notification Feed */}
      {state.notifications?.length > 0 && (
        <div style={{ marginTop: '25px', padding: '15px', background: '#fffde7', border: '1px solid #fff59d', borderRadius: '8px' }}>
          <h4>🔔 Recent Activity Feed</h4>
          <ul style={{ paddingLeft: '20px', margin: '10px 0 0 0', fontSize: '13px', color: '#555' }}>
            {state.notifications.map((note) => (
              <li key={note.id} style={{ margin: '4px 0' }}>{note.text} <span style={{ fontSize: '11px', color: '#999' }}>({note.time})</span></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}