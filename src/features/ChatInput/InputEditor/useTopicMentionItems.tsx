import { Icon } from '@lobehub/ui';
import { MessageSquareText } from 'lucide-react';
import { useMemo } from 'react';

import { useChatStore } from '@/store/chat';
import { topicSelectors } from '@/store/chat/selectors';

const MAX_TOPIC_ITEMS = 10;

export const useTopicMentionItems = () => {
  const topics = useChatStore(topicSelectors.displayTopics);
  const activeTopicId = useChatStore((s) => s.activeTopicId);

  return useMemo(() => {
    if (!topics || topics.length === 0) return [];

    return topics
      .filter((t) => t.id !== activeTopicId)
      .slice(0, MAX_TOPIC_ITEMS)
      .map((topic) => ({
        icon: <Icon icon={MessageSquareText} size={20} />,
        key: `topic-${topic.id}`,
        label: topic.title || 'Untitled',
        metadata: { topicId: topic.id, topicTitle: topic.title, type: 'topic' },
      }));
  }, [topics, activeTopicId]);
};
