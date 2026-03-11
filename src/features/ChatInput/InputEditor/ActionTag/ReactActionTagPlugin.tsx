import { useLexicalComposerContext } from '@lobehub/editor';
import { type FC, useLayoutEffect } from 'react';
import { useTranslation } from 'react-i18next';

import ActionTag from './ActionTag';
import { ActionTagPlugin } from './ActionTagPlugin';

const ReactActionTagPlugin: FC = () => {
  const [editor] = useLexicalComposerContext();
  const { t } = useTranslation('editor');

  useLayoutEffect(() => {
    (editor as any).registerPlugin(ActionTagPlugin, {
      decorator: (node: any, lexicalEditor: any) => {
        const label =
          node.actionCategory === 'command'
            ? t(`slash.${node.actionType}` as any)
            : node.actionLabel;

        return <ActionTag editor={lexicalEditor} label={label} node={node} />;
      },
    });
  }, [editor, t]);

  return null;
};

ReactActionTagPlugin.displayName = 'ReactActionTagPlugin';

export default ReactActionTagPlugin;
