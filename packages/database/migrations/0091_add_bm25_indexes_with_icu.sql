-- Custom SQL migration file, put your code below! --
-- All tables include user_id (keyword tokenizer + fast) for filter pushdown into tantivy index scan.
-- Messages additionally includes role for the same reason.

-- agents: title, description, slug, tags(jsonb), user_id
DROP INDEX IF EXISTS agents_bm25_idx;
CREATE INDEX agents_bm25_idx ON agents
USING bm25 (id, title, description, slug, tags, user_id)
WITH (
  key_field='id',
  text_fields='{"title":{"tokenizer":{"type":"icu","stemmer":"English","stopwords_language":"English"}},"description":{"tokenizer":{"type":"icu","stemmer":"English","stopwords_language":"English"}},"slug":{"tokenizer":{"type":"icu"}},"user_id":{"fast":true,"tokenizer":{"type":"keyword"}}}',
  json_fields='{"tags":{"tokenizer":{"type":"icu"}}}'
);

-- topics: title, content, history_summary, user_id
DROP INDEX IF EXISTS topics_bm25_idx;
CREATE INDEX topics_bm25_idx ON topics
USING bm25 (id, title, content, history_summary, user_id)
WITH (
  key_field='id',
  text_fields='{"title":{"tokenizer":{"type":"icu","stemmer":"English","stopwords_language":"English"}},"content":{"tokenizer":{"type":"icu","stemmer":"English","stopwords_language":"English"}},"history_summary":{"tokenizer":{"type":"icu","stemmer":"English","stopwords_language":"English"}},"user_id":{"fast":true,"tokenizer":{"type":"keyword"}}}'
);

-- messages: content, user_id, role
DROP INDEX IF EXISTS messages_bm25_idx;
CREATE INDEX messages_bm25_idx ON messages
USING bm25 (id, content, user_id, role)
WITH (
  key_field='id',
  text_fields='{"content":{"tokenizer":{"type":"icu","stemmer":"English","stopwords_language":"English"}},"user_id":{"fast":true,"tokenizer":{"type":"keyword"}},"role":{"fast":true,"tokenizer":{"type":"keyword"}}}'
);

-- files: name, user_id
DROP INDEX IF EXISTS files_bm25_idx;
CREATE INDEX files_bm25_idx ON files
USING bm25 (id, name, user_id)
WITH (
  key_field='id',
  text_fields='{"name":{"tokenizer":{"type":"icu"}},"user_id":{"fast":true,"tokenizer":{"type":"keyword"}}}'
);

-- documents: title, filename, description, user_id
DROP INDEX IF EXISTS documents_bm25_idx;
CREATE INDEX documents_bm25_idx ON documents
USING bm25 (id, title, filename, description, user_id)
WITH (
  key_field='id',
  text_fields='{"title":{"tokenizer":{"type":"icu","stemmer":"English","stopwords_language":"English"}},"filename":{"tokenizer":{"type":"icu"}},"description":{"tokenizer":{"type":"icu","stemmer":"English","stopwords_language":"English"}},"user_id":{"fast":true,"tokenizer":{"type":"keyword"}}}'
);

-- knowledge_bases: name, description, user_id
DROP INDEX IF EXISTS knowledge_bases_bm25_idx;
CREATE INDEX knowledge_bases_bm25_idx ON knowledge_bases
USING bm25 (id, name, description, user_id)
WITH (
  key_field='id',
  text_fields='{"name":{"tokenizer":{"type":"icu"}},"description":{"tokenizer":{"type":"icu","stemmer":"English","stopwords_language":"English"}},"user_id":{"fast":true,"tokenizer":{"type":"keyword"}}}'
);

-- user_memories: title, summary, details, user_id
DROP INDEX IF EXISTS user_memories_bm25_idx;
CREATE INDEX user_memories_bm25_idx ON user_memories
USING bm25 (id, title, summary, details, user_id)
WITH (
  key_field='id',
  text_fields='{"title":{"tokenizer":{"type":"icu","stemmer":"English","stopwords_language":"English"}},"summary":{"tokenizer":{"type":"icu","stemmer":"English","stopwords_language":"English"}},"details":{"tokenizer":{"type":"icu","stemmer":"English","stopwords_language":"English"}},"user_id":{"fast":true,"tokenizer":{"type":"keyword"}}}'
);

-- chat_groups: title, description, user_id
DROP INDEX IF EXISTS chat_groups_bm25_idx;
CREATE INDEX chat_groups_bm25_idx ON chat_groups
USING bm25 (id, title, description, user_id)
WITH (
  key_field='id',
  text_fields='{"title":{"tokenizer":{"type":"icu","stemmer":"English","stopwords_language":"English"}},"description":{"tokenizer":{"type":"icu","stemmer":"English","stopwords_language":"English"}},"user_id":{"fast":true,"tokenizer":{"type":"keyword"}}}'
);
