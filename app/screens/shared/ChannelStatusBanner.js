import React from 'react';
import { View, Text } from 'react-native';
import { isPaused, isBlocked } from '../../shared/channelState';

export default function ChannelStatusBanner({ state }) {
  if (isBlocked(state)) {
    return (
      <View style={{ padding: 10, backgroundColor: '#ffcccc' }}>
        <Text style={{ color: 'red' }}>
          Messaging is blocked for safety.
        </Text>
      </View>
    );
  }

  if (isPaused(state)) {
    return (
      <View style={{ padding: 10, backgroundColor: '#fff3cd' }}>
        <Text style={{ color: '#856404' }}>
          Messaging is paused.
        </Text>
      </View>
    );
  }

  return null;
}
