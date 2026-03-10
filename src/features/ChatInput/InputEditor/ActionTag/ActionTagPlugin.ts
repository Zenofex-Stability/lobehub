import {
  ILitexmlService,
  IMarkdownShortCutService,
  MARKDOWN_READER_LEVEL_HIGH,
} from '@lobehub/editor';
import type { LexicalEditor } from 'lexical';

import { $isActionTagNode, ActionTagNode, type SerializedActionTagNode } from './ActionTagNode';
import { registerActionTagCommand } from './command';
import { registerActionTagSelectionObserver } from './selectionObserver';
import type { ActionTagCategory, ActionTagType } from './types';

export interface ActionTagPluginOptions {
  decorator: (node: ActionTagNode, editor: LexicalEditor) => any;
  theme?: { actionTag?: string };
}

const ACTION_TAG_REGEX = /^<action\s+type="([^"]+)"\s+category="([^"]+)"\s*\/?>$/;

export class ActionTagPlugin {
  static pluginName = 'ActionTagPlugin';

  config?: ActionTagPluginOptions;
  private kernel: any; // IEditorKernel (not exported from public API)
  private clears: Array<() => void> = [];

  constructor(kernel: any, config?: ActionTagPluginOptions) {
    this.kernel = kernel;
    this.config = config;

    kernel.registerNodes([ActionTagNode]);

    if (config?.theme) {
      kernel.registerThemes(config.theme);
    }

    kernel.registerDecorator(
      ActionTagNode.getType(),
      (node: ActionTagNode, editor: LexicalEditor) => {
        return config?.decorator ? config.decorator(node, editor) : null;
      },
    );
  }

  onInit(editor: LexicalEditor): void {
    this.clears.push(registerActionTagCommand(editor));
    this.clears.push(registerActionTagSelectionObserver(editor));
    this.registerMarkdown();
    this.registerLiteXml();
  }

  private registerMarkdown(): void {
    const mdService = this.kernel.requireService(IMarkdownShortCutService);

    // Writer: ActionTagNode → markdown
    mdService?.registerMarkdownWriter(ActionTagNode.getType(), (ctx: any, node: any) => {
      if ($isActionTagNode(node)) {
        ctx.appendLine(`<action type="${node.actionType}" category="${node.actionCategory}" />`);
      }
    });

    // Reader: markdown → ActionTagNode (used when loading markdown back into editor)
    mdService?.registerMarkdownReader(
      'html',
      (mdastNode: any) => {
        const value = mdastNode?.value as string | undefined;
        if (!value) return false;

        const match = ACTION_TAG_REGEX.exec(value.trim());
        if (!match) return false;

        const [, actionType, actionCategory] = match;

        // Dynamically import INodeHelper to avoid deep import at module level
        try {
          const { INodeHelper } = require('@lobehub/editor/es/editor-kernel/inode/helper');
          return INodeHelper.createElementNode(ActionTagNode.getType(), {
            actionCategory: actionCategory as ActionTagCategory,
            actionLabel: actionType,
            actionType: actionType as ActionTagType,
          } satisfies Partial<SerializedActionTagNode>);
        } catch {
          return false;
        }
      },
      MARKDOWN_READER_LEVEL_HIGH,
    );
  }

  private registerLiteXml(): void {
    const xmlService = this.kernel.requireService(ILitexmlService);

    xmlService?.registerXMLWriter(ActionTagNode.getType(), (node: any, ctx: any) => {
      if ($isActionTagNode(node)) {
        return ctx.createXmlNode('action', {
          category: node.actionCategory,
          label: node.actionLabel,
          type: node.actionType,
        });
      }
      return false;
    });

    xmlService?.registerXMLReader('action', (xmlElement: any) => {
      try {
        const { INodeHelper } = require('@lobehub/editor/es/editor-kernel/inode/helper');
        return INodeHelper.createElementNode(ActionTagNode.getType(), {
          actionCategory: (xmlElement.getAttribute('category') || 'skill') as ActionTagCategory,
          actionLabel: xmlElement.getAttribute('label') || '',
          actionType: (xmlElement.getAttribute('type') || 'translate') as ActionTagType,
        } satisfies Partial<SerializedActionTagNode>);
      } catch {
        return false;
      }
    });
  }

  destroy(): void {
    for (const clear of this.clears) {
      clear();
    }
    this.clears = [];
    this.kernel.unregisterDecorator?.(ActionTagNode.getType());
  }
}
