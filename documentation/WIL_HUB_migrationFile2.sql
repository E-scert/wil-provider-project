-- ============================
-- WIL Hub MVP Schema Migration (SERIAL PKs)
-- ============================

-- Users
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT CHECK (role IN ('student','company_admin','institution_admin','super_admin')) NOT NULL,
    linked_id INT, -- FK to student/company/institution depending on role
    created_at TIMESTAMP DEFAULT NOW()
);

-- Students
CREATE TABLE students (
    student_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    program_of_study TEXT NOT NULL,
    graduation_year INT,
    cv_url TEXT,
    skills TEXT[],
    
    availability_date DATE,
    eligibility_status TEXT CHECK (eligibility_status IN ('provisional','verified')) DEFAULT 'provisional'
);

-- Institutions
CREATE TABLE institutions (
    institution_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT UNIQUE NOT NULL,
    verification_role BOOLEAN DEFAULT TRUE
);

-- Companies
CREATE TABLE companies (
    company_id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    industry TEXT,
    contact_person TEXT,
    email TEXT UNIQUE NOT NULL,
    verified_status BOOLEAN DEFAULT FALSE
);

-- WIL Programs
CREATE TABLE wil_programs (
    program_id SERIAL PRIMARY KEY,
    company_id INT REFERENCES companies(company_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    eligible_courses TEXT[] NOT NULL,   -- core matching field
    duration_months INT,                -- optional
    open_date DATE,                     -- optional
    close_date DATE NOT NULL,           -- always required
    posting_status TEXT CHECK (
        posting_status IN ('pending','approved','closed')
    ) DEFAULT 'pending',

    -- Application handling
    application_method TEXT CHECK (
        application_method IN ('email','portal')
    ) NOT NULL,
    application_email TEXT,
    application_link TEXT,

    -- Constraint: enforce correct field usage
    CONSTRAINT application_method_check
        CHECK (
            (application_method = 'email' AND application_email IS NOT NULL AND application_link IS NULL)
            OR
            (application_method = 'portal' AND application_link IS NOT NULL AND application_email IS NULL)
        )
);


-- Applications
CREATE TABLE applications (
    application_id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(student_id) ON DELETE CASCADE,
    program_id INT REFERENCES wil_programs(program_id) ON DELETE CASCADE,
    status TEXT CHECK (status IN ('pending','shortlisted','selected','rejected')) DEFAULT 'pending',
    date_applied DATE DEFAULT CURRENT_DATE
);

-- Matches
CREATE TABLE matches (
    match_id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(student_id) ON DELETE CASCADE,
    program_id INT REFERENCES wil_programs(program_id) ON DELETE CASCADE,
    institution_id INT REFERENCES institutions(institution_id) ON DELETE CASCADE,
    match_status TEXT CHECK (match_status IN ('proposed','approved','rejected')) DEFAULT 'proposed',
    date_matched DATE DEFAULT CURRENT_DATE
);

-- Placements
CREATE TABLE placements (
    placement_id SERIAL PRIMARY KEY,
    student_id INT REFERENCES students(student_id) ON DELETE CASCADE,
    program_id INT REFERENCES wil_programs(program_id) ON DELETE CASCADE,
    company_id INT REFERENCES companies(company_id) ON DELETE CASCADE,
    institution_id INT REFERENCES institutions(institution_id) ON DELETE CASCADE,
    start_date DATE,
    end_date DATE,
    completion_status TEXT CHECK (completion_status IN ('ongoing','completed','failed')) DEFAULT 'ongoing'
);

-- Reports
CREATE TABLE reports (
    report_id SERIAL PRIMARY KEY,
    placement_id INT REFERENCES placements(placement_id) ON DELETE CASCADE,
    institution_id INT REFERENCES institutions(institution_id) ON DELETE CASCADE,
    graduation_impact BOOLEAN DEFAULT FALSE,
    notes TEXT
);

-- Indexes
CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_companies_email ON companies(email);
CREATE INDEX idx_institutions_email ON institutions(email);
CREATE INDEX idx_wil_programs_company ON wil_programs(company_id);
CREATE INDEX idx_applications_student ON applications(student_id);
CREATE INDEX idx_applications_program ON applications(program_id);
CREATE INDEX idx_matches_student ON matches(student_id);
CREATE INDEX idx_matches_program ON matches(program_id);
CREATE INDEX idx_placements_student ON placements(student_id);
CREATE INDEX idx_placements_program ON placements(program_id);


