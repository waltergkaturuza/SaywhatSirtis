-- Create document_folders table for managing dynamic folder structure
CREATE TABLE IF NOT EXISTS document_folders (
    id SERIAL PRIMARY KEY,
    path VARCHAR(500) NOT NULL UNIQUE, -- Full folder path like "HR/Employee contracts"
    department VARCHAR(200) NOT NULL, -- Department name
    category VARCHAR(200) NOT NULL, -- Document category
    document_count INTEGER DEFAULT 0, -- Number of documents in this folder
    created_by VARCHAR(200), -- User who created the folder
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB, -- Additional folder metadata
    
    -- Indexes for better performance
    UNIQUE(department, category),
    INDEX idx_document_folders_dept (department),
    INDEX idx_document_folders_category (category),
    INDEX idx_document_folders_path (path),
    INDEX idx_document_folders_active (is_active)
);

-- Add folderPath column to documents table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'documents' AND column_name = 'folder_path') THEN
        ALTER TABLE documents ADD COLUMN folder_path VARCHAR(500);
        ALTER TABLE documents ADD INDEX idx_documents_folder_path (folder_path);
    END IF;
END $$;

-- Update existing documents to have folder paths based on department and category
UPDATE documents 
SET folder_path = CONCAT(department, '/', category)
WHERE department IS NOT NULL 
  AND category IS NOT NULL 
  AND (folder_path IS NULL OR folder_path = '');

-- Insert initial folder records for existing document combinations
INSERT INTO document_folders (path, department, category, document_count, created_by, created_at)
SELECT 
    CONCAT(department, '/', category) as path,
    department,
    category,
    COUNT(*) as document_count,
    'system' as created_by,
    CURRENT_TIMESTAMP as created_at
FROM documents 
WHERE department IS NOT NULL 
  AND category IS NOT NULL
GROUP BY department, category
ON CONFLICT (path) DO NOTHING;

-- Create function to automatically update folder document count
CREATE OR REPLACE FUNCTION update_folder_document_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle INSERT
    IF TG_OP = 'INSERT' THEN
        IF NEW.department IS NOT NULL AND NEW.category IS NOT NULL THEN
            INSERT INTO document_folders (path, department, category, document_count, created_by)
            VALUES (CONCAT(NEW.department, '/', NEW.category), NEW.department, NEW.category, 1, 'auto')
            ON CONFLICT (path) DO UPDATE SET 
                document_count = document_folders.document_count + 1,
                last_updated = CURRENT_TIMESTAMP;
        END IF;
        RETURN NEW;
    END IF;
    
    -- Handle UPDATE
    IF TG_OP = 'UPDATE' THEN
        -- Decrease count from old folder if it existed
        IF OLD.department IS NOT NULL AND OLD.category IS NOT NULL THEN
            UPDATE document_folders 
            SET document_count = GREATEST(document_count - 1, 0),
                last_updated = CURRENT_TIMESTAMP
            WHERE path = CONCAT(OLD.department, '/', OLD.category);
        END IF;
        
        -- Increase count in new folder
        IF NEW.department IS NOT NULL AND NEW.category IS NOT NULL THEN
            INSERT INTO document_folders (path, department, category, document_count, created_by)
            VALUES (CONCAT(NEW.department, '/', NEW.category), NEW.department, NEW.category, 1, 'auto')
            ON CONFLICT (path) DO UPDATE SET 
                document_count = document_folders.document_count + 1,
                last_updated = CURRENT_TIMESTAMP;
        END IF;
        RETURN NEW;
    END IF;
    
    -- Handle DELETE
    IF TG_OP = 'DELETE' THEN
        IF OLD.department IS NOT NULL AND OLD.category IS NOT NULL THEN
            UPDATE document_folders 
            SET document_count = GREATEST(document_count - 1, 0),
                last_updated = CURRENT_TIMESTAMP
            WHERE path = CONCAT(OLD.department, '/', OLD.category);
        END IF;
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic folder count management
DROP TRIGGER IF EXISTS trigger_update_folder_count ON documents;
CREATE TRIGGER trigger_update_folder_count
    AFTER INSERT OR UPDATE OR DELETE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_folder_document_count();

COMMENT ON TABLE document_folders IS 'Dynamic folder structure for organizing documents by department and category';
COMMENT ON COLUMN document_folders.path IS 'Full folder path in format: Department/Category';
COMMENT ON COLUMN document_folders.document_count IS 'Automatically maintained count of documents in this folder';