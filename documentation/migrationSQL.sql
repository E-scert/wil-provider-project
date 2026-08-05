----// Copyright (c) 2026 JR
---// Licensed under the MIT License. See LICENSE file for details.

-- =========================
-- 1. AUTHENTICATION & CORE USERS
-- Stores all system users (students, companies, admins).
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    password_hash VARCHAR(255) NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('student', 'company', 'admin')),
    date_created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- 2. STUDENT MAIN PROFILE
-- Basic student identity linked to users table.
CREATE TABLE student (
    stud_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    sex VARCHAR(10),
    age INT
);

-- =========================
-- 3. STUDENT CONTACT & ACADEMIC DETAILS
-- Stores student contact info and academic field.
CREATE TABLE stud_details (
    details_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stud_id UUID REFERENCES student(stud_id) ON DELETE CASCADE,
    student_email VARCHAR(255) UNIQUE NOT NULL,
    personal_email VARCHAR(255),
    course_field VARCHAR(150),
    cell_no VARCHAR(20)
);

-- =========================
-- 4. STUDENT DOCUMENT TRACKING
-- Tracks uploaded student documents (ID, WIL letter, academic record).
CREATE TABLE stud_docs (
    docs_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stud_id UUID UNIQUE REFERENCES student(stud_id) ON DELETE CASCADE,
    wil_doc_path TEXT,
    id_doc_path TEXT,
    academic_doc_path TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- 5. STUDENT SKILLS (normalized join table)
-- Maps students to individual skills for querying/filtering.
CREATE TABLE stud_skill_map (
    map_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stud_id UUID REFERENCES student(stud_id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL
);

-- =========================
-- 6. COMPANY PROFILE
-- Stores company identity linked to users table.
CREATE TABLE company (
    comp_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    comp_name VARCHAR(150) NOT NULL,
    comp_email VARCHAR(255) UNIQUE NOT NULL,
    comp_description TEXT
);

-- =========================
-- 7. COMPANY ADDRESS
-- Stores company address details linked to company table.
CREATE TABLE company_address (
    address_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comp_id UUID REFERENCES company(comp_id) ON DELETE CASCADE,
    recipient_name VARCHAR(150),
    building_street_name TEXT NOT NULL,
    unit VARCHAR(50),
    suburb VARCHAR(100),
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL
);

-- =========================
-- 8. WIL PROGRAMMES
-- Stores WIL opportunities posted by companies.
CREATE TABLE wil_program (
    program_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comp_id UUID REFERENCES company(comp_id) ON DELETE CASCADE,
    program_name VARCHAR(150) NOT NULL,
    program_desc TEXT,
    duration_months INT NOT NULL,
    program_field VARCHAR(150) NOT NULL,
    open_date DATE NOT NULL,
    close_date DATE NOT NULL,
    slots_open INT NOT NULL,
    date_created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- 9. STUDENT APPLICATIONS
-- Tracks student applications to WIL programs.
CREATE TABLE student_app (
    app_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stud_id UUID REFERENCES student(stud_id) ON DELETE CASCADE,
    program_id UUID REFERENCES wil_program(program_id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Reviewed', 'Accepted', 'Rejected')),
    date_applied TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- =========================
-- 1. ENABLE RLS ON ALL TABLES
-- Row Level Security ensures each role only sees its own data.
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE student ENABLE ROW LEVEL SECURITY;
ALTER TABLE stud_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE stud_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE stud_skill_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE company ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_address ENABLE ROW LEVEL SECURITY;
ALTER TABLE wil_program ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_app ENABLE ROW LEVEL SECURITY;

-- =========================
-- 2. STUDENT POLICIES
-- Students can only view their own profile, details, docs, and applications.
CREATE POLICY "Students can view own profile"
ON student FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Students can view own details"
ON stud_details FOR SELECT
USING (stud_id IN (SELECT stud_id FROM student WHERE user_id = auth.uid()));

CREATE POLICY "Students can view own docs"
ON stud_docs FOR SELECT
USING (stud_id IN (SELECT stud_id FROM student WHERE user_id = auth.uid()));

CREATE POLICY "Students can apply to programs"
ON student_app FOR INSERT
WITH CHECK (stud_id IN (SELECT stud_id FROM student WHERE user_id = auth.uid()));

CREATE POLICY "Students can view own applications"
ON student_app FOR SELECT
USING (stud_id IN (SELECT stud_id FROM student WHERE user_id = auth.uid()));

-- Students can view all programs (open listings)
CREATE POLICY "Students can view all programs"
ON wil_program FOR SELECT
USING (true);

-- =========================
-- 3. COMPANY POLICIES
-- Companies can only view their own profile, addresses, programs, and applicants.
CREATE POLICY "Companies can view own profile"
ON company FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Companies can view own addresses"
ON company_address FOR SELECT
USING (comp_id IN (SELECT comp_id FROM company WHERE user_id = auth.uid()));

CREATE POLICY "Companies can post programs"
ON wil_program FOR INSERT
WITH CHECK (comp_id IN (SELECT comp_id FROM company WHERE user_id = auth.uid()));

CREATE POLICY "Companies can view own programs"
ON wil_program FOR SELECT
USING (comp_id IN (SELECT comp_id FROM company WHERE user_id = auth.uid()));

CREATE POLICY "Companies can view applicants"
ON student_app FOR SELECT
USING (
    program_id IN (
        SELECT program_id
        FROM wil_program
        WHERE comp_id IN (
            SELECT comp_id FROM company WHERE user_id = auth.uid()
        )
    )
);

-- =========================
-- 4. ADMIN POLICIES
-- Admins have full access to all tables.
CREATE POLICY "Admins full access users"
ON users FOR ALL
USING (auth.role() = 'admin')
WITH CHECK (auth.role() = 'admin');

CREATE POLICY "Admins full access student"
ON student FOR ALL
USING (auth.role() = 'admin')
WITH CHECK (auth.role() = 'admin');

CREATE POLICY "Admins full access stud_details"
ON stud_details FOR ALL
USING (auth.role() = 'admin')
WITH CHECK (auth.role() = 'admin');

CREATE POLICY "Admins full access stud_docs"
ON stud_docs FOR ALL
USING (auth.role() = 'admin')
WITH CHECK (auth.role() = 'admin');

CREATE POLICY "Admins full access stud_skill_map"
ON stud_skill_map FOR ALL
USING (auth.role() = 'admin')
WITH CHECK (auth.role() = 'admin');

CREATE POLICY "Admins full access company"
ON company FOR ALL
USING (auth.role() = 'admin')
WITH CHECK (auth.role() = 'admin');

CREATE POLICY "Admins full access company_address"
ON company_address FOR ALL
USING (auth.role() = 'admin')
WITH CHECK (auth.role() = 'admin');

CREATE POLICY "Admins full access wil_program"
ON wil_program FOR ALL
USING (auth.role() = 'admin')
WITH CHECK (auth.role() = 'admin');

CREATE POLICY "Admins full access student_app"
ON student_app FOR ALL
USING (auth.role() = 'admin')
WITH CHECK (auth.role() = 'admin');

-- =========================
--FUNCTIONS & TRIGGERS

-- =========================
-- FUNCTION 1: Prevent applications to full programs
-- Ensures students cannot apply to WIL programs that have no slots left.
CREATE OR REPLACE FUNCTION public.check_program_capacity()
RETURNS TRIGGER AS $$
DECLARE
    v_slots_remaining INT;
BEGIN
    SELECT slots_open INTO v_slots_remaining
    FROM public.wil_program
    WHERE program_id = NEW.program_id;

    IF v_slots_remaining <= 0 THEN
        RAISE EXCEPTION 'This WIL program is full. Applications are closed.'
            USING ERRCODE = 'D0000';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER before_student_app_insert
    BEFORE INSERT ON public.student_app
    FOR EACH ROW
    EXECUTE FUNCTION public.check_program_capacity();

-- =========================
-- FUNCTION 2: Decrement slots when student accepted
-- Reduces slots_open by 1 when a student’s application status changes to Accepted.
CREATE OR REPLACE FUNCTION public.decrement_program_capacity()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'Accepted' AND (OLD.status IS DISTINCT FROM 'Accepted') THEN
        UPDATE public.wil_program
        SET slots_open = slots_open - 1
        WHERE program_id = NEW.program_id
          AND slots_open > 0;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_application_accepted
    AFTER UPDATE ON public.student_app
    FOR EACH ROW
    EXECUTE FUNCTION public.decrement_program_capacity();

-- =========================
-- FUNCTION 3: Auto-reject pending applicants when slots depleted
-- If slots_open becomes 0, reject all remaining Pending applications for that program.
CREATE OR REPLACE FUNCTION public.auto_reject_remaining_applicants()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slots_open <= 0 THEN
        UPDATE public.student_app
        SET status = 'Rejected'
        WHERE program_id = NEW.program_id
          AND status = 'Pending';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_slots_depleted
    AFTER UPDATE OF slots_open ON public.wil_program
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_reject_remaining_applicants();

-- =========================
-- FUNCTION 4: Auto-link uploaded student docs
-- Links uploaded file paths to the correct student in stud_docs.
-- NOTE: If you don’t have Supabase’s storage.objects table, attach this trigger
-- to stud_docs or handle linking in your backend code.
CREATE OR REPLACE FUNCTION public.auto_link_student_docs()
RETURNS TRIGGER AS $$
DECLARE
    v_stud_id UUID;
    v_doc_type TEXT;
    v_path_tokens TEXT[];
BEGIN
    -- Example logic: parse file path to extract student UUID
    v_path_tokens := string_to_array(NEW.name, '/');
    IF array_length(v_path_tokens, 1) >= 2 THEN
        v_stud_id := v_path_tokens[2]::UUID;
    END IF;

    -- Detect document type based on filename
    IF NEW.name ILIKE '%id%' THEN
        v_doc_type := 'id';
    ELSIF NEW.name ILIKE '%wil%' THEN
        v_doc_type := 'wil';
    ELSIF NEW.name ILIKE '%academic%' THEN
        v_doc_type := 'academic';
    END IF;

    -- Upsert into stud_docs
    INSERT INTO public.stud_docs (stud_id, id_doc_path, wil_doc_path, academic_doc_path, updated_at)
    VALUES (
        v_stud_id,
        CASE WHEN v_doc_type = 'id' THEN NEW.name ELSE NULL END,
        CASE WHEN v_doc_type = 'wil' THEN NEW.name ELSE NULL END,
        CASE WHEN v_doc_type = 'academic' THEN NEW.name ELSE NULL END,
        CURRENT_TIMESTAMP
    )
    ON CONFLICT (stud_id) DO UPDATE
    SET id_doc_path = CASE WHEN v_doc_type = 'id' THEN NEW.name ELSE stud_docs.id_doc_path END,
        wil_doc_path = CASE WHEN v_doc_type = 'wil' THEN NEW.name ELSE stud_docs.wil_doc_path END,
        academic_doc_path = CASE WHEN v_doc_type = 'academic' THEN NEW.name ELSE stud_docs.academic_doc_path END,
        updated_at = CURRENT_TIMESTAMP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to the table you want to watch.
-- If you have Supabase Storage internal table:
--   AFTER INSERT ON storage.objects
-- Otherwise, attach to stud_docs or handle in backend.
DROP TRIGGER IF EXISTS auto_link_student_docs_trigger ON public.stud_docs;

CREATE TRIGGER auto_link_student_docs_trigger
AFTER INSERT ON public.stud_docs
FOR EACH ROW
EXECUTE FUNCTION public.auto_link_student_docs();

- ---------------------------------------------------------------------
-- 1. users — allow a freshly-authenticated user to create their own row
-- ---------------------------------------------------------------------
CREATE POLICY "Users can insert own row"
ON users FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- 2. student — self-signup + self-edit
-- ---------------------------------------------------------------------
CREATE POLICY "Students can insert own profile"
ON student FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can update own profile"
ON student FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- 3. stud_details — self-signup + self-edit
-- ---------------------------------------------------------------------
CREATE POLICY "Students can insert own details"
ON stud_details FOR INSERT
WITH CHECK (stud_id IN (SELECT stud_id FROM student WHERE user_id = auth.uid()));

CREATE POLICY "Students can update own details"
ON stud_details FOR UPDATE
USING (stud_id IN (SELECT stud_id FROM student WHERE user_id = auth.uid()))
WITH CHECK (stud_id IN (SELECT stud_id FROM student WHERE user_id = auth.uid()));

-- ---------------------------------------------------------------------
-- 4. stud_docs — needed for document upload
-- ---------------------------------------------------------------------
CREATE POLICY "Students can insert own docs"
ON stud_docs FOR INSERT
WITH CHECK (stud_id IN (SELECT stud_id FROM student WHERE user_id = auth.uid()));

CREATE POLICY "Students can update own docs"
ON stud_docs FOR UPDATE
USING (stud_id IN (SELECT stud_id FROM student WHERE user_id = auth.uid()))
WITH CHECK (stud_id IN (SELECT stud_id FROM student WHERE user_id = auth.uid()));

-- ---------------------------------------------------------------------
-- 5. stud_skill_map — 
-- ---------------------------------------------------------------------
CREATE POLICY "Students can view own skills"
ON stud_skill_map FOR SELECT
USING (stud_id IN (SELECT stud_id FROM student WHERE user_id = auth.uid()));

CREATE POLICY "Students can insert own skills"
ON stud_skill_map FOR INSERT
WITH CHECK (stud_id IN (SELECT stud_id FROM student WHERE user_id = auth.uid()));

CREATE POLICY "Students can delete own skills"
ON stud_skill_map FOR DELETE
USING (stud_id IN (SELECT stud_id FROM student WHERE user_id = auth.uid()));

-- ---------------------------------------------------------------------
-- 6. company — self-signup + self-edit
-- ---------------------------------------------------------------------
CREATE POLICY "Companies can insert own profile"
ON company FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Companies can update own profile"
ON company FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- 7. company_address — self-signup + self-edit
-- ---------------------------------------------------------------------
CREATE POLICY "Companies can insert own address"
ON company_address FOR INSERT
WITH CHECK (comp_id IN (SELECT comp_id FROM company WHERE user_id = auth.uid()));

CREATE POLICY "Companies can update own address"
ON company_address FOR UPDATE
USING (comp_id IN (SELECT comp_id FROM company WHERE user_id = auth.uid()))
WITH CHECK (comp_id IN (SELECT comp_id FROM company WHERE user_id = auth.uid()));

-- ---------------------------------------------------------------------
-- 8. student_app — companies need UPDATE to accept/reject applicants

-- ---------------------------------------------------------------------
CREATE POLICY "Companies can update applicant status"
ON student_app FOR UPDATE
USING (
  program_id IN (
    SELECT program_id FROM wil_program
    WHERE comp_id IN (SELECT comp_id FROM company WHERE user_id = auth.uid())
  )
)
WITH CHECK (
  program_id IN (
    SELECT program_id FROM wil_program
    WHERE comp_id IN (SELECT comp_id FROM company WHERE user_id = auth.uid())
  )
);


-- =====================================================================
DROP TRIGGER IF EXISTS auto_link_student_docs_trigger ON public.stud_docs;


