import { ChannelStates } from './models';

export function isBlocked(state) {
  return (
    state === ChannelStates.SYSTEM_BLOCKED ||
    state === ChannelStates.CASEWORKER_BLOCKED
  );
}

export function isPaused(state) {
  return state === ChannelStates.CHILD_PAUSED;
}

export function isActive(state) {
  return state === ChannelStates.ACTIVE;
}
