export class RecordingPolicyService {
  evaluatePolicy(recordingRequested: boolean): { allowed: boolean; reason?: string } {
    if (!recordingRequested) {
      return { allowed: false, reason: 'recording_not_requested' };
    }

    return { allowed: true };
  }
}

export const recordingPolicyService = new RecordingPolicyService();
