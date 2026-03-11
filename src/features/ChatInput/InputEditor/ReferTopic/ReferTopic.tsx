import { Tag } from '@lobehub/ui';
import { MessageSquarePlusIcon } from 'lucide-react';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { useChatStore } from '@/store/chat';

import type { ReferTopicNode } from './ReferTopicNode';

interface ReferTopicProps {
  node: ReferTopicNode;
}

const ReferTopic = memo<ReferTopicProps>(({ node }) => {
  const { t } = useTranslation('topic');
  const title = node.topicTitle || t('defaultTitle');
  const switchTopic = useChatStore((s) => s.switchTopic);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (node.topicId) {
        switchTopic(node.topicId);
      }
    },
    [node.topicId, switchTopic],
  );

  return (
    <span
      style={{ cursor: 'pointer', display: 'inline-flex', userSelect: 'none' }}
      onClick={handleClick}
    >
      <Tag color="green" icon={<MessageSquarePlusIcon size={12} />} variant="outlined">
        {title}
      </Tag>
    </span>
  );
});

ReferTopic.displayName = 'ReferTopic';

export default ReferTopic;
