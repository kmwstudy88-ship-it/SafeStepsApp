import Constants from 'expo-constants';
import { supabase } from '../supabaseClient';

declare const operationalCaseDomain: unique symbol;
export type OperationalCaseId = string & { readonly [operationalCaseDomain]: 'operational-case' };
export type CarerCase = { id: OperationalCaseId; title: string; status: string; stage: string | null; reviewAt: string | null };
export type JournalKind = 'daily_update' | 'achievement' | 'concern';
export type CarerJournalEntry = { id: string; caseId: OperationalCaseId; kind: JournalKind; title: string;
  detail: string; createdAt: string; familyShared: boolean };
export type CarerChannel = { id: string; title: string; operationalCaseId: OperationalCaseId; enabled: boolean;
  canManage: boolean; canSend: boolean; canReview: boolean; revoked: boolean; expiresAt: string };
export type MonitoredMessage = { id: string; body: string; createdAt: string; isMine: boolean;
  senderRole: 'carer' | 'parent'; reviewStatus: 'pending' | 'approved' | 'rejected' };
export type CarerMedia = { id: string; operationalCaseId: OperationalCaseId; title: string; description: string; mimeType: string;
  byteSize: number; state: 'reserved' | 'ready'; createdAt: string; isMine: boolean; canReview: boolean;
  reviewStatus: 'pending' | 'approved' | 'rejected'; parentSharing: boolean };
export type MediaReservation = { id: string; bucket: 'carer-media'; path: string; mimeType: string };

export function createCarerPortalApi(userId: string) {
  async function request<T>(path: string, body?: unknown): Promise<T> {
    const base = String(Constants.expoConfig?.extra?.backendUrl ?? process.env.EXPO_PUBLIC_BACKEND_URL ?? '').replace(/\/$/, '');
    if (!base) throw new Error('Carer Portal connection is not configured. Contact your care team.');
    const { data, error } = await supabase.auth.getSession();
    if (error || data.session?.user.id !== userId || !data.session.access_token) throw new Error('Sign in again to access your carer records.');
    const response = await fetch(`${base}${path}`, { method: body === undefined ? 'GET' : 'POST',
      headers: { Authorization: `Bearer ${data.session.access_token}`, 'Content-Type': 'application/json' },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload?.error?.message || 'Unable to access the carer record service.');
    return payload as T;
  }
  return {
    listMedia: () => request<{ media: CarerMedia[] }>('/carers/media'),
    reserveMedia: (caseId: OperationalCaseId, entry: { submissionId: string; fileName: string; title: string; description: string; mimeType: string; byteSize: number }) =>
      request<MediaReservation>(`/carers/cases/${encodeURIComponent(caseId)}/media`,entry),
    uploadReserved: async (reservation: MediaReservation, bytes: ArrayBuffer) => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user.id!==userId) throw new Error('Sign in again before uploading media.');
      if (reservation.bucket!=='carer-media') throw new Error('The private upload destination is unavailable.');
      const { error } = await supabase.storage.from('carer-media').upload(reservation.path,bytes,{ contentType:reservation.mimeType,upsert:false,cacheControl:'0' });
      if (error && Number((error as {statusCode?:string}).statusCode)!==409) throw new Error('The private upload could not be completed. Keep the original file and retry.');
      // A duplicate at this immutable path can be an earlier completed upload; the
      // backend still verifies the original stored bytes before accepting completion.
    },
    completeMedia: (id: string) => request<{state:'ready'}>(`/carers/media/${encodeURIComponent(id)}/complete`,{}),
    getMediaView: (id: string) => request<{url:string;mimeType:string;expiresAt:string}>(`/carers/media/${encodeURIComponent(id)}/view`),
    mediaRecipients: (id: string) => request<{recipients:{id:string;displayName:string;memberReference:string}[]}>(`/carers/media/${encodeURIComponent(id)}/recipients`),
    reviewMedia: (id: string, entry: {decision:'approved'|'rejected';parentUserId?:string;expiresAt?:string;reason:string;originalDisclosureConfirmed?:boolean}) =>
      request(`/carers/media/${encodeURIComponent(id)}/review`,entry),
    listChannels: () => request<{ channels: CarerChannel[] }>('/carers/channels'),
    getMessages: (id: string) => request<{ messages: MonitoredMessage[] }>(`/carers/channels/${encodeURIComponent(id)}/messages`),
    setChannelEnabled: (id: string, enabled: boolean) => request<{ enabled: boolean }>(`/carers/channels/${encodeURIComponent(id)}/enabled`, { enabled }),
    sendMessage: (id: string, text: string, submissionId: string) => request<{ id: string; reviewStatus: 'pending' }>(
      `/carers/channels/${encodeURIComponent(id)}/messages`, { text, submissionId }),
    reviewMessage: (id: string, messageId: string, decision: 'approved' | 'rejected', reason: string) => request(
      `/carers/channels/${encodeURIComponent(id)}/review`, { messageId, decision, reason }),
    revokeChannel: (id: string, reason: string) => request(`/carers/channels/${encodeURIComponent(id)}/revoke`, { reason }),
    listCases: () => request<{ cases: CarerCase[] }>('/carers/cases'),
    listJournal: (caseId: OperationalCaseId) => request<{ entries: CarerJournalEntry[] }>(`/carers/cases/${encodeURIComponent(caseId)}/journal`),
    createJournal: (caseId: OperationalCaseId, entry: { kind: JournalKind; title: string; detail: string; submissionId: string }) =>
      request<{ id: string; status: 'submitted' }>(`/carers/cases/${encodeURIComponent(caseId)}/journal`, entry),
  };
}
