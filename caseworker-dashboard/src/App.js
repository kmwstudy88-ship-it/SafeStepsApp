import React from 'react';
import FlaggedMessages from './pages/flags/FlaggedMessages';
import ChannelStatus from './pages/channels/ChannelStatus';
import BlockUnblock from './pages/channels/BlockUnblock';
import ModerationRules from './pages/rules/ModerationRules';
import AuditLogs from './pages/audit/AuditLogs';

export default function App() {
  return (
    <div style={{ padding: 20 }}>
      <h1>SafeSteps Caseworker Dashboard</h1>

      <FlaggedMessages />
      <ChannelStatus />
      <BlockUnblock />
      <ModerationRules />
      <AuditLogs />
    </div>
  );
}
