BEGIN;

CREATE TABLE IF NOT EXISTS curriculum_nodes (
  id TEXT PRIMARY KEY,
  parent_id TEXT REFERENCES curriculum_nodes(id) ON DELETE CASCADE,
  node_type TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL DEFAULT '',
  position INTEGER NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by_user_id TEXT,
  updated_by_user_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE curriculum_nodes ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE curriculum_nodes ADD COLUMN IF NOT EXISTS metadata JSONB;

UPDATE curriculum_nodes SET slug = '' WHERE slug IS NULL;
UPDATE curriculum_nodes SET metadata = '{}'::jsonb WHERE metadata IS NULL;

ALTER TABLE curriculum_nodes ALTER COLUMN slug SET DEFAULT '';
ALTER TABLE curriculum_nodes ALTER COLUMN slug SET NOT NULL;
ALTER TABLE curriculum_nodes ALTER COLUMN metadata SET DEFAULT '{}'::jsonb;
ALTER TABLE curriculum_nodes ALTER COLUMN metadata SET NOT NULL;

UPDATE curriculum_nodes SET node_type = 'year' WHERE node_type = 'class';
UPDATE curriculum_nodes SET node_type = 'chapter' WHERE node_type = 'module';
UPDATE curriculum_nodes SET node_type = 'lesson' WHERE node_type = 'material';

UPDATE curriculum_nodes AS node
SET node_type = 'subject'
FROM curriculum_nodes AS parent
WHERE node.node_type = 'chapter'
  AND parent.id = node.parent_id
  AND parent.node_type = 'year';

INSERT INTO curriculum_nodes (
  id,
  parent_id,
  node_type,
  title,
  slug,
  position,
  metadata,
  created_at,
  updated_at
)
SELECT
  'curriculum-school-edutindo',
  NULL,
  'school',
  'EDUTINDO School',
  'edutindo',
  0,
  '{}'::jsonb,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1
  FROM curriculum_nodes
  WHERE parent_id IS NULL
    AND node_type = 'school'
    AND slug = 'edutindo'
);

WITH default_school AS (
  SELECT id
  FROM curriculum_nodes
  WHERE parent_id IS NULL
    AND node_type = 'school'
    AND slug = 'edutindo'
  ORDER BY created_at ASC
  LIMIT 1
)
UPDATE curriculum_nodes
SET
  parent_id = (SELECT id FROM default_school),
  updated_at = NOW()
WHERE parent_id IS NULL
  AND node_type = 'year';

CREATE INDEX IF NOT EXISTS curriculum_nodes_parent_position_idx
ON curriculum_nodes (parent_id, position, created_at);

CREATE INDEX IF NOT EXISTS curriculum_nodes_parent_type_idx
ON curriculum_nodes (parent_id, node_type);

CREATE INDEX IF NOT EXISTS curriculum_nodes_parent_slug_idx
ON curriculum_nodes (parent_id, slug);

COMMIT;
