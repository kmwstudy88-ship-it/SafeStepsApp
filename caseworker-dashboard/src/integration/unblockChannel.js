import { API } from '../../shared/apiClient';

export async function unblockChannel(channelId) {
  const res = await API.patch(/channels//unblock, {
    changedBy: 'caseworker'
  });

  return res;
}
