# Topic Reference Tool Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a built-in tool that lets the LLM fetch context from a referenced topic (summary + recent messages).

**Architecture:** New package `@lobechat/builtin-tool-topic-reference` following the calculator/memory pattern. Manifest defines a single `getTopicContext` API. Server runtime queries TopicModel and MessageModel, returning historySummary if available or last 30 messages as fallback.

**Tech Stack:** TypeScript, Drizzle ORM (via LobeChatDatabase), existing BuiltinToolManifest/BuiltinServerRuntimeOutput types.

---

## File Structure

```
packages/builtin-tool-topic-reference/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts              # Package exports
    ├── types.ts              # Identifier + API name constants
    └── manifest.ts           # BuiltinToolManifest definition

src/server/services/toolExecution/serverRuntimes/
└── topicReference.ts         # Server runtime (DB-dependent, per-request factory)
```

**Modified files:**

- `packages/builtin-tools/package.json` — add dependency
- `packages/builtin-tools/src/index.ts` — import manifest, register in builtinTools + defaultToolIds
- `src/server/services/toolExecution/serverRuntimes/index.ts` — import and register runtime

---

## Task 1: Create package scaffolding

**Files:**

- Create: `packages/builtin-tool-topic-reference/package.json`

- Create: `packages/builtin-tool-topic-reference/tsconfig.json`

- [ ] **Step 1: Create package.json**

```json
{
  "devDependencies": {
    "@lobechat/types": "workspace:*"
  },
  "exports": {
    ".": "./src/index.ts"
  },
  "main": "./src/index.ts",
  "name": "@lobechat/builtin-tool-topic-reference",
  "private": true,
  "version": "1.0.0"
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "node",
    "declaration": true,
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "exclude": ["node_modules"],
  "include": ["src/**/*"]
}
```

---

## Task 2: Define types and manifest

**Files:**

- Create: `packages/builtin-tool-topic-reference/src/types.ts`

- Create: `packages/builtin-tool-topic-reference/src/manifest.ts`

- Create: `packages/builtin-tool-topic-reference/src/index.ts`

- [ ] **Step 1: Create src/types.ts**

```typescript
export const TopicReferenceIdentifier = 'lobe-topic-reference';

export const TopicReferenceApiName = {
  getTopicContext: 'getTopicContext',
} as const;

export type TopicReferenceApiNameType =
  (typeof TopicReferenceApiName)[keyof typeof TopicReferenceApiName];
```

- [ ] **Step 2: Create src/manifest.ts**

```typescript
import { type BuiltinToolManifest } from '@lobechat/types';

import { TopicReferenceApiName, TopicReferenceIdentifier } from './types';

export const TopicReferenceManifest: BuiltinToolManifest = {
  api: [
    {
      description:
        'Retrieve context from a referenced topic conversation. Returns the topic summary if available, otherwise returns the most recent messages. Use this when you see a topic reference tag in the user message and need to understand what was discussed in that topic.',
      name: TopicReferenceApiName.getTopicContext,
      parameters: {
        additionalProperties: false,
        properties: {
          topicId: {
            description: 'The ID of the topic to retrieve context from',
            type: 'string',
          },
        },
        required: ['topicId'],
        type: 'object',
      },
    },
  ],
  identifier: TopicReferenceIdentifier,
  meta: {
    avatar: '📋',
    description: 'Retrieve context from referenced topic conversations',
    title: 'Topic Reference',
  },
  systemRole: '',
  type: 'builtin',
};
```

- [ ] **Step 3: Create src/index.ts**

```typescript
export { TopicReferenceManifest } from './manifest';
export {
  TopicReferenceApiName,
  type TopicReferenceApiNameType,
  TopicReferenceIdentifier,
} from './types';
```

---

## Task 3: Register manifest in builtin-tools

**Files:**

- Modify: `packages/builtin-tools/package.json`

- Modify: `packages/builtin-tools/src/index.ts`

- [ ] **Step 1: Add dependency to package.json**

Add to `dependencies`:

```json
"@lobechat/builtin-tool-topic-reference": "workspace:*"
```

- [ ] **Step 2: Import and register in src/index.ts**

Add import at top:

```typescript
import { TopicReferenceManifest } from '@lobechat/builtin-tool-topic-reference';
```

Add to `defaultToolIds` array:

```typescript
TopicReferenceManifest.identifier,
```

Add to `builtinTools` array:

```typescript
{
  discoverable: false,
  hidden: true,
  identifier: TopicReferenceManifest.identifier,
  manifest: TopicReferenceManifest,
  type: 'builtin',
},
```

---

## Task 4: Implement server runtime

**Files:**

- Create: `src/server/services/toolExecution/serverRuntimes/topicReference.ts`

- Modify: `src/server/services/toolExecution/serverRuntimes/index.ts`

- [ ] **Step 1: Create topicReference.ts**

This is a per-request runtime (needs DB access). Logic:

1. Query `TopicModel.findById(topicId)` — get topic metadata
2. If topic has `historySummary`, return title + summary
3. Otherwise query `MessageModel.query({ topicId })` and return last 30 messages serialized as `role: content` pairs

```typescript
import { TopicReferenceIdentifier } from '@lobechat/builtin-tool-topic-reference';
import type { LobeChatDatabase } from '@lobechat/database';
import { MessageModel } from '@lobechat/database/models/message';
import { TopicModel } from '@lobechat/database/models/topic';
import type { BuiltinServerRuntimeOutput } from '@lobechat/types';

import type { ServerRuntimeRegistration } from './types';

const MAX_MESSAGES = 30;

interface GetTopicContextParams {
  topicId: string;
}

class TopicReferenceExecutionRuntime {
  private db: LobeChatDatabase;
  private userId: string;

  constructor(db: LobeChatDatabase, userId: string) {
    this.db = db;
    this.userId = userId;
  }

  getTopicContext = async (params: GetTopicContextParams): Promise<BuiltinServerRuntimeOutput> => {
    const { topicId } = params;

    if (!topicId) {
      return { content: 'topicId is required', success: false };
    }

    try {
      const topicModel = new TopicModel(this.db, this.userId);
      const topic = await topicModel.findById(topicId);

      if (!topic) {
        return { content: `Topic not found: ${topicId}`, success: false };
      }

      // If topic has a summary, prefer it
      if (topic.historySummary) {
        const result = [
          `# Topic: ${topic.title || 'Untitled'}`,
          '',
          '## Summary',
          topic.historySummary,
        ].join('\n');

        return { content: result, success: true };
      }

      // Fallback: fetch recent messages
      const messageModel = new MessageModel(this.db, this.userId);
      const messages = await messageModel.query({ topicId });

      const recentMessages = messages.slice(-MAX_MESSAGES);

      const lines = [`# Topic: ${topic.title || 'Untitled'}`, '', '## Recent Messages', ''];

      for (const msg of recentMessages) {
        const role =
          msg.role === 'user' ? 'User' : msg.role === 'assistant' ? 'Assistant' : msg.role;
        const content = (msg.content || '').trim();
        if (content) {
          lines.push(`**${role}**: ${content}`, '');
        }
      }

      return { content: lines.join('\n'), success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { content: `Failed to fetch topic context: ${errorMessage}`, error, success: false };
    }
  };
}

export const topicReferenceRuntime: ServerRuntimeRegistration = {
  factory: (context) => {
    if (!context.serverDB) {
      throw new Error('serverDB is required for TopicReference execution');
    }
    if (!context.userId) {
      throw new Error('userId is required for TopicReference execution');
    }
    return new TopicReferenceExecutionRuntime(context.serverDB, context.userId);
  },
  identifier: TopicReferenceIdentifier,
};
```

- [ ] **Step 2: Register in serverRuntimes/index.ts**

Add import:

```typescript
import { topicReferenceRuntime } from './topicReference';
```

Add to `registerRuntimes` array:

```typescript
topicReferenceRuntime,
```

---

## Task 5: Install dependencies and verify

- [ ] **Step 1: Run pnpm install**

```bash
pnpm install
```

- [ ] **Step 2: Type check modified files**

```bash
bunx tsc --noEmit packages/builtin-tool-topic-reference/src/index.ts
```

- [ ] **Step 3: Verify imports resolve**

Check that `@lobechat/builtin-tool-topic-reference` resolves correctly from `packages/builtin-tools/`.

---

## Task 6: Commit

- [ ] **Step 1: Stage and commit**

```bash
git add packages/builtin-tool-topic-reference/ \
  packages/builtin-tools/package.json \
  packages/builtin-tools/src/index.ts \
  src/server/services/toolExecution/serverRuntimes/topicReference.ts \
  src/server/services/toolExecution/serverRuntimes/index.ts

git commit -m "✨ feat: add topic reference builtin tool for LLM to fetch referenced topic context"
```
