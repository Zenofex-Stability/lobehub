import { describe, expect, it } from 'vitest';

import { parseCommandsFromEditorData } from './parseCommands';

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
            ],
            type: 'paragraph',
          },
        ],
        type: 'root',
      },
    };

    const result = parseCommandsFromEditorData(editorData);
    expect(result).toHaveLength(2);
    expect(result[0].type).toBe('newTopic');
    expect(result[1].type).toBe('translate');
  });
});
