import { Tag } from '@lobehub/ui';
import { MessageSquarePlusIcon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import type { ReferTopicNode } from './ReferTopicNode';

interface ReferTopicProps {
  node: ReferTopicNode;
}

const ReferTopic = memo<ReferTopicProps>(({ node }) => {
  const { t } = useTranslation('topic');
  const title = node.topicTitle || t('defaultTitle');

  return (
    <span style={{ cursor: 'default', display: 'inline-flex', userSelect: 'none' }}>
      <Tag color="purple" icon={<MessageSquarePlusIcon size={12} />} variant="outlined">
        {title}
      </Tag>
    </span>
  );
});

ReferTopic.displayName = 'ReferTopic';

export default ReferTopic;
