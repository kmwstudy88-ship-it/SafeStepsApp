import React from 'react';
import ChildMessagingScreen from './screens/child/ChildMessagingScreen';

export default function App() {
  return <ChildMessagingScreen route={{ params: { channelId: 'chan-001', childId: 'child-123', parentId: 'parent-456' } }} />;
}
