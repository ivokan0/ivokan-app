-- Create tutor_resume table
CREATE TABLE tutor_resume (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tutor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('education', 'work_experience', 'certification')),
    
    -- Education fields
    institution_name TEXT,
    field_of_study TEXT,
    degree_level TEXT,
    
    -- Work experience fields
    company_name TEXT,
    position TEXT,
    
    -- Certification fields
    certificate_name TEXT,
    issuing_organization TEXT,
    
    -- Common fields
    start_year INTEGER NOT NULL,
    end_year INTEGER, -- optional
    description TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_tutor_resume_tutor_id ON tutor_resume(tutor_id);
CREATE INDEX idx_tutor_resume_type ON tutor_resume(type);

-- Enable RLS
ALTER TABLE tutor_resume ENABLE ROW LEVEL SECURITY;

-- Create policy for all operations
CREATE POLICY "Allow all operations on tutor_resume" 
  ON tutor_resume FOR ALL USING (true);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tutor_resume_updated_at 
    BEFORE UPDATE ON tutor_resume 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
