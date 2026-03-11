import { describe, expect, it } from 'vitest';

import {
  parseCommandsFromEditorData,
  parseSelectedSkillsFromEditorData,
  parseSelectedToolsFromEditorData,
} from './parseCommands';

describe('parseCommandsFromEditorData', () => {
  it('should return empty array for undefined editorData', () => {
    expect(parseCommandsFromEditorData(undefined)).toEqual([]);
  });

  it('should return empty array for editorData with no action tags', () => {
    const editorData = {
      root: {
        children: [
          {
            children: [{ text: 'hello', type: 'text' }],
            type: 'paragraph',
          },
        ],
        type: 'root',
      },
    };
    expect(parseCommandsFromEditorData(editorData)).toEqual([]);
  });

  it('should extract command tags from editorData', () => {
    const editorData = {
      root: {
        children: [
          {
            children: [
              {
                actionCategory: 'command',
                actionLabel: 'Send in new topic',
                actionType: 'newTopic',
                type: 'action-tag',
              },
              { text: ' some message', type: 'text' },
            ],
            type: 'paragraph',
          },
        ],
        type: 'root',
      },
    };

    const result = parseCommandsFromEditorData(editorData);
    expect(result).toEqual([{ category: 'command', label: 'Send in new topic', type: 'newTopic' }]);
  });

  it('should extract multiple tags in document order', () => {
    const editorData = {
      root: {
        children: [
          {
            children: [
              {
                actionCategory: 'command',
                actionLabel: 'Send in new topic',
                actionType: 'newTopic',
                type: 'action-tag',
              },
              {
                actionCategory: 'skill',
                actionLabel: 'Translate',
                actionType: 'translate',
                type: 'action-tag',
              },
              {
                actionCategory: 'tool',
                actionLabel: 'Notebook',
                actionType: 'lobe-notebook',
                type: 'action-tag',
              },
            ],
            type: 'paragraph',
          },
        ],
        type: 'root',
      },
    };

    const result = parseCommandsFromEditorData(editorData);
    expect(result).toHaveLength(3);
    expect(result[0].type).toBe('newTopic');
    expect(result[1].type).toBe('translate');
    expect(result[2].type).toBe('lobe-notebook');
  });
});

describe('parseSelectedSkillsFromEditorData', () => {
  it('should return selected skills only', () => {
    const editorData = {
      root: {
        children: [
          {
            children: [
              {
                actionCategory: 'command',
                actionLabel: 'Compact context',
                actionType: 'compact',
                type: 'action-tag',
              },
              {
                actionCategory: 'skill',
                actionLabel: 'User Memory',
                actionType: 'user_memory',
                type: 'action-tag',
              },
              {
                actionCategory: 'skill',
                actionLabel: 'Instruction',
                actionType: 'instruction',
                type: 'action-tag',
              },
            ],
            type: 'paragraph',
          },
        ],
        type: 'root',
      },
    };

    expect(parseSelectedSkillsFromEditorData(editorData)).toEqual([
      { identifier: 'user_memory', name: 'User Memory' },
      { identifier: 'instruction', name: 'Instruction' },
    ]);
  });

  it('should deduplicate selected skills by identifier', () => {
    const editorData = {
      root: {
        children: [
          {
            children: [
              {
                actionCategory: 'skill',
                actionLabel: 'User Memory',
                actionType: 'user_memory',
                type: 'action-tag',
              },
              {
                actionCategory: 'skill',
                actionLabel: 'User Memory Duplicate',
                actionType: 'user_memory',
                type: 'action-tag',
              },
            ],
            type: 'paragraph',
          },
        ],
        type: 'root',
      },
    };

    expect(parseSelectedSkillsFromEditorData(editorData)).toEqual([
      { identifier: 'user_memory', name: 'User Memory' },
    ]);
  });

  it('should ignore tool tags when selecting skills', () => {
    const editorData = {
      root: {
        children: [
          {
            children: [
              {
                actionCategory: 'tool',
                actionLabel: 'Notebook',
                actionType: 'lobe-notebook',
                type: 'action-tag',
              },
              {
                actionCategory: 'skill',
                actionLabel: 'User Memory',
                actionType: 'user_memory',
                type: 'action-tag',
              },
            ],
            type: 'paragraph',
          },
        ],
        type: 'root',
      },
    };

    expect(parseSelectedSkillsFromEditorData(editorData)).toEqual([
      { identifier: 'user_memory', name: 'User Memory' },
    ]);
  });
});

describe('parseSelectedToolsFromEditorData', () => {
  it('should return selected tools only', () => {
    const editorData = {
      root: {
        children: [
          {
            children: [
              {
                actionCategory: 'command',
                actionLabel: 'Compact context',
                actionType: 'compact',
                type: 'action-tag',
              },
              {
                actionCategory: 'tool',
                actionLabel: 'Notebook',
                actionType: 'lobe-notebook',
                type: 'action-tag',
              },
              {
                actionCategory: 'tool',
                actionLabel: 'Artifacts',
                actionType: 'lobe-artifacts',
                type: 'action-tag',
              },
            ],
            type: 'paragraph',
          },
        ],
        type: 'root',
      },
    };

    expect(parseSelectedToolsFromEditorData(editorData)).toEqual([
      { identifier: 'lobe-notebook', name: 'Notebook' },
      { identifier: 'lobe-artifacts', name: 'Artifacts' },
    ]);
  });

  it('should deduplicate selected tools by identifier', () => {
    const editorData = {
      root: {
        children: [
          {
            children: [
              {
                actionCategory: 'tool',
                actionLabel: 'Notebook',
                actionType: 'lobe-notebook',
                type: 'action-tag',
              },
              {
                actionCategory: 'tool',
                actionLabel: 'Notebook Duplicate',
                actionType: 'lobe-notebook',
                type: 'action-tag',
              },
            ],
            type: 'paragraph',
          },
        ],
        type: 'root',
      },
    };

    expect(parseSelectedToolsFromEditorData(editorData)).toEqual([
      { identifier: 'lobe-notebook', name: 'Notebook' },
    ]);
  });
});
