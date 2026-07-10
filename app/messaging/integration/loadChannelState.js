import { API } from '../../shared/apiClient';

export async function loadChannelState(channelId) {
  const res = await API.get(/channels/);
  return res.state;
}
