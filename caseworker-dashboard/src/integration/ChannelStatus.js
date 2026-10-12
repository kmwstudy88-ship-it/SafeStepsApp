import React, { useEffect, useState } from 'react';
import { loadChannels } from '../../integration/loadChannels';

export default function ChannelStatus() {
  const [channels, setChannels] = useState([]);

  async function refresh() {
    const data = await loadChannels();
    setChannels(data);
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Channel Status</h2>

      {channels.map((ch) => (
        <div key={ch.id} style={{ marginBottom: 15, padding: 10, border: '1px solid #ccc' }}>
          <p><strong>Channel ID:</strong> {ch.id}</p>
          <p><strong>Child:</strong> {ch.childId}</p>
          <p><strong>Parent:</strong> {ch.parentId}</p>
          <p><strong>State:</strong> {ch.state}</p>
        </div>
      ))}
    </div>
  );
}
