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
