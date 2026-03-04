-- Run this SQL in your Supabase SQL Editor to add the skills_ratings column
-- This allows for proper storage of skills data instead of packing it into the remark

ALTER TABLE student_report_data 
ADD COLUMN IF NOT EXISTS skills_ratings JSONB DEFAULT '{}'::jsonb;

-- Optional: Create an index for better performance if querying by skills
-- CREATE INDEX IF NOT EXISTS idx_student_report_data_skills ON student_report_data USING gin (skills_ratings);
