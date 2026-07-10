import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList } from 'react-native';
import { loadMessages } from '../../messaging/integration/loadMessages';
import { sendMessage } from '../../messaging/integration/sendMessage';
import { loadChannelState } from '../../messaging/integration/loadChannelState';
import { isBlocked, isPaused } from '../../shared/channelState';

export default function ParentMessagingScreen({ route }) {
  const { channelId, parentId, childId } = route.params;

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
    const res = await sendMessage(channelId, parentId, childId, text);

    if (res.status === 'blocked') {
      alert('Message could not be sent due to communication guidelines.');
    }

    setText('');
    refresh();
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22 }}>Parent Messaging</Text>

      {isBlocked(state) && (
        <Text style={{ color: 'red' }}>
          Messaging is currently blocked.
        </Text>
      )}

      {isPaused(state) && (
        <Text style={{ color: 'orange' }}>
          Messaging is paused.
        </Text>
      )}

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text style={{ marginVertical: 5 }}>
            {item.fromUserId === parentId ? 'You: ' : 'Child: '}
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
