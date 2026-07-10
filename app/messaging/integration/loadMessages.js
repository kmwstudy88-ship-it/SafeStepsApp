import { API } from '../../shared/apiClient';

export async function loadMessages(channelId) {
  const res = await API.get(`/channels/${channelId}/messages`);
  return res.messages;
}
