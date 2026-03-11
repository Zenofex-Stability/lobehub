/**
 * Runtime Step Context Types
 *
 * Step Context is computed at the beginning of each Agent Runtime step
 * and injected into Context Engine and Tool Executors.
 *
 * Key principles:
 * 1. Computed by the caller (AgentRuntime), not by Context Engine or Executor
 * 2. Executors read from stepContext, return new state via result.state
 * 3. Replaces the deprecated pluginState passing pattern
 */

/** Status of a todo item */
export type StepContextTodoStatus = 'todo' | 'processing' | 'completed';

/**
 * Todo item structure
 * Duplicated here to avoid circular dependency with builtin-tool-gtd
 */
export interface StepContextTodoItem {
  status: StepContextTodoStatus;
  text: string;
}

/**
 * Todo list structure in step context
 */
export interface StepContextTodos {
  items: StepContextTodoItem[];
  updatedAt: string;
}

/**
 * Page Editor context for each step
 * Contains the latest XML structure fetched at each step
 */
export interface StepPageEditorContext {
  /**
   * Current XML structure of the page
   * Fetched at the beginning of each step to get latest state
   */
  xml: string;
}

/**
 * Initial Page Editor context
 * Stored at operation initialization and remains constant
 */
export interface InitialPageEditorContext {
  /**
   * Initial markdown content of the page
   */
  markdown: string;
  /**
   * Document metadata
   */
  metadata: {
    charCount?: number;
    lineCount?: number;
    title: string;
  };
  /**
   * Initial XML structure (for reference)
   */
  xml: string;
}

/**
 * User-selected skill context for the current request
 * Captured from slash-menu skill action tags before send
 */
export interface RuntimeSelectedSkill {
  /**
   * Skill identifier used by runtime/tooling
   */
  identifier: string;
  /**
   * Human-readable skill name shown in the input UI
   */
  name: string;
}

/**
 * Runtime Step Context
 *
 * Contains dynamically computed state that changes between steps.
 * Computed from messages at the beginning of each step.
 *
 * @example
 * ```typescript
 * const stepContext = computeStepContext(state);
 * // Pass to Context Engine
 * messagesEngine.process({ messages, stepContext });
 * // Pass to Executor
 * executor.invoke(params, { stepContext, messageId, ... });
 * ```
 */
export interface RuntimeStepContext {
  /**
   * Activated tool identifiers accumulated from lobe-tools messages
   * Tools once activated remain active for the rest of the conversation
   */
  activatedToolIds?: string[];
  /**
   * Page Editor context for current step
   * Contains the latest XML structure fetched at each step
   */
  stepPageEditor?: StepPageEditorContext;
  /**
   * Current todo list state
   * Computed from the latest GTD tool message in the conversation
   */
  todos?: StepContextTodos;
}

/**
 * Initial Context
 *
 * Contains state captured at operation initialization.
 * Remains constant throughout the operation lifecycle.
 */
export interface RuntimeInitialContext {
  /**
   * Initial Page Editor context
   * Contains markdown content and metadata captured at operation start
   */
  pageEditor?: InitialPageEditorContext;
  /**
   * Skills explicitly selected by the user for the current request
   * This is ephemeral runtime context and is not persisted to chat history
   */
  selectedSkills?: RuntimeSelectedSkill[];
}
