import { API } from '../../shared/apiClient';

export async function loadFlagged() {
  const res = await API.get('/moderation/flags');
  return res.flags;
}
