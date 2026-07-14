import React, { useEffect, useState } from 'react';
import { loadFlagged } from '../../integration/loadFlagged';

export default function FlaggedMessages() {
  const [flags, setFlags] = useState([]);

  async function refresh() {
    const data = await loadFlagged();
    setFlags(data);
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Flagged Messages</h2>

      {flags.length === 0 && <p>No flagged messages.</p>}

      {flags.map((msg) => (
        <div key={msg.id} style={{ marginBottom: 15, padding: 10, border: '1px solid #ccc' }}>
          <p><strong>From:</strong> {msg.fromUserId}</p>
          <p><strong>To:</strong> {msg.toUserId}</p>
          <p><strong>Message:</strong> {msg.body}</p>
          <p><strong>Tier:</strong> {msg.moderationTier}</p>
          <p><strong>Matched Patterns:</strong> {JSON.stringify(msg.rulesMatched)}</p>
        </div>
      ))}
    </div>
  );
}
