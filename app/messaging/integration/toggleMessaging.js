import { API } from '../../shared/apiClient';

export async function toggleMessaging(channelId, enabled, childId) {
  const res = await API.patch(`/channels/${channelId}/state`, {
    newState: enabled ? 'ACTIVE' : 'CHILD_PAUSED',
    changedBy: 'child',
    childId,
    reason: enabled ? null : 'Child paused messaging'
  });

  return res;
}
