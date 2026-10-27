-- ══════════════════════════════════════════════════════════════
-- CIVICRESOLVE AI — PRODUCTION SQLITE DATABASE SCHEMA
-- Role-Based Smart City Grievance, Department Coordination & Resolution Platform
-- ══════════════════════════════════════════════════════════════

PRAGMA foreign_keys = ON;

-- 1. Users Table (Role-Based Authentication & Access Control)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('citizen', 'worker', 'officer', 'employee', 'admin')),
    department TEXT,
    ward TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'pending_approval', 'disabled')),
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- 2. Complaints Table
CREATE TABLE IF NOT EXISTS complaints (
    id TEXT PRIMARY KEY,
    citizen_id TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    department TEXT NOT NULL,
    ward TEXT NOT NULL,
    locality TEXT NOT NULL,
    landmark TEXT,
    lat REAL,
    lng REAL,
    urgency TEXT NOT NULL DEFAULT 'Normal' CHECK(urgency IN ('Low', 'Normal', 'High', 'Critical')),
    safety_concern INTEGER NOT NULL DEFAULT 0,
    recurring INTEGER NOT NULL DEFAULT 0,
    affected_count TEXT DEFAULT '10-50',
    status TEXT NOT NULL DEFAULT 'Submitted' CHECK(status IN (
        'Submitted',
        'Under Review',
        'Assigned',
        'In Progress',
        'Resolution Submitted',
        'Verification Pending',
        'Awaiting Verification',
        'Rework Required',
        'Resolved',
        'Reopened',
        'Overdue',
        'Withdrawn'
    )),
    assigned_worker_id TEXT,
    assigned_worker TEXT,
    deadline_hours INTEGER NOT NULL DEFAULT 24,
    created_at TEXT NOT NULL,
    target_deadline TEXT NOT NULL,
    resolved_at TEXT,
    submitted_by TEXT NOT NULL DEFAULT 'Citizen Reporter',
    is_anonymous INTEGER NOT NULL DEFAULT 0,
    upvotes INTEGER NOT NULL DEFAULT 0,
    linked_duplicate_id TEXT,
    idempotency_key TEXT UNIQUE,
    feedback_rating INTEGER,
    feedback_comment TEXT,
    feedback_date TEXT,
    FOREIGN KEY (citizen_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_worker_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (linked_duplicate_id) REFERENCES complaints(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_complaints_citizen ON complaints(citizen_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_ward ON complaints(ward);
CREATE INDEX IF NOT EXISTS idx_complaints_dept ON complaints(department);
CREATE INDEX IF NOT EXISTS idx_complaints_worker ON complaints(assigned_worker_id);
CREATE INDEX IF NOT EXISTS idx_complaints_deadline ON complaints(target_deadline);
CREATE INDEX IF NOT EXISTS idx_complaints_idempotency ON complaints(idempotency_key);

-- 3. Multimodal Attachments Table (Photos, Audio, Video, Docs)
CREATE TABLE IF NOT EXISTS attachments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    complaint_id TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK(file_type IN ('photo', 'video', 'audio', 'document')),
    file_url TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    file_size_bytes INTEGER DEFAULT 0,
    mime_type TEXT,
    stage TEXT NOT NULL DEFAULT 'intake' CHECK(stage IN ('intake', 'resolution')),
    uploaded_by TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_attachments_complaint ON attachments(complaint_id);

-- 4. Complaint Timeline Events Table (Audit History)
CREATE TABLE IF NOT EXISTS complaint_timeline (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    complaint_id TEXT NOT NULL,
    previous_status TEXT,
    new_status TEXT,
    event_type TEXT NOT NULL,
    action TEXT NOT NULL,
    explanation TEXT NOT NULL,
    actor_role TEXT NOT NULL DEFAULT 'system',
    actor_name TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_timeline_complaint ON complaint_timeline(complaint_id);

-- 5. Evidence Table (Photographic / Documented Proof)
CREATE TABLE IF NOT EXISTS evidence (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    complaint_id TEXT NOT NULL,
    evidence_type TEXT NOT NULL CHECK(evidence_type IN ('before', 'after', 'inspection')),
    declared_category TEXT NOT NULL,
    file_path TEXT NOT NULL,
    caption TEXT,
    submitted_by TEXT NOT NULL,
    submitted_at TEXT NOT NULL,
    verification_status TEXT NOT NULL DEFAULT 'Pending' CHECK(verification_status IN ('Pending', 'Approved', 'Rejected')),
    verification_explanation TEXT,
    reviewer_decision TEXT,
    reviewer_name TEXT,
    reviewed_at TEXT,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_evidence_complaint ON evidence(complaint_id);

-- 6. In-App Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    complaint_id TEXT,
    icon_type TEXT NOT NULL DEFAULT 'info' CHECK(icon_type IN ('info', 'success', 'warning', 'danger')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    recipient_role TEXT NOT NULL DEFAULT 'citizen',
    recipient_user_id TEXT,
    created_at TEXT NOT NULL,
    is_read INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notif_role ON notifications(recipient_role, is_read);
CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(recipient_user_id);

-- 7. Escalations Ledger Table (Idempotent SLA & Triage Records)
CREATE TABLE IF NOT EXISTS escalations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    complaint_id TEXT NOT NULL,
    rule_code TEXT NOT NULL,
    escalation_level TEXT NOT NULL DEFAULT 'Level 1' CHECK(escalation_level IN ('Level 1', 'Level 2', 'Level 3', 'Commissioner')),
    reason TEXT NOT NULL,
    action_taken TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_escalations_complaint_rule ON escalations(complaint_id, rule_code);

-- 8. Audit Logs Table (Administrative Security Ledger)
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    actor_id TEXT,
    actor_name TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT NOT NULL,
    ip_address TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_time ON audit_logs(timestamp);

-- 9. System Configuration & Simulated Clock Table
CREATE TABLE IF NOT EXISTS system_state (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);
