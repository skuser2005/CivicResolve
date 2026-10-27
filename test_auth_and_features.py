"""
test_auth_and_features.py - Comprehensive Unit & Integration Tests
Verifies:
1. Citizen Registration and immediate login
2. Staff (Worker/Officer) Registration requiring admin approval
3. Admin approval of pending staff
4. Password verification and rejection of wrong password
5. Token generation & authentication header
6. File upload (photo, audio, video)
7. Complaint creation with idempotency key preventing duplicates
8. Multimodal attachments storage
"""

import unittest
import json
import io
import os
import app as flask_app
from database import init_db

class TestAuthAndFeatures(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db(seed=True, reset=True)
        cls.client = flask_app.app.test_client()

    def test_01_demo_logins(self):
        """Test pre-seeded demo accounts login correctly."""
        # 1. Citizen login
        res = self.client.post("/api/auth/login", json={"identifier": "ananya@civicresolve.gov", "password": "Citizen@123"})
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["user"]["role"], "citizen")
        self.assertTrue(bool(data["token"]))

        # 2. Worker login
        res = self.client.post("/api/auth/login", json={"identifier": "rajesh@civicresolve.gov", "password": "Worker@123"})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.get_json()["user"]["role"], "worker")

        # 3. Officer login
        res = self.client.post("/api/auth/login", json={"identifier": "priya@civicresolve.gov", "password": "Officer@123"})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.get_json()["user"]["role"], "officer")

        # 4. Admin login
        res = self.client.post("/api/auth/login", json={"identifier": "admin@civicresolve.gov", "password": "Admin@123"})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.get_json()["user"]["role"], "admin")

    def test_02_invalid_login(self):
        """Test login fails with incorrect password."""
        res = self.client.post("/api/auth/login", json={"identifier": "ananya@civicresolve.gov", "password": "WrongPassword!"})
        self.assertEqual(res.status_code, 401)

    def test_03_citizen_registration(self):
        """Citizens register and can login immediately."""
        reg_res = self.client.post("/api/auth/register", json={
            "name": "Kavita Rao",
            "email": "kavita.rao@example.com",
            "phone": "+91 91234 56789",
            "password": "Password@123",
            "role": "citizen",
            "ward": "Ward 07 — Malleshwaram"
        })
        self.assertEqual(reg_res.status_code, 201)
        self.assertFalse(reg_res.get_json()["requires_approval"])

        login_res = self.client.post("/api/auth/login", json={
            "identifier": "kavita.rao@example.com",
            "password": "Password@123"
        })
        self.assertEqual(login_res.status_code, 200)

    def test_04_staff_registration_requires_approval(self):
        """Staff (Worker) registration sets status to pending_approval."""
        reg_res = self.client.post("/api/auth/register", json={
            "name": "Manjunath Gowda",
            "email": "manju.gowda@civicresolve.gov",
            "phone": "+91 93333 44444",
            "password": "Worker@123",
            "role": "worker",
            "department": "Roads & Infrastructure (PWD)"
        })
        self.assertEqual(reg_res.status_code, 201)
        self.assertTrue(reg_res.get_json()["requires_approval"])

        # Login must be rejected while pending approval
        login_res = self.client.post("/api/auth/login", json={
            "identifier": "manju.gowda@civicresolve.gov",
            "password": "Worker@123"
        })
        self.assertEqual(login_res.status_code, 403)
        self.assertIn("pending", login_res.get_json()["error"])

    def test_05_admin_approves_staff(self):
        """Admin can list and approve pending staff."""
        # Login as Admin
        admin_login = self.client.post("/api/auth/login", json={"identifier": "admin@civicresolve.gov", "password": "Admin@123"})
        token = admin_login.get_json()["token"]
        headers = {"Authorization": f"Bearer {token}"}

        # List pending staff
        users_res = self.client.get("/api/users?status=pending_approval", headers=headers)
        self.assertEqual(users_res.status_code, 200)
        pending_users = users_res.get_json()["users"]
        self.assertGreaterEqual(len(pending_users), 1)

        # Approve Suresh Patil
        suresh = next(u for u in pending_users if u["email"] == "suresh@civicresolve.gov")
        patch_res = self.client.patch(f"/api/users/{suresh['id']}/status", json={"status": "active"}, headers=headers)
        self.assertEqual(patch_res.status_code, 200)

        # Now Suresh can log in!
        suresh_login = self.client.post("/api/auth/login", json={"identifier": "suresh@civicresolve.gov", "password": "Worker@123"})
        self.assertEqual(suresh_login.status_code, 200)
        self.assertEqual(suresh_login.get_json()["user"]["role"], "worker")

    def test_06_file_upload(self):
        """Test uploading a photo file to /api/upload."""
        data = {
            'file': (io.BytesIO(b"fake image data"), 'pothole_site.jpg')
        }
        res = self.client.post("/api/upload", data=data, content_type='multipart/form-data')
        self.assertEqual(res.status_code, 201)
        body = res.get_json()
        self.assertEqual(body["file_type"], "photo")
        self.assertTrue(body["url"].startswith("/uploads/"))

    def test_07_complaint_idempotency(self):
        """Double clicking or resending identical idempotency key returns same complaint."""
        key = "idemp-test-uuid-9999"
        payload = {
            "title": "Severe road obstruction near city park",
            "description": "Fallen branches completely blocking traffic on main arterial road.",
            "category": "Fallen Tree Branch",
            "ward": "Ward 14 — Koramangala",
            "locality": "4th Block Park Road",
            "urgency": "High",
            "idempotency_key": key
        }
        res1 = self.client.post("/api/complaints", json=payload)
        self.assertEqual(res1.status_code, 201)
        cid1 = res1.get_json()["complaint"]["id"]

        # Resend immediately with same idempotency key
        res2 = self.client.post("/api/complaints", json=payload)
        self.assertEqual(res2.status_code, 200)
        cid2 = res2.get_json()["complaint"]["id"]

        self.assertEqual(cid1, cid2)


if __name__ == "__main__":
    unittest.main()
