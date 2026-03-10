-- Custom SQL migration file, put your code below! --

-- agents: title, description, slug, tags(jsonb)
CREATE INDEX agents_bm25_idx ON agents
USING bm25 (id, title, description, slug, tags)
WITH (key_field='id');

-- topics: title, content, history_summary
CREATE INDEX topics_bm25_idx ON topics
USING bm25 (id, title, content, history_summary)
WITH (key_field='id');

-- messages: content
CREATE INDEX messages_bm25_idx ON messages
USING bm25 (id, content)
WITH (key_field='id');

-- files: name
CREATE INDEX files_bm25_idx ON files
USING bm25 (id, name)
WITH (key_field='id');

-- documents: title, filename, description
CREATE INDEX documents_bm25_idx ON documents
USING bm25 (id, title, filename, description)
WITH (key_field='id');

-- knowledge_bases: name, description
CREATE INDEX knowledge_bases_bm25_idx ON knowledge_bases
USING bm25 (id, name, description)
WITH (key_field='id');

-- user_memories: title, summary, details
CREATE INDEX user_memories_bm25_idx ON user_memories
USING bm25 (id, title, summary, details)
WITH (key_field='id');

-- chat_groups: title, description
CREATE INDEX chat_groups_bm25_idx ON chat_groups
USING bm25 (id, title, description)
WITH (key_field='id');
