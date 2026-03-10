import type { CommandType } from '@/features/ChatInput/InputEditor/ActionTag/types';

import type { SendMessageWithContextParams } from '../conversationLifecycle';

/**
 * The mutable send params that command handlers can modify.
 * After all commands run, these overrides are merged into the original params.
 */
export interface CommandSendOverrides {
  /** Force creation of a new topic (ignore current topicId) */
  forceNewTopic?: boolean;
  /** Whether to skip sending the message to AI entirely */
  skipAISend?: boolean;
}

export interface CommandHandlerContext {
  /** Original send params (read-only reference) */
  params: SendMessageWithContextParams;
}

export type CommandHandler = (ctx: CommandHandlerContext) => CommandSendOverrides | void;

export type CommandRegistry = Record<CommandType, CommandHandler>;
