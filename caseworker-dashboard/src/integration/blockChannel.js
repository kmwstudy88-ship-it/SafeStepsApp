import { API } from '../../shared/apiClient';

export async function blockChannel(channelId, reason = 'Unsafe communication') {
  const res = await API.patch(/channels//block, {
    reason,
    changedBy: 'caseworker'
  });

  return res;
}
