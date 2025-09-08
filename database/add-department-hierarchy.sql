-- Add hierarchical structure to departments table
ALTER TABLE departments 
ADD COLUMN parent_id TEXT,
ADD COLUMN level INTEGER DEFAULT 0;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS departments_parent_id_idx ON departments(parent_id);
CREATE INDEX IF NOT EXISTS departments_level_idx ON departments(level);

-- Add foreign key constraint for parent-child relationship
ALTER TABLE departments 
ADD CONSTRAINT departments_parent_id_fkey 
FOREIGN KEY (parent_id) REFERENCES departments(id) ON DELETE SET NULL;
