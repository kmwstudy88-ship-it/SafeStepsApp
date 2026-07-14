import React, { useEffect, useState } from 'react';
import { API } from '../../shared/apiClient';

export default function CurriculumViewer({ tier }) {
  const [weeks, setWeeks] = useState([]);

  useEffect(() => {
    API.get(/curriculum-full/).then(setWeeks);
  }, [tier]);

  return (
    <div style={{ padding: 20 }}>
      <h2>12-Week Curriculum (Tier {tier})</h2>
      {weeks.map((w) => (
        <div key={w.week} style={{ marginBottom: 20 }}>
          <h3>Week {w.week}</h3>
          <p><strong>Child Tasks:</strong></p>
          <ul>{w.childTasks.map((t, i) => <li key={i}>{t}</li>)}</ul>
          <p><strong>Parent Tasks:</strong></p>
          <ul>{w.parentTasks.map((t, i) => <li key={i}>{t}</li>)}</ul>
          <p><strong>Caseworker Tasks:</strong></p>
          <ul>{w.caseworker.map((t, i) => <li key={i}>{t}</li>)}</ul>
        </div>
      ))}
    </div>
  );
}
