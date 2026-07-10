import React, { useEffect, useState } from 'react';
import { API } from '../../shared/apiClient';

export default function RiskFrequency() {
  const [freq, setFreq] = useState({});

  useEffect(() => {
    API.get('/analytics/risk-frequency').then(setFreq);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Risk Pattern Frequency</h2>
      <pre>{JSON.stringify(freq, null, 2)}</pre>
    </div>
  );
}
