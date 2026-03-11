import {
  ILitexmlService,
  IMarkdownShortCutService,
  MARKDOWN_READER_LEVEL_HIGH,
} from '@lobehub/editor';
import type { LexicalEditor } from 'lexical';

import { $isReferTopicNode, ReferTopicNode, type SerializedReferTopicNode } from './ReferTopicNode';

export interface ReferTopicPluginOptions {
  decorator: (node: ReferTopicNode, editor: LexicalEditor) => any;
  theme?: { referTopic?: string };
}

const REFER_TOPIC_REGEX = /^<referTopic\s+name="([^"]*)"\s+id="([^"]*)"\s*\/?>$/;

export class ReferTopicPlugin {
  static pluginName = 'ReferTopicPlugin';

  config?: ReferTopicPluginOptions;
  private kernel: any;

  constructor(kernel: any, config?: ReferTopicPluginOptions) {
    this.kernel = kernel;
    this.config = config;

    kernel.registerNodes([ReferTopicNode]);

    if (config?.theme) {
      kernel.registerThemes(config.theme);
    }

    kernel.registerDecorator(
      ReferTopicNode.getType(),
      (node: ReferTopicNode, editor: LexicalEditor) => {
        return config?.decorator ? config.decorator(node, editor) : null;
      },
    );
  }

  onInit(_editor: LexicalEditor): void {
    this.registerMarkdown();
    this.registerLiteXml();
  }

  private registerMarkdown(): void {
    const mdService = this.kernel.requireService(IMarkdownShortCutService);

    mdService?.registerMarkdownWriter(ReferTopicNode.getType(), (ctx: any, node: any) => {
      if ($isReferTopicNode(node)) {
        ctx.appendLine(`<referTopic name="${node.topicTitle}" id="${node.topicId}" />`);
      }
    });

    mdService?.registerMarkdownReader(
      'html',
      (mdastNode: any) => {
        const value = mdastNode?.value as string | undefined;
        if (!value) return false;

        const match = REFER_TOPIC_REGEX.exec(value.trim());
        if (!match) return false;

        const [, topicTitle, topicId] = match;
        try {
          const { INodeHelper } = require('@lobehub/editor/es/editor-kernel/inode/helper');
          return INodeHelper.createElementNode(ReferTopicNode.getType(), {
            topicId,
            topicTitle,
          } satisfies Partial<SerializedReferTopicNode>);
        } catch {
          return false;
        }
      },
      MARKDOWN_READER_LEVEL_HIGH,
    );
  }

  private registerLiteXml(): void {
    const xmlService = this.kernel.requireService(ILitexmlService);

    xmlService?.registerXMLWriter(ReferTopicNode.getType(), (node: any, ctx: any) => {
      if ($isReferTopicNode(node)) {
        return ctx.createXmlNode('referTopic', {
          id: node.topicId,
          name: node.topicTitle,
        });
      }
      return false;
    });

    xmlService?.registerXMLReader('referTopic', (xmlElement: any) => {
      try {
        const { INodeHelper } = require('@lobehub/editor/es/editor-kernel/inode/helper');
        return INodeHelper.createElementNode(ReferTopicNode.getType(), {
          topicId: xmlElement.getAttribute('id') || '',
          topicTitle: xmlElement.getAttribute('name') || '',
        } satisfies Partial<SerializedReferTopicNode>);
      } catch {
        return false;
      }
    });
  }

  destroy(): void {
    this.kernel.unregisterDecorator?.(ReferTopicNode.getType());
  }
}
