import { useLexicalComposerContext } from '@lobehub/editor';
import { type FC, useLayoutEffect } from 'react';

import ReferTopic from './ReferTopic';
import { ReferTopicPlugin } from './ReferTopicPlugin';

const ReactReferTopicPlugin: FC = () => {
  const [editor] = useLexicalComposerContext();

  useLayoutEffect(() => {
    (editor as any).registerPlugin(ReferTopicPlugin, {
      decorator: (node: any, _lexicalEditor: any) => {
        return <ReferTopic node={node} />;
      },
    });
  }, [editor]);

  return null;
};

ReactReferTopicPlugin.displayName = 'ReactReferTopicPlugin';

export default ReactReferTopicPlugin;
