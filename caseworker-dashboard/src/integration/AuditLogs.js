import React, { useEffect, useState } from 'react';
import { loadAuditLogs } from '../../integration/loadAuditLogs';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);

  async function refresh() {
    const data = await loadAuditLogs();
    setLogs(data);
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Audit Logs</h2>

      {logs.map((log) => (
        <div key={log.id} style={{ marginBottom: 15, padding: 10, border: '1px solid #ccc' }}>
          <p><strong>Event:</strong> {log.event}</p>
          <p><strong>Details:</strong> {log.details}</p>
          <p><strong>Timestamp:</strong> {log.createdAt}</p>
        </div>
      ))}
    </div>
  );
}
