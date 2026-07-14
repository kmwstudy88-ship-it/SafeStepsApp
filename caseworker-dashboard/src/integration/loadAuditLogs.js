import { API } from '../../shared/apiClient';

export async function loadAuditLogs() {
  const res = await API.get('/audit');
  return res.logs;
}
