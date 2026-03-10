/**
 * Slash action architecture:
 *
 * 1. Command — Built-in, line-start only, executed client-side before send
 * 2. Skill   — Dynamic (from agent/system config), line-start, processed by MessageEngine
 */
export type ActionTagCategory = 'command' | 'skill';

// Built-in commands: client-side intercepted, never sent to AI
export type CommandType = 'compact' | 'newTopic';

// Skills use dynamic identifiers from agent config (plugin/tool identifiers)
export type SkillType = string & {};

export type ActionTagType = CommandType | SkillType;

export interface ActionTagData {
  category: ActionTagCategory;
  icon?: string;
  label: string;
  type: ActionTagType;
}

// Built-in commands — line-start only, client-side execution
export const BUILTIN_COMMANDS: ActionTagData[] = [
  { category: 'command', label: 'newTopic', type: 'newTopic' },
  { category: 'command', label: 'compact', type: 'compact' },
];
