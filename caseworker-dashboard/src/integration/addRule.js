import { API } from '../../shared/apiClient';

export async function addRule(tier, phrase, category) {
  const res = await API.post('/moderation/custom-rules', {
    tier,
    phrase,
    category
  });

  return res;
}
