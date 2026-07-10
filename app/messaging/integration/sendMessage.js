import { API } from '../../shared/apiClient';

export async function sendMessage(channelId, fromUserId, toUserId, body) {
  const res = await API.post('/messages', {
    channelId,
    fromUserId,
    toUserId,
    body
  });

  return res;
}
