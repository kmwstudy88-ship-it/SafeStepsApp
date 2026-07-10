export const MessageModel = {
  id: '',
  channelId: '',
  fromUserId: '',
  toUserId: '',
  body: '',
  delivered: false,
  moderationTier: 0,
  rulesMatched: []
};

export const ChannelStates = {
  ACTIVE: 'ACTIVE',
  CHILD_PAUSED: 'CHILD_PAUSED',
  SYSTEM_BLOCKED: 'SYSTEM_BLOCKED',
  CASEWORKER_BLOCKED: 'CASEWORKER_BLOCKED'
};
