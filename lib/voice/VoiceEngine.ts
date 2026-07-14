export type VoiceSignalType = "join" | "worker_join" | "offer" | "answer" | "ice_candidate" | "leave";

export type VoiceSignalPayload = {
  type: VoiceSignalType;
  roomCode: string;
  playerId?: string;
  workerId?: string;
  offer?: unknown;
  answer?: unknown;
  candidate?: unknown;
};

export type SendVoiceSignal = (signal: VoiceSignalPayload) => void;

type PeerConnectionLike = {
  addTrack?: (track: unknown, stream: unknown) => void;
  createOffer: () => Promise<unknown>;
  createAnswer: () => Promise<unknown>;
  setLocalDescription: (description: unknown) => Promise<void>;
  setRemoteDescription: (description: unknown) => Promise<void>;
  addIceCandidate: (candidate: unknown) => Promise<void>;
  close?: () => void;
};

type VoiceRuntime = {
  RTCPeerConnection?: new (configuration: { iceServers: { urls: string }[] }) => PeerConnectionLike;
  mediaDevices?: {
    getUserMedia: (constraints: { audio: boolean; video?: boolean }) => Promise<{
      getTracks: () => unknown[];
    }>;
  };
};

function getVoiceRuntime(): VoiceRuntime {
  const runtime = globalThis as VoiceRuntime & { navigator?: VoiceRuntime };
  return {
    RTCPeerConnection: runtime.RTCPeerConnection,
    mediaDevices: runtime.navigator?.mediaDevices ?? runtime.mediaDevices,
  };
}

export class VoiceEngine {
  private pc: PeerConnectionLike | null = null;

  constructor(
    public readonly roomCode: string,
    private readonly runtime: VoiceRuntime = getVoiceRuntime(),
  ) {}

  isAvailable() {
    return Boolean(this.runtime.RTCPeerConnection && this.runtime.mediaDevices?.getUserMedia);
  }

  async startLocalAudio() {
    if (!this.runtime.RTCPeerConnection || !this.runtime.mediaDevices?.getUserMedia) {
      throw new Error("Voice chat requires a WebRTC runtime. Install and configure a React Native WebRTC package before enabling live audio.");
    }

    this.pc = this.pc ?? new this.runtime.RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    const stream = await this.runtime.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => this.pc?.addTrack?.(track, stream));
    return stream;
  }

  async createOffer(sendSignal: SendVoiceSignal) {
    const pc = this.requirePeerConnection();
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    sendSignal({ type: "offer", offer, roomCode: this.roomCode });
  }

  async handleOffer(offer: unknown, sendSignal: SendVoiceSignal) {
    const pc = this.requirePeerConnection();
    await pc.setRemoteDescription(offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    sendSignal({ type: "answer", answer, roomCode: this.roomCode });
  }

  async handleAnswer(answer: unknown) {
    await this.requirePeerConnection().setRemoteDescription(answer);
  }

  async handleIceCandidate(candidate: unknown) {
    await this.requirePeerConnection().addIceCandidate(candidate);
  }

  joinPayload(playerId: string): VoiceSignalPayload {
    return { type: "join", roomCode: this.roomCode, playerId };
  }

  workerJoinPayload(workerId: string): VoiceSignalPayload {
    return { type: "worker_join", roomCode: this.roomCode, workerId };
  }

  stop() {
    this.pc?.close?.();
    this.pc = null;
  }

  private requirePeerConnection() {
    if (!this.pc) {
      throw new Error("Voice peer connection has not started. Call startLocalAudio first.");
    }
    return this.pc;
  }
}
