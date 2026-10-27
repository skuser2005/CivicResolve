import unittest
import json
import os
from app import app
from database import init_db, DB_PATH


class CivicResolveBackendTests(unittest.TestCase):

    def setUp(self):
        """Reset and seed fresh database before each test."""
        if os.path.exists(DB_PATH):
            try:
                os.remove(DB_PATH)
            except Exception:
                pass
        init_db(seed=True)
        self.client = app.test_client()

    def tearDown(self):
        """Restore clean seeded database after test so application remains functional."""
        init_db(seed=True)

    def test_01_health_check(self):
        """GET /api/health should return 200 with healthy status."""
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "healthy")
        self.assertGreaterEqual(data["complaint_count"], 7)

    def test_02_list_complaints(self):
        """GET /api/complaints should return list of complaints with filtering."""
        res = self.client.get("/api/complaints")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertGreaterEqual(data["count"], 7)

        # Filter by status
        res_filter = self.client.get("/api/complaints?status=Overdue")
        self.assertEqual(res_filter.status_code, 200)
        filtered_data = res_filter.get_json()
        for c in filtered_data["complaints"]:
            self.assertEqual(c["status"], "Overdue")

    def test_03_create_complaint_validation(self):
        """POST /api/complaints should validate required fields."""
        # Missing title
        bad_res = self.client.post("/api/complaints", json={
            "description": "Short",
            "category": "Garbage Dump",
            "ward": "Ward 14"
        })
        self.assertEqual(bad_res.status_code, 400)
        self.assertIn("error", bad_res.get_json())

        # Valid complaint
        good_res = self.client.post("/api/complaints", json={
            "title": "Severe Pothole Cluster on Ring Road",
            "description": "Deep craters along 30 meters causing traffic slow down and dangerous swerving.",
            "category": "Pothole",
            "ward": "Ward 14 — Koramangala",
            "locality": "Ring Road Junction",
            "urgency": "High",
            "safety_concern": True
        })
        self.assertEqual(good_res.status_code, 201)
        data = good_res.get_json()
        self.assertIn("CR-2026-", data["complaint"]["id"])
        self.assertEqual(data["complaint"]["status"], "Submitted")

    def test_04_status_transition_enforcement(self):
        """Lifecycle transitions must be strictly enforced."""
        cid = "CR-2026-8499"  # Currently 'Submitted'

        # Invalid transition: Submitted -> Resolved directly (must fail)
        bad_res = self.client.patch(f"/api/complaints/{cid}/status", json={
            "status": "Resolved",
            "reason": "Direct closure attempt without inspection"
        })
        self.assertEqual(bad_res.status_code, 400)

        # Valid transition: Submitted -> Assigned
        res1 = self.client.patch(f"/api/complaints/{cid}/status", json={
            "status": "Assigned",
            "reason": "Assigned to Sanitation Crew 1"
        })
        self.assertEqual(res1.status_code, 200)
        self.assertEqual(res1.get_json()["complaint"]["status"], "Assigned")

        # Valid transition: Assigned -> In Progress
        res2 = self.client.patch(f"/api/complaints/{cid}/status", json={
            "status": "In Progress",
            "reason": "Crew reached location and started work"
        })
        self.assertEqual(res2.status_code, 200)
        self.assertEqual(res2.get_json()["complaint"]["status"], "In Progress")

    def test_05_evidence_verification_and_rework(self):
        """Evidence submission, review rejection, and rework cycle."""
        cid = "CR-2026-7281"  # 'In Progress'

        # Submit resolution evidence
        sub_res = self.client.post(f"/api/complaints/{cid}/evidence", json={
            "file_path": "water_pipe_repaired.jpg",
            "caption": "Replaced 4-inch ductile iron collar and tested pressure.",
            "declared_category": "Water Leakage"
        })
        self.assertEqual(sub_res.status_code, 201)
        self.assertEqual(sub_res.get_json()["complaint"]["status"], "Awaiting Verification")

        # Reviewer rejects evidence -> status must become 'Rework Required'
        rej_res = self.client.post(f"/api/complaints/{cid}/verify-evidence", json={
            "decision": "Rejected",
            "explanation": "Pressure gauge indicates ongoing seep at the joint. Tighten flange bolts."
        })
        self.assertEqual(rej_res.status_code, 200)
        self.assertEqual(rej_res.get_json()["complaint"]["status"], "Rework Required")

        # Resubmit improved evidence
        resub_res = self.client.post(f"/api/complaints/{cid}/evidence", json={
            "file_path": "water_pipe_flange_tightened.jpg",
            "caption": "Flange bolts torqued to 85 Nm. Hydrostatic pressure hold verified.",
            "declared_category": "Water Leakage"
        })
        self.assertEqual(resub_res.status_code, 201)
        self.assertEqual(resub_res.get_json()["complaint"]["status"], "Awaiting Verification")

        # Reviewer approves -> status must become 'Resolved'
        appr_res = self.client.post(f"/api/complaints/{cid}/verify-evidence", json={
            "decision": "Approved",
            "explanation": "Hydrostatic test verified by Junior Engineer. Closure approved."
        })
        self.assertEqual(appr_res.status_code, 200)
        self.assertEqual(appr_res.get_json()["complaint"]["status"], "Resolved")

    def test_06_reopen_complaint(self):
        """Citizen reopening of a resolved complaint."""
        cid = "CR-2026-9104"  # Currently 'Resolved'

        reopen_res = self.client.post(f"/api/complaints/{cid}/reopen", json={
            "reason": "Rain washed out top bitumen layer, pothole depression has reappeared."
        })
        self.assertEqual(reopen_res.status_code, 200)
        data = reopen_res.get_json()
        self.assertEqual(data["complaint"]["status"], "Reopened")
        self.assertEqual(data["complaint"]["urgency"], "High")

    def test_07_recovery_agent_deterministic_findings(self):
        """Run Civic Recovery Agent and verify explainable findings for REC-01, 02, 03, 04."""
        agent_res = self.client.post("/api/agent/run")
        self.assertEqual(agent_res.status_code, 200)
        data = agent_res.get_json()["results"]

        self.assertGreaterEqual(data["scanned_count"], 7)
        self.assertGreaterEqual(data["issues_found"], 3)

        rule_codes = [f["rule_code"] for f in data["findings"]]
        self.assertIn("RULE REC-01", rule_codes)  # Overdue dump CR-2026-8492
        self.assertIn("RULE REC-02", rule_codes)  # Stalled rejected sewage CR-2026-5531
        self.assertIn("RULE REC-03", rule_codes)  # Unassigned reopened CR-2026-4412
        self.assertIn("RULE REC-04", rule_codes)  # Duplicate CR-2026-8492 <-> 8499

    def test_08_clock_advance_triggers_overdue(self):
        """Advancing demo time makes deadline-approaching complaints overdue."""
        # Advance time by 24 hours
        adv_res = self.client.post("/api/clock/advance", json={"hours": 24})
        self.assertEqual(adv_res.status_code, 200)

        # Check dashboard metrics
        dash_res = self.client.get("/api/dashboard")
        self.assertEqual(dash_res.status_code, 200)
        metrics = dash_res.get_json()
        self.assertGreaterEqual(metrics["overdue_complaints"], 2)

    def test_09_escalation_idempotency(self):
        """Escalating twice under same rule must reject duplicate with 409."""
        cid = "CR-2026-6140"

        # First escalation
        res1 = self.client.post(f"/api/complaints/{cid}/escalate", json={
            "reason": "Safety hazard unresolved within standard window.",
            "rule_code": "REC-01"
        })
        self.assertEqual(res1.status_code, 200)

        # Second escalation with same rule_code -> Must reject as duplicate
        res2 = self.client.post(f"/api/complaints/{cid}/escalate", json={
            "reason": "Duplicate attempt.",
            "rule_code": "REC-01"
        })
        self.assertEqual(res2.status_code, 409)


if __name__ == "__main__":
    unittest.main()
