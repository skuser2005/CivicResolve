"""
services/verification_service.py - Transparent rule-based Evidence Verification and Review Service.
Validates metadata, category alignment, and handles human reviewer approvals/rejections.
"""

from datetime import datetime, timezone
from database import get_db, get_simulated_time
from services.complaint_service import parse_iso, get_complaint_by_id


def evaluate_evidence_rules(complaint, evidence_data):
    """
    Transparent rule-based verification:
    - Verifies evidence presence
    - Checks category alignment
    - Checks metadata (completion notes >= 15 characters, timestamp, file reference)
    - Clarifies that photo presence alone does not prove physical repair and requires human review.
    """
    reasons = []
    is_valid_metadata = True

    expected_category = complaint["category"]
    submitted_category = evidence_data.get("declared_category", "").strip() or expected_category

    # Check 1: Category Match
    if submitted_category.lower() != expected_category.lower():
        is_valid_metadata = False
        reasons.append(
            f"Declared category mismatch: Evidence submitted under '{submitted_category}', but grievance is registered under '{expected_category}'."
        )

    # Check 2: File reference presence
    file_path = evidence_data.get("file_path", "").strip()
    if not file_path:
        is_valid_metadata = False
        reasons.append("Missing completion photograph reference.")

    # Check 3: Detailed work caption / notes
    caption = evidence_data.get("caption", "").strip()
    if len(caption) < 15:
        is_valid_metadata = False
        reasons.append("Work completion notes are too brief (minimum 15 characters required detailing repair scope/materials).")

    # Transparency disclaimer regarding photo vs physical reality
    reasons.append(
        "Notice: Uploaded photographic evidence verified for metadata alignment only. "
        "Physical restoration requires supervisor or field engineer sign-off."
    )

    outcome = "Ready for Reviewer Decision" if is_valid_metadata else "Metadata Incomplete / Discrepancy"
    recommended_action = "Supervisor review and physical sign-off" if is_valid_metadata else "Request rework from field crew"

    return {
        "is_valid_metadata": is_valid_metadata,
        "outcome": outcome,
        "reasons": reasons,
        "expected_category": expected_category,
        "submitted_category": submitted_category,
        "requires_reviewer_approval": True,
        "recommended_action": recommended_action,
    }


def submit_evidence(complaint_id, data):
    """Submits resolution evidence for a complaint and transitions it to Awaiting Verification."""
    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM complaints WHERE id = ?", (complaint_id,))
        row = cur.fetchone()
        if not row:
            return None, {"error": "Complaint not found"}, 404

        comp = dict(row)
        if comp["status"] not in ["In Progress", "Rework Required", "Assigned"]:
            return None, {
                "error": f"Cannot submit resolution evidence while complaint is '{comp['status']}'. It must be 'In Progress' or 'Rework Required'."
            }, 400

        file_path = data.get("file_path", "").strip()
        if not file_path:
            return None, {"error": "Evidence photo file path or preset reference is required."}, 400

        caption = data.get("caption", "").strip()
        if len(caption) < 10:
            return None, {"error": "Detailed work notes (minimum 10 characters) are required."}, 400

        evidence_type = data.get("evidence_type", "after")
        declared_category = data.get("declared_category", comp["category"])
        submitted_by = data.get("submitted_by", comp["assigned_worker"] or "Field Worker")

        sim_now = get_simulated_time(conn)
        sim_dt = parse_iso(sim_now) or datetime.now(timezone.utc)
        timeline_ts = sim_dt.strftime("%Y-%m-%d %H:%M")

        # Run automated metadata evaluation
        eval_result = evaluate_evidence_rules(comp, {
            "declared_category": declared_category,
            "file_path": file_path,
            "caption": caption
        })

        with conn:
            cur.execute(
                """
                INSERT INTO evidence (
                    complaint_id, evidence_type, declared_category, file_path, caption,
                    submitted_by, submitted_at, verification_status, verification_explanation
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending', ?)
                """,
                (
                    complaint_id, evidence_type, declared_category, file_path, caption,
                    submitted_by, sim_now, " • ".join(eval_result["reasons"])
                )
            )
            evidence_id = cur.lastrowid

            # Transition complaint status to Awaiting Verification
            conn.execute(
                """
                UPDATE complaints SET status = 'Awaiting Verification' WHERE id = ?
                """,
                (complaint_id,)
            )

            # Record in timeline
            conn.execute(
                """
                INSERT INTO complaint_timeline (
                    complaint_id, previous_status, new_status, event_type, action,
                    explanation, actor_role, actor_name, created_at
                ) VALUES (?, ?, 'Awaiting Verification', 'EVIDENCE_SUBMISSION', 'Resolution Evidence Submitted',
                          ?, 'worker', ?, ?)
                """,
                (
                    complaint_id, comp["status"],
                    f"Field team uploaded completion proof: \"{caption}\". Automated metadata check: {eval_result['outcome']}.",
                    submitted_by, timeline_ts
                )
            )

            # In-app alert for supervising officer
            conn.execute(
                """
                INSERT INTO notifications (
                    complaint_id, icon_type, title, message, recipient_role, created_at, is_read
                ) VALUES (?, 'info', 'Resolution Proof Submitted',
                          'Evidence uploaded for ' || ? || '. Awaiting supervisor verification.',
                          'officer', ?, 0)
                """,
                (complaint_id, complaint_id, timeline_ts)
            )

        updated_complaint = get_complaint_by_id(complaint_id)
        return {
            "complaint": updated_complaint,
            "evidence_id": evidence_id,
            "evaluation": eval_result
        }, None, 201
    finally:
        conn.close()


def verify_evidence(complaint_id, decision, explanation, reviewer_name="Priya Sharma (Officer)"):
    """
    Reviewer action: approves or rejects evidence.
    - If Approved: sets complaint status to 'Resolved', records in timeline.
    - If Rejected: sets complaint status to 'Rework Required', records in timeline.
    Never marks resolved automatically when rejected.
    """
    decision_clean = decision.strip().lower()
    if decision_clean not in ["approved", "rejected", "approve", "reject"]:
        return None, {"error": "Decision must be 'Approved' or 'Rejected'."}, 400

    is_approved = decision_clean in ["approved", "approve"]
    normalized_decision = "Approved" if is_approved else "Rejected"

    if not explanation or len(explanation.strip()) < 5:
        return None, {"error": "A review explanation (minimum 5 characters) is mandatory."}, 400

    conn = get_db()
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM complaints WHERE id = ?", (complaint_id,))
        comp_row = cur.fetchone()
        if not comp_row:
            return None, {"error": "Complaint not found"}, 404

        comp = dict(comp_row)
        if comp["status"] not in ["Awaiting Verification", "In Progress", "Rework Required"]:
            return None, {
                "error": f"Cannot review evidence when complaint is in '{comp['status']}' state."
            }, 400

        # Find latest pending or unapproved after-evidence
        cur.execute(
            """
            SELECT * FROM evidence 
            WHERE complaint_id = ? AND evidence_type = 'after'
            ORDER BY id DESC LIMIT 1
            """,
            (complaint_id,)
        )
        ev_row = cur.fetchone()
        if not ev_row:
            return None, {
                "error": "No completion evidence found for this complaint to review."
            }, 404

        evidence_id = ev_row["id"]
        sim_now = get_simulated_time(conn)
        sim_dt = parse_iso(sim_now) or datetime.now(timezone.utc)
        timeline_ts = sim_dt.strftime("%Y-%m-%d %H:%M")
        new_status = "Resolved" if is_approved else "Rework Required"

        with conn:
            # Update evidence record
            conn.execute(
                """
                UPDATE evidence
                SET verification_status = ?, reviewer_decision = ?, reviewer_name = ?, reviewed_at = ?,
                    verification_explanation = ?
                WHERE id = ?
                """,
                (
                    normalized_decision,
                    f"{normalized_decision}: {explanation.strip()}",
                    reviewer_name,
                    sim_now,
                    explanation.strip(),
                    evidence_id
                )
            )

            # Update complaint status atomically
            resolved_at = sim_now if is_approved else None
            conn.execute(
                """
                UPDATE complaints
                SET status = ?, resolved_at = COALESCE(?, resolved_at)
                WHERE id = ?
                """,
                (new_status, resolved_at, complaint_id)
            )

            # Record timeline entry
            action_title = "Resolution Officially Verified & Approved" if is_approved else "Evidence Rejected: Return for Rework"
            conn.execute(
                """
                INSERT INTO complaint_timeline (
                    complaint_id, previous_status, new_status, event_type, action,
                    explanation, actor_role, actor_name, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, 'officer', ?, ?)
                """,
                (
                    complaint_id, comp["status"], new_status,
                    "RESOLUTION" if is_approved else "EVIDENCE_REJECTION",
                    action_title,
                    f"Supervisor verdict: {explanation.strip()}",
                    reviewer_name, timeline_ts
                )
            )

            # Notification
            notif_icon = "success" if is_approved else "danger"
            conn.execute(
                """
                INSERT INTO notifications (
                    complaint_id, icon_type, title, message, recipient_role, created_at, is_read
                ) VALUES (?, ?, ?, ?, ?, ?, 0)
                """,
                (
                    complaint_id, notif_icon,
                    f"Evidence {normalized_decision}",
                    f"Grievance {complaint_id}: {explanation.strip()}",
                    "citizen" if is_approved else "worker",
                    timeline_ts
                )
            )

        return get_complaint_by_id(complaint_id), None, 200
    finally:
        conn.close()
