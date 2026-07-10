import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList } from 'react-native';
import { loadMessages } from '../../messaging/integration/loadMessages';
import { sendMessage } from '../../messaging/integration/sendMessage';
import { loadChannelState } from '../../messaging/integration/loadChannelState';
import { toggleMessaging } from '../../messaging/integration/toggleMessaging';
import { isPaused, isBlocked } from '../../shared/channelState';

export default function ChildMessagingScreen({ route }) {
  const { channelId, childId, parentId } = route.params;

  const [messages, setMessages] = useState([]);
  const [state, setState] = useState('ACTIVE');
  const [text, setText] = useState('');

  async function refresh() {
    const msgs = await loadMessages(channelId);
    const st = await loadChannelState(channelId);

    setMessages(msgs);
    setState(st);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleSend() {
    const res = await sendMessage(channelId, childId, parentId, text);

    if (res.status === 'blocked') {
      alert('Message blocked for safety.');
    }

    setText('');
    refresh();
  }

  async function handleToggle() {
    const enabled = state !== 'CHILD_PAUSED';
    await toggleMessaging(channelId, !enabled, childId);
    refresh();
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22 }}>Child Messaging</Text>

      {isBlocked(state) && (
        <Text style={{ color: 'red' }}>
          Messaging is blocked for safety.
        </Text>
      )}

      {isPaused(state) && (
        <Text style={{ color: 'orange' }}>
          You paused messaging. Turn it back on when ready.
        </Text>
      )}

      <Button
        title={state === 'CHILD_PAUSED' ? 'Resume Messaging' : 'Pause Messaging'}
        onPress={handleToggle}
      />

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text style={{ marginVertical: 5 }}>
            {item.fromUserId === childId ? 'You: ' : 'Parent: '}
            {item.body}
          </Text>
        )}
      />

      {!isBlocked(state) && !isPaused(state) && (
        <>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder='Type message...'
            style={{
              borderWidth: 1,
              padding: 10,
              marginVertical: 10
            }}
          />
          <Button title='Send' onPress={handleSend} />
        </>
      )}
    </View>
  );
}
