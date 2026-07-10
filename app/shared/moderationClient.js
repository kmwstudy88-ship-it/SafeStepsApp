import { API } from './apiClient';

export async function checkModeration(text) {
  const res = await API.post('/moderation/check', { text });
  return res;
}
