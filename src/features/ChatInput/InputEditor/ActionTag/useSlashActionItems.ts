import type { IEditor, SlashOptions } from '@lobehub/editor';
import Fuse from 'fuse.js';
import { $getSelection, $isRangeSelection } from 'lexical';
import { ArchiveIcon, MessageSquarePlusIcon, WrenchIcon } from 'lucide-react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { useChatInputStore } from '../../store';
import { INSERT_ACTION_TAG_COMMAND, type InsertActionTagPayload } from './command';
import { type ActionTagData, BUILTIN_COMMANDS } from './types';
import { useEnabledSkills } from './useEnabledSkills';

type SlashItem = NonNullable<SlashOptions['items'] extends (infer U)[] ? U : never>;

interface SlashMenuOption {
  icon?: any;
  key: string;
  label: string;
  metadata?: Record<string, any>;
  onSelect?: (editor: IEditor, matchingString: string) => void;
}

const COMMAND_ICONS: Record<string, any> = {
  compact: ArchiveIcon,
  newTopic: MessageSquarePlusIcon,
};

export const useSlashActionItems = (): SlashOptions['items'] => {
  const { t } = useTranslation('editor');
  const editorInstance = useChatInputStore((s) => s.editor);
  const enabledSkills = useEnabledSkills();

  return useCallback(
    async (
      search: { leadOffset: number; matchingString: string; replaceableString: string } | null,
    ) => {
      const allItems: SlashItem[] = [];

      const makeCommandItem = (action: ActionTagData): SlashMenuOption => ({
        icon: COMMAND_ICONS[action.type],
        key: `action-${action.type}`,
        label: t(`slash.${action.type}` as any),
        metadata: { category: action.category, type: action.type },
        onSelect: (editor: IEditor) => {
          const payload: InsertActionTagPayload = {
            category: action.category,
            label: t(`slash.${action.type}` as any) as string,
            type: action.type,
          };
          editor.dispatchCommand(INSERT_ACTION_TAG_COMMAND, payload);
        },
      });

      const makeSkillItem = (skill: ActionTagData): SlashMenuOption => ({
        icon: WrenchIcon,
        key: `skill-${skill.type}`,
        label: skill.label,
        metadata: { category: 'skill', type: skill.type },
        onSelect: (editor: IEditor) => {
          const payload: InsertActionTagPayload = {
            category: 'skill',
            label: skill.label,
            type: skill.type,
          };
          editor.dispatchCommand(INSERT_ACTION_TAG_COMMAND, payload);
        },
      });

      // All action tags are line-start only for now
      let isAtLineStart = search === null;
      if (!isAtLineStart && editorInstance) {
        const lexicalEditor = editorInstance.getLexicalEditor();
        if (lexicalEditor) {
          lexicalEditor.getEditorState().read(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              const node = selection.anchor.getNode();
              const topElement = node.getTopLevelElement();
              if (topElement) {
                const paragraphText = topElement.getTextContent();
                const triggerAndSearch = '/' + (search?.matchingString || '');
                isAtLineStart = paragraphText === triggerAndSearch;
              }
            }
          });
        }
      }

      if (!isAtLineStart) return [];

      // 1. Built-in commands
      for (const action of BUILTIN_COMMANDS) {
        allItems.push(makeCommandItem(action) as SlashItem);
      }

      // 2. Enabled skills from agent config
      if (enabledSkills.length > 0) {
        allItems.push({ type: 'divider' } as SlashItem);
        for (const skill of enabledSkills) {
          allItems.push(makeSkillItem(skill) as SlashItem);
        }
      }

      // Fuzzy filtering
      if (search?.matchingString && search.matchingString.length > 0) {
        const searchable = allItems.filter((i) => !('type' in i) || (i as any).type !== 'divider');
        const fuse = new Fuse(searchable, { keys: ['key', 'label'], threshold: 0.4 });
        return fuse.search(search.matchingString).map((r) => r.item);
      }

      return allItems;
    },
    [t, editorInstance, enabledSkills],
  );
};
