import type { VoiceSignalPayload } from "./VoiceEngine";

export type VoiceSignalHandler = (payload: VoiceSignalPayload) => void;

export class VoiceSignalingClient {
  private socket: WebSocket | null = null;
  private listeners: VoiceSignalHandler[] = [];

  constructor(private readonly url = "ws://localhost:8082") {}

  connect() {
    this.socket = new WebSocket(this.url);
    this.socket.onmessage = (message) => {
      const payload = JSON.parse(String(message.data)) as VoiceSignalPayload;
      this.listeners.forEach((listener) => listener(payload));
    };
  }

  send(payload: VoiceSignalPayload) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error("Voice signaling socket is not connected.");
    }
    this.socket.send(JSON.stringify(payload));
  }

  onSignal(listener: VoiceSignalHandler) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((item) => item !== listener);
    };
  }

  close() {
    this.socket?.close();
    this.socket = null;
  }
}
