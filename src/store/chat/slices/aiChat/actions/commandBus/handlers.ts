import type { CommandHandler } from './types';

/**
 * /newTopic — Force the message to be sent in a brand-new topic,
 * regardless of the current topic context.
 */
export const newTopicHandler: CommandHandler = () => {
  return { forceNewTopic: true };
};

/**
 * /compact — Compress the current conversation context.
 * Triggers a history summarization without sending a new AI message.
 */
export const compactHandler: CommandHandler = () => {
  return { skipAISend: true };
};
