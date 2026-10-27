"""
app.py - Main Flask REST API & Web Application for CivicResolve AI.
Serves the complete civic grievance management API and the frontend client.
"""

import os
from datetime import datetime, timezone, timedelta
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

from database import init_db, get_db, get_simulated_time, set_simulated_time
from services.complaint_service import (
    create_complaint,
    get_complaint_by_id,
    list_complaints,
    update_complaint_status,
    reopen_complaint,
    escalate_complaint,
    assign_worker,
    upvote_complaint,
    calculate_dashboard_metrics,
    parse_iso,
)
from services.verification_service import submit_evidence, verify_evidence
from services.recovery_agent import CivicRecoveryAgent
from services.auth_service import (
    register_user,
    authenticate_user,
    verify_token,
    get_user_by_id,
    list_users,
    update_user_status
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOADS_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {
    "jpg", "jpeg", "png", "webp", "gif",
    "mp4", "webm", "mov", "m4v",
    "mp3", "wav", "ogg", "aac", "m4a",
    "pdf"
}

app = Flask(__name__, static_folder=BASE_DIR)
CORS(
    app,
    resources={r"/api/*": {"origins": "*"}},
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
    methods=["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"]
)

# Ensure database is initialized on startup
init_db(seed=True)


def get_current_user():
    """Extracts and verifies user from Authorization: Bearer <token>."""
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header[7:].strip()
        payload = verify_token(token)
        if payload:
            return payload
    return None


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# ══════════════════════════════════════════════════════════════
# STATIC ASSETS, UPLOADS & FRONTEND SERVING
# ══════════════════════════════════════════════════════════════
@app.route("/")
@app.route("/citizen/dashboard")
@app.route("/worker/dashboard")
@app.route("/employee/dashboard")
@app.route("/officer/dashboard")
@app.route("/admin/dashboard")
@app.route("/auth")
def serve_index():
    """Serves the main frontend Single Page Application."""
    return send_from_directory(BASE_DIR, "index.html")


@app.route("/uploads/<path:filename>")
def serve_uploaded_media(filename):
    """Serves real uploaded multimedia attachments (photos, videos, audio)."""
    return send_from_directory(UPLOADS_DIR, filename)


@app.route("/<path:filename>")
def serve_static(filename):
    """Serves styles, scripts, and local assets."""
    if os.path.exists(os.path.join(BASE_DIR, filename)):
        return send_from_directory(BASE_DIR, filename)
    return jsonify({"error": "Resource not found"}), 404


# ══════════════════════════════════════════════════════════════
# AUTHENTICATION & USER MANAGEMENT API
# ══════════════════════════════════════════════════════════════
@app.route("/api/auth/register", methods=["POST"])
def auth_register():
    """Citizen registration or staff application."""
    data = request.get_json(silent=True) or {}
    res, err, code = register_user(data)
    if err:
        return jsonify(err), code
    return jsonify({"message": "Registration successful.", **res}), code


@app.route("/api/auth/login", methods=["POST"])
def auth_login():
    """Authenticates credentials and issues signed session token."""
    data = request.get_json(silent=True) or {}
    identifier = data.get("identifier") or data.get("email") or data.get("phone")
    password = data.get("password")
    res, err, code = authenticate_user(identifier, password)
    if err:
        return jsonify(err), code
    return jsonify({"message": "Authentication successful.", **res}), code


@app.route("/api/auth/me", methods=["GET"])
def auth_me():
    """Returns currently authenticated user profile."""
    user = get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized or session expired."}), 401
    full_user = get_user_by_id(user["uid"])
    return jsonify({"user": full_user or user}), 200


@app.route("/api/users", methods=["GET"])
def get_users_list():
    """Admin-only: Retrieve user list for staff provisioning."""
    current_user = get_current_user()
    if not current_user or current_user.get("role") != "admin":
        return jsonify({"error": "Administrator privilege required."}), 403
    role = request.args.get("role")
    status = request.args.get("status")
    users = list_users(role=role, status=status)
    return jsonify({"count": len(users), "users": users}), 200


@app.route("/api/users/<string:user_id>/status", methods=["PATCH"])
def patch_user_status(user_id):
    """Admin-only: Approve, activate, or disable worker/officer accounts."""
    current_user = get_current_user()
    if not current_user or current_user.get("role") != "admin":
        return jsonify({"error": "Administrator privilege required."}), 403
    data = request.get_json(silent=True) or {}
    new_status = data.get("status")
    admin_name = current_user.get("name", "Administrator")
    user, err, code = update_user_status(user_id, new_status, admin_name)
    if err:
        return jsonify(err), code
    return jsonify({"message": f"User status updated to '{new_status}'.", "user": user}), code


# ══════════════════════════════════════════════════════════════
# MULTIMODAL MEDIA UPLOAD API
# ══════════════════════════════════════════════════════════════
@app.route("/api/upload", methods=["POST"])
def post_upload():
    """Upload photos, videos, or audio recordings with genuine file saving."""
    if "file" not in request.files:
        return jsonify({"error": "No file field found in form request."}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No file selected."}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": f"Unsupported file format. Supported: {', '.join(sorted(ALLOWED_EXTENSIONS))}"}), 400

    ext = file.filename.rsplit(".", 1)[1].lower()
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    rand_suffix = os.urandom(4).hex()
    safe_filename = f"{ts}_{rand_suffix}.{ext}"
    dest_path = os.path.join(UPLOADS_DIR, safe_filename)
    file.save(dest_path)

    size_bytes = os.path.getsize(dest_path)
    file_type = "photo"
    if ext in ["mp4", "webm", "mov", "m4v"]:
        file_type = "video"
    elif ext in ["mp3", "wav", "ogg", "aac", "m4a"]:
        file_type = "audio"
    elif ext == "pdf":
        file_type = "document"

    return jsonify({
        "message": "File uploaded successfully.",
        "url": f"/uploads/{safe_filename}",
        "filename": safe_filename,
        "original_filename": file.filename,
        "file_type": file_type,
        "size_bytes": size_bytes,
        "mime_type": file.mimetype
    }), 201


# ══════════════════════════════════════════════════════════════
# SYSTEM HEALTH & SIMULATED CLOCK
# ══════════════════════════════════════════════════════════════
@app.route("/api/health", methods=["GET"])
def health_check():
    """Check whether the backend and database connection are healthy."""
    try:
        sim_time = get_simulated_time()
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) AS total FROM complaints")
        total = cur.fetchone()["total"]
        conn.close()
        return jsonify({
            "status": "healthy",
            "service": "CivicResolve AI Backend",
            "version": "2.0.0",
            "database": "connected",
            "complaint_count": total,
            "simulated_time": sim_time
        }), 200
    except Exception as e:
        return jsonify({"status": "unhealthy", "error": str(e)}), 500


@app.route("/api/clock", methods=["GET"])
def get_clock():
    """Retrieve current simulated clock time."""
    return jsonify({"simulated_time": get_simulated_time()}), 200


@app.route("/api/clock/advance", methods=["POST"])
def advance_clock():
    """Advance simulated demo time by N hours (default 12 hours)."""
    data = request.get_json(silent=True) or {}
    hours = int(data.get("hours", 12))

    current_iso = get_simulated_time()
    dt = parse_iso(current_iso) or datetime.now(timezone.utc)
    new_dt = dt + timedelta(hours=hours)
    new_iso = new_dt.strftime("%Y-%m-%dT%H:%M:%SZ")

    set_simulated_time(new_iso)

    return jsonify({
        "message": f"Simulated clock advanced by +{hours} hours.",
        "previous_time": current_iso,
        "simulated_time": new_iso
    }), 200


@app.route("/api/reset-demo", methods=["POST"])
def reset_demo():
    """Resets the SQLite database to factory seeded demo state."""
    db_file = os.path.join(BASE_DIR, "civicresolve.db")
    if os.path.exists(db_file):
        try:
            os.remove(db_file)
        except Exception:
            pass
    init_db(seed=True)
    return jsonify({
        "message": "Demo database successfully restored to fresh seeded state.",
        "simulated_time": get_simulated_time()
    }), 200


# ══════════════════════════════════════════════════════════════
# COMPLAINTS API
# ══════════════════════════════════════════════════════════════
@app.route("/api/complaints", methods=["GET"])
def get_complaints():
    """Retrieve complaints with role-based visibility and filters."""
    current_user = get_current_user()
    filters = {
        "status": request.args.get("status"),
        "category": request.args.get("category"),
        "urgency": request.args.get("urgency") or request.args.get("priority"),
        "ward": request.args.get("ward"),
        "department": request.args.get("department"),
        "citizen_id": request.args.get("citizen_id"),
        "all_public": request.args.get("all_public") == "true",
        "all": request.args.get("all") == "true",
    }
    clean_filters = {k: v for k, v in filters.items() if v}
    complaints = list_complaints(clean_filters, current_user=current_user)
    return jsonify({"count": len(complaints), "complaints": complaints}), 200


@app.route("/api/complaints", methods=["POST"])
def post_complaint():
    """Validate and create a new complaint record with idempotency and user binding."""
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "Malformed request. JSON body is required."}), 400

    current_user = get_current_user()
    if current_user and not data.get("citizen_id"):
        data["citizen_id"] = current_user.get("uid")
        if not data.get("submitted_by"):
            data["submitted_by"] = current_user.get("name")

    complaint, err, status_code = create_complaint(data)
    if err:
        return jsonify(err), status_code
    return jsonify({"message": "Grievance registered successfully.", "complaint": complaint}), status_code


@app.route("/api/complaints/<string:complaint_id>", methods=["GET"])
def get_complaint(complaint_id):
    """Retrieve one complaint and its full timeline and evidence."""
    complaint = get_complaint_by_id(complaint_id)
    if not complaint:
        return jsonify({"error": f"Complaint '{complaint_id}' not found."}), 404
    return jsonify({"complaint": complaint}), 200


@app.route("/api/complaints/<string:complaint_id>/status", methods=["PATCH"])
def patch_complaint_status(complaint_id):
    """Validate and update complaint status enforcing allowed lifecycle transitions."""
    current_user = get_current_user()
    data = request.get_json(silent=True) or {}
    new_status = data.get("status")
    reason = data.get("reason", "").strip()

    if not new_status:
        return jsonify({"error": "Field 'status' is required."}), 400

    # Derive role from trusted token if present, otherwise fallback to request data
    if current_user:
        actor_role = current_user.get("role", "officer")
        actor_name = current_user.get("name", "Staff Member")
        # Citizens cannot transition complaints to staff operational statuses
        if actor_role == "citizen" and new_status in ["Assigned", "In Progress", "Resolved", "Verification Pending", "Awaiting Verification", "Overdue"]:
            return jsonify({"error": "Unauthorized: Citizens cannot execute internal operational status transitions."}), 403
    else:
        actor_role = data.get("actor_role", "officer")
        actor_name = data.get("actor_name", "Priya Sharma (Officer)")

    complaint, err, status_code = update_complaint_status(
        complaint_id, new_status, reason, actor_role, actor_name
    )
    if err:
        return jsonify(err), status_code
    return jsonify({"message": f"Status updated to '{new_status}'.", "complaint": complaint}), status_code


@app.route("/api/complaints/<string:complaint_id>/timeline", methods=["GET"])
def get_timeline(complaint_id):
    """Retrieve event history for a complaint."""
    complaint = get_complaint_by_id(complaint_id)
    if not complaint:
        return jsonify({"error": f"Complaint '{complaint_id}' not found."}), 404
    return jsonify({"complaint_id": complaint_id, "timeline": complaint["timeline"]}), 200


# ══════════════════════════════════════════════════════════════
# EVIDENCE & VERIFICATION API
# ══════════════════════════════════════════════════════════════
@app.route("/api/complaints/<string:complaint_id>/evidence", methods=["POST"])
def post_evidence(complaint_id):
    """Submit repair resolution evidence."""
    current_user = get_current_user()
    data = request.get_json(silent=True) or {}
    if current_user:
        data["worker_name"] = current_user.get("name", data.get("worker_name", "Rajesh Kumar"))

    result, err, status_code = submit_evidence(complaint_id, data)
    if err:
        return jsonify(err), status_code
    return jsonify({"message": "Evidence submitted successfully.", **result}), status_code


@app.route("/api/complaints/<string:complaint_id>/verify-evidence", methods=["POST"])
def post_verify_evidence(complaint_id):
    """Reviewer decision: approve or reject evidence."""
    current_user = get_current_user()
    if current_user and current_user.get("role") not in ["officer", "employee", "admin"]:
        return jsonify({"error": "Unauthorized: Verification sign-off requires Department Employee or Administrator credentials."}), 403

    data = request.get_json(silent=True) or {}
    decision = data.get("decision", "").strip()
    explanation = data.get("explanation", "").strip()
    reviewer_name = current_user.get("name") if current_user else data.get("reviewer_name", "Priya Sharma (Senior Officer)")

    complaint, err, status_code = verify_evidence(complaint_id, decision, explanation, reviewer_name)
    if err:
        return jsonify(err), status_code
    return jsonify({"message": f"Evidence {decision} recorded.", "complaint": complaint}), status_code


# ══════════════════════════════════════════════════════════════
# REOPEN & ESCALATION API
# ══════════════════════════════════════════════════════════════
@app.route("/api/complaints/<string:complaint_id>/reopen", methods=["POST"])
def post_reopen(complaint_id):
    """Reopen a resolved complaint when citizen reports issue remains."""
    current_user = get_current_user()
    data = request.get_json(silent=True) or {}
    reason = data.get("reason", "").strip()
    citizen_name = current_user.get("name") if current_user else data.get("citizen_name", "Ananya Sen")

    complaint, err, status_code = reopen_complaint(complaint_id, reason, citizen_name)
    if err:
        return jsonify(err), status_code
    return jsonify({"message": "Complaint reopened successfully.", "complaint": complaint}), status_code


@app.route("/api/complaints/<string:complaint_id>/escalate", methods=["POST"])
def post_escalate(complaint_id):
    """Record a valid escalation without creating duplicates."""
    data = request.get_json(silent=True) or {}
    reason = data.get("reason", "Target resolution SLA breached.").strip()
    rule_code = data.get("rule_code", "REC-01")
    level = data.get("escalation_level", "Level 2")

    complaint, err, status_code = escalate_complaint(complaint_id, reason, rule_code, level)
    if err:
        return jsonify(err), status_code
    return jsonify({"message": "Escalation recorded successfully.", "complaint": complaint}), status_code


@app.route("/api/complaints/<string:complaint_id>/assign", methods=["POST"])
def post_assign_worker(complaint_id):
    """Assign field crew or taskforce to a complaint."""
    current_user = get_current_user()
    if current_user and current_user.get("role") not in ["officer", "employee", "admin"]:
        return jsonify({"error": "Unauthorized: Dispatch assignments require Department Officer or Administrator credentials."}), 403

    data = request.get_json(silent=True) or {}
    worker_name = data.get("worker_name", "").strip() or "Special Emergency Taskforce"
    instructions = data.get("instructions", "").strip()
    officer_name = current_user.get("name") if current_user else data.get("officer_name", "Priya Sharma (Senior Officer)")

    complaint, err, status_code = assign_worker(complaint_id, worker_name, instructions, officer_name)
    if err:
        return jsonify(err), status_code
    return jsonify({"message": f"Assigned to {worker_name}.", "complaint": complaint}), status_code


@app.route("/api/complaints/<string:complaint_id>/upvote", methods=["POST"])
def post_upvote(complaint_id):
    """Upvote or remove upvote on a civic grievance."""
    data = request.get_json(silent=True) or {}
    increment = data.get("increment", True)
    result, err, status_code = upvote_complaint(complaint_id, increment=increment)
    if err:
        return jsonify(err), status_code
    return jsonify({"message": "Vote recorded.", **result}), status_code


# ══════════════════════════════════════════════════════════════
# CIVIC RECOVERY AGENT & DASHBOARD API
# ══════════════════════════════════════════════════════════════
@app.route("/api/agent/run", methods=["POST"])
def post_run_agent():
    """Run the rule-based Civic Recovery Agent across real database records."""
    current_user = get_current_user()
    if current_user and current_user.get("role") not in ["officer", "employee", "admin"]:
        return jsonify({"error": "Unauthorized: Civic Recovery Agent triggers require Department Officer or Administrator credentials."}), 403

    audit_results = CivicRecoveryAgent.run()
    return jsonify({
        "message": "Civic Recovery Agent audit complete.",
        "results": audit_results
    }), 200


@app.route("/api/dashboard", methods=["GET"])
def get_dashboard():
    """Calculate dashboard metrics from real database records."""
    metrics = calculate_dashboard_metrics()
    return jsonify(metrics), 200


@app.route("/api/notifications", methods=["GET"])
def get_notifications():
    """Retrieve notifications with optional role filter."""
    role = request.args.get("role")
    conn = get_db()
    try:
        cur = conn.cursor()
        if role:
            cur.execute(
                "SELECT * FROM notifications WHERE recipient_role = ? OR recipient_role = 'citizen' ORDER BY id DESC LIMIT 50",
                (role,)
            )
        else:
            cur.execute("SELECT * FROM notifications ORDER BY id DESC LIMIT 50")
        rows = [dict(r) for r in cur.fetchall()]
        return jsonify({"count": len(rows), "notifications": rows}), 200
    finally:
        conn.close()


@app.route("/api/notifications/read-all", methods=["POST"])
def post_read_all_notifications():
    """Mark all notifications as read."""
    conn = get_db()
    try:
        with conn:
            conn.execute("UPDATE notifications SET is_read = 1")
        return jsonify({"message": "All notifications marked as read."}), 200
    finally:
        conn.close()


if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("  CIVICRESOLVE AI — SMART CITY GRIEVANCE PLATFORM")
    print("  Flask REST API Server Starting on http://127.0.0.1:5000")
    print("=" * 60 + "\n")
    app.run(host="127.0.0.1", port=5000, debug=True)
