"""
services/recovery_agent.py - Explainable, Rule-Based Civic Recovery Agent.
Scans actual SQLite records deterministically, explains findings, executes safe actions,
and flags human reviews for evidence disputes and final decisions.
"""

from datetime import datetime, timezone
import math
from database import get_db, get_simulated_time
from services.complaint_service import parse_iso


class CivicRecoveryAgent:
    """Deterministic, explainable civic recovery agent operating on actual database records."""

    @staticmethod
    def run():
        """Scans all complaints in the database and evaluates recovery rules."""
        conn = get_db()
        try:
            cur = conn.cursor()
            cur.execute("SELECT * FROM complaints")
            complaints = [dict(r) for r in cur.fetchall()]

            sim_now = get_simulated_time(conn)
            sim_dt = parse_iso(sim_now) or datetime.now(timezone.utc)
            timeline_ts = sim_dt.strftime("%Y-%m-%d %H:%M")

            findings = []
            safe_actions_count = 0
            human_reviews_count = 0

            # ── 1. SCAN EACH COMPLAINT FOR REC-01, REC-02, REC-03 ──
            for c in complaints:
                cid = c["id"]
                created_dt = parse_iso(c["created_at"]) or sim_dt
                elapsed_hours = max(0.0, (sim_dt - created_dt).total_seconds() / 3600.0)
                sla_hours = c["deadline_hours"]

                # ── RULE REC-01: SLA Threshold Exceeded (Overdue Grievance) ──
                if c["status"] not in ["Resolved", "Withdrawn"] and elapsed_hours > sla_hours:
                    overdue_by = round(elapsed_hours - sla_hours, 1)
                    rule_code = "RULE REC-01"
                    rule_title = "SLA Threshold Exceeded (Overdue Grievance)"
                    data_cited = (
                        f"Complaint ID: {cid} | Category: {c['category']} | Ward: {c['ward']}\n"
                        f"Submitted At: {c['created_at'].replace('T', ' ').substring(0, 16) if hasattr(c['created_at'], 'substring') else c['created_at'][:16]} | SLA: {sla_hours}h\n"
                        f"Simulated Clock: {timeline_ts} | Elapsed: {round(elapsed_hours, 1)}h (+{overdue_by}h breach)"
                    )
                    reasoning = (
                        f"Grievance has remained open for {round(elapsed_hours, 1)} hours, exceeding the "
                        f"{sla_hours}-hour municipal SLA threshold by {overdue_by} hours. No resolution was verified."
                    )
                    recommendation = "Escalate priority to Critical, set status to Overdue, and notify Zonal Commissioner."

                    # Idempotent execution: check if already escalated under REC-01
                    cur.execute(
                        "SELECT 1 FROM escalations WHERE complaint_id = ? AND rule_code = 'REC-01'",
                        (cid,)
                    )
                    already_escalated = cur.fetchone() is not None

                    if not already_escalated:
                        with conn:
                            conn.execute(
                                """
                                INSERT INTO escalations (complaint_id, rule_code, escalation_level, reason, action_taken, created_at)
                                VALUES (?, 'REC-01', 'Commissioner', ?, 'Status marked Overdue and dispatched to Commissioner', ?)
                                """,
                                (cid, f"SLA breached by {overdue_by} hours.", timeline_ts)
                            )
                            conn.execute(
                                "UPDATE complaints SET status = 'Overdue', urgency = 'Critical' WHERE id = ?",
                                (cid,)
                            )
                            conn.execute(
                                """
                                INSERT INTO complaint_timeline (
                                    complaint_id, previous_status, new_status, event_type, action,
                                    explanation, actor_role, actor_name, created_at
                                ) VALUES (?, ?, 'Overdue', 'ESCALATION', 'Recovery Agent: Escalation Flagged',
                                          ?, 'system', 'Civic Recovery Agent (Rule REC-01)', ?)
                                """,
                                (cid, c["status"], f"Autonomous SLA recovery: breached {sla_hours}h SLA by {overdue_by}h. Escalated to Commissioner.", timeline_ts)
                            )
                            conn.execute(
                                """
                                INSERT INTO notifications (complaint_id, icon_type, title, message, recipient_role, created_at, is_read)
                                VALUES (?, 'danger', 'SLA Breach Escalation',
                                        'Case ' || ? || ' was marked Overdue (+' || ? || 'h breach).', 'officer', ?, 0)
                                """,
                                (cid, cid, str(overdue_by), timeline_ts)
                            )
                        action_status = "Safe Auto-Action Executed"
                        safe_actions_count += 1
                    else:
                        action_status = "Already Applied in Ledger"

                    findings.append({
                        "id": f"FIND-REC01-{cid}",
                        "complaint_id": cid,
                        "category": c["category"],
                        "ward": c["ward"],
                        "rule_code": rule_code,
                        "rule_title": rule_title,
                        "data_cited": data_cited,
                        "reasoning": reasoning,
                        "recommendation": recommendation,
                        "action_status": action_status,
                        "requires_human_review": False,
                        "action_badge": "safe",
                    })

                # ── RULE REC-02: Stalled Rejected Evidence (Evidence Dispute) ──
                cur.execute(
                    """
                    SELECT * FROM evidence 
                    WHERE complaint_id = ? AND verification_status = 'Rejected'
                    ORDER BY id DESC LIMIT 1
                    """,
                    (cid,)
                )
                rejected_ev = cur.fetchone()

                if rejected_ev and c["status"] in ["Rework Required", "In Progress"]:
                    ev_dict = dict(rejected_ev)
                    rej_dt = parse_iso(ev_dict["reviewed_at"]) or created_dt
                    stalled_hours = round(max(0.0, (sim_dt - rej_dt).total_seconds() / 3600.0), 1)

                    rule_code = "RULE REC-02"
                    rule_title = "Stalled Rejected Evidence (Evidence Dispute)"
                    data_cited = (
                        f"Complaint ID: {cid} | Status: {c['status']} | Worker: {c['assigned_worker'] or 'Unassigned'}\n"
                        f"Evidence ID: {ev_dict['id']} | Rejected At: {ev_dict['reviewed_at'][:16] if ev_dict['reviewed_at'] else 'N/A'}\n"
                        f"Stalled in Rework: {stalled_hours}h | Reviewer: {ev_dict['reviewer_name']}\n"
                        f"Rejection Reason: \"{ev_dict['reviewer_decision'] or ev_dict['verification_explanation']}\""
                    )
                    reasoning = (
                        f"Field worker resolution evidence was rejected by officer due to location/quality discrepancy, "
                        f"and the complaint has remained in rework for {stalled_hours} hours without re-inspection."
                    )
                    recommendation = (
                        "Requires supervisor on-site dispute review or contractor reassignment. "
                        "Autonomous closure or penalty is prohibited to protect due process."
                    )

                    human_reviews_count += 1
                    findings.append({
                        "id": f"FIND-REC02-{cid}",
                        "complaint_id": cid,
                        "category": c["category"],
                        "ward": c["ward"],
                        "rule_code": rule_code,
                        "rule_title": rule_title,
                        "data_cited": data_cited,
                        "reasoning": reasoning,
                        "recommendation": recommendation,
                        "action_status": "Human Approval Required",
                        "requires_human_review": True,
                        "action_badge": "approval",
                        "human_action_label": "Review Evidence Dispute"
                    })

                # ── RULE REC-03: Unassigned Reopened Grievance ──
                if c["status"] == "Reopened" and (not c["assigned_worker"] or c["assigned_worker"].strip().lower() in ["none", "unassigned"]):
                    rule_code = "RULE REC-03"
                    rule_title = "Unassigned Reopened Grievance (Accountability Void)"
                    feedback = c["feedback_comment"] or "Citizen reported problem returned after initial closure."
                    data_cited = (
                        f"Complaint ID: {cid} | Category: {c['category']} | Status: Reopened\n"
                        f"Assigned Worker: [NONE] | Urgency: {c['urgency']}\n"
                        f"Citizen Feedback: \"{feedback}\""
                    )
                    reasoning = (
                        "Grievance was reopened by a citizen after previous closure, but has no assigned field crew, "
                        "creating an operational bottleneck where work orders cannot proceed."
                    )
                    recommendation = (
                        "Escalate urgency to High, log dispatch triage alert, and prompt Officer Priya Sharma "
                        "to assign a specialized contractor."
                    )

                    cur.execute(
                        "SELECT 1 FROM escalations WHERE complaint_id = ? AND rule_code = 'REC-03'",
                        (cid,)
                    )
                    already_triaged = cur.fetchone() is not None

                    if not already_triaged:
                        with conn:
                            conn.execute(
                                "UPDATE complaints SET urgency = 'High' WHERE id = ?",
                                (cid,)
                            )
                            conn.execute(
                                """
                                INSERT INTO escalations (complaint_id, rule_code, escalation_level, reason, action_taken, created_at)
                                VALUES (?, 'REC-03', 'Level 2', 'Reopened grievance unassigned to field crew.', 'Urgency raised to High; dispatch alert logged.', ?)
                                """,
                                (cid, timeline_ts)
                            )
                            conn.execute(
                                """
                                INSERT INTO complaint_timeline (
                                    complaint_id, previous_status, new_status, event_type, action,
                                    explanation, actor_role, actor_name, created_at
                                ) VALUES (?, 'Reopened', 'Reopened', 'TRIAGE', 'Recovery Agent: Reopen Triage Logged',
                                          'Priority elevated to High. Awaiting human officer assignment to dedicated crew.',
                                          'system', 'Civic Recovery Agent (Rule REC-03)', ?)
                                """,
                                (cid, timeline_ts)
                            )
                            conn.execute(
                                """
                                INSERT INTO notifications (complaint_id, icon_type, title, message, recipient_role, created_at, is_read)
                                VALUES (?, 'warning', 'Reopen Triage Alert',
                                        'Reopened case ' || ? || ' elevated to High priority. Requires squad assignment.',
                                        'officer', ?, 0)
                                """,
                                (cid, cid, timeline_ts)
                            )
                        action_status = "Safe Urgency Raised + Human Assignment Required"
                        safe_actions_count += 1
                    else:
                        action_status = "Already Applied in Ledger"

                    human_reviews_count += 1
                    findings.append({
                        "id": f"FIND-REC03-{cid}",
                        "complaint_id": cid,
                        "category": c["category"],
                        "ward": c["ward"],
                        "rule_code": rule_code,
                        "rule_title": rule_title,
                        "data_cited": data_cited,
                        "reasoning": reasoning,
                        "recommendation": recommendation,
                        "action_status": action_status,
                        "requires_human_review": True,
                        "action_badge": "approval",
                        "human_action_label": "Assign Crew as Officer"
                    })

            # ── 2. PAIRWISE SCAN FOR REC-04: LIKELY DUPLICATE COMPLAINTS ──
            n = len(complaints)
            for i in range(n):
                for j in range(i + 1, n):
                    c1 = complaints[i]
                    c2 = complaints[j]

                    if c1["status"] not in ["Resolved", "Withdrawn"] and c2["status"] not in ["Resolved", "Withdrawn"]:
                        if c1["ward"] == c2["ward"] and c1["category"] == c2["category"]:
                            # Spatial proximity check (within ~300 meters)
                            lat_diff = abs((c1["lat"] or 0) - (c2["lat"] or 0)) * 111000
                            lng_diff = abs((c1["lng"] or 0) - (c2["lng"] or 0)) * 111000
                            dist_meters = round(math.sqrt(lat_diff * lat_diff + lng_diff * lng_diff))

                            if dist_meters < 300:
                                rule_code = "RULE REC-04"
                                rule_title = "High-Probability Unlinked Co-located Duplicate"
                                data_cited = (
                                    f"Case A: {c1['id']} (\"{c1['title'][:35]}...\")\n"
                                    f"Case B: {c2['id']} (\"{c2['title'][:35]}...\")\n"
                                    f"Ward: {c1['ward']} | Category: {c1['category']} | Separation Distance: ~{dist_meters}m"
                                )
                                reasoning = (
                                    f"Both grievances report identical civic categories within {dist_meters} meters in {c1['ward']}. "
                                    f"Currently assigned to independent municipal queues, creating duplicate dispatch waste."
                                )
                                recommendation = (
                                    f"Auto-link cross-references between {c1['id']} and {c2['id']} in timelines. "
                                    f"Officer review required before permanently consolidating public records."
                                )

                                # Safe action: link duplicate IDs if not linked yet
                                already_linked = c1.get("linked_duplicate_id") == c2["id"] or c2.get("linked_duplicate_id") == c1["id"]

                                if not already_linked:
                                    with conn:
                                        conn.execute(
                                            "UPDATE complaints SET linked_duplicate_id = ? WHERE id = ?",
                                            (c2["id"], c1["id"])
                                        )
                                        conn.execute(
                                            "UPDATE complaints SET linked_duplicate_id = ? WHERE id = ?",
                                            (c1["id"], c2["id"])
                                        )
                                        conn.execute(
                                            """
                                            INSERT INTO complaint_timeline (
                                                complaint_id, previous_status, new_status, event_type, action,
                                                explanation, actor_role, actor_name, created_at
                                            ) VALUES (?, ?, ?, 'DUPLICATE_LINK', 'Recovery Agent: Duplicate Reference Linked',
                                                      ?, 'system', 'Civic Recovery Agent (Rule REC-04)', ?)
                                            """,
                                            (c1["id"], c1["status"], c1["status"], f"Auto-linked with co-located incident {c2['id']} (~{dist_meters}m away).", timeline_ts)
                                        )
                                        conn.execute(
                                            """
                                            INSERT INTO complaint_timeline (
                                                complaint_id, previous_status, new_status, event_type, action,
                                                explanation, actor_role, actor_name, created_at
                                            ) VALUES (?, ?, ?, 'DUPLICATE_LINK', 'Recovery Agent: Duplicate Reference Linked',
                                                      ?, 'system', 'Civic Recovery Agent (Rule REC-04)', ?)
                                            """,
                                            (c2["id"], c2["status"], c2["status"], f"Auto-linked with co-located incident {c1['id']} (~{dist_meters}m away).", timeline_ts)
                                        )
                                        conn.execute(
                                            """
                                            INSERT INTO notifications (complaint_id, icon_type, title, message, recipient_role, created_at, is_read)
                                            VALUES (?, 'info', 'Duplicate Linkage Detected',
                                                    'Case ' || ? || ' cross-referenced with ' || ? || ' (~' || ? || 'm away).',
                                                    'officer', ?, 0)
                                            """,
                                            (c1["id"], c1["id"], c2["id"], str(dist_meters), timeline_ts)
                                        )
                                    action_status = "Safe Linkage Executed"
                                    safe_actions_count += 1
                                else:
                                    action_status = "Already Applied in Ledger"

                                findings.append({
                                    "id": f"FIND-REC04-{c1['id']}-{c2['id']}",
                                    "complaint_id": f"{c1['id']} ↔ {c2['id']}",
                                    "category": c1["category"],
                                    "ward": c1["ward"],
                                    "rule_code": rule_code,
                                    "rule_title": rule_title,
                                    "data_cited": data_cited,
                                    "reasoning": reasoning,
                                    "recommendation": recommendation,
                                    "action_status": action_status,
                                    "requires_human_review": False,
                                    "action_badge": "safe",
                                })

            return {
                "scanned_count": len(complaints),
                "issues_found": len(findings),
                "safe_actions_taken": safe_actions_count,
                "human_reviews_needed": human_reviews_count,
                "simulated_time": sim_now,
                "findings": findings,
            }
        finally:
            conn.close()
