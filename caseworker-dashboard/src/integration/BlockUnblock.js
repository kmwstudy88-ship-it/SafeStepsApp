import React, { useEffect, useState } from 'react';
import { loadChannels } from '../../integration/loadChannels';
import { blockChannel } from '../../integration/blockChannel';
import { unblockChannel } from '../../integration/unblockChannel';

export default function BlockUnblock() {
  const [channels, setChannels] = useState([]);

  async function refresh() {
    const data = await loadChannels();
    setChannels(data);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleBlock(id) {
    await blockChannel(id, 'Caseworker manual block');
    refresh();
  }

  async function handleUnblock(id) {
    await unblockChannel(id);
    refresh();
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Block / Unblock Channels</h2>

      {channels.map((ch) => (
        <div key={ch.id} style={{ marginBottom: 15, padding: 10, border: '1px solid #ccc' }}>
          <p><strong>Channel ID:</strong> {ch.id}</p>
          <p><strong>State:</strong> {ch.state}</p>

          {ch.state !== 'ACTIVE' ? (
            <button onClick={() => handleUnblock(ch.id)}>Unblock</button>
          ) : (
            <button onClick={() => handleBlock(ch.id)}>Block</button>
          )}
        </div>
      ))}
    </div>
  );
}
