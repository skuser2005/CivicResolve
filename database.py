"""
database.py - Database Connection and Initialization for CivicResolve AI.
Uses Python's built-in sqlite3 module with foreign key enforcement and row mapping.
"""

import os
import sqlite3
import time
from datetime import datetime, timezone

DB_NAME = "civicresolve.db"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, DB_NAME)
SCHEMA_PATH = os.path.join(BASE_DIR, "schema.sql")

DEFAULT_SIMULATED_TIME = "2026-10-27T10:00:00Z"


def get_db():
    """Returns a SQLite database connection with row factory and foreign keys enabled."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def init_db(seed=True, reset=False):
    """Initializes the database schema and seeds initial demo records if empty."""
    if reset and os.path.exists(DB_PATH):
        try:
            os.remove(DB_PATH)
        except Exception:
            pass

    with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
        schema_sql = f.read()

    need_recreate = False
    if os.path.exists(DB_PATH):
        try:
            with get_db() as conn:
                cur = conn.cursor()
                cur.execute("PRAGMA table_info(complaints)")
                cols = [r["name"] for r in cur.fetchall()]
                cur.execute("PRAGMA table_info(users)")
                user_cols = [r["name"] for r in cur.fetchall()]
                if "citizen_id" not in cols or "idempotency_key" not in cols or not user_cols:
                    need_recreate = True
        except Exception:
            need_recreate = True

    if need_recreate:
        try:
            os.remove(DB_PATH)
        except Exception:
            pass

    with get_db() as conn:
        conn.executescript(schema_sql)

        # Initialize simulated clock if not present
        cur = conn.cursor()
        cur.execute("SELECT value FROM system_state WHERE key = 'simulated_time'")
        row = cur.fetchone()
        if not row:
            cur.execute(
                "INSERT INTO system_state (key, value) VALUES ('simulated_time', ?)",
                (DEFAULT_SIMULATED_TIME,),
            )

        if seed:
            seed_users(conn)
            seed_initial_data(conn)

        conn.commit()


def get_simulated_time(conn=None):
    """Returns the current simulated clock as an ISO 8601 string."""
    own_conn = False
    if conn is None:
        conn = get_db()
        own_conn = True

    try:
        cur = conn.cursor()
        cur.execute("SELECT value FROM system_state WHERE key = 'simulated_time'")
        row = cur.fetchone()
        if row and row["value"]:
            return row["value"]
        return DEFAULT_SIMULATED_TIME
    finally:
        if own_conn:
            conn.close()


def set_simulated_time(iso_str, conn=None):
    """Sets the simulated clock to a specific ISO 8601 string."""
    own_conn = False
    if conn is None:
        conn = get_db()
        own_conn = True

    try:
        conn.execute(
            "INSERT OR REPLACE INTO system_state (key, value) VALUES ('simulated_time', ?)",
            (iso_str,),
        )
        conn.commit()
    finally:
        if own_conn:
            conn.close()


def seed_initial_data(conn):
    """Seeds rich, realistic complaints, timeline, and evidence if table is empty."""
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) AS cnt FROM complaints")
    if cur.fetchone()["cnt"] > 0:
        return  # Already populated

    # Seed 1: Overdue Dump in Koramangala
    conn.execute(
        """
        INSERT INTO complaints (
            id, title, description, category, department, ward, locality, landmark,
            lat, lng, urgency, safety_concern, recurring, affected_count, status,
            assigned_worker, deadline_hours, created_at, target_deadline, submitted_by, is_anonymous, upvotes
        ) VALUES (
            'CR-2026-8492',
            'Severe Municipal Dump Overflowing onto Pedestrian Walkway',
            'Large waste heap spilling across 15 meters of footpath with severe odor and stray animal menace.',
            'Garbage Dump',
            'Sanitation & Solid Waste',
            'Ward 14 — Koramangala',
            '5th Block, 80 Feet Road',
            'Opposite BDA Complex, near Post Office',
            12.9352, 77.6245,
            'Critical', 1, 1, '200+', 'Overdue',
            'Rajesh Kumar (Squad #4)', 24,
            '2026-10-26T09:30:00Z', '2026-10-27T09:30:00Z',
            'Ananya Sen', 0, 46
        )
        """
    )
    conn.execute(
        """
        INSERT INTO evidence (complaint_id, evidence_type, declared_category, file_path, caption, submitted_by, submitted_at, verification_status)
        VALUES ('CR-2026-8492', 'before', 'Garbage Dump', 'evidence_waste_ward14.jpg', 'Large waste heap spilling across 15m of footpath.', 'Ananya Sen', '2026-10-26T09:30:00Z', 'Pending')
        """
    )
    conn.execute(
        """
        INSERT INTO complaint_timeline (complaint_id, previous_status, new_status, event_type, action, explanation, actor_role, actor_name, created_at)
        VALUES 
        ('CR-2026-8492', NULL, 'Submitted', 'CREATION', 'Complaint Registered', 'Registered grievance with photo and high urgency.', 'citizen', 'Ananya Sen', '2026-10-26 09:30'),
        ('CR-2026-8492', 'Submitted', 'Assigned', 'ASSIGNMENT', 'Department Dispatched', 'Assigned to Sanitation Squad #4 for mechanical clearing.', 'officer', 'Priya Sharma', '2026-10-26 10:15'),
        ('CR-2026-8492', 'Assigned', 'In Progress', 'STATUS_CHANGE', 'Work Order Accepted', 'Field crew assigned dump truck #KA-01-EA-4920.', 'worker', 'Rajesh Kumar', '2026-10-26 11:00'),
        ('CR-2026-8492', 'In Progress', 'Overdue', 'ESCALATION', 'SLA Breach Flagged', 'Target 24-hour turnaround breached. Escalation alert sent to Zonal Commissioner.', 'system', 'Deadline Agent', '2026-10-27 09:30')
        """
    )

    # Seed 2: Verified Resolved Pothole in Malleshwaram
    conn.execute(
        """
        INSERT INTO complaints (
            id, title, description, category, department, ward, locality, landmark,
            lat, lng, urgency, safety_concern, recurring, affected_count, status,
            assigned_worker, deadline_hours, created_at, target_deadline, resolved_at,
            submitted_by, is_anonymous, upvotes, feedback_rating, feedback_comment, feedback_date
        ) VALUES (
            'CR-2026-9104',
            'Dangerous 2ft Deep Road Trench Following Underground Cable Laying',
            'Unbarricaded excavation across carriage lane posing severe skid risk for two-wheelers.',
            'Pothole',
            'Roads & Infrastructure (PWD)',
            'Ward 07 — Malleshwaram',
            '11th Cross, Temple Street',
            'Near Govt Boys High School',
            13.0031, 77.5643,
            'High', 1, 0, '50-200', 'Resolved',
            'PWD Road Crew #8', 48,
            '2026-10-25T14:10:00Z', '2026-10-27T14:10:00Z', '2026-10-27T10:00:00Z',
            'Karthik Rao', 0, 68, 5, 'Quick turnaround within 48 hours. Quality asphalt compaction.', '2026-10-27'
        )
        """
    )
    conn.execute(
        """
        INSERT INTO evidence (complaint_id, evidence_type, declared_category, file_path, caption, submitted_by, submitted_at, verification_status, reviewer_decision, reviewer_name, reviewed_at)
        VALUES 
        ('CR-2026-9104', 'before', 'Pothole', 'evidence_pothole_malleswaram.jpg', 'Unbarricaded excavation across carriage lane.', 'Karthik Rao', '2026-10-25T14:10:00Z', 'Pending', NULL, NULL, NULL),
        ('CR-2026-9104', 'after', 'Pothole', 'evidence_pothole_repaired.jpg', 'Excavation backfilled with WMM, compacted, and resurfaced with bituminous hot mix.', 'PWD Road Crew #8', '2026-10-26T18:30:00Z', 'Approved', 'Approved: Photo confirms hot-mix asphalt restoration.', 'Priya Sharma (Officer)', '2026-10-27T10:00:00Z')
        """
    )
    conn.execute(
        """
        INSERT INTO complaint_timeline (complaint_id, previous_status, new_status, event_type, action, explanation, actor_role, actor_name, created_at)
        VALUES 
        ('CR-2026-9104', NULL, 'Submitted', 'CREATION', 'Complaint Registered', 'Reported road trench with photo proof.', 'citizen', 'Karthik Rao', '2026-10-25 14:10'),
        ('CR-2026-9104', 'Submitted', 'Assigned', 'ASSIGNMENT', 'Assigned to Road Crew #8', 'Work order #PWD-849 issued for evening compaction.', 'officer', 'Priya Sharma', '2026-10-25 16:00'),
        ('CR-2026-9104', 'Assigned', 'In Progress', 'STATUS_CHANGE', 'Work in Progress', 'Crew initiated backfilling and compaction.', 'worker', 'PWD Road Crew #8', '2026-10-26 10:00'),
        ('CR-2026-9104', 'In Progress', 'Awaiting Verification', 'EVIDENCE_SUBMISSION', 'Resolution Evidence Submitted', 'Uploaded completion photo and asphalt compaction log.', 'worker', 'PWD Road Crew #8', '2026-10-26 18:30'),
        ('CR-2026-9104', 'Awaiting Verification', 'Resolved', 'RESOLUTION', 'Officially Verified & Resolved', 'Junior engineer physical inspection passed. Complaint closed.', 'officer', 'Priya Sharma', '2026-10-27 10:00')
        """
    )

    # Seed 3: In Progress Water Leak in Indiranagar
    conn.execute(
        """
        INSERT INTO complaints (
            id, title, description, category, department, ward, locality, landmark,
            lat, lng, urgency, safety_concern, recurring, affected_count, status,
            assigned_worker, deadline_hours, created_at, target_deadline,
            submitted_by, is_anonymous, upvotes
        ) VALUES (
            'CR-2026-7281',
            'Potable Drinking Water Pipeline Burst Flooding Street',
            'Major mains line ruptured, clean drinking water gushing onto the tarmac.',
            'Water Leakage',
            'Water Supply & Sewerage',
            'Ward 04 — Indiranagar',
            '100 Feet Road, 12th Main',
            'Behind Metro Station Pillar #142',
            12.9784, 77.6408,
            'Critical', 0, 0, '200+', 'In Progress',
            'BWSSB Rapid Unit 2', 12,
            '2026-10-27T08:00:00Z', '2026-10-27T20:00:00Z',
            'Meera Nambiar', 1, 32
        )
        """
    )
    conn.execute(
        """
        INSERT INTO complaint_timeline (complaint_id, previous_status, new_status, event_type, action, explanation, actor_role, actor_name, created_at)
        VALUES 
        ('CR-2026-7281', NULL, 'Submitted', 'CREATION', 'Complaint Registered', 'Reported pipeline rupture causing loss of potable water.', 'citizen', 'Anonymous Resident', '2026-10-27 08:00'),
        ('CR-2026-7281', 'Submitted', 'Assigned', 'ASSIGNMENT', 'Valve Gate Isolated', 'Upstream supply closed to stop water wastage while crew arrives.', 'officer', 'Water Board Officer', '2026-10-27 09:20'),
        ('CR-2026-7281', 'Assigned', 'In Progress', 'STATUS_CHANGE', 'Work in Progress', 'Excavation started to replace 4-inch ductile iron collar.', 'worker', 'BWSSB Rapid Unit 2', '2026-10-27 11:30')
        """
    )

    # Seed 4: Broken Streetlight Awaiting Verification in Rajajinagar
    conn.execute(
        """
        INSERT INTO complaints (
            id, title, description, category, department, ward, locality, landmark,
            lat, lng, urgency, safety_concern, recurring, affected_count, status,
            assigned_worker, deadline_hours, created_at, target_deadline,
            submitted_by, is_anonymous, upvotes
        ) VALUES (
            'CR-2026-6140',
            'Four Successive Streetlights Damaged & Dark at Night',
            'Dark alley creating safety issues for women returning from night hospital shifts.',
            'Broken Streetlight',
            'Electrical & Street Lighting',
            'Ward 12 — Rajajinagar',
            '3rd Block, 59th Cross',
            'Near ESI Hospital Circle',
            12.9902, 77.5532,
            'High', 1, 1, '50-200', 'Awaiting Verification',
            'Electrical Maintenance Squad B', 36,
            '2026-10-26T18:45:00Z', '2026-10-28T06:45:00Z',
            'Ananya Sen', 0, 21
        )
        """
    )
    conn.execute(
        """
        INSERT INTO evidence (complaint_id, evidence_type, declared_category, file_path, caption, submitted_by, submitted_at, verification_status)
        VALUES 
        ('CR-2026-6140', 'before', 'Broken Streetlight', 'streetlight_broken.jpg', 'Dark alley creating safety issues.', 'Ananya Sen', '2026-10-26T18:45:00Z', 'Pending'),
        ('CR-2026-6140', 'after', 'Broken Streetlight', 'streetlight_repaired.jpg', 'Replaced faulty MCB switch and fitted 4 new 90W LED fixtures. Tested functional at 25 lux.', 'Electrical Maintenance Squad B', '2026-10-27T14:00:00Z', 'Pending')
        """
    )
    conn.execute(
        """
        INSERT INTO complaint_timeline (complaint_id, previous_status, new_status, event_type, action, explanation, actor_role, actor_name, created_at)
        VALUES 
        ('CR-2026-6140', NULL, 'Submitted', 'CREATION', 'Complaint Registered', 'Night safety issue lodged.', 'citizen', 'Ananya Sen', '2026-10-26 18:45'),
        ('CR-2026-6140', 'Submitted', 'Assigned', 'ASSIGNMENT', 'Assigned to Electrical Squad B', 'Work order issued for luminaire replacement.', 'officer', 'Priya Sharma', '2026-10-26 19:10'),
        ('CR-2026-6140', 'Assigned', 'Awaiting Verification', 'EVIDENCE_SUBMISSION', 'Resolution Evidence Submitted', 'Fixtures replaced and illuminance verified at 25 lux.', 'worker', 'Squad B', '2026-10-27 14:00')
        """
    )

    # Seed 5: Rework Required (Rejected Evidence) in Koramangala
    conn.execute(
        """
        INSERT INTO complaints (
            id, title, description, category, department, ward, locality, landmark,
            lat, lng, urgency, safety_concern, recurring, affected_count, status,
            assigned_worker, deadline_hours, created_at, target_deadline,
            submitted_by, is_anonymous, upvotes
        ) VALUES (
            'CR-2026-5531',
            'Raw Sewage Overflow Stagnating Behind 5th Block Vegetable Market',
            'Black sewage water backflowing into shopping walkway with severe health hazard.',
            'Sewage Overflow',
            'Water Supply & Sewerage',
            'Ward 14 — Koramangala',
            '5th Block, Market Lane',
            'Behind Corporation Vegetable Market Stalls',
            12.9348, 77.6238,
            'High', 1, 0, '200+', 'Rework Required',
            'Sanitation Squad #4', 24,
            '2026-10-26T11:00:00Z', '2026-10-27T11:00:00Z',
            'Koramangala Traders Association', 0, 39
        )
        """
    )
    conn.execute(
        """
        INSERT INTO evidence (complaint_id, evidence_type, declared_category, file_path, caption, submitted_by, submitted_at, verification_status, reviewer_decision, reviewer_name, reviewed_at, verification_explanation)
        VALUES 
        ('CR-2026-5531', 'before', 'Sewage Overflow', 'sewage_leak.jpg', 'Black sewage water backflow.', 'Traders Association', '2026-10-26T11:00:00Z', 'Pending', NULL, NULL, NULL, NULL),
        ('CR-2026-5531', 'after', 'Sewage Overflow', 'sewage_partial_clean.jpg', 'Photo of nearby dry street.', 'Sanitation Squad #4', '2026-10-26T16:45:00Z', 'Rejected', 'Rejected: Photo shows clear pavement 100m away, but health inspector confirmed blockage remains.', 'Priya Sharma (Officer)', '2026-10-26T17:30:00Z', 'Location coordinates of uploaded photo do not correspond with reported overflow site.')
        """
    )
    conn.execute(
        """
        INSERT INTO complaint_timeline (complaint_id, previous_status, new_status, event_type, action, explanation, actor_role, actor_name, created_at)
        VALUES 
        ('CR-2026-5531', NULL, 'Submitted', 'CREATION', 'Complaint Registered', 'Reported health hazard and foul stench.', 'citizen', 'Traders Association', '2026-10-26 11:00'),
        ('CR-2026-5531', 'Submitted', 'In Progress', 'STATUS_CHANGE', 'Dispatched to Drainage Squad', 'Assigned for mechanical jetting.', 'officer', 'Priya Sharma', '2026-10-26 12:15'),
        ('CR-2026-5531', 'In Progress', 'Awaiting Verification', 'EVIDENCE_SUBMISSION', 'Resolution Evidence Submitted', 'Crew uploaded completion photo of street.', 'worker', 'Squad #4', '2026-10-26 16:45'),
        ('CR-2026-5531', 'Awaiting Verification', 'Rework Required', 'EVIDENCE_REJECTION', 'Evidence Rejected: Return for Rework', 'Photo location did not match grievance coordinates. Instructed crew to redo on site.', 'officer', 'Priya Sharma', '2026-10-26 17:30')
        """
    )

    # Seed 6: Reopened Case with Unassigned Worker
    conn.execute(
        """
        INSERT INTO complaints (
            id, title, description, category, department, ward, locality, landmark,
            lat, lng, urgency, safety_concern, recurring, affected_count, status,
            assigned_worker, deadline_hours, created_at, target_deadline,
            submitted_by, is_anonymous, upvotes, feedback_comment
        ) VALUES (
            'CR-2026-4412',
            'Open Masonry Dustbin Broken & Sharp Debris Obstructing Road',
            'Demolished brick dustbin wall with exposed rebar creating pedestrian hazard.',
            'Damaged Public Property',
            'Civic Amenities & Horticulture',
            'Ward 14 — Koramangala',
            '3rd Block, 14th Main',
            'Near Corporation Bank ATM',
            12.9320, 77.6210,
            'High', 1, 1, '50-200', 'Reopened',
            NULL, 48,
            '2026-10-25T10:00:00Z', '2026-10-27T10:00:00Z',
            'Ananya Sen', 0, 18,
            'The compactor truck cleared the garbage but accidentally crushed the brick enclosure, leaving sharp debris across the road. Needs masonry repair!'
        )
        """
    )
    conn.execute(
        """
        INSERT INTO complaint_timeline (complaint_id, previous_status, new_status, event_type, action, explanation, actor_role, actor_name, created_at)
        VALUES 
        ('CR-2026-4412', NULL, 'Submitted', 'CREATION', 'Complaint Registered', 'Reported broken bin enclosure.', 'citizen', 'Ananya Sen', '2026-10-25 10:00'),
        ('CR-2026-4412', 'Submitted', 'Resolved', 'RESOLUTION', 'Marked Cleaned', 'Solid waste removed from enclosure.', 'worker', 'Field Crew', '2026-10-26 12:00'),
        ('CR-2026-4412', 'Resolved', 'Reopened', 'REOPEN', 'Complaint Reopened by Citizen', 'Citizen reported truck crushed the masonry enclosure leaving sharp debris on road.', 'citizen', 'Ananya Sen', '2026-10-26 15:30')
        """
    )

    # Seed 7: Co-located Unlinked Duplicate of CR-2026-8492
    conn.execute(
        """
        INSERT INTO complaints (
            id, title, description, category, department, ward, locality, landmark,
            lat, lng, urgency, safety_concern, recurring, affected_count, status,
            assigned_worker, deadline_hours, created_at, target_deadline,
            submitted_by, is_anonymous, upvotes
        ) VALUES (
            'CR-2026-8499',
            'Massive Waste Overflow Spilling in Front of BDA Post Office',
            'Waste spillover in front of post office gate obstructing pedestrian movement.',
            'Garbage Dump',
            'Sanitation & Solid Waste',
            'Ward 14 — Koramangala',
            '5th Block, 80 Feet Road',
            'Opposite BDA Complex Post Office Gate',
            12.9354, 77.6248,
            'High', 0, 0, '100-200', 'Submitted',
            'Sanitation Squad #4', 24,
            '2026-10-26T10:45:00Z', '2026-10-27T10:45:00Z',
            'Ramesh Sundaram', 0, 14
        )
        """
    )
    conn.execute(
        """
        INSERT INTO complaint_timeline (complaint_id, previous_status, new_status, event_type, action, explanation, actor_role, actor_name, created_at)
        VALUES 
        ('CR-2026-8499', NULL, 'Submitted', 'CREATION', 'Complaint Registered', 'Registered duplicate dump grievance at BDA Post Office gate.', 'citizen', 'Ramesh Sundaram', '2026-10-26 10:45')
        """
    )

    # Notifications
    conn.execute(
        """
        INSERT INTO notifications (complaint_id, icon_type, title, message, recipient_role, created_at, is_read)
        VALUES 
        ('CR-2026-8492', 'warning', 'SLA Escalation Warning', 'Case CR-2026-8492 has breached its 24-hour SLA threshold. Escalation alert sent to Zonal Commissioner.', 'officer', '2026-10-27 09:30', 0),
        ('CR-2026-9104', 'success', 'Resolution Proof Verified', 'Road trench CR-2026-9104 was verified by PWD Officer and marked Resolved.', 'citizen', '2026-10-27 10:00', 0),
        ('CR-2026-5531', 'danger', 'Evidence Returned for Rework', 'Case CR-2026-5531 resolution evidence rejected: Photo location did not match grievance site.', 'worker', '2026-10-26 17:30', 0),
        ('CR-2026-7281', 'info', 'Field Crew Dispatched', 'BWSSB Rapid Unit 2 is actively working on Water Leak CR-2026-7281.', 'citizen', '2026-10-27 09:20', 1)
        """
    )


def seed_users(conn):
    """Seeds default demo accounts with hashed passwords for instant reviewer evaluation."""
    from services.auth_service import hash_password

    users = [
        ('usr-101', 'Ananya Sen', 'ananya@civicresolve.gov', '+91 98765 43210', 'Citizen@123', 'citizen', None, 'Ward 14 — Koramangala', 'active'),
        ('usr-202', 'Rajesh Kumar', 'rajesh@civicresolve.gov', '+91 98765 43211', 'Worker@123', 'worker', 'Sanitation & Solid Waste', 'Ward 14', 'active'),
        ('usr-303', 'Priya Sharma', 'priya@civicresolve.gov', '+91 98765 43212', 'Officer@123', 'officer', 'PWD & Sanitation', 'City Central', 'active'),
        ('usr-404', 'Dr. V. Narayanan', 'admin@civicresolve.gov', '+91 98765 43213', 'Admin@123', 'admin', 'Municipal Administration', 'HQ', 'active'),
        ('usr-205', 'Suresh Patil', 'suresh@civicresolve.gov', '+91 98765 43214', 'Worker@123', 'worker', 'Water Supply & Sewerage', 'Ward 22', 'pending_approval'),
        ('usr-308', 'Vikram Mehta', 'vikram@civicresolve.gov', '+91 98765 43215', 'Officer@123', 'officer', 'Electrical & Street Lighting', 'Ward 08', 'pending_approval'),
        # Generic role accounts for reviewer and test automation convenience
        ('usr-102', 'Citizen Resident', 'citizen@civicresolve.gov', '+91 98765 43220', 'Citizen@123', 'citizen', None, 'Ward 14 — Koramangala', 'active'),
        ('usr-203', 'Field Crew Worker', 'worker@civicresolve.gov', '+91 98765 43221', 'Worker@123', 'worker', 'Sanitation & Solid Waste', 'Ward 14', 'active'),
        ('usr-304', 'Department Officer', 'officer@civicresolve.gov', '+91 98765 43222', 'Officer@123', 'officer', 'PWD & Sanitation', 'City Central', 'active'),
        ('usr-305', 'Department Employee', 'employee@civicresolve.gov', '+91 98765 43223', 'Employee@123', 'officer', 'Roads & Infrastructure (PWD)', 'City Central', 'active'),
    ]

    now_iso = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    cur = conn.cursor()
    for uid, name, email, phone, pwd, role, dept, ward, status in users:
        cur.execute("SELECT 1 FROM users WHERE LOWER(email) = ?", (email.lower(),))
        if not cur.fetchone():
            p_hash, salt = hash_password(pwd)
            conn.execute(
                """
                INSERT INTO users (id, name, email, phone, password_hash, salt, role, department, ward, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (uid, name, email, phone, p_hash, salt, role, dept, ward, status, now_iso)
            )


if __name__ == "__main__":
    init_db(seed=True)
    print("Database initialized and seeded successfully.")
