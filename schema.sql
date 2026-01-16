-- Database Schema for FMSC Corporate Plan Tracker

-- Reports Table
CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    department_id TEXT NOT NULL,
    period TEXT NOT NULL, -- Format: YYYY-MM
    status TEXT NOT NULL, -- DRAFT, SUBMITTED, REVISION_REQUESTED, ACCEPTED
    created_by TEXT NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE,
    selected_goals JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Report Entries Table
CREATE TABLE IF NOT EXISTS report_entries (
    id TEXT PRIMARY KEY,
    report_id TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    objective_id TEXT NOT NULL,
    status TEXT NOT NULL, -- Not started, In progress, Completed, Delayed
    narrative TEXT,
    metrics TEXT,
    challenges TEXT,
    support_needed TEXT,
    evidence_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    submitted_by TEXT, -- User ID
    submitted_by_name TEXT,
    is_approved_by_hod BOOLEAN DEFAULT FALSE
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_reports_dept_period ON reports(department_id, period);
CREATE INDEX IF NOT EXISTS idx_entries_report_id ON report_entries(report_id);
