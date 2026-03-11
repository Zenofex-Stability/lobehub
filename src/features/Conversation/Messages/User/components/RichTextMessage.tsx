import {
  ReactCodemirrorPlugin,
  ReactCodePlugin,
  ReactHRPlugin,
  ReactLinkHighlightPlugin,
  ReactListPlugin,
  ReactMathPlugin,
  ReactMentionPlugin,
  ReactTablePlugin,
  ReactVirtualBlockPlugin,
} from '@lobehub/editor';
import { Editor } from '@lobehub/editor/react';
import { memo, useMemo } from 'react';

import { ReactActionTagPlugin } from '@/features/ChatInput/InputEditor/ActionTag';
import { ReactReferTopicPlugin } from '@/features/ChatInput/InputEditor/ReferTopic';

interface RichTextMessageProps {
  editorState: unknown;
}

const EDITOR_PLUGINS = [
  ReactListPlugin,
  ReactCodePlugin,
  ReactCodemirrorPlugin,
  ReactHRPlugin,
  ReactLinkHighlightPlugin,
  ReactTablePlugin,
  ReactVirtualBlockPlugin,
  ReactMathPlugin,
  ReactMentionPlugin,
  ReactActionTagPlugin,
  ReactReferTopicPlugin,
];

const RichTextMessage = memo<RichTextMessageProps>(({ editorState }) => {
  const content = useMemo(() => {
    if (!editorState || typeof editorState !== 'object') return null;
    if (Object.keys(editorState as Record<string, unknown>).length === 0) return null;

    try {
      return JSON.stringify(editorState);
    } catch {
      return null;
    }
  }, [editorState]);

  if (!content) return null;

  return (
    <Editor
      content={content}
      editable={false}
      enablePasteMarkdown={false}
      markdownOption={false}
      plugins={EDITOR_PLUGINS}
      type={'json'}
      variant={'chat'}
    />
  );
});

RichTextMessage.displayName = 'RichTextMessage';

export default RichTextMessage;
