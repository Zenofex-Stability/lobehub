import { Tag, Tooltip } from '@lobehub/ui';
import { CLICK_COMMAND, COMMAND_PRIORITY_LOW, type LexicalEditor } from 'lexical';
import { memo, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import type { ActionTagNode } from './ActionTagNode';
import { useStyles } from './style';
import type { ActionTagCategory } from './types';

interface ActionTagProps {
  editor: LexicalEditor;
  label: string;
  node: ActionTagNode;
}

const CATEGORY_COLOR: Record<ActionTagCategory, string> = {
  command: 'purple',
  skill: 'blue',
};

const CATEGORY_I18N_KEY: Record<ActionTagCategory, string> = {
  command: 'actionTag.category.command',
  skill: 'actionTag.category.skill',
};

const CATEGORY_STYLE_KEY: Record<ActionTagCategory, 'commandTag' | 'skillTag'> = {
  command: 'commandTag',
  skill: 'skillTag',
};

const ActionTag = memo<ActionTagProps>(({ node, editor, label }) => {
  const spanRef = useRef<HTMLSpanElement>(null);
  const { styles, cx } = useStyles();
  const { t } = useTranslation('editor');

  const category = node.actionCategory;
  const categoryLabel = t(CATEGORY_I18N_KEY[category] as any);
  const color = CATEGORY_COLOR[category];
  const styleKey = CATEGORY_STYLE_KEY[category];

  const onClick = useCallback((payload: MouseEvent) => {
    if (payload.target === spanRef.current || spanRef.current?.contains(payload.target as Node)) {
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    return editor.registerCommand(CLICK_COMMAND, onClick, COMMAND_PRIORITY_LOW);
  }, [editor, onClick]);

  return (
    <span className={cx('editor_action_tag', styles[styleKey])} ref={spanRef}>
      <Tooltip
        title={
          <div>
            <div style={{ fontWeight: 500 }}>{label}</div>
            <div>{categoryLabel}</div>
          </div>
        }
      >
        <Tag color={color} variant="filled">
          {label}
        </Tag>
      </Tooltip>
    </span>
  );
});

ActionTag.displayName = 'ActionTag';

export default ActionTag;
