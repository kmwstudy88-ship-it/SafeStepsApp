import { API } from '../../shared/apiClient';

export async function loadChannels() {
  const res = await API.get('/channels');
  return res.channels;
}
