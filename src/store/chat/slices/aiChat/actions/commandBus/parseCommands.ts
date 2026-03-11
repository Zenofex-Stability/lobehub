import type {
  ActionTagCategory,
  ActionTagType,
} from '@/features/ChatInput/InputEditor/ActionTag/types';

export interface ParsedCommand {
  category: ActionTagCategory;
  label: string;
  type: ActionTagType;
}

/**
 * Walk the Lexical JSON tree to find all action-tag nodes.
 * Returns the extracted commands in document order.
 */
export const parseCommandsFromEditorData = (
  editorData: Record<string, any> | undefined,
): ParsedCommand[] => {
  if (!editorData) return [];

  const commands: ParsedCommand[] = [];
  walkNode(editorData.root, commands);
  return commands;
};

/**
 * Check if editorData contains any meaningful text content
 * besides action-tag nodes (whitespace-only counts as empty).
 */
export const hasNonActionContent = (editorData: Record<string, any> | undefined): boolean => {
  if (!editorData) return false;
  const parts: string[] = [];
  collectText(editorData.root, parts);
  return parts.join('').trim().length > 0;
};

function collectText(node: any, out: string[]): void {
  if (!node) return;
  if (node.type === 'action-tag') return;
  if (node.type === 'text' && typeof node.text === 'string') {
    out.push(node.text);
  }
  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      collectText(child, out);
    }
  }
}

function walkNode(node: any, out: ParsedCommand[]): void {
  if (!node) return;

  if (node.type === 'action-tag') {
    out.push({
      category: node.actionCategory,
      label: node.actionLabel,
      type: node.actionType,
    });
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      walkNode(child, out);
    }
  }
}
