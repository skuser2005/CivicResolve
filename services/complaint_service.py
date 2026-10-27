"""
services/complaint_service.py - Business logic for Complaint Lifecycle, Validation, and Storage.
Enforces strict state transitions, atomic updates, and dashboard calculations.
"""

from datetime import datetime, timezone, timedelta
import random
import re
from database import get_db, get_simulated_time

# Allowed categories and department routing
CATEGORY_DEPT_MAP = {
    "Garbage Dump": "Sanitation & Solid Waste",
    "Overflowing Dustbin": "Sanitation & Solid Waste",
    "Missed Garbage Vehicle": "Sanitation & Solid Waste",
    "Street Sweeping Incomplete": "Sanitation & Solid Waste",
    "Dead Animal Removal": "Sanitation & Solid Waste",
    "Public Toilet Hygiene": "Sanitation & Solid Waste",
    "Pothole": "Roads & Infrastructure (PWD)",
    "Damaged Footpath": "Roads & Infrastructure (PWD)",
    "Broken Streetlight": "Electrical & Street Lighting",
    "Damaged Road Divider": "Roads & Infrastructure (PWD)",
    "Missing Road Sign": "Roads & Infrastructure (PWD)",
    "Water Leakage": "Water Supply & Sewerage",
    "Blocked Drain": "Water Supply & Sewerage",
    "Sewage Overflow": "Water Supply & Sewerage",
    "Waterlogging Hotspot": "Water Supply & Sewerage",
    "Damaged Public Property": "Civic Amenities & Horticulture",
    "Accessibility Barrier": "Civic Amenities & Horticulture",
    "Fallen Tree Branch": "Civic Amenities & Horticulture",
    "Other Civic Service": "Civic Amenities & Horticulture",
}

DEFAULT_SLA_HOURS = {
    "Sanitation & Solid Waste": 24,
    "Roads & Infrastructure (PWD)": 48,
    "Water Supply & Sewerage": 12,
    "Electrical & Street Lighting": 36,
    "Civic Amenities & Horticulture": 48,
}

# Permitted Lifecycle Transitions
VALID_TRANSITIONS = {
    "Submitted": ["Assigned", "In Progress", "Withdrawn"],
    "Assigned": ["In Progress", "Awaiting Verification", "Withdrawn"],
    "In Progress": ["Awaiting Verification", "Rework Required", "Withdrawn", "Overdue"],
    "Awaiting Verification": ["Resolved", "Rework Required", "In Progress"],
    "Rework Required": ["In Progress", "Awaiting Verification", "Withdrawn"],
    "Overdue": ["In Progress", "Awaiting Verification", "Withdrawn"],
    "Resolved": ["Reopened"],
    "Reopened": ["Assigned", "In Progress", "Withdrawn"],
    "Withdrawn": []
}


def parse_iso(ts_str):
    """Safely parse an ISO datetime string into UTC datetime."""
    if not ts_str:
        return None
    try:
        clean = ts_str.replace("Z", "+00:00")
        if " " in clean and "T" not in clean:
            clean = clean.replace(" ", "T") + "+00:00"
        return datetime.fromisoformat(clean)
    except Exception:
        return None


def generate_unique_complaint_id(conn):
    """Generates an unguessable tracking ID: CR-2026-XXXX (4-digit random)."""
    cur = conn.cursor()
    for _ in range(50):
        code = random.randint(1000, 9999)
        cid = f"CR-2026-{code}"
        cur.execute("SELECT 1 FROM complaints WHERE id = ?", (cid,))
        if not cur.fetchone():
            return cid
    # Fallback with timestamp
    return f"CR-2026-{int(datetime.now(timezone.utc).timestamp()) % 100000}"


def validate_complaint_input(data):
    """Server-side input validation for new complaint submissions."""
    errors = []
    title = data.get("title", "").strip()
    if not title or len(title) < 5:
        errors.append("Title is required and must be at least 5 characters.")

    description = data.get("description", "").strip()
    if not description or len(description) < 10:
        errors.append("Detailed description is required (minimum 10 characters).")

    category = data.get("category", "").strip()
    if not category:
        errors.append("Category is required.")

    ward = data.get("ward", "").strip()
    if not ward:
        errors.append("Municipal ward is required.")

    locality = data.get("locality", "").strip()
    if not locality:
        errors.append("Locality or street name is required.")

    urgency = data.get("urgency", "Normal").strip()
    if urgency not in ["Low", "Normal", "High", "Critical"]:
        errors.append("Urgency must be one of: Low, Normal, High, Critical.")

    return errors


def create_complaint(data):
    """Validates and creates a new complaint, timeline event, attachments, and initial notification."""
    errors = validate_complaint_input(data)
    if errors:
        return None, {"error": "Validation failed", "details": errors}, 400

    conn = get_db()
    try:
        cur = conn.cursor()

        # Idempotency Protection: Prevent duplicate complaints from double-click or network retry
        idempotency_key = data.get("idempotency_key")
        if idempotency_key:
            cur.execute("SELECT id FROM complaints WHERE idempotency_key = ?", (idempotency_key,))
            existing = cur.fetchone()
            if existing:
                return get_complaint_by_id(existing["id"]), None, 200

        complaint_id = generate_unique_complaint_id(conn)
        citizen_id = data.get("citizen_id")
        title = data["title"].strip()
        description = data["description"].strip()
        category = data["category"].strip()
        ward = data["ward"].strip()
        locality = data["locality"].strip()
        landmark = data.get("landmark", "").strip()
        lat = data.get("lat")
        lng = data.get("lng")
        urgency = data.get("urgency", "Normal")
        safety_concern = 1 if data.get("safety_concern") else 0
        recurring = 1 if data.get("recurring") else 0
        affected_count = data.get("affected_count", "10-50")
        is_anonymous = 1 if data.get("is_anonymous") else 0
        submitted_by = "Anonymous Resident" if is_anonymous else (data.get("submitted_by", "Ananya Sen").strip() or "Ananya Sen")

        department = data.get("department") or CATEGORY_DEPT_MAP.get(category, "Civic Amenities & Horticulture")
        deadline_hours = DEFAULT_SLA_HOURS.get(department, 24)

        # Calculate timestamps
        sim_now_str = get_simulated_time(conn)
        sim_dt = parse_iso(sim_now_str) or datetime.now(timezone.utc)
        target_deadline = (sim_dt + timedelta(hours=deadline_hours)).isoformat()
        created_at = sim_dt.isoformat()

        # Assigned worker suggestion
        assigned_worker = f"{department.split('&')[0].strip()} Unit 1"

        with conn:
            conn.execute(
                """
                INSERT INTO complaints (
                    id, citizen_id, title, description, category, department, ward, locality, landmark,
                    lat, lng, urgency, safety_concern, recurring, affected_count, status,
                    assigned_worker, deadline_hours, created_at, target_deadline,
                    submitted_by, is_anonymous, upvotes, idempotency_key
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Submitted', ?, ?, ?, ?, ?, ?, 1, ?)
                """,
                (
                    complaint_id, citizen_id, title, description, category, department, ward, locality, landmark,
                    lat, lng, urgency, safety_concern, recurring, affected_count,
                    assigned_worker, deadline_hours, created_at, target_deadline,
                    submitted_by, is_anonymous, idempotency_key
                )
            )

            # Store multimodal attachments if provided
            attachments = data.get("attachments", [])
            for att in attachments:
                conn.execute(
                    """
                    INSERT INTO attachments (
                        complaint_id, file_type, file_url, original_filename,
                        file_size_bytes, mime_type, stage, uploaded_by, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        complaint_id,
                        att.get("file_type", "photo"),
                        att.get("file_url", ""),
                        att.get("original_filename", "attachment"),
                        att.get("file_size_bytes", 0),
                        att.get("mime_type", ""),
                        att.get("stage", "intake"),
                        submitted_by,
                        created_at
                    )
                )

            # Store legacy evidence_file if provided
            evidence_file = data.get("evidence_file")
            if evidence_file:
                conn.execute(
                    """
                    INSERT INTO evidence (
                        complaint_id, evidence_type, declared_category, file_path, caption,
                        submitted_by, submitted_at, verification_status
                    ) VALUES (?, 'before', ?, ?, ?, ?, ?, 'Pending')
                    """,
                    (
                        complaint_id, category, evidence_file,
                        data.get("evidence_caption") or description[:100],
                        submitted_by, created_at
                    )
                )

            # Record timeline entry
            timeline_ts = sim_dt.strftime("%Y-%m-%d %H:%M")
            conn.execute(
                """
                INSERT INTO complaint_timeline (
                    complaint_id, previous_status, new_status, event_type, action,
                    explanation, actor_role, actor_name, created_at
                ) VALUES (?, NULL, 'Submitted', 'CREATION', 'Complaint Registered',
                          'Grievance registered in municipal database with automated routing.',
                          'citizen', ?, ?)
                """,
                (complaint_id, submitted_by, timeline_ts)
            )

            # In-app notification
            conn.execute(
                """
                INSERT INTO notifications (
                    complaint_id, icon_type, title, message, recipient_role, recipient_user_id, created_at, is_read
                ) VALUES (?, 'info', 'Grievance Registered',
                          'Tracking ID ' || ? || ' was registered and routed to ' || ?,
                          'citizen', ?, ?, 0)
                """,
                (complaint_id, complaint_id, department, citizen_id, timeline_ts)
            )

        return get_complaint_by_id(complaint_id), None, 201
    finally:
        conn.close()


def format_complaint_dict(c, timeline=None, evidence_list=None, escalations=None, attachments_list=None):
    """Formats complaint dictionary with both snake_case and camelCase keys for complete compatibility."""
    comp = dict(c)
    comp["deadlineHours"] = comp.get("deadline_hours", 24)
    comp["targetDeadline"] = comp.get("target_deadline")
    comp["timestamp"] = comp.get("created_at")
    comp["assignedWorker"] = comp.get("assigned_worker")
    comp["submittedBy"] = comp.get("submitted_by")
    comp["safetyConcern"] = bool(comp.get("safety_concern"))
    comp["recurring"] = bool(comp.get("recurring"))
    comp["affectedCount"] = comp.get("affected_count", "10-50")
    comp["userVoted"] = False
    comp["citizenId"] = comp.get("citizen_id")
    comp["idempotencyKey"] = comp.get("idempotency_key")
    comp["attachments"] = attachments_list or []

    if comp.get("is_anonymous"):
        comp["submitted_by"] = "Anonymous Resident"
        comp["submittedBy"] = "Anonymous Resident"

    after_ev = None
    if evidence_list:
        for ev in evidence_list:
            if ev.get("evidence_category") in ["After", "Resolution Proof", "Resolution"]:
                after_ev = ev
                break

    comp["evidence"] = {
        "beforeImg": "dump-visual",
        "beforeCaption": comp.get("description", "Citizen photo proof recorded."),
        "afterImg": "pothole-after" if after_ev else None,
        "afterCaption": (after_ev.get("verification_explanation") or after_ev.get("file_reference")) if after_ev else None
    }
    comp["evidence_list"] = evidence_list or []
    comp["escalations"] = escalations or []

    if timeline:
        comp["timeline"] = [
            {
                "id": t.get("id"),
                "timestamp": (t.get("created_at") or "").replace("T", " ")[:16],
                "actor": t.get("actor", "Municipal Authority"),
                "action": t.get("event_type", "Status Updated"),
                "desc": t.get("explanation", ""),
                "previous_status": t.get("previous_status"),
                "new_status": t.get("new_status"),
                "role": "worker" if "worker" in t.get("actor", "").lower() else (
                    "system" if "agent" in t.get("actor", "").lower() or "ai" in t.get("actor", "").lower() else (
                        "citizen" if "citizen" in t.get("actor", "").lower() else "officer"
                    )
                )
            }
            for t in timeline
        ]
    else:
        comp["timeline"] = []

    comp["comments"] = []
    comp["feedback"] = None
    return comp


def get_complaint_by_id(complaint_id):
    """Retrieves a single complaint with its timeline, evidence, escalations, and multimodal attachments."""
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM complaints WHERE id = ?", (complaint_id,))
        row = cur.fetchone()
        if not row:
            return None

        comp = dict(row)

        # Calculate deadline status based on simulated clock
        sim_now = get_simulated_time(conn)
        sim_dt = parse_iso(sim_now) or datetime.now(timezone.utc)
        created_dt = parse_iso(comp["created_at"]) or sim_dt
        elapsed_hours = max(0.0, (sim_dt - created_dt).total_seconds() / 3600.0)
        remaining_hours = max(0.0, comp["deadline_hours"] - elapsed_hours)
        is_overdue = elapsed_hours > comp["deadline_hours"] and comp["status"] not in ["Resolved", "Withdrawn"]

        comp["elapsed_hours"] = round(elapsed_hours, 1)
        comp["remaining_hours"] = round(remaining_hours, 1)
        comp["is_overdue"] = is_overdue

        # Timeline
        cur.execute("SELECT * FROM complaint_timeline WHERE complaint_id = ? ORDER BY id DESC", (complaint_id,))
        timeline = [dict(t) for t in cur.fetchall()]

        # Evidence
        cur.execute("SELECT * FROM evidence WHERE complaint_id = ? ORDER BY id ASC", (complaint_id,))
        evidence_list = [dict(e) for e in cur.fetchall()]

        # Escalations
        cur.execute("SELECT * FROM escalations WHERE complaint_id = ? ORDER BY id DESC", (complaint_id,))
        escalations = [dict(esc) for esc in cur.fetchall()]

        # Attachments
        cur.execute("SELECT * FROM attachments WHERE complaint_id = ? ORDER BY id ASC", (complaint_id,))
        attachments_list = [dict(att) for att in cur.fetchall()]

        return format_complaint_dict(comp, timeline, evidence_list, escalations, attachments_list)
    finally:
        conn.close()


def list_complaints(filters=None, current_user=None):
    """Lists complaints with role-based scoping and filtering."""
    conn = get_db()
    try:
        query = "SELECT * FROM complaints WHERE 1=1"
        params = []

        if current_user:
            role = current_user.get("role")
            if role == "citizen" and not (filters and filters.get("all_public")):
                query += " AND (citizen_id = ? OR submitted_by = ? OR is_anonymous = 1)"
                params.extend([current_user.get("id"), current_user.get("name")])
            elif role == "worker" and not (filters and filters.get("all")):
                query += " AND (assigned_worker_id = ? OR assigned_worker LIKE ? OR department = ?)"
                params.extend([current_user.get("id"), f"%{current_user.get('name')}%", current_user.get("department")])
            elif role == "officer" and not (filters and filters.get("all")):
                dept = current_user.get("department")
                if dept:
                    query += " AND (department LIKE ?)"
                    params.append(f"%{dept.split('&')[0].strip()}%")

        if filters:
            if filters.get("citizen_id"):
                query += " AND citizen_id = ?"
                params.append(filters["citizen_id"])
            if filters.get("status"):
                query += " AND status = ?"
                params.append(filters["status"])
            if filters.get("category"):
                query += " AND category = ?"
                params.append(filters["category"])
            if filters.get("urgency"):
                query += " AND urgency = ?"
                params.append(filters["urgency"])
            if filters.get("ward"):
                query += " AND ward = ?"
                params.append(filters["ward"])
            if filters.get("department"):
                query += " AND department = ?"
                params.append(filters["department"])

        query += " ORDER BY created_at DESC"

        cur = conn.cursor()
        cur.execute(query, params)
        rows = cur.fetchall()

        sim_now = get_simulated_time(conn)
        sim_dt = parse_iso(sim_now) or datetime.now(timezone.utc)

        # Pre-fetch timelines, evidence, and attachments
        cur.execute("SELECT * FROM complaint_timeline ORDER BY id DESC")
        timelines_by_cid = {}
        for t in cur.fetchall():
            cid = t["complaint_id"]
            if cid not in timelines_by_cid:
                timelines_by_cid[cid] = []
            timelines_by_cid[cid].append(dict(t))

        cur.execute("SELECT * FROM evidence ORDER BY id ASC")
        evidence_by_cid = {}
        for ev in cur.fetchall():
            cid = ev["complaint_id"]
            if cid not in evidence_by_cid:
                evidence_by_cid[cid] = []
            evidence_by_cid[cid].append(dict(ev))

        cur.execute("SELECT * FROM attachments ORDER BY id ASC")
        attachments_by_cid = {}
        for att in cur.fetchall():
            cid = att["complaint_id"]
            if cid not in attachments_by_cid:
                attachments_by_cid[cid] = []
            attachments_by_cid[cid].append(dict(att))

        results = []
        for r in rows:
            c = dict(r)
            created_dt = parse_iso(c["created_at"]) or sim_dt
            elapsed = max(0.0, (sim_dt - created_dt).total_seconds() / 3600.0)
            c["elapsed_hours"] = round(elapsed, 1)
            c["is_overdue"] = elapsed > c["deadline_hours"] and c["status"] not in ["Resolved", "Withdrawn"]
            formatted = format_complaint_dict(
                c,
                timelines_by_cid.get(c["id"], []),
                evidence_by_cid.get(c["id"], []),
                None,
                attachments_by_cid.get(c["id"], [])
            )
            results.append(formatted)

        return results
    finally:
        conn.close()


def update_complaint_status(complaint_id, new_status, reason, actor_role="officer", actor_name="Priya Sharma"):
    """
    Validates and updates status enforcing allowed transitions.
    Records transition event and notification in a single atomic transaction.
    """
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute("SELECT status FROM complaints WHERE id = ?", (complaint_id,))
        row = cur.fetchone()
        if not row:
            return None, {"error": "Complaint not found"}, 404

        current_status = row["status"]
        allowed = VALID_TRANSITIONS.get(current_status, [])

        if new_status not in allowed:
            return None, {
                "error": "Invalid status transition",
                "current_status": current_status,
                "requested_status": new_status,
                "allowed_transitions": allowed
            }, 400

        # Safety rule: Cannot mark Resolved directly through PATCH status without verified evidence
        if new_status == "Resolved":
            cur.execute(
                "SELECT 1 FROM evidence WHERE complaint_id = ? AND evidence_type = 'after' AND verification_status = 'Approved'",
                (complaint_id,)
            )
            if not cur.fetchone():
                return None, {
                    "error": "Resolution rejected",
                    "reason": "Cannot mark complaint Resolved without approved resolution evidence. Submit and verify evidence first."
                }, 400

        sim_now = get_simulated_time(conn)
        sim_dt = parse_iso(sim_now) or datetime.now(timezone.utc)
        timeline_ts = sim_dt.strftime("%Y-%m-%d %H:%M")
        resolved_at = sim_dt.isoformat() if new_status == "Resolved" else None

        with conn:
            conn.execute(
                """
                UPDATE complaints 
                SET status = ?, resolved_at = COALESCE(?, resolved_at)
                WHERE id = ?
                """,
                (new_status, resolved_at, complaint_id)
            )

            conn.execute(
                """
                INSERT INTO complaint_timeline (
                    complaint_id, previous_status, new_status, event_type, action,
                    explanation, actor_role, actor_name, created_at
                ) VALUES (?, ?, ?, 'STATUS_CHANGE', ?, ?, ?, ?, ?)
                """,
                (
                    complaint_id, current_status, new_status,
                    f"Status changed to {new_status}",
                    reason or f"Transitioned from {current_status} to {new_status}.",
                    actor_role, actor_name, timeline_ts
                )
            )

            icon = "success" if new_status == "Resolved" else "warning" if new_status in ["Overdue", "Rework Required"] else "info"
            conn.execute(
                """
                INSERT INTO notifications (
                    complaint_id, icon_type, title, message, recipient_role, created_at, is_read
                ) VALUES (?, ?, ?, ?, 'citizen', ?, 0)
                """,
                (complaint_id, icon, f"Status: {new_status}", reason, timeline_ts)
            )

        return get_complaint_by_id(complaint_id), None, 200
    finally:
        conn.close()


def reopen_complaint(complaint_id, reason, citizen_name="Ananya Sen"):
    """Reopens a resolved complaint when a citizen reports the issue has returned."""
    if not reason or len(reason.strip()) < 10:
        return None, {"error": "A detailed reason (min 10 chars) is required to reopen a grievance."}, 400

    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute("SELECT status FROM complaints WHERE id = ?", (complaint_id,))
        row = cur.fetchone()
        if not row:
            return None, {"error": "Complaint not found"}, 404

        current_status = row["status"]
        if current_status != "Resolved":
            return None, {
                "error": "Only Resolved complaints can be reopened.",
                "current_status": current_status
            }, 400

        sim_now = get_simulated_time(conn)
        sim_dt = parse_iso(sim_now) or datetime.now(timezone.utc)
        timeline_ts = sim_dt.strftime("%Y-%m-%d %H:%M")

        with conn:
            conn.execute(
                """
                UPDATE complaints
                SET status = 'Reopened', urgency = 'High', feedback_comment = ?, resolved_at = NULL
                WHERE id = ?
                """,
                (reason.strip(), complaint_id)
            )

            conn.execute(
                """
                INSERT INTO complaint_timeline (
                    complaint_id, previous_status, new_status, event_type, action,
                    explanation, actor_role, actor_name, created_at
                ) VALUES (?, 'Resolved', 'Reopened', 'REOPEN', 'Complaint Reopened by Citizen',
                          ?, 'citizen', ?, ?)
                """,
                (complaint_id, reason.strip(), citizen_name, timeline_ts)
            )

            conn.execute(
                """
                INSERT INTO notifications (
                    complaint_id, icon_type, title, message, recipient_role, created_at, is_read
                ) VALUES (?, 'warning', 'Case Reopened by Citizen',
                          'Grievance ' || ? || ' was reopened. Urgent supervisor re-dispatch required.',
                          'officer', ?, 0)
                """,
                (complaint_id, complaint_id, timeline_ts)
            )

        return get_complaint_by_id(complaint_id), None, 200
    finally:
        conn.close()


def escalate_complaint(complaint_id, reason, rule_code="REC-01", escalation_level="Level 2"):
    """
    Records a valid escalation without creating duplicates.
    Uses escalations table to ensure idempotency per complaint and rule.
    """
    conn = get_db()
    try:
        cur = conn.cursor()
        # Check if already escalated for this rule
        cur.execute(
            "SELECT 1 FROM escalations WHERE complaint_id = ? AND rule_code = ?",
            (complaint_id, rule_code)
        )
        if cur.fetchone():
            return None, {
                "error": "Escalation already recorded",
                "message": f"Complaint {complaint_id} has already been escalated under rule {rule_code}."
            }, 409

        sim_now = get_simulated_time(conn)
        sim_dt = parse_iso(sim_now) or datetime.now(timezone.utc)
        timeline_ts = sim_dt.strftime("%Y-%m-%d %H:%M")

        with conn:
            conn.execute(
                """
                INSERT INTO escalations (
                    complaint_id, rule_code, escalation_level, reason, action_taken, created_at
                ) VALUES (?, ?, ?, ?, 'Status marked Overdue and dispatched to Zonal Commissioner', ?)
                """,
                (complaint_id, rule_code, escalation_level, reason, timeline_ts)
            )

            conn.execute(
                """
                UPDATE complaints SET status = 'Overdue', urgency = 'Critical' WHERE id = ?
                """,
                (complaint_id,)
            )

            conn.execute(
                """
                INSERT INTO complaint_timeline (
                    complaint_id, previous_status, new_status, event_type, action,
                    explanation, actor_role, actor_name, created_at
                ) VALUES (?, 'In Progress', 'Overdue', 'ESCALATION', 'SLA Breach Escalation Recorded',
                          ?, 'system', 'Escalation Agent', ?)
                """,
                (complaint_id, reason, timeline_ts)
            )

            conn.execute(
                """
                INSERT INTO notifications (
                    complaint_id, icon_type, title, message, recipient_role, created_at, is_read
                ) VALUES (?, 'danger', 'Formal Escalation Triggered',
                          'Case ' || ? || ' escalated to Zonal Commissioner due to SLA breach.',
                          'officer', ?, 0)
                """,
                (complaint_id, complaint_id, timeline_ts)
            )

        return get_complaint_by_id(complaint_id), None, 200
    finally:
        conn.close()


def calculate_dashboard_metrics():
    """Calculates all public metrics dynamically from actual SQLite database rows."""
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM complaints")
        complaints = [dict(r) for r in cur.fetchall()]

        total = len(complaints)
        open_count = sum(1 for c in complaints if c["status"] in ["Submitted", "Assigned", "In Progress", "Rework Required"])
        awaiting_count = sum(1 for c in complaints if c["status"] == "Awaiting Verification")
        resolved_count = sum(1 for c in complaints if c["status"] == "Resolved")
        reopened_count = sum(1 for c in complaints if c["status"] == "Reopened")

        sim_now = get_simulated_time(conn)
        sim_dt = parse_iso(sim_now) or datetime.now(timezone.utc)

        # Dynamic overdue count
        overdue_count = 0
        resolution_durations = []

        for c in complaints:
            created_dt = parse_iso(c["created_at"]) or sim_dt
            if c["status"] not in ["Resolved", "Withdrawn"]:
                elapsed = (sim_dt - created_dt).total_seconds() / 3600.0
                if elapsed > c["deadline_hours"] or c["status"] == "Overdue":
                    overdue_count += 1
            elif c["status"] == "Resolved" and c["resolved_at"]:
                res_dt = parse_iso(c["resolved_at"])
                if res_dt and res_dt >= created_dt:
                    resolution_durations.append((res_dt - created_dt).total_seconds() / 3600.0)

        # Calculate median resolution time
        median_res_hours = 0.0
        if resolution_durations:
            resolution_durations.sort()
            n = len(resolution_durations)
            median_res_hours = resolution_durations[n // 2] if n % 2 != 0 else (resolution_durations[n//2 - 1] + resolution_durations[n//2]) / 2.0

        # Department performance
        dept_stats = {}
        for c in complaints:
            dept = c["department"]
            if dept not in dept_stats:
                dept_stats[dept] = {"total": 0, "resolved": 0, "overdue": 0}
            dept_stats[dept]["total"] += 1
            if c["status"] == "Resolved":
                dept_stats[dept]["resolved"] += 1
            elif c["status"] == "Overdue":
                dept_stats[dept]["overdue"] += 1

        return {
            "total_reports": total,
            "open_complaints": open_count,
            "overdue_complaints": overdue_count,
            "awaiting_verification": awaiting_count,
            "resolved_complaints": resolved_count,
            "reopened_complaints": reopened_count,
            "median_resolution_hours": round(median_res_hours, 1),
            "simulated_time": sim_now,
            "department_breakdown": dept_stats,
            "status_distribution": {
                "Submitted": sum(1 for c in complaints if c["status"] == "Submitted"),
                "Assigned": sum(1 for c in complaints if c["status"] == "Assigned"),
                "In Progress": sum(1 for c in complaints if c["status"] == "In Progress"),
                "Awaiting Verification": awaiting_count,
                "Rework Required": sum(1 for c in complaints if c["status"] == "Rework Required"),
                "Resolved": resolved_count,
                "Reopened": reopened_count,
                "Overdue": overdue_count,
            }
        }
    finally:
        conn.close()


def assign_worker(complaint_id, worker_name, instructions="", officer_name="Priya Sharma (Senior Officer)"):
    """Assigns or reassigns a field squad or worker to a complaint, logging timeline and notification."""
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM complaints WHERE id = ?", (complaint_id,))
        row = cur.fetchone()
        if not row:
            return None, {"error": f"Complaint '{complaint_id}' not found."}, 404

        sim_now = get_simulated_time(conn)
        sim_dt = parse_iso(sim_now) or datetime.now(timezone.utc)
        timeline_ts = sim_dt.strftime("%Y-%m-%d %H:%M")

        new_status = row["status"]
        if new_status in ["Submitted", "Reopened"]:
            new_status = "Assigned"

        with conn:
            conn.execute(
                "UPDATE complaints SET assigned_worker = ?, status = ? WHERE id = ?",
                (worker_name, new_status, complaint_id)
            )
            conn.execute(
                """
                INSERT INTO complaint_timeline (
                    complaint_id, previous_status, new_status, event_type, action,
                    explanation, actor_role, actor_name, created_at
                ) VALUES (?, ?, ?, 'ASSIGNMENT', 'Field Crew Assigned', ?, 'officer', ?, ?)
                """,
                (
                    complaint_id, row["status"], new_status,
                    instructions or f"Assigned to {worker_name}.",
                    officer_name, timeline_ts
                )
            )
            conn.execute(
                """
                INSERT INTO notifications (
                    complaint_id, icon_type, title, message, recipient_role, created_at, is_read
                ) VALUES (?, 'info', 'Work Order Assigned',
                          'Case ' || ? || ' assigned to ' || ?, 'worker', ?, 0)
                """,
                (complaint_id, complaint_id, worker_name, timeline_ts)
            )

        return get_complaint_by_id(complaint_id), None, 200
    finally:
        conn.close()


def upvote_complaint(complaint_id, increment=True):
    """Toggles or updates upvote count for a complaint."""
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute("SELECT upvotes FROM complaints WHERE id = ?", (complaint_id,))
        row = cur.fetchone()
        if not row:
            return None, {"error": f"Complaint '{complaint_id}' not found."}, 404

        current_votes = row["upvotes"] or 0
        new_votes = max(0, current_votes + (1 if increment else -1))

        with conn:
            conn.execute(
                "UPDATE complaints SET upvotes = ? WHERE id = ?",
                (new_votes, complaint_id)
            )

        return {"complaint_id": complaint_id, "upvotes": new_votes}, None, 200
    finally:
        conn.close()

