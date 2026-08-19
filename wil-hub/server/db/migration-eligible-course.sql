ALTER TABLE wil_programs ADD COLUMN eligible_courses TEXT[];

-- Speeds up the array-containment check the matching algorithm will use
CREATE INDEX idx_wil_programs_eligible_courses ON wil_programs USING GIN (eligible_courses);