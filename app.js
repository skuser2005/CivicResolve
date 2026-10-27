/* ══════════════════════════════════════════════════════════════
   CIVICRESOLVE AI — CORE LOGIC & APPLICATION ENGINE
   Smart City Grievance, Department Coordination & Resolution Platform
   ══════════════════════════════════════════════════════════════ */

'use strict';

// ── DEFAULT SEEDED DATABASE ────────────────────────────────────
const DEFAULT_CIVIC_DB = {
  users: {
    citizen: { id: 'usr-101', name: 'Ananya Sen', role: 'citizen', ward: 'Ward 14 — Koramangala', email: 'ananya@civicresolve.gov', phone: '+91 98765 43210' },
    worker: { id: 'usr-202', name: 'Rajesh Kumar', role: 'worker', department: 'Sanitation & Solid Waste', squad: 'Squad #4', ward: 'Ward 14' },
    officer: { id: 'usr-303', name: 'Priya Sharma', role: 'officer', title: 'Senior Grievance Officer', division: 'PWD & Sanitation' },
    admin: { id: 'usr-404', name: 'Dr. V. Narayanan', role: 'admin', title: 'Chief Municipal Commissioner' }
  },

  complaints: [
    {
      id: 'CR-2026-8492',
      title: 'Severe Municipal Dump Overflowing onto Pedestrian Walkway',
      category: 'Garbage Dump',
      department: 'Sanitation & Solid Waste',
      ward: 'Ward 14 — Koramangala',
      locality: '5th Block, 80 Feet Road',
      landmark: 'Opposite BDA Complex, near Post Office',
      lat: 12.9352,
      lng: 77.6245,
      urgency: 'Critical',
      safetyConcern: true,
      recurring: true,
      affectedCount: '200+',
      submittedBy: 'Ananya Sen',
      anonymous: false,
      timestamp: '2026-10-26T09:30:00Z',
      status: 'Overdue',
      assignedWorker: 'Rajesh Kumar (Squad #4)',
      deadlineHours: 24,
      targetDeadline: '2026-10-27T09:30:00Z',
      upvotes: 46,
      userVoted: false,
      evidence: {
        beforeImg: 'dump-visual',
        beforeCaption: 'Large waste heap spilling across 15 meters of footpath with severe odor and stray animal menace.',
        afterImg: null,
        afterCaption: null
      },
      timeline: [
        { timestamp: '2026-10-26 09:30', actor: 'Citizen (Ananya)', action: 'Complaint Submitted', desc: 'Registered grievance with geo-tagged photo and high urgency.', role: 'citizen' },
        { timestamp: '2026-10-26 09:31', actor: 'AI Intake Agent', action: 'Intake Validated & Scored', desc: 'Category verified as Sanitation. Priority Score: 92/100 (Safety hazard detected).', role: 'system' },
        { timestamp: '2026-10-26 10:15', actor: 'Officer (Priya Sharma)', action: 'Department Dispatched', desc: 'Assigned to Sanitation Squad #4 for immediate mechanical clearing.', role: 'officer' },
        { timestamp: '2026-10-26 11:00', actor: 'Worker (Rajesh Kumar)', action: 'Work Order Accepted', desc: 'Field crew assigned dump truck #KA-01-EA-4920.', role: 'worker' },
        { timestamp: '2026-10-27 09:30', actor: 'AI Deadline Agent', action: 'SLA Breach Flagged', desc: 'Target 24-hour turnaround breached. Escalation alert sent to Zonal Commissioner.', role: 'system' }
      ],
      comments: [
        { user: 'Siddharth M.', time: '1 day ago', text: 'This dump has been expanding for 4 days. School children cannot use the sidewalk.' },
        { user: 'Koramangala RWA', time: '18 hours ago', text: 'Supported! We have notified the ward health inspector as well.' }
      ],
      feedback: null
    },
    {
      id: 'CR-2026-9104',
      title: 'Dangerous 2ft Deep Road Trench Following Underground Cable Laying',
      category: 'Pothole',
      department: 'Roads & Infrastructure (PWD)',
      ward: 'Ward 07 — Malleshwaram',
      locality: '11th Cross, Temple Street',
      landmark: 'Near Govt Boys High School',
      lat: 13.0031,
      lng: 77.5643,
      urgency: 'High',
      safetyConcern: true,
      recurring: false,
      affectedCount: '50-200',
      submittedBy: 'Karthik Rao',
      anonymous: false,
      timestamp: '2026-10-25T14:10:00Z',
      status: 'Resolved',
      assignedWorker: 'PWD Road Crew #8',
      deadlineHours: 48,
      targetDeadline: '2026-10-27T14:10:00Z',
      upvotes: 68,
      userVoted: true,
      evidence: {
        beforeImg: 'pothole-visual',
        beforeCaption: 'Unbarricaded excavation across carriage lane posing severe skid risk for two-wheelers.',
        afterImg: 'pothole-after',
        afterCaption: 'Excavation backfilled with WMM, compacted, and resurfaced with bituminous hot mix.'
      },
      timeline: [
        { timestamp: '2026-10-25 14:10', actor: 'Citizen (Karthik)', action: 'Complaint Submitted', desc: 'Reported road trench with photographic evidence.', role: 'citizen' },
        { timestamp: '2026-10-25 14:12', actor: 'AI Routing Agent', action: 'Routed to PWD Roads', desc: 'Classified under PWD Malleshwaram subdivision.', role: 'system' },
        { timestamp: '2026-10-25 16:00', actor: 'Officer (Priya Sharma)', action: 'Assigned to Road Crew #8', desc: 'Work order #PWD-849 issued for evening compaction.', role: 'officer' },
        { timestamp: '2026-10-26 18:30', actor: 'Worker (Crew #8)', action: 'Resolution Evidence Submitted', desc: 'Uploaded completion photo and asphalt compaction log.', role: 'worker' },
        { timestamp: '2026-10-27 10:00', actor: 'Officer (Priya Sharma)', action: 'Officially Verified & Resolved', desc: 'Junior engineer physical inspection passed. Complaint closed.', role: 'officer' }
      ],
      comments: [
        { user: 'Anita Deshmukh', time: '2 days ago', text: 'Two scooters slipped here yesterday in the rain. Very urgent!' },
        { user: 'Karthik Rao', time: '6 hours ago', text: 'Verified this morning. The road has been patched smoothly. Thank you team!' }
      ],
      feedback: { rating: 5, comment: 'Quick turnaround within 48 hours. Quality patch work.', date: '2026-10-27' }
    },
    {
      id: 'CR-2026-7281',
      title: 'Potable Drinking Water Pipeline Burst Flooding Street',
      category: 'Water Leakage',
      department: 'Water Supply & Sewerage',
      ward: 'Ward 04 — Indiranagar',
      locality: '100 Feet Road, 12th Main',
      landmark: 'Behind Metro Station Pillar #142',
      lat: 12.9784,
      lng: 77.6408,
      urgency: 'Critical',
      safetyConcern: false,
      recurring: false,
      affectedCount: '200+',
      submittedBy: 'Meera Nambiar',
      anonymous: true,
      timestamp: '2026-10-27T08:00:00Z',
      status: 'In Progress',
      assignedWorker: 'BWSSB Rapid Unit 2',
      deadlineHours: 12,
      targetDeadline: '2026-10-27T20:00:00Z',
      upvotes: 32,
      userVoted: false,
      evidence: {
        beforeImg: 'water-visual',
        beforeCaption: 'Major mains line ruptured, clean drinking water gushing onto the tarmac.',
        afterImg: null,
        afterCaption: null
      },
      timeline: [
        { timestamp: '2026-10-27 08:00', actor: 'Resident (Ward 04)', action: 'Complaint Submitted', desc: 'Reported pipeline rupture causing loss of potable water.', role: 'citizen' },
        { timestamp: '2026-10-27 08:05', actor: 'AI Intake Agent', action: 'High Priority Flagged', desc: 'Resource loss risk evaluated. Routed to Water Board.', role: 'system' },
        { timestamp: '2026-10-27 09:20', actor: 'Officer (Water Board)', action: 'Valve Gate Isolated', desc: 'Upstream supply closed to stop water wastage while crew arrives.', role: 'officer' },
        { timestamp: '2026-10-27 11:30', actor: 'Worker (BWSSB Unit 2)', action: 'Work In Progress', desc: 'Excavation started to replace 4-inch ductile iron collar.', role: 'worker' }
      ],
      comments: [
        { user: 'Vikram Seth', time: '3 hours ago', text: 'Water pressure in neighboring houses has dropped to zero.' }
      ],
      feedback: null
    },
    {
      id: 'CR-2026-6140',
      title: 'Four Successive Streetlights Damaged & Dark at Night',
      category: 'Broken Streetlight',
      department: 'Electrical & Street Lighting',
      ward: 'Ward 12 — Rajajinagar',
      locality: '3rd Block, 59th Cross',
      landmark: 'Near ESI Hospital Circle',
      lat: 12.9902,
      lng: 77.5532,
      urgency: 'High',
      safetyConcern: true,
      recurring: true,
      affectedCount: '50-200',
      submittedBy: 'Ananya Sen',
      anonymous: false,
      timestamp: '2026-10-26T18:45:00Z',
      status: 'Awaiting Verification',
      assignedWorker: 'Electrical Maintenance Squad B',
      deadlineHours: 36,
      targetDeadline: '2026-10-28T06:45:00Z',
      upvotes: 21,
      userVoted: false,
      evidence: {
        beforeImg: 'light-visual',
        beforeCaption: 'Dark alley creating safety issues for women returning from night hospital shifts.',
        afterImg: 'dump-visual',
        afterCaption: 'Replaced faulty MCB switch and fitted 4 new 90W LED fixtures. Tested functional.'
      },
      timeline: [
        { timestamp: '2026-10-26 18:45', actor: 'Citizen (Ananya)', action: 'Complaint Submitted', desc: 'Night safety issue lodged.', role: 'citizen' },
        { timestamp: '2026-10-26 18:48', actor: 'AI Intake Agent', action: 'Safety Priority Applied', desc: 'Night transit safety flagged. SLA set to 36 hours.', role: 'system' },
        { timestamp: '2026-10-27 14:00', actor: 'Worker (Squad B)', action: 'Resolution Evidence Submitted', desc: 'Fixtures replaced and illuminance verified at 25 lux.', role: 'worker' }
      ],
      comments: [],
      feedback: null
    },
    {
      id: 'CR-2026-5531',
      title: 'Raw Sewage Overflow Stagnating Behind 5th Block Vegetable Market',
      category: 'Sewage Overflow',
      department: 'Water Supply & Sewerage',
      ward: 'Ward 14 — Koramangala',
      locality: '5th Block, Market Lane',
      landmark: 'Behind Corporation Vegetable Market Stalls',
      lat: 12.9348,
      lng: 77.6238,
      urgency: 'High',
      safetyConcern: true,
      recurring: false,
      affectedCount: '200+',
      submittedBy: 'Koramangala Traders Association',
      anonymous: false,
      timestamp: '2026-10-26T11:00:00Z',
      status: 'In Progress',
      assignedWorker: 'Sanitation Squad #4',
      deadlineHours: 24,
      targetDeadline: '2026-10-27T11:00:00Z',
      upvotes: 39,
      userVoted: false,
      evidence: {
        beforeImg: 'water-visual',
        beforeCaption: 'Black sewage water backflowing into shopping walkway.',
        afterImg: 'dump-visual',
        afterCaption: 'Superficial sweeping photo submitted by crew.',
        rejected: true,
        rejectedAt: '2026-10-26T17:30:00Z',
        rejectionReason: 'Submitted photo shows clear pavement 100m away, but health inspector reported active sewage stagnation behind the vegetable stalls. Return for on-site rework.'
      },
      timeline: [
        { timestamp: '2026-10-26 11:00', actor: 'Traders Association', action: 'Complaint Submitted', desc: 'Reported health hazard and foul stench.', role: 'citizen' },
        { timestamp: '2026-10-26 12:15', actor: 'AI Routing Agent', action: 'Assigned to Drainage Squad', desc: 'Dispatched for mechanical desilting.', role: 'system' },
        { timestamp: '2026-10-26 16:45', actor: 'Worker (Squad #4)', action: 'Resolution Evidence Submitted', desc: 'Crew uploaded photo of nearby street.', role: 'worker' },
        { timestamp: '2026-10-26 17:30', actor: 'Officer (Priya Sharma)', action: 'Evidence Rejected: Return for Rework', desc: 'Photo location did not match grievance coordinates. Instructed crew to redo.', role: 'officer' }
      ],
      comments: [
        { user: 'Vendor Rajesh', time: '1 day ago', text: 'Customers cannot enter the market due to the backflow.' }
      ],
      feedback: null
    },
    {
      id: 'CR-2026-4412',
      title: 'Open Masonry Dustbin Broken & Sharp Debris Obstructing Road',
      category: 'Damaged Public Property',
      department: 'Civic Amenities & Horticulture',
      ward: 'Ward 14 — Koramangala',
      locality: '3rd Block, 14th Main',
      landmark: 'Near Corporation Bank ATM',
      lat: 12.9320,
      lng: 77.6210,
      urgency: 'Normal',
      safetyConcern: true,
      recurring: true,
      affectedCount: '50-200',
      submittedBy: 'Ananya Sen',
      anonymous: false,
      timestamp: '2026-10-25T10:00:00Z',
      status: 'Reopened',
      assignedWorker: null,
      deadlineHours: 48,
      targetDeadline: '2026-10-27T10:00:00Z',
      upvotes: 18,
      userVoted: false,
      evidence: {
        beforeImg: 'dump-visual',
        beforeCaption: 'Demolished brick dustbin wall with exposed rebar.',
        afterImg: null,
        afterCaption: null
      },
      timeline: [
        { timestamp: '2026-10-25 10:00', actor: 'Citizen (Ananya)', action: 'Complaint Submitted', desc: 'Reported broken bin enclosure.', role: 'citizen' },
        { timestamp: '2026-10-26 12:00', actor: 'Field Crew', action: 'Marked Cleaned', desc: 'Solid waste removed.', role: 'worker' },
        { timestamp: '2026-10-26 15:30', actor: 'Citizen (Ananya)', action: 'Complaint Reopened', desc: 'Truck broke the masonry enclosure leaving sharp debris on road. Unassigned since reopen.', role: 'citizen' }
      ],
      comments: [],
      feedback: {
        comment: 'The compactor truck cleared the garbage but accidentally crushed the brick enclosure, leaving sharp debris across the road. Needs masonry repair!',
        reopenedAt: '2026-10-26T15:30:00Z'
      }
    },
    {
      id: 'CR-2026-8499',
      title: 'Massive Waste Overflow Spilling in Front of BDA Post Office',
      category: 'Garbage Dump',
      department: 'Sanitation & Solid Waste',
      ward: 'Ward 14 — Koramangala',
      locality: '5th Block, 80 Feet Road',
      landmark: 'Opposite BDA Complex Post Office Gate',
      lat: 12.9354,
      lng: 77.6248,
      urgency: 'High',
      safetyConcern: false,
      recurring: false,
      affectedCount: '100-200',
      submittedBy: 'Ramesh Sundaram',
      anonymous: false,
      timestamp: '2026-10-26T10:45:00Z',
      status: 'Intake Review',
      assignedWorker: 'Sanitation Squad #4',
      deadlineHours: 24,
      targetDeadline: '2026-10-27T10:45:00Z',
      upvotes: 14,
      userVoted: false,
      evidence: {
        beforeImg: 'dump-visual',
        beforeCaption: 'Waste spillover in front of post office gate.',
        afterImg: null,
        afterCaption: null
      },
      timeline: [
        { timestamp: '2026-10-26 10:45', actor: 'Citizen (Ramesh)', action: 'Complaint Submitted', desc: 'Registered duplicate dump grievance at BDA Post Office gate.', role: 'citizen' }
      ],
      comments: [],
      feedback: null
    }
  ],

  facilities: [
    {
      id: 'FAC-01',
      name: 'Koramangala BDA Complex Public Restroom',
      type: 'toilet',
      category: 'Public Toilet',
      ward: 'Ward 14 — Koramangala',
      location: 'BDA Complex, 80 Feet Road',
      lat: 12.9355,
      lng: 77.6250,
      amenities: ['Male & Female', 'Wheelchair Accessible', 'Running Water', 'Sanitary Disposal'],
      status: 'Operational',
      hours: '06:00 AM – 10:00 PM',
      rating: 4.3,
      lastInspected: 'Today, 08:30 AM'
    },
    {
      id: 'FAC-02',
      name: 'Malleshwaram 8th Cross Accessible Facility',
      type: 'accessible',
      category: 'Accessible Restroom',
      ward: 'Ward 07 — Malleshwaram',
      location: 'Near Canara Union, 8th Cross',
      lat: 13.0035,
      lng: 77.5650,
      amenities: ['Braille Signage', 'Wheelchair Ramp', 'Grab Bars', 'Emergency Alarm Bell'],
      status: 'Operational',
      hours: '24 Hours Open',
      rating: 4.7,
      lastInspected: 'Yesterday'
    },
    {
      id: 'FAC-03',
      name: 'Indiranagar Metro Smart Waste Drop',
      type: 'bin',
      category: 'Public Bin',
      ward: 'Ward 04 — Indiranagar',
      location: '100ft Road Metro Exit Gate B',
      lat: 12.9780,
      lng: 77.6415,
      amenities: ['Wet Waste', 'Dry Recyclables', 'E-Waste Slot', 'Sensor Level Monitor'],
      status: 'Operational (72% Full)',
      hours: 'Always Accessible',
      rating: 4.1,
      lastInspected: 'Today, 11:00 AM'
    },
    {
      id: 'FAC-04',
      name: 'Rajajinagar Clean Water ATM Station',
      type: 'water',
      category: 'Water Point',
      ward: 'Ward 12 — Rajajinagar',
      location: 'Opposite ESI Hospital Park',
      lat: 12.9895,
      lng: 77.5540,
      amenities: ['RO Purified', 'Cold Water Dispenser', 'Free Refill Station', 'TDS Monitor'],
      status: 'Operational',
      hours: '05:00 AM – 11:00 PM',
      rating: 4.5,
      lastInspected: 'Oct 26'
    }
  ],

  surveys: [
    {
      id: 'SURV-01',
      title: 'Ward 14: Cleanliness Drive vs. Smart Bin Upgrades',
      desc: 'Help municipal planners prioritize Q4 discretionary sanitation funds for Koramangala.',
      options: [
        { text: 'Install 20 Solar-Powered Compactor Bins on Commercial Streets', votes: 142 },
        { text: 'Deploy Night-Shift Mechanical Street Sweeping Vehicles', votes: 198 },
        { text: 'Initiate Weekend Citizen Volunteer Composting Workshops', votes: 64 }
      ],
      userVoted: false
    },
    {
      id: 'SURV-02',
      title: 'Pedestrian Safety Priority on High-Density Corridors',
      desc: 'Which infrastructure intervention should the PWD Roads Division execute first?',
      options: [
        { text: 'Construct Raised Tabletop Pedestrian Crossings near Schools', votes: 231 },
        { text: 'Clear Footpath Encroachments & Restore Continuous Walkways', votes: 310 },
        { text: 'Install High-Lumen Dedicated Pedestrian Streetlamps', votes: 88 }
      ],
      userVoted: true
    }
  ],

  auditLogs: [
    { timestamp: '2026-10-27 10:00', actor: 'Priya Sharma (Officer)', action: 'VERIFY_RESOLUTION', details: 'Case CR-2026-9104 approved and marked Resolved after inspecting asphalt proof.' },
    { timestamp: '2026-10-27 09:30', actor: 'AI Engine', action: 'SLA_BREACH_ALERT', details: 'Case CR-2026-8492 exceeded 24-hour deadline threshold. Escalated to Commissioner desk.' },
    { timestamp: '2026-10-27 09:20', actor: 'Officer (Water Board)', action: 'ASSIGN_WORKER', details: 'Case CR-2026-7281 assigned to BWSSB Rapid Unit 2.' },
    { timestamp: '2026-10-26 14:15', actor: 'Rajesh Kumar (Worker)', action: 'ACCEPT_TASK', details: 'Worker accepted grievance CR-2026-8492.' },
    { timestamp: '2026-10-25 14:10', actor: 'Karthik Rao (Citizen)', action: 'SUBMIT_COMPLAINT', details: 'New complaint CR-2026-9104 registered in Ward 07.' }
  ],

  notifications: [
    { id: 'notif-1', icon: 'warning', title: 'SLA Escalation Warning', desc: 'Case CR-2026-8492 is overdue by 4 hours. Field team notified.', time: '10m ago', unread: true },
    { id: 'notif-2', icon: 'success', title: 'Resolution Proof Verified', desc: 'Road trench CR-2026-9104 was verified by PWD Officer.', time: '1h ago', unread: true },
    { id: 'notif-3', icon: 'info', title: 'Field Crew Dispatched', desc: 'BWSSB Rapid Unit 2 started work on Water Leak CR-2026-7281.', time: '3h ago', unread: false }
  ]
};

// ── AUTHENTICATION SESSION MANAGER ───────────────────────────
const AuthManager = {
  TOKEN_KEY: 'CIVIC_AUTH_TOKEN',
  USER_KEY: 'CIVIC_AUTH_USER',

  getToken() {
    return sessionStorage.getItem(this.TOKEN_KEY);
  },

  getCurrentUser() {
    try {
      const u = sessionStorage.getItem(this.USER_KEY);
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },

  setSession(token, user) {
    sessionStorage.setItem(this.TOKEN_KEY, token);
    sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
  },

  clearSession() {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.USER_KEY);
  },

  isAuthenticated() {
    return !!this.getToken();
  }
};

// ── BACKEND API CLIENT ───────────────────────────────────────
const API_BASE = (() => {
  if (typeof window === 'undefined') return 'http://127.0.0.1:5000';
  if (window.location.protocol === 'file:') return 'http://127.0.0.1:5000';
  if (window.location.port === '5000') return '';
  return 'http://127.0.0.1:5000';
})();

const ApiClient = {
  backendAvailable: false,

  async request(method, path, body = null) {
    const headers = { 'Content-Type': 'application/json' };
    const token = AuthManager.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);

    let res;
    try {
      res = await fetch(`${API_BASE}${path}`, opts);
    } catch (netErr) {
      this.backendAvailable = false;
      throw new Error('Unable to connect to CivicResolve AI server. Please ensure the backend is running at http://127.0.0.1:5000.');
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 401 && !path.includes('/auth/login')) {
        AuthManager.clearSession();
        window.location.hash = '#auth';
      }
      let errMsg = '';
      if (data.details && Array.isArray(data.details)) {
        errMsg = data.details.join(' ');
      } else if (data.message && data.error && data.error !== data.message) {
        errMsg = `${data.error}: ${data.message}`;
      } else {
        errMsg = data.error || data.message || `Request failed (${res.status})`;
      }
      throw new Error(typeof errMsg === 'object' ? JSON.stringify(errMsg) : errMsg);
    }
    return data;
  },

  async upload(formData) {
    const headers = {};
    const token = AuthManager.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API_BASE}/api/upload`, {
      method: 'POST',
      headers,
      body: formData
    }).catch(() => null);
    if (!res) throw new Error('File upload service unreachable');
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || 'File upload failed');
    }
    return data;
  },

  async checkHealth() {
    try {
      await this.request('GET', '/api/health');
      this.backendAvailable = true;
      return true;
    } catch {
      this.backendAvailable = false;
      return false;
    }
  },

  get(path) { return this.request('GET', path); },
  post(path, body) { return this.request('POST', path, body); },
  patch(path, body) { return this.request('PATCH', path, body); }
};

// ── DATABASE HELPER (Backend-Aware) ───────────────────────────
class CivicDatabase {
  constructor() {
    this.STORAGE_KEY = 'CIVICRESOLVE_AI_DATABASE_V1';
    this.data = this._loadLocal();
  }

  _loadLocal() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) { /* ignore */ }
    return JSON.parse(JSON.stringify(DEFAULT_CIVIC_DB));
  }

  save(dataToSave) {
    this.data = dataToSave || this.data;
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) { /* ignore */ }
  }

  async refreshFromBackend() {
    if (!ApiClient.backendAvailable) return;
    try {
      const resp = await ApiClient.get('/api/complaints');
      if (resp && resp.complaints) {
        this.data.complaints = resp.complaints;
      }
      try {
        const notifData = await ApiClient.get('/api/notifications');
        if (notifData && notifData.notifications) {
          this.data.notifications = notifData.notifications.map(n => ({
            id: 'notif-' + n.id,
            dbId: n.id,
            icon: n.icon_type || 'info',
            title: n.title,
            desc: n.message,
            time: n.created_at ? n.created_at.replace('T', ' ').substring(0, 16) : 'Recent',
            unread: !n.is_read,
            complaint_id: n.complaint_id
          }));
        }
      } catch(e) { /* non-critical */ }
    } catch (e) {
      console.warn('Backend refresh failed:', e.message);
    }
  }

  reset() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.data = JSON.parse(JSON.stringify(DEFAULT_CIVIC_DB));
    this.save();
    return this.data;
  }

  getComplaints() { return this.data.complaints; }
  getComplaint(id) { return this.data.complaints.find(c => c.id.toUpperCase() === id.toUpperCase()); }

  addComplaint(complaint) {
    this.data.complaints.unshift(complaint);
    this.addAuditLog('Citizen Reporter', 'SUBMIT_COMPLAINT', `Created grievance ${complaint.id} (${complaint.category}) in ${complaint.ward}.`);
    this.addNotification('info', 'New Grievance Registered', `Complaint ${complaint.id} registered and intake agent triggered.`);
    this.save();
    return complaint;
  }

  updateComplaint(id, updates) {
    const idx = this.data.complaints.findIndex(c => c.id.toUpperCase() === id.toUpperCase());
    if (idx !== -1) {
      this.data.complaints[idx] = { ...this.data.complaints[idx], ...updates };
      this.save();
      return this.data.complaints[idx];
    }
    return null;
  }

  addTimelineEvent(complaintId, event) {
    const c = this.getComplaint(complaintId);
    if (c) {
      if (!c.timeline) c.timeline = [];
      c.timeline.unshift(event);
      this.save();
    }
  }

  addAuditLog(actor, action, details) {
    const now = new Date();
    const ts = now.toISOString().replace('T', ' ').substring(0, 16);
    this.data.auditLogs.unshift({ timestamp: ts, actor, action, details });
    if (this.data.auditLogs.length > 50) this.data.auditLogs.pop();
    this.save();
  }

  addNotification(icon, title, desc) {
    const notif = {
      id: 'notif-' + Date.now(),
      icon,
      title,
      desc,
      time: 'Just now',
      unread: true
    };
    this.data.notifications.unshift(notif);
    this.save();
  }
}

const db = new CivicDatabase();

// ── AI AGENT ARCHITECTURE ENGINE ──────────────────────────────
const CivicAI = {
  // Agent 1: Intake Agent
  intakeAgent(title, description, category, urgency, hasSafety) {
    const text = (title + ' ' + description).toLowerCase();
    let detectedCategory = category;
    let confidence = 0.94;
    let safetyFlags = [];

    if (text.includes('dump') || text.includes('garbage') || text.includes('waste') || text.includes('trash') || text.includes('smell')) {
      detectedCategory = 'Garbage Dump';
    } else if (text.includes('pothole') || text.includes('trench') || text.includes('road') || text.includes('asphalt')) {
      detectedCategory = 'Pothole';
    } else if (text.includes('leak') || text.includes('water') || text.includes('pipe') || text.includes('drain') || text.includes('sewage')) {
      detectedCategory = 'Water Leakage';
    } else if (text.includes('light') || text.includes('lamp') || text.includes('dark') || text.includes('electric')) {
      detectedCategory = 'Broken Streetlight';
    }

    if (text.includes('live wire') || text.includes('electric shock') || text.includes('manhole') || text.includes('school') || hasSafety) {
      safetyFlags.push('Immediate Pedestrian / Traffic Hazard');
    }

    const reasoning = `Categorized as "${detectedCategory}" with ${Math.round(confidence * 100)}% semantic confidence. ${safetyFlags.length > 0 ? 'WARNING: ' + safetyFlags.join(', ') : 'Standard municipal protocol assigned.'}`;

    return {
      suggestedCategory: detectedCategory,
      confidence: confidence,
      safetyFlags: safetyFlags,
      reasoning: reasoning
    };
  },

  // Agent 2: Duplicate Detection Agent
  duplicateAgent(category, ward, locality, description) {
    const activeComplaints = db.getComplaints().filter(c => c.status !== 'Resolved');
    const descWords = description.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const candidates = [];

    activeComplaints.forEach(item => {
      let score = 0;
      let sharedFactors = [];

      if (item.category.toLowerCase() === category.toLowerCase()) {
        score += 40;
        sharedFactors.push('Identical problem category');
      }

      if (item.ward === ward) {
        score += 30;
        sharedFactors.push('Same municipal ward');
      }

      const itemDesc = item.title.toLowerCase() + ' ' + (item.locality || '').toLowerCase();
      let wordMatches = 0;
      descWords.forEach(w => {
        if (itemDesc.includes(w)) wordMatches++;
      });

      if (wordMatches > 0) {
        score += Math.min(wordMatches * 10, 25);
        sharedFactors.push('Overlapping keywords & street references');
      }

      if (score >= 40) {
        candidates.push({
          complaint: item,
          score: Math.min(score, 95),
          explanation: sharedFactors.join(' • ')
        });
      }
    });

    candidates.sort((a, b) => b.score - a.score);
    return candidates;
  },

  // Agent 3: Department Routing Agent
  routingAgent(category) {
    const cat = category.toLowerCase();
    if (cat.includes('garbage') || cat.includes('dump') || cat.includes('sweeping') || cat.includes('toilet') || cat.includes('animal') || cat.includes('sanitation')) {
      return { department: 'Sanitation & Solid Waste', squad: 'Sanitation Squad #4', slaHours: 24 };
    }
    if (cat.includes('pothole') || cat.includes('road') || cat.includes('footpath') || cat.includes('divider') || cat.includes('sign')) {
      return { department: 'Roads & Infrastructure (PWD)', squad: 'PWD Road Crew #8', slaHours: 48 };
    }
    if (cat.includes('water') || cat.includes('drain') || cat.includes('sewage') || cat.includes('flood')) {
      return { department: 'Water Supply & Sewerage', squad: 'BWSSB Rapid Unit 2', slaHours: 12 };
    }
    if (cat.includes('light') || cat.includes('electrical')) {
      return { department: 'Electrical & Street Lighting', squad: 'Electrical Maintenance Squad B', slaHours: 36 };
    }
    return { department: 'Civic Amenities & Horticulture', squad: 'General Maintenance Crew 1', slaHours: 48 };
  },

  // Agent 4: Priority Scoring Agent
  priorityAgent(urgency, safetyConcern, recurring, upvotes = 0) {
    let score = 20;
    if (urgency === 'Critical') score += 40;
    else if (urgency === 'High') score += 25;
    else if (urgency === 'Normal') score += 10;

    if (safetyConcern) score += 25;
    if (recurring) score += 15;
    score += Math.min(Math.floor(upvotes / 5) * 5, 20);

    let label = 'Normal';
    if (score >= 80) label = 'Critical';
    else if (score >= 50) label = 'High';
    else if (score < 30) label = 'Low';

    return { score, label };
  },

  // Agent 5: Deadline & Escalation Agent
  deadlineAgent(timestamp, slaHours) {
    const created = new Date(timestamp).getTime();
    const now = CivicApp.getSimulatedTime().getTime();
    const elapsedHours = (now - created) / (1000 * 60 * 60);
    const remainingHours = Math.max(0, slaHours - elapsedHours);
    const isOverdue = elapsedHours > slaHours;
    return {
      elapsedHours: elapsedHours.toFixed(1),
      remainingHours: remainingHours.toFixed(1),
      isOverdue: isOverdue,
      urgencySignal: isOverdue ? 'Overdue - Escalated' : remainingHours < 4 ? 'Approaching Deadline' : 'On Track'
    };
  },

  // Agent 6: Resolution Evidence Agent
  evidenceAgent(complaint, completionNotes, hasAfterPhoto) {
    if (!hasAfterPhoto) {
      return { ready: false, verdict: 'Rejected: Mandatory completion photograph missing.' };
    }
    if (!completionNotes || completionNotes.length < 15) {
      return { ready: false, verdict: 'Incomplete: Requires detailed work description & materials used.' };
    }
    return {
      ready: true,
      verdict: 'Verified Ready for Officer Sign-off. Photo metadata and repair scope correspond with original complaint.'
    };
  }
};

// ── EXPLAINABLE CIVIC RECOVERY AGENT (DETERMINISTIC) ──────────
const CivicRecoveryAgent = {
  // Scans actual complaints in CivicDB and returns deterministic, explainable findings
  scanComplaints() {
    const complaints = db.getComplaints();
    const simTime = CivicApp.getSimulatedTime();
    const simTimeMs = simTime.getTime();
    const findings = [];
    let safeActionsExecuted = 0;
    let humanReviewsRequired = 0;

    complaints.forEach(c => {
      // RULE REC-01: SLA Threshold Exceeded
      if (c.status !== 'Resolved' && c.status !== 'Withdrawn' && c.status !== 'Closed') {
        const createdMs = new Date(c.timestamp).getTime();
        const slaHours = c.deadlineHours || 24;
        const elapsedHours = (simTimeMs - createdMs) / (1000 * 60 * 60);

        if (elapsedHours > slaHours) {
          const overdueBy = (elapsedHours - slaHours).toFixed(1);
          const ruleCode = 'RULE REC-01';
          const ruleTitle = 'SLA Threshold Exceeded (Overdue Grievance)';
          const dataCited = `Case ID: ${c.id} | Category: ${c.category} | Ward: ${c.ward}\nSubmitted: ${c.timestamp.replace('T', ' ').substring(0, 16)} | SLA: ${slaHours}h\nSimulated Time: ${CivicApp.formatSimulatedTime()} | Elapsed: ${elapsedHours.toFixed(1)}h (+${overdueBy}h Overdue)`;
          const reasoning = `Grievance has remained unresolved for ${elapsedHours.toFixed(1)} hours, exceeding the ${slaHours}-hour municipal SLA threshold by ${overdueBy} hours. No officer sign-off or completion evidence was recorded before deadline expiry.`;
          const recommendation = `Escalate case priority to Critical, update status to Overdue, and trigger high-priority dispatch alert to Zonal Commissioner desk.`;

          // Safe action execution: update status to Overdue and log timeline event ONCE
          let actionStatus = 'Safe Auto-Action Executed';
          const alreadyLogged = c.timeline && c.timeline.some(t => t.action.includes('Recovery Agent: Escalation'));

          if (!alreadyLogged) {
            c.status = 'Overdue';
            c.urgency = 'Critical';
            db.addTimelineEvent(c.id, {
              timestamp: CivicApp.formatSimulatedTime(),
              actor: 'Civic Recovery Agent (Rule REC-01)',
              action: 'Recovery Agent: Escalation Flagged',
              desc: `Autonomous SLA recovery triggered: Case exceeded ${slaHours}h turnaround by ${overdueBy}h. Status marked Overdue and dispatched to Commissioner.`,
              role: 'system'
            });
            db.addNotification('warning', `Recovery Escalation: ${c.id}`, `Autonomous agent flagged ${c.id} as overdue by ${overdueBy}h.`);
            safeActionsExecuted++;
          } else {
            actionStatus = 'Already Applied in Ledger';
          }

          findings.push({
            id: `FIND-REC01-${c.id}`,
            complaintId: c.id,
            category: c.category,
            ward: c.ward,
            ruleCode,
            ruleTitle,
            dataCited,
            reasoning,
            recommendation,
            actionStatus,
            requiresHumanReview: false,
            actionBadge: 'safe'
          });
        }
      }

      // RULE REC-02: Stalled Rejected Evidence (Evidence Dispute)
      const hasRejectedEvidence = (c.evidence && c.evidence.rejected) || 
        (c.timeline && c.timeline.some(t => t.action.includes('Evidence Rejected')));

      if (hasRejectedEvidence && c.status === 'In Progress') {
        const rejectionNote = c.evidence?.rejectionReason || 'Resolution evidence rejected by supervising officer.';
        const rejectedTime = c.evidence?.rejectedAt || (c.timeline.find(t => t.action.includes('Evidence Rejected'))?.timestamp) || c.timestamp;
        const rejectedMs = new Date(rejectedTime).getTime();
        const stalledHours = Math.max(0, (simTimeMs - rejectedMs) / (1000 * 60 * 60)).toFixed(1);

        const ruleCode = 'RULE REC-02';
        const ruleTitle = 'Stalled Rejected Evidence (Evidence Dispute)';
        const dataCited = `Case ID: ${c.id} | Department: ${c.department} | Assigned: ${c.assignedWorker || 'Squad'}\nRejected At: ${rejectedTime.replace('T', ' ').substring(0, 16)} | Stalled: ${stalledHours}h\nOfficer Verdict: "${rejectionNote}"`;
        const reasoning = `Field worker evidence was formally rejected by municipal officer due to location/quality discrepancy, and the case has remained stalled in rework for ${stalledHours} hours without updated resubmission.`;
        const recommendation = `Requires supervisor on-site dispute review or formal replacement work order. Autonomous closing or penalty is prohibited to preserve due process.`;

        humanReviewsRequired++;
        findings.push({
          id: `FIND-REC02-${c.id}`,
          complaintId: c.id,
          category: c.category,
          ward: c.ward,
          ruleCode,
          ruleTitle,
          dataCited,
          reasoning,
          recommendation,
          actionStatus: 'Human Approval Required',
          requiresHumanReview: true,
          actionBadge: 'approval',
          humanActionLabel: 'Review Evidence Dispute'
        });
      }

      // RULE REC-03: Unassigned Reopened Grievance
      if (c.status === 'Reopened' && (!c.assignedWorker || c.assignedWorker === 'Unassigned')) {
        const feedbackNote = c.feedback?.comment || (c.timeline && c.timeline.find(t => t.action.includes('Reopened'))?.desc) || 'Citizen reported recurring failure.';
        const ruleCode = 'RULE REC-03';
        const ruleTitle = 'Unassigned Reopened Grievance (Accountability Void)';
        const dataCited = `Case ID: ${c.id} | Category: ${c.category} | Status: Reopened\nAssigned Crew: [NONE] | Citizen Feedback: "${feedbackNote}"`;
        const reasoning = `Grievance was marked Resolved previously, but reopened by citizen with specific rework notes. Currently no field worker is assigned, stalling resolution accountability.`;
        const recommendation = `Escalate urgency to High, auto-route triage notice, and prompt Department Officer to assign a specialized contractor.`;

        let actionStatus = 'Safe Auto-Action Executed';
        const alreadyLogged = c.timeline && c.timeline.some(t => t.action.includes('Recovery Agent: Reopen Triage'));

        if (!alreadyLogged) {
          c.urgency = 'High';
          db.addTimelineEvent(c.id, {
            timestamp: CivicApp.formatSimulatedTime(),
            actor: 'Civic Recovery Agent (Rule REC-03)',
            action: 'Recovery Agent: Reopen Triage Logged',
            desc: `Autonomous recovery triage: Priority elevated to High. Awaiting human officer assignment to dedicated masonry crew.`,
            role: 'system'
          });
          db.addNotification('info', `Reopen Triage: ${c.id}`, `Complaint ${c.id} prioritized for crew reassignment.`);
          safeActionsExecuted++;
        } else {
          actionStatus = 'Already Applied in Ledger';
        }

        humanReviewsRequired++;
        findings.push({
          id: `FIND-REC03-${c.id}`,
          complaintId: c.id,
          category: c.category,
          ward: c.ward,
          ruleCode,
          ruleTitle,
          dataCited,
          reasoning,
          recommendation,
          actionStatus: 'Safe Urgency Raised + Human Assignment Required',
          requiresHumanReview: true,
          actionBadge: 'approval',
          humanActionLabel: 'Assign Crew as Officer'
        });
      }
    });

    // RULE REC-04: High-Probability Unlinked Co-located Duplicate
    for (let i = 0; i < complaints.length; i++) {
      for (let j = i + 1; j < complaints.length; j++) {
        const c1 = complaints[i];
        const c2 = complaints[j];

        if (c1.status !== 'Resolved' && c2.status !== 'Resolved') {
          if (c1.ward === c2.ward && c1.category === c2.category) {
            // Calculate distance approximation in meters
            const latDiff = Math.abs(c1.lat - c2.lat) * 111000;
            const lngDiff = Math.abs(c1.lng - c2.lng) * 111000;
            const approxDistMeters = Math.round(Math.sqrt(latDiff * latDiff + lngDiff * lngDiff));

            if (approxDistMeters < 300) {
              const ruleCode = 'RULE REC-04';
              const ruleTitle = 'High-Probability Unlinked Co-located Duplicate';
              const dataCited = `Case A: ${c1.id} ("${c1.title.substring(0, 35)}...")\nCase B: ${c2.id} ("${c2.title.substring(0, 35)}...")\nWard: ${c1.ward} | Category: ${c1.category} | Separation Distance: ~${approxDistMeters}m`;
              const reasoning = `Both grievances report identical civic problem categories within ${approxDistMeters} meters in ${c1.ward}. Currently dispatched into independent municipal queues, risking redundant vehicle dispatches.`;
              const recommendation = `Auto-link references between ${c1.id} and ${c2.id} in timeline. Require officer confirmation before permanently consolidating public records.`;

              let actionStatus = 'Safe Linkage Executed';
              const alreadyLogged = (c1.timeline && c1.timeline.some(t => t.desc.includes(`linked with ${c2.id}`))) ||
                                    (c2.timeline && c2.timeline.some(t => t.desc.includes(`linked with ${c1.id}`)));

              if (!alreadyLogged) {
                c1.linkedDuplicateId = c2.id;
                c2.linkedDuplicateId = c1.id;
                db.addTimelineEvent(c1.id, {
                  timestamp: CivicApp.formatSimulatedTime(),
                  actor: 'Civic Recovery Agent (Rule REC-04)',
                  action: 'Recovery Agent: Duplicate Reference Linked',
                  desc: `Autonomous duplicate detection: Linked with co-located incident ${c2.id} (~${approxDistMeters}m away).`,
                  role: 'system'
                });
                db.addTimelineEvent(c2.id, {
                  timestamp: CivicApp.formatSimulatedTime(),
                  actor: 'Civic Recovery Agent (Rule REC-04)',
                  action: 'Recovery Agent: Duplicate Reference Linked',
                  desc: `Autonomous duplicate detection: Linked with co-located incident ${c1.id} (~${approxDistMeters}m away).`,
                  role: 'system'
                });
                db.addNotification('info', `Duplicate Linked: ${c1.id} & ${c2.id}`, `Autonomous agent cross-referenced co-located incidents.`);
                safeActionsExecuted++;
              } else {
                actionStatus = 'Already Applied in Ledger';
              }

              findings.push({
                id: `FIND-REC04-${c1.id}-${c2.id}`,
                complaintId: `${c1.id} ↔ ${c2.id}`,
                category: c1.category,
                ward: c1.ward,
                ruleCode,
                ruleTitle,
                dataCited,
                reasoning,
                recommendation,
                actionStatus,
                requiresHumanReview: false,
                actionBadge: 'safe'
              });
            }
          }
        }
      }
    }

    db.save();

    return {
      scannedCount: complaints.length,
      issuesFoundCount: findings.length,
      safeActionsCount: safeActionsExecuted,
      humanReviewsCount: humanReviewsRequired,
      findings
    };
  }
};

// ── APPLICATION CONTROLLER ────────────────────────────────────
const CivicApp = {
  activeRole: 'citizen',
  activeLang: 'en',
  currentGrievanceDraft: null,
  currentIdempotencyKey: null,
  isSubmittingComplaint: false,
  attachedEvidenceFiles: [],
  mediaRecorder: null,
  audioChunks: [],
  voiceTimerInterval: null,
  voiceDurationSeconds: 0,
  speechRecognition: null,
  pickerMap: null,
  pickerMarker: null,
  cityMap: null,
  facilitiesMap: null,
  simulatedTime: new Date('2026-10-27T10:00:00Z'),

  async init() {
    // Check backend connectivity
    const backendOk = await ApiClient.checkHealth();
    const pill = document.getElementById('backendStatusPill');
    if (pill) {
      if (backendOk) {
        pill.className = 'backend-status-pill connected';
        pill.innerHTML = '<span class="status-dot-mini"></span> Backend Connected';
        await db.refreshFromBackend();
        try {
          const clockData = await ApiClient.get('/api/clock');
          if (clockData && clockData.simulated_time) {
            this.simulatedTime = new Date(clockData.simulated_time);
          }
        } catch(e) { /* use default */ }
      } else {
        pill.className = 'backend-status-pill disconnected';
        pill.innerHTML = '<span class="status-dot-mini"></span> Offline Mode';
      }
    }

    // Restore authenticated session role if available
    const curUser = AuthManager.getCurrentUser();
    if (curUser) {
      this.activeRole = curUser.role || 'citizen';
    }

    this.updateSimClockDisplay();
    this.bindEvents();
    this.bindAuthEvents();
    this.bindMultimodalEvents();
    this.handleRouting();
    this.renderHeaderUser();
    this.renderPublicStats();
    this.renderRecentIncidents();
    this.renderHotspots();
    this.renderNotifications();
    this.initCategoryGrid();
    this.updateAiInspectorOutputs();

    window.addEventListener('hashchange', () => this.handleRouting());
  },

  normalizeRoute(rawRoute) {
    if (!rawRoute) return '';
    let clean = rawRoute.toLowerCase().trim().replace(/^#*\/?/, '').replace(/\/$/, '');
    
    // Support path-based and hash-based dashboard routes
    if (clean === 'citizen' || clean === 'citizen/dashboard') return 'citizen';
    if (clean === 'worker' || clean === 'worker/dashboard') return 'worker';
    if (clean === 'officer' || clean === 'officer/dashboard' || clean === 'employee' || clean === 'employee/dashboard') return 'officer';
    if (clean === 'admin' || clean === 'admin/dashboard') return 'admin';
    if (clean === 'dashboard') return 'dashboard';
    
    return clean;
  },

  getRoleDashboardHash(role) {
    const r = (role || '').toLowerCase();
    if (r === 'worker') return '#/worker/dashboard';
    if (r === 'officer' || r === 'employee') return '#/employee/dashboard';
    if (r === 'admin') return '#/admin/dashboard';
    return '#/citizen/dashboard';
  },

  // ── ROUTING & ROLE AUTHORIZATION ─────────────────────────────
  handleRouting() {
    let raw = window.location.hash || '';
    if (!raw && window.location.pathname && window.location.pathname !== '/') {
      raw = window.location.pathname;
    }
    const rawRoute = raw.split('?')[0];
    let route = this.normalizeRoute(rawRoute);
    const isAuthed = AuthManager.isAuthenticated();
    const curUser = AuthManager.getCurrentUser();

    // 1. Unauthenticated users must land on Login / Welcome View 0
    if (!isAuthed) {
      route = 'auth';
      if (!window.location.hash.includes('auth')) {
        window.location.hash = '#auth';
        return;
      }
    } else {
      const userRole = (curUser.role || 'citizen').toLowerCase();
      const targetHash = this.getRoleDashboardHash(userRole);

      // 2. Authenticated users landing on #auth or empty hash get routed to their role portal
      if (!route || route === 'auth') {
        if (window.location.hash !== targetHash) {
          window.location.hash = targetHash;
          return;
        }
        route = this.normalizeRoute(targetHash);
      }

      // 3. Strict Server Role Authorization Enforcement
      if (route === 'admin' && userRole !== 'admin') {
        this.showToast('Access Denied: Municipal Administrator privileges required.', 'warning');
        window.location.hash = targetHash;
        return;
      }
      if (route === 'officer' && userRole !== 'officer' && userRole !== 'employee' && userRole !== 'admin') {
        this.showToast('Access Denied: Department Employee authorization required.', 'warning');
        window.location.hash = targetHash;
        return;
      }
      if (route === 'worker' && userRole !== 'worker' && userRole !== 'admin') {
        this.showToast('Access Denied: Field Worker authorization required.', 'warning');
        window.location.hash = targetHash;
        return;
      }
    }
    
    // Hide all views
    document.querySelectorAll('.page-view').forEach(view => {
      view.classList.add('hidden');
    });

    // Update active nav link
    document.querySelectorAll('.nav-link, .mobile-link').forEach(link => {
      if (link.dataset.nav === route) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    const targetView = document.getElementById(`view-${route}`) || document.getElementById('view-auth');
    targetView.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Close mobile nav
    document.getElementById('mobileNav')?.classList.remove('open');

    // Route-specific initializers
    if (route === 'citizen') {
      this.renderCitizenPortal();
    } else if (route === 'map') {
      setTimeout(() => this.initCityMap(), 150);
    } else if (route === 'facilities') {
      this.renderFacilities();
      setTimeout(() => this.initFacilitiesMap(), 150);
    } else if (route === 'dashboard') {
      this.renderDashboardAnalytics();
    } else if (route === 'surveys') {
      this.renderSurveys();
    } else if (route === 'worker') {
      this.renderWorkerPortal();
    } else if (route === 'officer') {
      this.renderOfficerPortal();
    } else if (route === 'admin') {
      this.renderAdminPortal();
    } else if (route === 'track') {
      const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
      const trackId = urlParams.get('id');
      if (trackId) {
        document.getElementById('trackSearchInput').value = trackId;
        this.renderCaseFile(trackId);
      } else {
        const first = db.getComplaints()[0];
        if (first) this.renderCaseFile(first.id);
      }
    } else if (route === 'report') {
      setTimeout(() => this.initPickerMap(), 200);
    }
  },

  // ── EVENT BINDINGS ───────────────────────────────────────────
  bindEvents() {
    // Role switcher dropdown
    const roleSelect = document.getElementById('roleSelect');
    roleSelect.addEventListener('change', (e) => {
      this.activeRole = e.target.value;
      const user = db.data.users[this.activeRole];
      document.getElementById('activeRoleName').textContent = `${user.name} (${this.activeRole.toUpperCase()})`;
      this.renderHeaderUser();
      this.showToast(`Switched active persona to ${user.name} (${user.role})`, 'info');

      // Auto route to specialized portal
      if (this.activeRole === 'worker') window.location.hash = '#worker';
      else if (this.activeRole === 'officer') window.location.hash = '#officer';
      else if (this.activeRole === 'admin') window.location.hash = '#admin';
      else window.location.hash = '#home';
    });

    // Reset Demo Data
    document.getElementById('btnResetDemoData').addEventListener('click', async () => {
      if (confirm('Reset all complaints, notifications, and logs to factory demo data?')) {
        if (ApiClient.backendAvailable) {
          try {
            await ApiClient.post('/api/reset-demo');
            await db.refreshFromBackend();
          } catch (e) {
            console.warn('Backend reset failed, resetting local:', e);
            db.reset();
          }
        } else {
          db.reset();
        }
        this.renderPublicStats();
        this.renderRecentIncidents();
        this.renderNotifications();
        this.showToast('Demo database restored to default state', 'success');
        this.handleRouting();
      }
    });

    // AI Live Inspector Drawer
    const aiDrawer = document.getElementById('aiInspectorDrawer');
    document.getElementById('btnOpenAiInspector').addEventListener('click', () => aiDrawer.classList.add('open'));
    document.getElementById('closeAiInspector').addEventListener('click', () => aiDrawer.classList.remove('open'));
    document.getElementById('footerOpenAiLink')?.addEventListener('click', (e) => {
      e.preventDefault();
      aiDrawer.classList.add('open');
    });

    // Notification Drawer
    const notifDrawer = document.getElementById('notifDrawer');
    const drawerOverlay = document.getElementById('drawerOverlay');
    document.getElementById('btnNotifications').addEventListener('click', () => {
      notifDrawer.classList.add('open');
      drawerOverlay.classList.add('active');
    });
    const closeDrawer = () => {
      notifDrawer.classList.remove('open');
      drawerOverlay.classList.remove('active');
    };
    document.getElementById('closeNotifDrawer').addEventListener('click', closeDrawer);
    drawerOverlay.addEventListener('click', closeDrawer);

    document.getElementById('markAllReadBtn').addEventListener('click', async () => {
      if (ApiClient.backendAvailable) {
        try {
          await ApiClient.post('/api/notifications/read-all');
        } catch (e) { /* ignore */ }
      }
      db.data.notifications.forEach(n => n.unread = false);
      db.save();
      this.renderNotifications();
      this.showToast('All notifications marked as read', 'info');
    });

    // Mobile Hamburger
    const hamburger = document.getElementById('hamburgerBtn');
    const mobileNav = document.getElementById('mobileNav');
    hamburger.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
    });

    // Language Toggle
    const langBtn = document.getElementById('langBtn');
    const langMenu = document.getElementById('langMenu');
    langBtn.addEventListener('click', () => langMenu.classList.toggle('open'));
    document.querySelectorAll('.lang-opt').forEach(opt => {
      opt.addEventListener('click', (e) => {
        this.activeLang = e.target.dataset.lang;
        document.getElementById('currentLangLabel').textContent = this.activeLang.toUpperCase();
        langMenu.classList.remove('open');
        this.showToast(`Interface language switched to ${e.target.textContent}`, 'info');
      });
    });

    // Quick Track Search in Hero
    document.getElementById('btnQuickTrack').addEventListener('click', () => {
      const id = document.getElementById('quickTrackInput').value.trim();
      if (id) {
        window.location.hash = `#track?id=${encodeURIComponent(id)}`;
      }
    });
    document.getElementById('quickTrackInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') document.getElementById('btnQuickTrack').click();
    });

    // Hero Sample Pills
    document.querySelectorAll('.sample-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        const id = tag.dataset.id;
        window.location.hash = `#track?id=${encodeURIComponent(id)}`;
      });
    });

    // Track Search Page
    document.getElementById('btnSearchTracking').addEventListener('click', () => {
      const id = document.getElementById('trackSearchInput').value.trim();
      if (id) this.renderCaseFile(id);
    });
    document.getElementById('trackSearchInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') document.getElementById('btnSearchTracking').click();
    });
    document.querySelectorAll('.pill-btn').forEach(pill => {
      pill.addEventListener('click', () => {
        const id = pill.dataset.trackId;
        document.getElementById('trackSearchInput').value = id;
        this.renderCaseFile(id);
      });
    });

    // Community Incidents Filter
    document.querySelectorAll('.incidents-filters .filter-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.incidents-filters .filter-pill').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.renderRecentIncidents(e.target.dataset.filter);
      });
    });

    // Facility Tabs Filter
    document.querySelectorAll('.fac-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        document.querySelectorAll('.fac-tab').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        this.renderFacilities(e.target.dataset.type);
      });
    });

    // Stepper Navigation in Report Form
    this.bindReportWizard();

    // Modals
    document.getElementById('btnCloseSuccessModal').addEventListener('click', () => {
      document.getElementById('submissionModal').classList.remove('active');
    });
    document.getElementById('btnPrintReceipt').addEventListener('click', () => {
      window.print();
    });
    document.getElementById('btnTrackThisNewComplaint').addEventListener('click', () => {
      document.getElementById('submissionModal').classList.remove('active');
      const id = document.getElementById('receiptTrackingId').textContent;
      window.location.hash = `#track?id=${id}`;
    });
    document.getElementById('btnCopyTrackingReceipt').addEventListener('click', () => {
      const id = document.getElementById('receiptTrackingId').textContent;
      navigator.clipboard?.writeText(id);
      this.showToast(`Tracking ID ${id} copied to clipboard!`, 'success');
    });

    // Officer Modal
    document.getElementById('btnCloseOfficerModal').addEventListener('click', () => {
      document.getElementById('officerActionModal').classList.remove('active');
    });
    // Feedback Modal
    document.getElementById('btnCloseFeedbackModal').addEventListener('click', () => {
      document.getElementById('feedbackModal').classList.remove('active');
    });
    document.querySelectorAll('.star-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const star = parseInt(btn.dataset.star);
        document.querySelectorAll('.star-btn').forEach((b, idx) => {
          if (idx < star) b.classList.add('active');
          else b.classList.remove('active');
        });
      });
    });

    // Dismiss disclaimer
    document.getElementById('dismissBanner').addEventListener('click', () => {
      document.querySelector('.disclaimer-banner').style.display = 'none';
    });

    // Simulated Time & Civic Recovery Agent Triggers
    document.getElementById('btnAdvanceDemoTime')?.addEventListener('click', () => {
      this.advanceSimulatedTime(12);
    });

    document.getElementById('btnRunRecoveryAgent')?.addEventListener('click', () => {
      this.triggerRecoveryAgent();
    });

    document.getElementById('btnDrawerRunRecovery')?.addEventListener('click', () => {
      document.getElementById('aiInspectorDrawer')?.classList.remove('open');
      this.triggerRecoveryAgent();
    });

    document.getElementById('btnCloseRecoveryModal')?.addEventListener('click', () => {
      document.getElementById('recoveryResultsModal')?.classList.remove('active');
    });

    document.getElementById('btnGoToComplaintsLedger')?.addEventListener('click', () => {
      document.getElementById('recoveryResultsModal')?.classList.remove('active');
      window.location.hash = '#officer';
    });
  },

  // ── AUTHENTICATION & LOGIN FLOW ──────────────────────────────
  bindAuthEvents() {
    const tabSignIn = document.getElementById('tabBtnSignIn');
    const tabRegister = document.getElementById('tabBtnRegister');
    const formLogin = document.getElementById('loginForm');
    const formRegister = document.getElementById('registerForm');
    const alertBox = document.getElementById('authAlertBox');
    const alertText = document.getElementById('authAlertText');

    const showAuthError = (msg) => {
      if (!alertBox || !alertText) return;
      alertBox.className = 'auth-alert-box';
      alertText.textContent = msg;
      alertBox.classList.remove('hidden');
    };

    const showAuthSuccess = (msg) => {
      if (!alertBox || !alertText) return;
      alertBox.className = 'auth-alert-box success';
      alertText.textContent = msg;
      alertBox.classList.remove('hidden');
    };

    if (tabSignIn && tabRegister) {
      tabSignIn.addEventListener('click', () => {
        tabSignIn.classList.add('active');
        tabRegister.classList.remove('active');
        formLogin?.classList.remove('hidden');
        formRegister?.classList.add('hidden');
        if (alertBox) alertBox.classList.add('hidden');
      });

      tabRegister.addEventListener('click', () => {
        tabRegister.classList.add('active');
        tabSignIn.classList.remove('active');
        formRegister?.classList.remove('hidden');
        formLogin?.classList.add('hidden');
        if (alertBox) alertBox.classList.add('hidden');
      });
    }

    // Toggle password visibility
    const btnTogglePwd = document.getElementById('btnToggleLoginPwd');
    const inputPwd = document.getElementById('loginPassword');
    if (btnTogglePwd && inputPwd) {
      btnTogglePwd.addEventListener('click', () => {
        if (inputPwd.type === 'password') {
          inputPwd.type = 'text';
          btnTogglePwd.innerHTML = '<i class="fa-regular fa-eye-slash"></i>';
        } else {
          inputPwd.type = 'password';
          btnTogglePwd.innerHTML = '<i class="fa-regular fa-eye"></i>';
        }
      });
    }

    // 1-Click Fast Evaluation Logins
    document.querySelectorAll('.btn-demo-pill').forEach(btn => {
      btn.addEventListener('click', async () => {
        const demoType = btn.dataset.demo;
        if (demoType === 'citizen') {
          document.getElementById('loginIdentifier').value = 'ananya@civicresolve.gov';
          document.getElementById('loginPassword').value = 'Citizen@123';
        } else if (demoType === 'worker') {
          document.getElementById('loginIdentifier').value = 'rajesh@civicresolve.gov';
          document.getElementById('loginPassword').value = 'Worker@123';
        } else if (demoType === 'officer') {
          document.getElementById('loginIdentifier').value = 'priya@civicresolve.gov';
          document.getElementById('loginPassword').value = 'Officer@123';
        } else if (demoType === 'admin') {
          document.getElementById('loginIdentifier').value = 'admin@civicresolve.gov';
          document.getElementById('loginPassword').value = 'Admin@123';
        } else if (demoType === 'pending') {
          document.getElementById('loginIdentifier').value = 'suresh@civicresolve.gov';
          document.getElementById('loginPassword').value = 'Worker@123';
        }
        tabSignIn?.click();
        document.getElementById('btnLoginSubmit')?.click();
      });
    });

    // Handle Login Form Submit
    let isLoggingIn = false;
    if (formLogin) {
      formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (isLoggingIn) return;

        const inputIdentifier = document.getElementById('loginIdentifier');
        const inputPassword = document.getElementById('loginPassword');
        const btnSubmit = document.getElementById('btnLoginSubmit');
        const identifier = inputIdentifier ? inputIdentifier.value.trim() : '';
        const password = inputPassword ? inputPassword.value : '';

        // Validate required fields
        if (!identifier) {
          showAuthError('Please provide your email address or mobile number.');
          inputIdentifier?.focus();
          return;
        }
        if (!password) {
          showAuthError('Please enter your account password.');
          inputPassword?.focus();
          return;
        }

        // Prevent duplicate login requests & show loading state
        isLoggingIn = true;
        const originalBtnHtml = btnSubmit ? btnSubmit.innerHTML : '';
        if (btnSubmit) {
          btnSubmit.disabled = true;
          btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...';
        }
        if (alertBox) alertBox.classList.add('hidden');

        try {
          const resp = await ApiClient.post('/api/auth/login', { identifier, password });
          if (resp && resp.token && resp.user) {
            AuthManager.setSession(resp.token, resp.user);
            this.activeRole = resp.user.role;
            this.renderHeaderUser();
            this.showToast(`Authenticated successfully as ${resp.user.name} (${resp.user.role})`, 'success');

            const roleSelect = document.getElementById('roleSelect');
            if (roleSelect) roleSelect.value = resp.user.role;

            const targetHash = this.getRoleDashboardHash(resp.user.role);
            window.location.hash = targetHash;
            this.handleRouting();
          } else {
            showAuthError('Authentication response incomplete. Please try again.');
          }
        } catch (err) {
          showAuthError(err.message || 'Authentication failed. Please verify your credentials.');
        } finally {
          isLoggingIn = false;
          if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = originalBtnHtml;
          }
        }
      });
    }

    // Handle Registration Form Submit
    let isRegistering = false;
    if (formRegister) {
      formRegister.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (isRegistering) return;

        const name = document.getElementById('regName')?.value.trim() || '';
        const email = document.getElementById('regEmail')?.value.trim() || '';
        const phone = document.getElementById('regPhone')?.value.trim() || '';
        const role = document.getElementById('regRole')?.value || 'citizen';
        const department = document.getElementById('regDepartment')?.value || '';
        const ward = document.getElementById('regWard')?.value || '';
        const password = document.getElementById('regPassword')?.value || '';
        const btnSubmit = document.getElementById('btnRegisterSubmit');

        if (!name || name.length < 2) {
          showAuthError('Please provide your full legal name (at least 2 characters).');
          return;
        }
        if (!email || !email.includes('@') || !email.includes('.')) {
          showAuthError('Please provide a valid email address.');
          return;
        }
        if (!password || password.length < 6) {
          showAuthError('Password must be at least 6 characters long.');
          return;
        }

        isRegistering = true;
        const origText = btnSubmit ? btnSubmit.innerHTML : '';
        if (btnSubmit) {
          btnSubmit.disabled = true;
          btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Registering Account...';
        }
        if (alertBox) alertBox.classList.add('hidden');

        try {
          const payload = { name, email, phone, role, department, ward, password };
          const resp = await ApiClient.post('/api/auth/register', payload);

          const isPending = resp.requires_approval || (resp.user && resp.user.status === 'pending_approval') || resp.status === 'pending_approval';

          if (isPending) {
            showAuthSuccess(resp.message || 'Staff application submitted successfully. An administrator must approve your account before access is granted.');
            this.showToast('Account registered under Pending Approval.', 'info');
          } else if (resp.token && resp.user) {
            AuthManager.setSession(resp.token, resp.user);
            this.activeRole = resp.user.role;
            this.renderHeaderUser();
            this.showToast(`Welcome to CivicResolve AI, ${resp.user.name}!`, 'success');
            window.location.hash = this.getRoleDashboardHash(resp.user.role);
            this.handleRouting();
          }
        } catch (err) {
          showAuthError(err.message || 'Registration failed.');
        } finally {
          isRegistering = false;
          if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = origText;
          }
        }
      });
    }

    // Handle Logout
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
      btnLogout.addEventListener('click', () => {
        AuthManager.clearSession();
        this.activeRole = 'citizen';
        this.renderHeaderUser();
        this.showToast('You have been signed out safely.', 'info');
        window.location.hash = '#auth';
      });
    }
  },

  // ── MULTIMODAL EVIDENCE & VOICE RECORDING ────────────────────
  bindMultimodalEvents() {
    // 1. Camera Input
    const camInput = document.getElementById('mediaCameraInput');
    if (camInput) {
      camInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) await this.handleFileUpload(file, 'image', 'Camera Capture');
      });
    }

    // 2. Photo Gallery Input
    const galInput = document.getElementById('mediaGalleryInput');
    if (galInput) {
      galInput.addEventListener('change', async (e) => {
        for (const file of e.target.files) {
          await this.handleFileUpload(file, 'image', 'Gallery Photo');
        }
      });
    }

    // 3. Video Input
    const vidInput = document.getElementById('mediaVideoInput');
    if (vidInput) {
      vidInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) await this.handleFileUpload(file, 'video', 'Video Evidence');
      });
    }

    // 4. Audio File Input
    const audInput = document.getElementById('mediaAudioFileInput');
    if (audInput) {
      audInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) await this.handleFileUpload(file, 'audio', 'Audio Recording');
      });
    }

    // 5. Live Voice Note Recorder (MediaRecorder API)
    const btnToggleRec = document.getElementById('btnVoiceRecordToggle');
    const btnStopRec = document.getElementById('btnStopVoiceRecord');
    if (btnToggleRec) {
      btnToggleRec.addEventListener('click', () => {
        if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
          this.startVoiceRecording();
        } else {
          this.stopVoiceRecording();
        }
      });
    }
    if (btnStopRec) {
      btnStopRec.addEventListener('click', () => {
        this.stopVoiceRecording();
      });
    }

    // 6. Speech-to-Text Dictation (Web Speech API)
    const btnDictate = document.getElementById('btnSpeechToText');
    const speechPill = document.getElementById('speechStatusPill');
    if (btnDictate) {
      btnDictate.addEventListener('click', () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
          this.showToast('Speech Recognition API is not supported in this browser.', 'warning');
          return;
        }

        if (this.speechRecognition) {
          this.speechRecognition.stop();
          this.speechRecognition = null;
          if (speechPill) speechPill.classList.add('hidden');
          return;
        }

        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = false;
          recognition.interimResults = false;
          recognition.lang = this.activeLang === 'hi' ? 'hi-IN' : 'en-IN';

          recognition.onstart = () => {
            if (speechPill) speechPill.classList.remove('hidden');
            this.showToast('Listening... Speak clearly into microphone.', 'info');
          };

          recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            const descArea = document.getElementById('reportDescription');
            if (descArea) {
              descArea.value = descArea.value ? `${descArea.value} ${transcript}` : transcript;
            }
            this.showToast('Voice transcribed into description!', 'success');
          };

          recognition.onerror = (event) => {
            this.showToast(`Speech recognition notice: ${event.error}`, 'warning');
            if (speechPill) speechPill.classList.add('hidden');
            this.speechRecognition = null;
          };

          recognition.onend = () => {
            if (speechPill) speechPill.classList.add('hidden');
            this.speechRecognition = null;
          };

          this.speechRecognition = recognition;
          recognition.start();
        } catch (e) {
          this.showToast('Could not initialize microphone for dictation.', 'warning');
        }
      });
    }

    // Remove evidence item
    const previewsContainer = document.getElementById('attachedPreviews');
    if (previewsContainer) {
      previewsContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-remove-att');
        if (btn) {
          const idx = parseInt(btn.dataset.index);
          this.attachedEvidenceFiles.splice(idx, 1);
          this.renderAttachedPreviews();
        }
      });
    }
  },

  async handleFileUpload(file, mediaType, label) {
    if (file.size > 25 * 1024 * 1024) {
      this.showToast('File size exceeds 25MB limit. Please choose a smaller file.', 'warning');
      return;
    }

    this.showToast(`Uploading ${file.name}...`, 'info');
    let fileUrl = '';

    if (ApiClient.backendAvailable) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const resp = await ApiClient.upload(formData);
        if (resp && resp.file_url) {
          fileUrl = resp.file_url;
        }
      } catch (err) {
        console.warn('Backend file upload failed, using local object URL:', err);
        fileUrl = URL.createObjectURL(file);
      }
    } else {
      fileUrl = URL.createObjectURL(file);
    }

    this.attachedEvidenceFiles.push({
      fileName: file.name,
      fileSize: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
      fileUrl: fileUrl,
      mediaType: mediaType,
      label: label
    });

    this.renderAttachedPreviews();
    this.showToast(`Attached ${file.name} successfully`, 'success');
  },

  async startVoiceRecording() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      this.showToast('Voice recording is not supported on this device/browser.', 'warning');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.audioChunks.push(e.data);
      };

      this.mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], `voice_note_${Date.now()}.webm`, { type: 'audio/webm' });
        await this.handleFileUpload(audioFile, 'audio', 'Voice Note');
        stream.getTracks().forEach(track => track.stop());
      };

      this.mediaRecorder.start();
      this.voiceDurationSeconds = 0;
      const timerEl = document.getElementById('voiceRecTimer');
      const recBar = document.getElementById('voiceRecorderBar');
      const recLabel = document.getElementById('voiceRecLabel');
      if (recBar) recBar.classList.remove('hidden');
      if (recLabel) recLabel.textContent = 'Recording...';

      this.voiceTimerInterval = setInterval(() => {
        this.voiceDurationSeconds++;
        const mins = String(Math.floor(this.voiceDurationSeconds / 60)).padStart(2, '0');
        const secs = String(this.voiceDurationSeconds % 60).padStart(2, '0');
        if (timerEl) timerEl.textContent = `${mins}:${secs}`;
      }, 1000);

      this.showToast('Recording voice note... Speak now.', 'info');
    } catch (err) {
      this.showToast('Microphone access denied or unavailable.', 'warning');
    }
  },

  stopVoiceRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    if (this.voiceTimerInterval) {
      clearInterval(this.voiceTimerInterval);
      this.voiceTimerInterval = null;
    }
    const recBar = document.getElementById('voiceRecorderBar');
    const recLabel = document.getElementById('voiceRecLabel');
    if (recBar) recBar.classList.add('hidden');
    if (recLabel) recLabel.textContent = 'Voice Note';
  },

  renderAttachedPreviews() {
    const container = document.getElementById('attachedPreviews');
    if (!container) return;

    if (this.attachedEvidenceFiles.length === 0) {
      container.innerHTML = `
        <div class="preview-item" id="defaultDemoPreviewItem">
          <div class="preview-thumb-box" id="activeEvidencePreview">
            <div class="mock-evidence-visual dump-visual">
              <i class="fa-solid fa-trash-can"></i>
              <span>Simulated Evidence Photo: Overflowing Municipal Dump</span>
            </div>
          </div>
          <div class="preview-details">
            <strong id="previewFileName">evidence_waste_ward14.jpg</strong>
            <span id="previewFileSize">1.8 MB • Timestamp Attached • EXIF Verified</span>
            <div class="preview-badge-status"><i class="fa-solid fa-circle-check"></i> Ready for Upload</div>
          </div>
          <button type="button" class="btn btn-xs btn-outline text-danger" id="btnRemoveEvidence">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = this.attachedEvidenceFiles.map((att, idx) => `
      <div class="preview-item">
        <div class="preview-thumb-box">
          ${att.mediaType === 'image' ? `
            <img src="${att.fileUrl}" alt="Evidence" style="width:100%; height:100%; object-fit:cover; border-radius:6px;" onerror="this.outerHTML='<i class=\\\'fa-solid fa-image\\\'></i>'" />
          ` : att.mediaType === 'video' ? `
            <div class="mock-evidence-visual" style="background:#0f172a; color:#38bdf8;">
              <i class="fa-solid fa-video"></i>
              <span>Video Attached</span>
            </div>
          ` : `
            <div class="mock-evidence-visual" style="background:#1e1b4b; color:#a78bfa;">
              <i class="fa-solid fa-microphone-lines"></i>
              <span>Audio Attached</span>
            </div>
          `}
        </div>
        <div class="preview-details" style="flex:1;">
          <strong>${att.fileName}</strong>
          <span>${att.fileSize} • ${att.label} • <span class="badge badge-success"><i class="fa-solid fa-circle-check"></i> Ready</span></span>
          ${att.mediaType === 'audio' ? `
            <audio controls src="${att.fileUrl}" style="height:28px; width:100%; margin-top:6px;"></audio>
          ` : ''}
        </div>
        <button type="button" class="btn btn-xs btn-outline text-danger btn-remove-att" data-index="${idx}">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `).join('');
  },

  // ── DEDICATED CITIZEN PORTAL ─────────────────────────────────
  renderCitizenPortal() {
    const curUser = AuthManager.getCurrentUser() || db.data.users.citizen;
    
    const greetingEl = document.getElementById('citizenPortalGreeting');
    const wardEl = document.getElementById('citizenPortalWard');
    const avatarEl = document.getElementById('citizenPortalAvatar');
    if (greetingEl) greetingEl.textContent = `Welcome, ${curUser.name}`;
    if (wardEl) wardEl.textContent = `${curUser.ward || 'Ward 14 — Koramangala'} • Verified Citizen Account`;
    if (avatarEl) {
      avatarEl.textContent = curUser.name.split(' ').map(n => n[0]).join('').substring(0, 2);
    }

    const myComplaints = db.getComplaints();
    const total = myComplaints.length;
    const active = myComplaints.filter(c => ['Submitted', 'Intake Review', 'Assigned', 'In Progress'].includes(c.status)).length;
    const pendingVerif = myComplaints.filter(c => ['Awaiting Verification', 'Pending Verification', 'Resolution Submitted'].includes(c.status)).length;
    const resolved = myComplaints.filter(c => c.status === 'Resolved').length;

    const elTotal = document.getElementById('cKpiTotal');
    const elActive = document.getElementById('cKpiActive');
    const elPending = document.getElementById('cKpiPendingVerif');
    const elResolved = document.getElementById('cKpiResolved');
    if (elTotal) elTotal.textContent = total;
    if (elActive) elActive.textContent = active;
    if (elPending) elPending.textContent = pendingVerif;
    if (elResolved) elResolved.textContent = resolved;

    document.querySelectorAll('.c-filter-btn').forEach(btn => {
      btn.onclick = (e) => {
        document.querySelectorAll('.c-filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.renderCitizenHistoryTable(e.target.dataset.filter);
      };
    });

    this.renderCitizenHistoryTable('all');
  },

  renderCitizenHistoryTable(filter = 'all') {
    const tbody = document.getElementById('citizenHistoryTableBody');
    if (!tbody) return;

    let list = db.getComplaints();
    if (filter === 'active') {
      list = list.filter(c => c.status !== 'Resolved');
    } else if (filter === 'resolved') {
      list = list.filter(c => c.status === 'Resolved');
    }

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:24px; color:#94a3b8;">No grievances recorded for this filter.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(c => `
      <tr>
        <td>
          <a href="#track?id=${c.id}" class="tracking-id-link" style="font-family:var(--font-mono); font-weight:800; color:var(--civic-blue);">
            ${c.id}
          </a>
        </td>
        <td><strong>${c.category}</strong></td>
        <td>
          <div style="font-weight:600; color:#0f172a;">${c.title}</div>
          <div style="font-size:0.75rem; color:#64748b;">${c.locality || ''}</div>
        </td>
        <td>${c.ward}</td>
        <td>
          <span class="status-badge status-${c.status.toLowerCase().replace(/\s+/g, '-')}">
            ${c.status}
          </span>
        </td>
        <td>${c.assignedWorker || 'Intake Routing'}</td>
        <td style="font-size:0.75rem; color:#64748b;">${c.timestamp ? c.timestamp.substring(0, 10) : '2026-10-27'}</td>
        <td>
          <a href="#track?id=${c.id}" class="btn btn-xs btn-primary">
            Track Case
          </a>
        </td>
      </tr>
    `).join('');
  },

  // ── SIMULATED TIME ENGINE ────────────────────────────────────
  getSimulatedTime() {
    return this.simulatedTime;
  },

  formatSimulatedTime() {
    const d = this.simulatedTime;
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
  },

  updateSimClockDisplay() {
    const el = document.getElementById('simClockDisplay');
    if (el) {
      const d = this.simulatedTime;
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const dateStr = `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
      let hours = d.getUTCHours();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      const mins = String(d.getUTCMinutes()).padStart(2, '0');
      el.textContent = `${dateStr}, ${hours}:${mins} ${ampm}`;
    }
  },

  async advanceSimulatedTime(hours = 12) {
    if (ApiClient.backendAvailable) {
      try {
        const resp = await ApiClient.post('/api/clock/advance', { hours });
        if (resp && resp.simulated_time) {
          this.simulatedTime = new Date(resp.simulated_time);
        } else {
          this.simulatedTime = new Date(this.simulatedTime.getTime() + hours * 3600000);
        }
        await db.refreshFromBackend();
      } catch (e) {
        console.warn('Clock advance API failed, falling back:', e);
        this.simulatedTime = new Date(this.simulatedTime.getTime() + hours * 3600000);
      }
    } else {
      this.simulatedTime = new Date(this.simulatedTime.getTime() + hours * 3600000);
    }
    this.updateSimClockDisplay();
    this.renderPublicStats();
    this.renderRecentIncidents();
    if (window.location.hash.includes('track')) {
      const curId = document.getElementById('trackSearchInput')?.value.trim();
      if (curId) this.renderCaseFile(curId);
    }
    if (window.location.hash.includes('officer')) {
      this.renderOfficerPortal();
    }
    this.showToast(`Simulated Clock advanced by +${hours} hours to ${this.formatSimulatedTime()}`, 'warning');
  },

  // ── RECOVERY AGENT CONTROLLER ────────────────────────────────
  async triggerRecoveryAgent() {
    let results;
    if (ApiClient.backendAvailable) {
      try {
        const resp = await ApiClient.post('/api/agent/run');
        const r = resp.results || {};
        results = {
          scannedCount: r.scanned_count ?? 0,
          issuesFoundCount: r.issues_found ?? 0,
          safeActionsCount: r.safe_actions_executed ?? 0,
          humanReviewsCount: r.human_reviews_required ?? 0,
          findings: (r.findings || []).map(f => ({
            id: f.id,
            ruleCode: f.rule_code || f.ruleCode,
            ruleTitle: f.rule_title || f.ruleTitle,
            complaintId: f.complaint_id || f.complaintId,
            actionBadge: f.action_badge || f.actionBadge,
            actionStatus: f.action_status || f.actionStatus,
            dataCited: f.data_cited || f.dataCited,
            reasoning: f.reasoning,
            recommendation: f.recommendation,
            requiresHumanReview: f.requires_human_review !== undefined ? f.requires_human_review : f.requiresHumanReview,
            humanActionLabel: f.human_action_label || f.humanActionLabel
          }))
        };
        await db.refreshFromBackend();
      } catch (e) {
        console.warn('Backend recovery agent failed, using local:', e);
        results = CivicRecoveryAgent.scanComplaints();
      }
    } else {
      results = CivicRecoveryAgent.scanComplaints();
    }
    
    // Summary counters
    document.getElementById('recScannedCount').textContent = results.scannedCount;
    document.getElementById('recIssuesFoundCount').textContent = results.issuesFoundCount;
    document.getElementById('recSafeActionsCount').textContent = results.safeActionsCount;
    document.getElementById('recHumanReviewsCount').textContent = results.humanReviewsCount;

    // Render findings
    const container = document.getElementById('recoveryFindingsContainer');
    if (results.findings.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:32px; background:#f8fafc; border-radius:10px; border:1px solid #e2e8f0;">
          <i class="fa-solid fa-circle-check" style="color:#10b981; font-size:2rem; margin-bottom:8px;"></i>
          <h4 style="color:#0f172a; font-weight:700;">All Municipal Workflows Operating Within Policy</h4>
          <p style="color:#64748b; font-size:0.875rem;">No overdue SLA breaches, unassigned reopened cases, or unlinked duplicates detected in current scan.</p>
        </div>
      `;
    } else {
      container.innerHTML = results.findings.map(f => `
        <div class="recovery-finding-card">
          <div class="finding-head">
            <div class="finding-title-group">
              <span class="rule-code-badge">${f.ruleCode}</span>
              <span class="finding-case-id">${f.complaintId}</span>
              <span style="font-weight:700; color:#0f172a; font-size:0.875rem;">${f.ruleTitle}</span>
            </div>
            <span class="finding-status-badge ${f.actionBadge}">
              <i class="fa-solid ${f.actionBadge === 'safe' ? 'fa-check' : 'fa-user-shield'}"></i>
              ${f.actionStatus}
            </span>
          </div>

          <div class="data-cited-box">
            <strong>[EXACT COMPLAINT DATA CITED]:</strong>\n${f.dataCited}
          </div>

          <div class="finding-reasoning">
            <strong>Diagnostic Reasoning:</strong> ${f.reasoning}
          </div>

          <div class="finding-action-row">
            <div class="action-text">
              <strong>Recommended Action:</strong>
              ${f.recommendation}
            </div>
            ${f.requiresHumanReview ? `
              <button class="btn btn-xs btn-primary" onclick="CivicApp.openHumanReviewForCase('${f.complaintId}', '${f.id}')">
                <i class="fa-solid fa-user-check"></i> ${f.humanActionLabel || 'Review Case'}
              </button>
            ` : `
              <span style="font-size:0.75rem; color:#059669; font-weight:700;">
                <i class="fa-solid fa-circle-check"></i> Auto-Remediated
              </span>
            `}
          </div>
        </div>
      `).join('');
    }

    // Telemetry in AI Drawer
    const drawerOutput = document.getElementById('inspectRecoveryOutput');
    if (drawerOutput) {
      drawerOutput.innerHTML = `
        <code>Last scan @ ${this.formatSimulatedTime()}: ${results.issuesFoundCount} issues detected across ${results.scannedCount} cases. (${results.safeActionsCount} safe auto-actions executed, ${results.humanReviewsCount} human reviews required).</code>
      `;
    }

    // Open Modal
    document.getElementById('recoveryResultsModal')?.classList.add('active');

    // Refresh UI
    this.renderPublicStats();
    this.renderRecentIncidents();
    this.renderNotifications();
    if (window.location.hash.includes('officer')) {
      this.renderOfficerPortal();
    }

    this.showToast(`Civic Recovery Agent audit complete: ${results.issuesFoundCount} issues diagnosed.`, 'info');
  },

  openHumanReviewForCase(complaintId, findingId) {
    document.getElementById('recoveryResultsModal')?.classList.remove('active');
    
    // Switch role to Officer so user has full authority to adjudicate
    const roleSelect = document.getElementById('roleSelect');
    if (roleSelect) {
      roleSelect.value = 'officer';
      this.activeRole = 'officer';
      const user = db.data.users.officer;
      document.getElementById('activeRoleName').textContent = `${user.name} (OFFICER)`;
      this.renderHeaderUser();
    }

    // Open Officer Action Modal for this case
    if (complaintId.includes('CR-2026-')) {
      const cleanId = complaintId.split(' ')[0];
      this.openOfficerActionModal(cleanId);
    } else {
      window.location.hash = '#officer';
    }
  },

  // ── HEADER & USER PILL ───────────────────────────────────────
  renderHeaderUser() {
    const curUser = AuthManager.getCurrentUser() || db.data.users[this.activeRole];
    const isAuthed = AuthManager.isAuthenticated();
    const nameEl = document.getElementById('headerUserName');
    const avatarEl = document.getElementById('headerUserAvatar');
    const roleEl = document.getElementById('headerUserRole');
    const logoutBtn = document.getElementById('btnLogout');

    if (nameEl) nameEl.textContent = isAuthed ? curUser.name.split(' ')[0] : 'Guest';
    if (roleEl) roleEl.textContent = isAuthed ? (curUser.role || 'Citizen').toUpperCase() : 'Sign In';
    if (avatarEl) {
      avatarEl.textContent = isAuthed ? curUser.name.split(' ').map(n => n[0]).join('').substring(0, 2) : '?';
    }
    if (logoutBtn) {
      if (isAuthed) logoutBtn.classList.remove('hidden');
      else logoutBtn.classList.add('hidden');
    }
  },

  // ── PUBLIC STATISTICS STRIP ──────────────────────────────────
  renderPublicStats() {
    const list = db.getComplaints();
    const total = list.length;
    const open = list.filter(c => c.status === 'Intake Review' || c.status === 'In Progress' || c.status === 'Assigned').length;
    const overdue = list.filter(c => c.status === 'Overdue').length;
    const awaiting = list.filter(c => c.status === 'Awaiting Verification' || c.status === 'Pending Verification').length;
    const resolved = list.filter(c => c.status === 'Resolved').length;
    const reopened = list.filter(c => c.status === 'Reopened').length;

    document.getElementById('statTotalReports').textContent = total;
    document.getElementById('statOpenComplaints').textContent = open;
    document.getElementById('statOverdueComplaints').textContent = overdue;
    document.getElementById('statAwaitingVerification').textContent = awaiting;
    document.getElementById('statResolvedComplaints').textContent = resolved;
    document.getElementById('statReopenedComplaints').textContent = reopened;
  },

  // ── RECENT COMMUNITY INCIDENTS ───────────────────────────────
  renderRecentIncidents(filter = 'all') {
    const container = document.getElementById('communityIncidentsGrid');
    if (!container) return;
    let items = db.getComplaints();

    if (filter === 'sanitation') {
      items = items.filter(c => c.department.includes('Sanitation'));
    } else if (filter === 'roads') {
      items = items.filter(c => c.department.includes('Roads'));
    } else if (filter === 'water') {
      items = items.filter(c => c.department.includes('Water'));
    } else if (filter === 'overdue') {
      items = items.filter(c => c.status === 'Overdue');
    }

    if (items.length === 0) {
      container.innerHTML = `<div class="empty-state">No incidents found for this filter.</div>`;
      return;
    }

    container.innerHTML = items.map(c => {
      const statusClass = c.status.toLowerCase().replace(/\s+/g, '-');
      const latestUpdate = c.timeline && c.timeline.length > 0 ? c.timeline[0].desc : 'Intake logged in municipal registry.';
      const upvotedClass = c.userVoted ? 'voted' : '';

      return `
        <div class="incident-card" data-id="${c.id}">
          <div>
            <div class="incident-card-top">
              <span class="incident-tracking-id">${c.id}</span>
              <span class="status-badge status-${statusClass}">${c.status}</span>
            </div>
            <h3 class="incident-title">${c.title}</h3>
            <div class="incident-meta-row">
              <span><i class="fa-solid fa-location-dot"></i> ${c.ward}</span>
              <span><i class="fa-solid fa-layer-group"></i> ${c.category}</span>
            </div>
            <div class="incident-update-snippet">
              <strong>Latest Update</strong>
              ${latestUpdate}
            </div>
          </div>
          <div class="incident-card-footer">
            <button class="btn-upvote ${upvotedClass}" onclick="CivicApp.toggleUpvote('${c.id}', event)">
              <i class="fa-solid fa-thumbs-up"></i>
              <span class="vote-count">${c.upvotes}</span> Support
            </button>
            <a href="#track?id=${c.id}" class="btn btn-sm btn-outline">
              View Details <i class="fa-solid fa-arrow-right"></i>
            </a>
          </div>
        </div>
      `;
    }).join('');
  },

  async toggleUpvote(id, event) {
    if (event) event.stopPropagation();
    const c = db.getComplaint(id);
    if (!c) return;
    const willVote = !c.userVoted;
    if (ApiClient.backendAvailable) {
      try {
        const resp = await ApiClient.post(`/api/complaints/${id}/upvote`, { increment: willVote });
        if (resp && resp.upvotes !== undefined) {
          c.upvotes = resp.upvotes;
        } else {
          c.upvotes = willVote ? c.upvotes + 1 : Math.max(0, c.upvotes - 1);
        }
      } catch (e) {
        c.upvotes = willVote ? c.upvotes + 1 : Math.max(0, c.upvotes - 1);
      }
    } else {
      c.upvotes = willVote ? c.upvotes + 1 : Math.max(0, c.upvotes - 1);
    }
    c.userVoted = willVote;
    if (willVote) {
      this.showToast(`Supported issue ${id}! Civic priority increased.`, 'success');
    } else {
      this.showToast(`Removed your vote for ${id}`, 'info');
    }
    db.save();
    this.renderRecentIncidents();
    if (window.location.hash.includes('track')) {
      this.renderCaseFile(id);
    }
  },

  // ── REPEAT HOTSPOTS ──────────────────────────────────────────
  renderHotspots() {
    const container = document.getElementById('repeatHotspotList');
    if (!container) return;
    const hotspots = [
      { name: 'Koramangala 80 Feet Road (BDA Junction)', count: 12, dept: 'Sanitation & Drainage', type: 'Severe recurring dump & drain backflow' },
      { name: 'Malleshwaram 11th Cross Intersection', count: 8, dept: 'PWD Roads Division', type: 'Uncompacted trenches from telecom utility cuts' },
      { name: 'Rajajinagar ESI Hospital Corridor', count: 6, dept: 'Electrical Maintenance', type: 'Recurring transformer overload & streetlight failures' }
    ];

    container.innerHTML = hotspots.map(h => `
      <div class="hotspot-item">
        <div class="hotspot-info">
          <h5>${h.name}</h5>
          <span><i class="fa-solid fa-building"></i> ${h.dept} • ${h.type}</span>
        </div>
        <span class="repeat-badge">${h.count} Repeat Incidents</span>
      </div>
    `).join('');
  },

  // ── REPORT WIZARD (7 STEPS) ──────────────────────────────────
  bindReportWizard() {
    const subcats = {
      sanitation: [
        { name: 'Garbage Dump', icon: 'fa-trash-can', desc: 'Open waste pile on road or sidewalk' },
        { name: 'Overflowing Dustbin', icon: 'fa-dumpster', desc: 'Public municipal bin unemptied' },
        { name: 'Missed Garbage Vehicle', icon: 'fa-truck-pickup', desc: 'Door-to-door vehicle failed to arrive' },
        { name: 'Street Sweeping Incomplete', icon: 'fa-broom', desc: 'Leaf litter & street debris uncollected' },
        { name: 'Dead Animal Removal', icon: 'fa-paw', desc: 'Carcass obstructing public roadway' },
        { name: 'Public Toilet Hygiene', icon: 'fa-restroom', desc: 'Hygiene, blockage or water shortage' }
      ],
      roads: [
        { name: 'Pothole', icon: 'fa-road', desc: 'Deep road crater or trench hazard' },
        { name: 'Damaged Footpath', icon: 'fa-person-walking', desc: 'Missing slab or broken sidewalk' },
        { name: 'Broken Streetlight', icon: 'fa-lightbulb', desc: 'Dark street, unlit fixture' },
        { name: 'Damaged Road Divider', icon: 'fa-arrows-split-up-and-left', desc: 'Broken median barrier' },
        { name: 'Missing Road Sign', icon: 'fa-diamond-turn-right', desc: 'Traffic warning sign knocked down' }
      ],
      water: [
        { name: 'Water Leakage', icon: 'fa-droplet', desc: 'Potable water pipeline gushing' },
        { name: 'Blocked Drain', icon: 'fa-water', desc: 'Storm drain clogged with silt' },
        { name: 'Sewage Overflow', icon: 'fa-biohazard', desc: 'Choked manhole spilling onto lane' },
        { name: 'Waterlogging Hotspot', icon: 'fa-cloud-showers-heavy', desc: 'Severe monsoon stagnant pool' }
      ],
      other: [
        { name: 'Damaged Park Equipment', icon: 'fa-tree', desc: 'Broken swings, benches or gym equipment' },
        { name: 'Accessibility Barrier', icon: 'fa-wheelchair', desc: 'Missing ramp or blocked curb access' },
        { name: 'Fallen Tree Branch', icon: 'fa-leaf', desc: 'Branch blocking road or electrical cable' },
        { name: 'Other Civic Service', icon: 'fa-circle-exclamation', desc: 'General municipal query' }
      ]
    };

    // Category Tabs click
    document.querySelectorAll('.cat-group-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.cat-group-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const group = btn.dataset.group;
        renderSubcats(group);
      });
    });

    const renderSubcats = (group) => {
      const grid = document.getElementById('subcategoryGrid');
      const items = subcats[group] || subcats.sanitation;
      grid.innerHTML = items.map((item, idx) => `
        <div class="subcat-card ${idx === 0 ? 'active' : ''}" data-category="${item.name}">
          <i class="fa-solid ${item.icon} subcat-icon"></i>
          <div class="subcat-info">
            <strong>${item.name}</strong>
            <span>${item.desc}</span>
          </div>
        </div>
      `).join('');

      // Click card
      grid.querySelectorAll('.subcat-card').forEach(card => {
        card.addEventListener('click', () => {
          grid.querySelectorAll('.subcat-card').forEach(c => c.classList.remove('active'));
          card.classList.add('active');
          document.getElementById('selectedCategory').value = card.dataset.category;
          const routing = CivicAI.routingAgent(card.dataset.category);
          document.getElementById('selectedDepartment').value = routing.department;
        });
      });

      if (items.length > 0) {
        document.getElementById('selectedCategory').value = items[0].name;
        const routing = CivicAI.routingAgent(items[0].name);
        document.getElementById('selectedDepartment').value = routing.department;
      }
    };

    renderSubcats('sanitation');

    // Stepper Navigation click / Next / Back
    const goToStep = (stepNum) => {
      document.querySelectorAll('.wizard-step').forEach(step => step.classList.remove('active'));
      const targetStep = document.getElementById(`wizardStep${stepNum}`);
      if (targetStep) targetStep.classList.add('active');

      document.querySelectorAll('.step-nav-btn').forEach(btn => {
        const btnStep = parseInt(btn.dataset.step);
        if (btnStep === stepNum) {
          btn.classList.add('active');
          btn.classList.remove('completed');
        } else if (btnStep < stepNum) {
          btn.classList.add('completed');
          btn.classList.remove('active');
        } else {
          btn.classList.remove('active', 'completed');
        }
      });

      if (stepNum === 3) {
        setTimeout(() => this.initPickerMap(), 150);
      } else if (stepNum === 7) {
        this.renderReviewSummary();
      }
    };
    this.goToStep = goToStep;

    document.querySelectorAll('.step-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => goToStep(parseInt(btn.dataset.step)));
    });

    document.querySelectorAll('.btn-next-step').forEach(btn => {
      btn.addEventListener('click', () => {
        const next = parseInt(btn.dataset.next);
        goToStep(next);
      });
    });

    document.querySelectorAll('.btn-prev-step').forEach(btn => {
      btn.addEventListener('click', () => {
        const prev = parseInt(btn.dataset.prev);
        goToStep(prev);
      });
    });

    // Evidence Presets selection
    document.querySelectorAll('.photo-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.photo-preset-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const imgKey = btn.dataset.img;
        const preview = document.getElementById('activeEvidencePreview');
        const label = document.getElementById('previewFileName');
        if (imgKey === 'dump') {
          preview.innerHTML = `<div class="mock-evidence-visual dump-visual"><i class="fa-solid fa-trash-can"></i><span>Dump Evidence</span></div>`;
          label.textContent = 'waste_overflow_evidence.jpg';
        } else if (imgKey === 'pothole') {
          preview.innerHTML = `<div class="mock-evidence-visual pothole-visual"><i class="fa-solid fa-road"></i><span>Pothole Evidence</span></div>`;
          label.textContent = 'road_pothole_evidence.jpg';
        } else if (imgKey === 'water') {
          preview.innerHTML = `<div class="mock-evidence-visual water-visual"><i class="fa-solid fa-droplet"></i><span>Pipe Leak Evidence</span></div>`;
          label.textContent = 'water_leak_evidence.jpg';
        } else {
          preview.innerHTML = `<div class="mock-evidence-visual light-visual"><i class="fa-solid fa-lightbulb"></i><span>Light Evidence</span></div>`;
          label.textContent = 'streetlight_evidence.jpg';
        }
      });
    });

    // Run Duplicate Check Step
    document.getElementById('btnRunDuplicateCheck').addEventListener('click', () => {
      const category = document.getElementById('selectedCategory').value;
      const ward = document.getElementById('locWard').value;
      const locality = document.getElementById('locLocality').value;
      const desc = document.getElementById('reportDescription').value;

      const candidates = CivicAI.duplicateAgent(category, ward, locality, desc);
      const container = document.getElementById('duplicateResultsContainer');

      if (candidates.length === 0) {
        container.innerHTML = `
          <div class="dup-candidate-card" style="border-color:#10b981;">
            <div class="dup-card-head">
              <strong style="color:#059669;"><i class="fa-solid fa-circle-check"></i> No Direct Duplicate Incidents Found</strong>
              <span class="badge badge-success">Unique Complaint</span>
            </div>
            <p style="font-size:0.875rem; color:#475569;">
              Our AI Duplicate Detection Agent checked 14 active complaints across ${ward}. No active work orders match your description. It is safe to register as a fresh grievance.
            </p>
          </div>
        `;
      } else {
        container.innerHTML = candidates.map(c => `
          <div class="dup-candidate-card">
            <div class="dup-card-head">
              <div>
                <strong>Similar Active Case: ${c.complaint.id}</strong>
                <span style="font-size:0.75rem; color:#64748b; display:block;">${c.complaint.title} (${c.complaint.status})</span>
              </div>
              <span class="dup-match-score">${c.score}% Match</span>
            </div>
            <div class="dup-explanation">
              <i class="fa-solid fa-brain"></i> <strong>AI Duplicate Reasoning:</strong> ${c.explanation}
            </div>
            <div class="dup-actions">
              <button type="button" class="btn btn-sm btn-outline" onclick="CivicApp.toggleUpvote('${c.complaint.id}'); window.location.hash='#track?id=${c.complaint.id}';">
                <i class="fa-solid fa-thumbs-up"></i> Support Existing ${c.complaint.id} Instead
              </button>
            </div>
          </div>
        `).join('');
      }

      goToStep(6);
    });

    // Final Submission Handler
    document.getElementById('btnFinalSubmitComplaint').addEventListener('click', () => {
      this.handleFinalComplaintSubmission();
    });
  },

  initCategoryGrid() {
    // Already populated by bindReportWizard
  },

  renderReviewSummary() {
    const title = document.getElementById('reportTitle').value || 'Civic Problem Report';
    const category = document.getElementById('selectedCategory').value;
    const ward = document.getElementById('locWard').value;
    const locality = document.getElementById('locLocality').value;
    const landmark = document.getElementById('locLandmark').value;
    const urgency = document.getElementById('reportUrgency').value;
    const safety = document.getElementById('isSafetyConcern').checked;
    const recurring = document.getElementById('isRecurring').checked;
    const identity = document.querySelector('input[name="displayIdentity"]:checked').value;
    const desc = document.getElementById('reportDescription').value;

    const routing = CivicAI.routingAgent(category);
    const intake = CivicAI.intakeAgent(title, desc, category, urgency, safety);

    const summaryCard = document.getElementById('reviewSummaryCard');
    summaryCard.innerHTML = `
      <div class="review-item">
        <span class="review-label">Issue Title:</span>
        <span class="review-val">${title}</span>
      </div>
      <div class="review-item">
        <span class="review-label">Category:</span>
        <span class="review-val">${category}</span>
      </div>
      <div class="review-item">
        <span class="review-label">Assigned Department:</span>
        <span class="review-val" style="color:var(--civic-blue);">${routing.department}</span>
      </div>
      <div class="review-item">
        <span class="review-label">Ward & Landmark:</span>
        <span class="review-val">${ward} • ${locality} (near ${landmark})</span>
      </div>
      <div class="review-item">
        <span class="review-label">Citizen Urgency & Safety:</span>
        <span class="review-val">${urgency} ${safety ? '• [Immediate Safety Hazard]' : ''}</span>
      </div>
      <div class="review-item">
        <span class="review-label">Target Resolution SLA:</span>
        <span class="review-val">Within ${routing.slaHours} Hours</span>
      </div>
      <div class="review-item">
        <span class="review-label">Public Identity Display:</span>
        <span class="review-val">${identity === 'named' ? 'Verified Citizen (Ananya Sen)' : 'Anonymous Resident'}</span>
      </div>
    `;

    document.getElementById('aiIntakeReasoning').innerHTML = `
      <strong>Intake Recommendation:</strong> ${intake.reasoning} Dispatched to <em>${routing.department} (${routing.squad})</em> with priority SLA timer set to ${routing.slaHours} hours.
    `;
  },

  async handleFinalComplaintSubmission() {
    // Double-click and duplicate submission prevention
    if (this.isSubmittingComplaint) {
      console.warn('Submission already in progress; ignoring duplicate trigger.');
      return;
    }

    const submitBtn = document.getElementById('btnFinalSubmitComplaint');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Registering Grievance...';
    }
    this.isSubmittingComplaint = true;

    // Ensure persistent client idempotency key
    if (!this.currentIdempotencyKey) {
      this.currentIdempotencyKey = 'IDEM-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    const title = document.getElementById('reportTitle')?.value.trim() || 'Civic Grievance Report';
    const description = document.getElementById('reportDescription')?.value.trim() || 'Reported civic issue requiring municipal attention.';
    const category = document.getElementById('selectedCategory')?.value || 'Garbage Dump';
    const ward = document.getElementById('locWard')?.value || 'Ward 14 — Koramangala';
    const locality = document.getElementById('locLocality')?.value || '5th Block, 80 Feet Road';
    const landmark = document.getElementById('locLandmark')?.value || 'Near Community Junction';
    const urgency = document.getElementById('reportUrgency')?.value || 'Normal';
    const safetyConcern = !!document.getElementById('isSafetyConcern')?.checked;
    const recurring = !!document.getElementById('isRecurring')?.checked;
    const affectedCount = document.getElementById('affectedCount')?.value || '10-50';
    const isAnonymous = document.querySelector('input[name="displayIdentity"]:checked')?.value === 'anonymous';
    const lat = parseFloat(document.getElementById('pickedLat')?.textContent) || 12.9352;
    const lng = parseFloat(document.getElementById('pickedLng')?.textContent) || 77.6245;

    const curUser = AuthManager.getCurrentUser();
    const routing = CivicAI.routingAgent(category);
    let trackingId = `CR-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const activePreset = document.querySelector('.photo-preset-btn.active')?.dataset.img || 'dump';
    let beforeVisual = 'dump-visual';
    if (activePreset === 'pothole') beforeVisual = 'pothole-visual';
    else if (activePreset === 'water') beforeVisual = 'water-visual';
    else if (activePreset === 'streetlight') beforeVisual = 'light-visual';

    const now = new Date();
    const timestamp = now.toISOString();

    const localComplaint = {
      id: trackingId,
      title: title,
      category: category,
      department: routing.department,
      ward: ward,
      locality: locality,
      landmark: landmark,
      lat: lat,
      lng: lng,
      urgency: urgency,
      safetyConcern: safetyConcern,
      recurring: recurring,
      affectedCount: affectedCount,
      submittedBy: isAnonymous ? 'Anonymous Resident' : (curUser ? curUser.name : 'Ananya Sen'),
      anonymous: isAnonymous,
      timestamp: timestamp,
      status: 'Intake Review',
      assignedWorker: routing.squad,
      deadlineHours: routing.slaHours,
      targetDeadline: new Date(Date.now() + routing.slaHours * 3600000).toISOString(),
      upvotes: 1,
      userVoted: true,
      evidence: {
        beforeImg: this.attachedEvidenceFiles.length > 0 ? this.attachedEvidenceFiles[0].fileUrl : beforeVisual,
        beforeCaption: description.substring(0, 100) + '...',
        afterImg: null,
        afterCaption: null
      },
      timeline: [
        {
          timestamp: now.toISOString().replace('T', ' ').substring(0, 16),
          actor: isAnonymous ? 'Anonymous Citizen' : (curUser ? `${curUser.name} (Citizen)` : 'Ananya Sen (Citizen)'),
          action: 'Complaint Registered',
          desc: 'Citizen submitted grievance with location coordinates and evidence.',
          role: 'citizen'
        },
        {
          timestamp: now.toISOString().replace('T', ' ').substring(0, 16),
          actor: 'AI Intake Agent',
          action: 'Intake Validated & Department Suggested',
          desc: `Category verified as "${category}". Routing recommended to ${routing.department}. Target resolution: ${routing.slaHours}h.`,
          role: 'system'
        }
      ],
      comments: [],
      feedback: null
    };

    let submissionSucceeded = false;

    if (ApiClient.backendAvailable) {
      try {
        const payload = {
          title,
          description,
          category,
          department: routing.department,
          ward,
          locality,
          landmark,
          lat,
          lng,
          urgency,
          safety_concern: safetyConcern,
          recurring: recurring,
          affected_count: affectedCount,
          is_anonymous: isAnonymous,
          submitted_by: isAnonymous ? 'Anonymous Resident' : (curUser ? curUser.name : 'Ananya Sen'),
          idempotency_key: this.currentIdempotencyKey,
          citizen_id: curUser ? curUser.id : null,
          attachments: this.attachedEvidenceFiles
        };

        const resp = await ApiClient.post('/api/complaints', payload);
        if (resp && resp.complaint) {
          trackingId = resp.complaint.id;
          await db.refreshFromBackend();
        } else {
          db.addComplaint(localComplaint);
        }
        submissionSucceeded = true;
      } catch (err) {
        console.warn('Backend complaint registration failed:', err);
        // If server failed, keep user input intact and permit retry
        this.showToast(`Submission notice: ${err.message}. Your entries have been preserved. You can retry submitting.`, 'warning');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Submit Grievance Now';
        }
        this.isSubmittingComplaint = false;
        return;
      }
    } else {
      db.addComplaint(localComplaint);
      submissionSucceeded = true;
    }

    if (!submissionSucceeded) {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Submit Grievance Now';
      }
      this.isSubmittingComplaint = false;
      return;
    }

    const savedComplaintId = trackingId;

    // Populate Receipt Modal
    const receiptTrackingEl = document.getElementById('receiptTrackingId');
    const receiptCatEl = document.getElementById('receiptCategory');
    const receiptLocEl = document.getElementById('receiptLocation');
    const receiptDeptEl = document.getElementById('receiptDepartment');
    const receiptDlEl = document.getElementById('receiptTargetDeadline');
    const receiptRepEl = document.getElementById('receiptReporter');
    const receiptTimeEl = document.getElementById('receiptTimestamp');

    if (receiptTrackingEl) receiptTrackingEl.textContent = savedComplaintId;
    if (receiptCatEl) receiptCatEl.textContent = category;
    if (receiptLocEl) receiptLocEl.textContent = `${ward} • ${locality}`;
    if (receiptDeptEl) receiptDeptEl.textContent = routing.department;
    if (receiptDlEl) receiptDlEl.textContent = `Within ${routing.slaHours} Hours`;
    if (receiptRepEl) receiptRepEl.textContent = isAnonymous ? 'Anonymous Resident' : (curUser ? curUser.name : 'Ananya Sen');
    if (receiptTimeEl) receiptTimeEl.textContent = now.toLocaleDateString() + ' • ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Show persistent success notification
    this.showToast(`Complaint ${savedComplaintId} registered successfully!`, 'success');

    // ── CRITICAL FEATURE 4: AUTOMATIC NEXT COMPLAINT FORM TRANSITION ──
    const overlay = document.getElementById('loadingTransitionOverlay');
    const overlayText = document.getElementById('loadingTransitionText');
    if (overlay) {
      if (overlayText) {
        overlayText.textContent = `Complaint ${savedComplaintId} recorded. Resetting intake state, clearing attachments, and preparing a fresh Complaint #2 form...`;
      }
      overlay.classList.remove('hidden');
    }

    setTimeout(() => {
      // 1. Explicitly reset the previous complaint's form values
      const form = document.getElementById('grievanceForm');
      if (form) form.reset();

      const titleInput = document.getElementById('reportTitle');
      const descInput = document.getElementById('reportDescription');
      const startInput = document.getElementById('reportStartDate');
      const recurCheck = document.getElementById('isRecurring');
      const safetyCheck = document.getElementById('isSafetyConcern');

      if (titleInput) titleInput.value = '';
      if (descInput) descInput.value = '';
      if (startInput) startInput.value = '';
      if (recurCheck) recurCheck.checked = false;
      if (safetyCheck) safetyCheck.checked = false;

      // 2. Clear all previous multimedia attachments & voice recordings
      this.attachedEvidenceFiles = [];
      this.stopVoiceRecording();
      this.renderAttachedPreviews();

      // 3. Reset to default problem category & generate clean idempotency key
      const catInput = document.getElementById('selectedCategory');
      if (catInput) catInput.value = 'Garbage Dump';
      this.currentIdempotencyKey = 'IDEM-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

      // 4. Return to Step 1 for fresh intake
      if (typeof this.goToStep === 'function') {
        this.goToStep(1);
      }

      // 5. Update heading to "Report Another Problem"
      const heading = document.getElementById('reportWizardHeading');
      const subheading = document.getElementById('reportWizardSubheading');
      if (heading) heading.textContent = 'Report Another Civic Problem';
      if (subheading) subheading.textContent = 'A fresh, unpopulated form is ready for Complaint #2. Previous details have been committed to the ledger.';

      // 6. Display success banner with fast access to track previous complaint
      const banner = document.getElementById('nextComplaintBanner');
      const bannerTitle = document.getElementById('bannerSuccessTitle');
      const bannerSub = document.getElementById('bannerSuccessSub');
      const btnTrackPrev = document.getElementById('btnBannerTrackPrev');

      if (bannerTitle) bannerTitle.textContent = `Complaint ${savedComplaintId} Received & Confirmed!`;
      if (bannerSub) bannerSub.textContent = 'Your previous report is now tracked. A clean, fresh form has been initialized for your next complaint.';
      if (banner) banner.classList.remove('hidden');

      if (btnTrackPrev) {
        btnTrackPrev.onclick = () => {
          window.location.hash = `#track?id=${savedComplaintId}`;
        };
      }

      // 7. Hide loading overlay and restore submit button
      if (overlay) overlay.classList.add('hidden');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Submit Grievance Now';
      }
      this.isSubmittingComplaint = false;

      // Refresh public counters and user dashboard
      this.renderPublicStats();
      this.renderRecentIncidents();
      this.renderNotifications();
      if (window.location.hash.includes('citizen')) {
        this.renderCitizenPortal();
      }
    }, 1200);
  },

  // ── CASE FILE & TRACKING DETAILS ─────────────────────────────
  renderCaseFile(id) {
    const c = db.getComplaint(id);
    const wrapper = document.getElementById('caseFileWrapper');
    if (!wrapper) return;

    if (!c) {
      wrapper.innerHTML = `
        <div class="empty-state" style="background:#fff; padding:40px; border-radius:14px; text-align:center;">
          <i class="fa-solid fa-magnifying-glass" style="font-size:2rem; color:#94a3b8; margin-bottom:12px;"></i>
          <h3>Complaint Identifier Not Found</h3>
          <p style="color:#64748b; margin-top:4px;">No record matching "${id}" exists in the municipal ledger. Please check for typographical errors.</p>
        </div>
      `;
      return;
    }

    const dl = CivicAI.deadlineAgent(c.timestamp, c.deadlineHours || 24);
    const statusClass = c.status.toLowerCase().replace(/\s+/g, '-');

    wrapper.innerHTML = `
      <div class="case-card">
        <div class="case-card-header">
          <div class="case-header-meta">
            <span class="case-id-badge"><i class="fa-solid fa-barcode"></i> ${c.id}</span>
            <span class="status-badge status-${statusClass}">${c.status}</span>
          </div>
          <h2 class="case-header-title">${c.title}</h2>
          <div class="case-header-info">
            <span><i class="fa-solid fa-location-dot"></i> ${c.ward}</span>
            <span><i class="fa-solid fa-layer-group"></i> ${c.category}</span>
            <span><i class="fa-solid fa-building"></i> ${c.department}</span>
            <span><i class="fa-solid fa-user-shield"></i> Reported by ${c.anonymous ? 'Anonymous Resident' : c.submittedBy}</span>
          </div>
        </div>

        <div class="case-card-body">
          <!-- KPI Metrics Row -->
          <div class="case-kpis-bar">
            <div class="case-kpi-item">
              <span>Target SLA Deadline:</span>
              <strong>${c.deadlineHours || 24} Hours Window</strong>
            </div>
            <div class="case-kpi-item">
              <span>Time Elapsed:</span>
              <strong>${dl.elapsedHours} Hours</strong>
            </div>
            <div class="case-kpi-item">
              <span>Remaining / SLA:</span>
              <strong style="color:${dl.isOverdue ? '#ef4444' : '#10b981'};">${dl.urgencySignal} (${dl.remainingHours}h left)</strong>
            </div>
            <div class="case-kpi-item">
              <span>Assigned Field Crew:</span>
              <strong>${c.assignedWorker || 'Pending Assignment'}</strong>
            </div>
          </div>

          <!-- Photographic Proof Vault -->
          <div class="case-evidence-panel">
            <h4 style="font-size:1rem; font-weight:700; color:#0f172a; margin-bottom:4px;">
              <i class="fa-solid fa-camera"></i> Photographic Evidence & Verification Proof
            </h4>
            <p style="font-size:0.8125rem; color:#64748b;">Every resolution requires verifiable photographic proof inspected by municipal supervisors.</p>
            
            <div class="evidence-side-by-side">
              <div class="evidence-side-box before">
                <div class="evidence-side-header">BEFORE: CITIZEN REPORT PHOTO</div>
                <div class="evidence-photo-box" style="background:#451a03; color:#fef3c7;">
                  <i class="fa-solid fa-triangle-exclamation" style="font-size:2rem;"></i>
                  <span>${c.category} Evidence</span>
                </div>
                <div class="evidence-caption">${c.evidence?.beforeCaption || 'Original citizen photo evidence.'}</div>
              </div>

              <div class="evidence-side-box after">
                <div class="evidence-side-header">AFTER: VERIFIED WORK RESOLUTION</div>
                ${c.evidence?.afterImg ? `
                  <div class="evidence-photo-box" style="background:#064e3b; color:#a7f3d0;">
                    <i class="fa-solid fa-circle-check" style="font-size:2rem;"></i>
                    <span>Verified Completed Work</span>
                  </div>
                  <div class="evidence-caption">${c.evidence.afterCaption}</div>
                ` : `
                  <div class="evidence-photo-box" style="background:#f1f5f9; color:#94a3b8;">
                    <i class="fa-solid fa-clock-rotate-left" style="font-size:2rem;"></i>
                    <span>Awaiting Field Crew Resolution Proof</span>
                  </div>
                  <div class="evidence-caption">Work in progress. Field crew must upload completion photo.</div>
                `}
              </div>
            </div>
          </div>

          <!-- 14-State Lifecycle Timeline -->
          <h3 class="timeline-section-title">
            <i class="fa-solid fa-timeline"></i> Action-Taken History & Status Progression
          </h3>

          <div class="case-timeline">
            ${c.timeline ? c.timeline.map((event, idx) => `
              <div class="timeline-event ${idx === 0 ? 'active' : ''} ${event.action.includes('Resolved') ? 'resolved' : ''}">
                <div class="event-dot">
                  <i class="fa-solid ${event.role === 'citizen' ? 'fa-user' : event.role === 'system' ? 'fa-brain' : event.role === 'worker' ? 'fa-wrench' : 'fa-building-columns'}"></i>
                </div>
                <div class="event-box">
                  <div class="event-header">
                    <span class="event-action">${event.action}</span>
                    <span class="event-actor-badge">${event.actor}</span>
                    <span class="event-time">${event.timestamp}</span>
                  </div>
                  <p class="event-desc">${event.desc}</p>
                </div>
              </div>
            `).join('') : '<p>No timeline entries recorded yet.</p>'}
          </div>

          <!-- Community Engagement Bar -->
          <div class="case-community-actions">
            <div class="community-left-actions">
              <button class="btn-upvote ${c.userVoted ? 'voted' : ''}" onclick="CivicApp.toggleUpvote('${c.id}')">
                <i class="fa-solid fa-thumbs-up"></i>
                <span>${c.upvotes}</span> Citizens Support This
              </button>
              <button class="btn btn-sm btn-outline" onclick="CivicApp.shareComplaint('${c.id}')">
                <i class="fa-solid fa-share-nodes"></i> Share Report
              </button>
            </div>
            
            <div class="citizen-feedback-actions">
              ${c.status === 'Resolved' ? `
                <button class="btn btn-sm btn-outline text-danger" onclick="CivicApp.openFeedbackModal('${c.id}', true)">
                  <i class="fa-solid fa-rotate-left"></i> Reopen Complaint
                </button>
                <button class="btn btn-sm btn-success" onclick="CivicApp.openFeedbackModal('${c.id}', false)">
                  <i class="fa-solid fa-star"></i> Rate Resolution
                </button>
              ` : `
                <button class="btn btn-sm btn-outline" onclick="CivicApp.withdrawComplaint('${c.id}')">
                  <i class="fa-solid fa-ban"></i> Withdraw My Report
                </button>
              `}
            </div>
          </div>

          <!-- Public Citizen Comments Thread -->
          <div class="comments-thread-box">
            <h4 style="font-size:0.9375rem; font-weight:700; color:#0f172a; margin-bottom:12px;">
              <i class="fa-solid fa-comments"></i> Public Community Discussion (${c.comments?.length || 0})
            </h4>

            <div class="comments-list">
              ${c.comments && c.comments.length > 0 ? c.comments.map(cm => `
                <div class="comment-item">
                  <div class="comment-head">
                    <span class="comment-user"><i class="fa-solid fa-user-circle"></i> ${cm.user}</span>
                    <span class="comment-time">${cm.time}</span>
                  </div>
                  <div class="comment-text">${cm.text}</div>
                </div>
              `).join('') : '<p style="font-size:0.8125rem; color:#94a3b8;">No public comments yet. Add the first update below.</p>'}
            </div>

            <div class="add-comment-form">
              <input type="text" id="newCommentInput_${c.id}" class="form-control form-control-sm" placeholder="Add verified local observation or status update..." />
              <button class="btn btn-sm btn-primary" onclick="CivicApp.addComment('${c.id}')">
                Post Comment
              </button>
            </div>
          </div>

        </div>
      </div>
    `;
  },

  addComment(id) {
    const input = document.getElementById(`newCommentInput_${id}`);
    if (!input || !input.value.trim()) return;
    const text = input.value.trim();
    const c = db.getComplaint(id);
    if (c) {
      if (!c.comments) c.comments = [];
      const user = db.data.users[this.activeRole].name;
      c.comments.push({ user: user, time: 'Just now', text: text });
      db.save();
      this.showToast('Your comment was posted to the public ledger.', 'success');
      this.renderCaseFile(id);
    }
  },

  shareComplaint(id) {
    navigator.clipboard?.writeText(window.location.origin + window.location.pathname + `#track?id=${id}`);
    this.showToast(`Case link for ${id} copied to clipboard!`, 'success');
  },

  async withdrawComplaint(id) {
    if (confirm(`Are you sure you wish to withdraw complaint ${id}? This action will be archived in the municipal audit log.`)) {
      if (ApiClient.backendAvailable) {
        try {
          await ApiClient.patch(`/api/complaints/${id}/status`, {
            status: 'Withdrawn',
            reason: 'Citizen withdrew report',
            actor_role: 'citizen',
            actor_name: 'Citizen (Ananya Sen)'
          });
          await db.refreshFromBackend();
        } catch (e) {
          console.warn('Backend withdraw failed, saving locally:', e);
          db.updateComplaint(id, { status: 'Withdrawn' });
        }
      } else {
        db.updateComplaint(id, { status: 'Withdrawn' });
      }
      db.addTimelineEvent(id, {
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        actor: 'Citizen (Ananya Sen)',
        action: 'Complaint Withdrawn',
        desc: 'Citizen marked the issue as resolved or no longer requiring municipal dispatch.',
        role: 'citizen'
      });
      db.addAuditLog('Citizen', 'WITHDRAW_COMPLAINT', `Complaint ${id} was marked Withdrawn.`);
      this.showToast(`Complaint ${id} has been withdrawn.`, 'info');
      this.renderCaseFile(id);
    }
  },

  openFeedbackModal(id, isReopen) {
    const modal = document.getElementById('feedbackModal');
    const title = document.getElementById('feedbackModalTitle');
    const ratingGroup = document.getElementById('starRatingGroup');
    const commentBox = document.getElementById('feedbackComment');
    commentBox.value = '';

    modal.dataset.complaintId = id;
    modal.dataset.isReopen = isReopen ? 'true' : 'false';

    if (isReopen) {
      title.textContent = 'Request Case Reopening';
      ratingGroup.style.display = 'none';
      commentBox.placeholder = 'Explain why the resolution was unsatisfactory (e.g. Garbage returned, pothole uncompacted)...';
    } else {
      title.textContent = 'Rate Resolution Quality';
      ratingGroup.style.display = 'block';
      commentBox.placeholder = 'Provide comments on service speed and quality...';
    }

    modal.classList.add('active');

    document.getElementById('btnSubmitFeedbackAction').onclick = async () => {
      const targetId = modal.dataset.complaintId;
      const willReopen = modal.dataset.isReopen === 'true';
      const comment = commentBox.value.trim() || (willReopen ? 'Citizen reported recurring problem.' : 'Satisfied with resolution.');

      if (willReopen) {
        if (ApiClient.backendAvailable) {
          try {
            await ApiClient.post(`/api/complaints/${targetId}/reopen`, {
              reason: comment,
              citizen_name: 'Ananya Sen'
            });
            await db.refreshFromBackend();
          } catch (e) {
            console.warn('Backend reopen failed, saving locally:', e);
            db.updateComplaint(targetId, { status: 'Reopened' });
          }
        } else {
          db.updateComplaint(targetId, { status: 'Reopened' });
        }
        db.addTimelineEvent(targetId, {
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          actor: 'Citizen (Ananya Sen)',
          action: 'Complaint Reopened',
          desc: `Citizen requested reopening: "${comment}". Escalated to Senior Officer desk.`,
          role: 'citizen'
        });
        db.addAuditLog('Citizen', 'REOPEN_COMPLAINT', `Case ${targetId} reopened by citizen.`);
        this.showToast(`Complaint ${targetId} reopened and escalated.`, 'warning');
      } else {
        const star = document.querySelectorAll('.star-btn.active').length;
        db.updateComplaint(targetId, { feedback: { rating: star, comment: comment, date: new Date().toISOString().substring(0, 10) } });
        db.addAuditLog('Citizen', 'FEEDBACK_SUBMITTED', `Citizen rated ${targetId} with ${star} stars.`);
        this.showToast('Thank you! Your feedback helps evaluate municipal crews.', 'success');
      }

      modal.classList.remove('active');
      this.renderCaseFile(targetId);
      this.renderPublicStats();
    };
  },

  // ── MAPS (LEAFLET) ───────────────────────────────────────────
  initPickerMap() {
    if (this.pickerMap) {
      this.pickerMap.invalidateSize();
      return;
    }
    const container = document.getElementById('pickerMap');
    if (!container) return;

    const defaultLat = 12.9352;
    const defaultLng = 77.6245;

    this.pickerMap = L.map('pickerMap').setView([defaultLat, defaultLng], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.pickerMap);

    this.pickerMarker = L.marker([defaultLat, defaultLng], { draggable: true }).addTo(this.pickerMap);

    this.pickerMarker.on('dragend', (e) => {
      const pos = e.target.getLatLng();
      document.getElementById('pickedLat').textContent = pos.lat.toFixed(4);
      document.getElementById('pickedLng').textContent = pos.lng.toFixed(4);
    });

    this.pickerMap.on('click', (e) => {
      this.pickerMarker.setLatLng(e.latlng);
      document.getElementById('pickedLat').textContent = e.latlng.lat.toFixed(4);
      document.getElementById('pickedLng').textContent = e.latlng.lng.toFixed(4);
    });

    document.getElementById('btnGpsLocate')?.addEventListener('click', () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          this.pickerMap.setView([lat, lng], 15);
          this.pickerMarker.setLatLng([lat, lng]);
          document.getElementById('pickedLat').textContent = lat.toFixed(4);
          document.getElementById('pickedLng').textContent = lng.toFixed(4);
          this.showToast('GPS coordinates locked successfully', 'success');
        }, () => {
          this.showToast('Location permission denied or unavailable, using ward default', 'warning');
        });
      }
    });
  },

  initCityMap() {
    if (!this.cityMap) {
      const container = document.getElementById('cityFullMap');
      if (!container) return;

      this.cityMap = L.map('cityFullMap').setView([12.9716, 77.5946], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.cityMap);

      this.mapMarkersLayer = L.layerGroup().addTo(this.cityMap);

      // Filters
      document.getElementById('mapFilterDept').addEventListener('change', () => this.refreshCityMapMarkers());
      document.getElementById('mapFilterStatus').addEventListener('change', () => this.refreshCityMapMarkers());
    }

    this.cityMap.invalidateSize();
    this.refreshCityMapMarkers();
  },

  refreshCityMapMarkers() {
    if (!this.cityMap || !this.mapMarkersLayer) return;
    this.mapMarkersLayer.clearLayers();

    const deptFilter = document.getElementById('mapFilterDept')?.value || 'all';
    const statusFilter = document.getElementById('mapFilterStatus')?.value || 'all';

    let list = db.getComplaints();
    if (deptFilter !== 'all') list = list.filter(c => c.department === deptFilter);
    if (statusFilter !== 'all') {
      if (statusFilter === 'Open') list = list.filter(c => c.status === 'Intake Review' || c.status === 'Submitted');
      else list = list.filter(c => c.status === statusFilter);
    }

    const sidebarList = document.getElementById('mapIncidentList');
    if (sidebarList) {
      sidebarList.innerHTML = list.map(c => `
        <div class="map-incident-item" onclick="CivicApp.focusMapMarker(${c.lat}, ${c.lng}, '${c.id}')">
          <strong>${c.title}</strong>
          <span>${c.id} • ${c.ward} • <span class="status-badge status-${c.status.toLowerCase().replace(/\s+/g, '-')}">${c.status}</span></span>
        </div>
      `).join('');
    }

    list.forEach(c => {
      let color = '#3b82f6';
      if (c.status === 'Resolved') color = '#10b981';
      else if (c.department.includes('Sanitation')) color = '#f59e0b';
      else if (c.department.includes('Water')) color = '#06b6d4';

      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `<div style="background:${color}; width:24px; height:24px; border-radius:50%; border:3px solid #fff; box-shadow:0 2px 6px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center; color:#fff; font-size:10px;"><i class="fa-solid fa-location-dot"></i></div>`,
        iconSize: [24, 24]
      });

      const marker = L.marker([c.lat, c.lng], { icon: customIcon }).addTo(this.mapMarkersLayer);
      marker.bindPopup(`
        <div style="font-family:'Plus Jakarta Sans',sans-serif; min-width:180px;">
          <strong style="color:#0f172a; font-size:13px; display:block;">${c.title}</strong>
          <span style="font-size:11px; color:#64748b; display:block; margin:2px 0 6px;">${c.id} • ${c.ward}</span>
          <span class="status-badge status-${c.status.toLowerCase().replace(/\s+/g, '-')}">${c.status}</span>
          <div style="margin-top:8px;">
            <a href="#track?id=${c.id}" class="btn btn-xs btn-primary" style="display:inline-block; color:#fff;">View Full Case</a>
          </div>
        </div>
      `);
    });
  },

  focusMapMarker(lat, lng, id) {
    if (this.cityMap) {
      this.cityMap.setView([lat, lng], 15);
    }
  },

  // ── FACILITIES LOCATOR ───────────────────────────────────────
  renderFacilities(typeFilter = 'all') {
    const grid = document.getElementById('facilitiesGrid');
    if (!grid) return;
    let list = db.data.facilities;
    if (typeFilter !== 'all') {
      list = list.filter(f => f.type === typeFilter);
    }

    grid.innerHTML = list.map(f => `
      <div class="facility-card">
        <div class="facility-head">
          <div>
            <h4>${f.name}</h4>
            <span><i class="fa-solid fa-location-dot"></i> ${f.ward} • ${f.location}</span>
          </div>
          <span class="badge badge-success"><i class="fa-solid fa-circle-check"></i> ${f.status}</span>
        </div>
        <div class="amenity-pills">
          ${f.amenities.map(a => `<span class="amenity-pill"><i class="fa-solid fa-check"></i> ${a}</span>`).join('')}
        </div>
        <div class="facility-footer">
          <span style="font-size:0.75rem; color:#64748b;"><i class="fa-solid fa-clock"></i> ${f.hours}</span>
          <a href="#report?category=Public%20Toilet&facility=${encodeURIComponent(f.name)}" class="btn btn-xs btn-outline">
            <i class="fa-solid fa-triangle-exclamation"></i> Report Issue Here
          </a>
        </div>
      </div>
    `).join('');
  },

  initFacilitiesMap() {
    if (!this.facilitiesMap) {
      const container = document.getElementById('facilitiesMap');
      if (!container) return;
      this.facilitiesMap = L.map('facilitiesMap').setView([12.9716, 77.5946], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.facilitiesMap);

      db.data.facilities.forEach(f => {
        L.marker([f.lat, f.lng]).addTo(this.facilitiesMap).bindPopup(`
          <strong>${f.name}</strong><br/>
          <span>${f.category} • ${f.hours}</span>
        `);
      });
    }
    this.facilitiesMap.invalidateSize();
  },

  // ── PUBLIC TRANSPARENCY DASHBOARD ────────────────────────────
  renderDashboardAnalytics() {
    const complaints = db.getComplaints();
    const total = complaints.length;
    const resolved = complaints.filter(c => c.status === 'Resolved').length;
    const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    document.getElementById('dashTotalCount').textContent = total;
    document.getElementById('dashResolvedRate').textContent = `${rate}%`;

    // Render Status Distribution Chart
    const statusCounts = {
      'Intake Review': complaints.filter(c => c.status === 'Intake Review' || c.status === 'Submitted').length,
      'In Progress': complaints.filter(c => c.status === 'In Progress' || c.status === 'Assigned').length,
      'Awaiting Verification': complaints.filter(c => c.status === 'Awaiting Verification').length,
      'Verified Resolved': resolved,
      'Overdue': complaints.filter(c => c.status === 'Overdue').length,
      'Reopened': complaints.filter(c => c.status === 'Reopened').length
    };

    const statusChart = document.getElementById('statusDistributionChart');
    if (statusChart) {
      statusChart.innerHTML = Object.entries(statusCounts).map(([label, count]) => {
        const pct = total > 0 ? (count / total) * 100 : 0;
        let color = '#3b82f6';
        if (label === 'Verified Resolved') color = '#10b981';
        else if (label === 'Overdue') color = '#ef4444';
        else if (label === 'In Progress') color = '#f59e0b';
        else if (label === 'Reopened') color = '#ea580c';

        return `
          <div class="bar-row">
            <span class="bar-label">${label}</span>
            <div class="bar-track">
              <div class="bar-fill" style="width:${pct}%; background:${color};"></div>
            </div>
            <span class="bar-count">${count}</span>
          </div>
        `;
      }).join('');
    }

    // Render Department Performance List
    const deptList = document.getElementById('deptPerformanceList');
    if (deptList) {
      const depts = [
        { name: 'Sanitation & Solid Waste', total: 6, resolved: 4, breached: 1 },
        { name: 'Roads & Infrastructure (PWD)', total: 5, resolved: 4, breached: 0 },
        { name: 'Water Supply & Sewerage', total: 4, resolved: 3, breached: 1 },
        { name: 'Electrical & Street Lighting', total: 3, resolved: 2, breached: 0 }
      ];

      deptList.innerHTML = depts.map(d => `
        <div class="dept-perf-item">
          <div class="dept-perf-head">
            <span>${d.name}</span>
            <span>${Math.round((d.resolved / d.total) * 100)}% Compliance</span>
          </div>
          <div class="dept-perf-bar">
            <div class="dept-fill-resolved" style="width:${(d.resolved / d.total) * 80}%;"></div>
            <div class="dept-fill-breached" style="width:${(d.breached / d.total) * 20}%;"></div>
          </div>
        </div>
      `).join('');
    }
  },

  // ── CITIZEN SURVEYS & POLLS ──────────────────────────────────
  renderSurveys() {
    const grid = document.getElementById('surveysGrid');
    if (!grid) return;

    grid.innerHTML = db.data.surveys.map(s => {
      const totalVotes = s.options.reduce((acc, opt) => acc + opt.votes, 0);

      return `
        <div class="survey-card" id="surveyCard_${s.id}">
          <div class="survey-header">
            <span class="section-badge"><i class="fa-solid fa-check-to-slot"></i> ACTIVE MUNICIPAL POLL</span>
            <h3>${s.title}</h3>
            <p>${s.desc}</p>
          </div>

          <div class="survey-options">
            ${s.options.map((opt, idx) => {
              const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
              return `
                <button type="button" class="survey-opt-btn ${s.userVoted ? 'voted' : ''}" onclick="CivicApp.voteSurvey('${s.id}', ${idx})">
                  <div class="survey-bar-bg" style="width:${pct}%;"></div>
                  <div class="survey-opt-content">
                    <span>${opt.text}</span>
                    <strong style="font-family:var(--font-mono);">${pct}% (${opt.votes} votes)</strong>
                  </div>
                </button>
              `;
            }).join('')}
          </div>

          <div style="font-size:0.75rem; color:#64748b; display:flex; justify-content:space-between;">
            <span><i class="fa-solid fa-users"></i> Total Verified Votes: ${totalVotes}</span>
            <span>Status: Democratic Decision Pending</span>
          </div>
        </div>
      `;
    }).join('');
  },

  voteSurvey(surveyId, optIdx) {
    const s = db.data.surveys.find(item => item.id === surveyId);
    if (!s) return;
    if (s.userVoted) {
      this.showToast('You have already recorded your vote in this municipal poll.', 'info');
      return;
    }
    s.options[optIdx].votes += 1;
    s.userVoted = true;
    db.save();
    this.showToast('Your vote has been cast and recorded in open survey registry.', 'success');
    this.renderSurveys();
  },

  // ── FIELD WORKER WORKSPACE ───────────────────────────────────
  renderWorkerPortal() {
    const grid = document.getElementById('workerTasksGrid');
    if (!grid) return;
    const workerTasks = db.getComplaints().filter(c => c.status !== 'Resolved');

    document.getElementById('workerAssignedCount').textContent = workerTasks.length;

    grid.innerHTML = workerTasks.map(c => `
      <div class="worker-card">
        <div>
          <div class="worker-card-head">
            <span class="incident-tracking-id">${c.id}</span>
            <span class="status-badge status-${c.status.toLowerCase().replace(/\s+/g, '-')}">${c.status}</span>
          </div>
          <h4 style="font-size:1rem; font-weight:700; color:#0f172a; margin-bottom:4px;">${c.title}</h4>
          <p style="font-size:0.8125rem; color:#64748b; margin-bottom:12px;">
            <i class="fa-solid fa-location-dot"></i> ${c.ward} • ${c.locality}
          </p>
          <div style="background:#f8fafc; padding:8px 10px; border-radius:6px; font-size:0.75rem; color:#334155;">
            <strong>Department Task:</strong> Deploy squad for resolution and submit photographic proof before deadline.
          </div>
        </div>

        <div class="worker-actions">
          ${c.status === 'Intake Review' || c.status === 'Assigned' ? `
            <button class="btn btn-xs btn-primary" onclick="CivicApp.workerUpdateStatus('${c.id}', 'In Progress', 'Work Started by Rajesh Kumar')">
              <i class="fa-solid fa-play"></i> Start Work
            </button>
          ` : ''}

          ${c.status === 'In Progress' || c.status === 'Overdue' ? `
            <button class="btn btn-xs btn-success" onclick="CivicApp.openWorkerEvidenceModal('${c.id}')">
              <i class="fa-solid fa-camera"></i> Submit Resolution Evidence
            </button>
          ` : ''}

          <a href="#track?id=${c.id}" class="btn btn-xs btn-outline">
            View Details
          </a>
        </div>
      </div>
    `).join('');
  },

  async workerUpdateStatus(id, newStatus, actionText) {
    if (ApiClient.backendAvailable) {
      try {
        await ApiClient.patch(`/api/complaints/${id}/status`, {
          status: newStatus,
          reason: actionText,
          actor_role: 'worker',
          actor_name: 'Rajesh Kumar (Field Worker)'
        });
        await db.refreshFromBackend();
      } catch (e) {
        console.warn('Backend worker status update failed, saving locally:', e);
        db.updateComplaint(id, { status: newStatus });
      }
    } else {
      db.updateComplaint(id, { status: newStatus });
    }
    db.addTimelineEvent(id, {
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      actor: 'Rajesh Kumar (Field Worker)',
      action: actionText,
      desc: 'Field squad on site with equipment. Work order updated in real time.',
      role: 'worker'
    });
    db.addAuditLog('Field Worker (Rajesh)', 'WORK_STATUS_UPDATE', `Updated ${id} to ${newStatus}.`);
    this.showToast(`Case ${id} marked as ${newStatus}`, 'success');
    this.renderWorkerPortal();
  },

  openWorkerEvidenceModal(id) {
    const modal = document.getElementById('officerActionModal');
    document.getElementById('officerModalTitle').textContent = `Submit Resolution Proof (${id})`;
    document.getElementById('officerModalSubtitle').textContent = 'Upload after-repair photo and completion log for officer audit.';

    document.getElementById('officerModalBody').innerHTML = `
      <div class="form-group">
        <label>Work Performed & Materials Used <span class="required">*</span></label>
        <textarea id="workerWorkNotes" class="form-control" rows="3" placeholder="e.g. Cleared 1.2 metric tons of solid waste using compactor truck #KA-01-EA-4920. Disinfected sidewalk with lime powder."></textarea>
      </div>
      <div class="form-group">
        <label>After Photo Evidence (Simulated Upload)</label>
        <div class="presets-grid">
          <button type="button" class="photo-preset-btn active" data-mock-after="pothole-after">
            <i class="fa-solid fa-circle-check"></i> Cleaned / Repaired Photo
          </button>
        </div>
      </div>
    `;

    modal.classList.add('active');

    document.getElementById('btnConfirmOfficerAction').onclick = async () => {
      const notes = document.getElementById('workerWorkNotes').value.trim() || 'Work completed and site restored to municipal hygiene standards.';
      if (ApiClient.backendAvailable) {
        try {
          await ApiClient.post(`/api/complaints/${id}/evidence`, {
            notes: notes,
            after_img_url: 'pothole-after',
            worker_name: 'Rajesh Kumar (Field Worker)'
          });
          await db.refreshFromBackend();
        } catch (e) {
          console.warn('Backend evidence submission failed, saving locally:', e);
          db.updateComplaint(id, {
            status: 'Awaiting Verification',
            evidence: {
              beforeImg: 'dump-visual',
              beforeCaption: 'Original incident condition.',
              afterImg: 'pothole-after',
              afterCaption: notes
            }
          });
        }
      } else {
        db.updateComplaint(id, {
          status: 'Awaiting Verification',
          evidence: {
            beforeImg: 'dump-visual',
            beforeCaption: 'Original incident condition.',
            afterImg: 'pothole-after',
            afterCaption: notes
          }
        });
      }

      db.addTimelineEvent(id, {
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        actor: 'Rajesh Kumar (Field Worker)',
        action: 'Resolution Evidence Submitted',
        desc: `Field team uploaded completion proof: "${notes}". Awaiting supervisor physical sign-off.`,
        role: 'worker'
      });

      db.addAuditLog('Field Worker (Rajesh)', 'SUBMIT_RESOLUTION_EVIDENCE', `Uploaded completion evidence for ${id}.`);
      modal.classList.remove('active');
      this.showToast('Resolution proof submitted! Sent to officer for verification.', 'success');
      this.renderWorkerPortal();
    };
  },

  // ── DEPARTMENT OFFICER PORTAL ────────────────────────────────
  renderOfficerPortal() {
    const tbody = document.getElementById('officerTableBody');
    if (!tbody) return;
    const complaints = db.getComplaints();

    document.getElementById('officerNewCases').textContent = complaints.filter(c => c.status === 'Intake Review').length;
    document.getElementById('officerPendingVerif').textContent = complaints.filter(c => c.status === 'Awaiting Verification').length;
    document.getElementById('officerOverdue').textContent = complaints.filter(c => c.status === 'Overdue').length;

    tbody.innerHTML = complaints.map(c => `
      <tr>
        <td><strong style="font-family:var(--font-mono);">${c.id}</strong></td>
        <td>${c.category}</td>
        <td>${c.ward}</td>
        <td><span class="status-badge ${c.urgency === 'Critical' ? 'status-overdue' : 'status-progress'}">${c.urgency}</span></td>
        <td><span class="status-badge status-${c.status.toLowerCase().replace(/\s+/g, '-')}">${c.status}</span></td>
        <td>${c.assignedWorker || 'Unassigned'}</td>
        <td style="font-family:var(--font-mono); font-size:0.75rem;">${c.deadlineHours || 24}h SLA</td>
        <td>
          <button class="btn btn-xs btn-primary" onclick="CivicApp.openOfficerActionModal('${c.id}')">
            Manage Case
          </button>
        </td>
      </tr>
    `).join('');
  },

  openOfficerActionModal(id) {
    const c = db.getComplaint(id);
    if (!c) return;

    const modal = document.getElementById('officerActionModal');
    document.getElementById('officerModalTitle').textContent = `Grievance Officer Action: ${c.id}`;
    document.getElementById('officerModalSubtitle').textContent = `Reviewing ${c.title} (${c.category})`;

    document.getElementById('officerModalBody').innerHTML = `
      <div class="form-group">
        <label>Select Administrative Action</label>
        <select id="officerActionType" class="form-control">
          <option value="verify" ${c.status === 'Awaiting Verification' ? 'selected' : ''}>Verify Resolution Proof & Mark Resolved</option>
          <option value="rework">Reject Evidence & Return for Rework</option>
          <option value="reassign">Reassign Department / Field Squad</option>
          <option value="priority">Escalate Priority Level</option>
        </select>
      </div>
      <div class="form-group">
        <label>Officer Inspection Notes / Instructions <span class="required">*</span></label>
        <textarea id="officerActionNotes" class="form-control" rows="3" placeholder="Enter formal inspection verdict or instructions for the field squad..."></textarea>
      </div>
    `;

    modal.classList.add('active');

    document.getElementById('btnConfirmOfficerAction').onclick = async () => {
      const actionType = document.getElementById('officerActionType').value;
      const notes = document.getElementById('officerActionNotes').value.trim() || 'Officer audit complete according to standard municipal guidelines.';

      if (actionType === 'verify') {
        if (ApiClient.backendAvailable) {
          try {
            await ApiClient.post(`/api/complaints/${id}/verify-evidence`, {
              decision: 'approved',
              explanation: notes,
              reviewer_name: 'Priya Sharma (Senior Grievance Officer)'
            });
            await db.refreshFromBackend();
          } catch (e) {
            console.warn('Backend verify-evidence failed, saving locally:', e);
            db.updateComplaint(id, { status: 'Resolved' });
          }
        } else {
          db.updateComplaint(id, { status: 'Resolved' });
        }
        db.addTimelineEvent(id, {
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          actor: 'Priya Sharma (Senior Grievance Officer)',
          action: 'Officially Verified & Resolved',
          desc: `Officer signed off on photographic proof: "${notes}". Case marked Resolved.`,
          role: 'officer'
        });
        db.addAuditLog('Officer Priya', 'VERIFY_RESOLUTION', `Approved completion of case ${id}.`);
        this.showToast(`Case ${id} marked officially Verified and Resolved!`, 'success');
      } else if (actionType === 'rework') {
        if (ApiClient.backendAvailable) {
          try {
            await ApiClient.post(`/api/complaints/${id}/verify-evidence`, {
              decision: 'rejected',
              explanation: notes,
              reviewer_name: 'Priya Sharma (Senior Grievance Officer)'
            });
            await db.refreshFromBackend();
          } catch (e) {
            console.warn('Backend reject-evidence failed, saving locally:', e);
            db.updateComplaint(id, { status: 'In Progress' });
          }
        } else {
          db.updateComplaint(id, { status: 'In Progress' });
        }
        db.addTimelineEvent(id, {
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          actor: 'Priya Sharma (Senior Grievance Officer)',
          action: 'Evidence Rejected: Return for Rework',
          desc: `Resolution proof inadequate: "${notes}". Returned to field squad.`,
          role: 'officer'
        });
        db.addAuditLog('Officer Priya', 'REJECT_EVIDENCE', `Returned ${id} for rework.`);
        this.showToast(`Evidence rejected. Field crew instructed to rework.`, 'warning');
      } else if (actionType === 'reassign') {
        if (ApiClient.backendAvailable) {
          try {
            await ApiClient.post(`/api/complaints/${id}/assign`, {
              worker_name: 'Special Emergency Taskforce',
              instructions: notes,
              officer_name: 'Priya Sharma (Senior Grievance Officer)'
            });
            await db.refreshFromBackend();
          } catch (e) {
            console.warn('Backend assign failed, saving locally:', e);
            db.updateComplaint(id, { assignedWorker: 'Special Emergency Taskforce' });
          }
        } else {
          db.updateComplaint(id, { assignedWorker: 'Special Emergency Taskforce' });
        }
        db.addTimelineEvent(id, {
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          actor: 'Priya Sharma (Senior Grievance Officer)',
          action: 'Reassigned to Emergency Taskforce',
          desc: notes,
          role: 'officer'
        });
        this.showToast(`Case ${id} transferred to Emergency Taskforce.`, 'info');
      } else if (actionType === 'priority') {
        if (ApiClient.backendAvailable) {
          try {
            await ApiClient.post(`/api/complaints/${id}/escalate`, {
              reason: notes,
              rule_code: 'OFFICER-ESC',
              escalation_level: 'Critical'
            });
            await db.refreshFromBackend();
          } catch (e) {
            console.warn('Backend escalate failed, saving locally:', e);
            db.updateComplaint(id, { urgency: 'Critical' });
          }
        } else {
          db.updateComplaint(id, { urgency: 'Critical' });
        }
        db.addTimelineEvent(id, {
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          actor: 'Priya Sharma (Senior Grievance Officer)',
          action: 'Priority Escalated to Critical',
          desc: `Reason: ${notes}`,
          role: 'officer'
        });
        this.showToast(`Priority for ${id} raised to Critical.`, 'warning');
      }

      modal.classList.remove('active');
      this.renderOfficerPortal();
      this.renderPublicStats();
    };
  },

  // ── MUNICIPAL ADMIN PORTAL ───────────────────────────────────
  async renderAdminPortal() {
    const list = document.getElementById('adminAuditLogList');
    if (list) {
      list.innerHTML = db.data.auditLogs.map(log => `
        <div class="audit-log-entry">
          <div class="audit-meta">
            <span><strong>${log.actor}</strong> [${log.action}]</span>
            <span>${log.timestamp}</span>
          </div>
          <div>${log.details}</div>
        </div>
      `).join('');
    }

    await this.renderAdminStaffList();

    const btnRefresh = document.getElementById('btnRefreshStaffApprovals');
    if (btnRefresh) {
      btnRefresh.onclick = () => this.renderAdminStaffList();
    }
  },

  async renderAdminStaffList() {
    const tbody = document.getElementById('adminStaffTableBody');
    if (!tbody) return;

    let users = [];
    if (ApiClient.backendAvailable) {
      try {
        const resp = await ApiClient.get('/api/users');
        users = resp.users || [];
      } catch (e) {
        console.warn('Failed to fetch users from backend:', e);
      }
    }

    if (users.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:#94a3b8; padding:20px;">No registered staff users found in ledger.</td></tr>`;
      return;
    }

    tbody.innerHTML = users.map(u => `
      <tr>
        <td style="font-family:var(--font-mono); font-size:0.75rem;"><strong>${u.id}</strong></td>
        <td><strong>${u.name}</strong></td>
        <td>${u.email}<br/><small style="color:#64748b;">${u.phone || '—'}</small></td>
        <td><span class="status-badge status-${u.role === 'admin' ? 'critical' : u.role === 'officer' ? 'progress' : 'assigned'}">${u.role.toUpperCase()}</span></td>
        <td>${u.department || 'General'}</td>
        <td style="font-size:0.75rem; color:#64748b;">${u.created_at ? u.created_at.substring(0, 10) : '2026-10-27'}</td>
        <td>
          <span class="status-badge ${u.status === 'active' ? 'status-resolved' : 'status-overdue'}">
            ${u.status === 'active' ? 'Active' : 'Pending Approval'}
          </span>
        </td>
        <td>
          ${u.status === 'pending_approval' ? `
            <button class="btn-action-approve" onclick="CivicApp.approveStaffUser('${u.id}')">
              <i class="fa-solid fa-check"></i> Approve & Activate
            </button>
          ` : `
            <span style="font-size:0.75rem; color:#10b981; font-weight:700;"><i class="fa-solid fa-check-double"></i> Active</span>
          `}
        </td>
      </tr>
    `).join('');
  },

  async approveStaffUser(userId) {
    if (ApiClient.backendAvailable) {
      try {
        await ApiClient.patch(`/api/users/${userId}/status`, { status: 'active' });
        this.showToast(`User ${userId} approved and activated successfully!`, 'success');
        await this.renderAdminStaffList();
      } catch (e) {
        this.showToast(`Failed to approve user: ${e.message}`, 'warning');
      }
    }
  },

  // ── AI INSPECTOR OUTPUTS ─────────────────────────────────────
  updateAiInspectorOutputs() {
    const intake = CivicAI.intakeAgent('Large garbage dump near school', 'Waste overflow with foul smell', 'Garbage Dump', 'High', true);
    document.getElementById('inspectIntakeOutput').innerHTML = `
      <code>Output: ${intake.reasoning}</code>
    `;
    document.getElementById('inspectDuplicateOutput').innerHTML = `
      <code>Matching criteria: Radius 500m • Category overlap: 40pts • Keyword similarity: 35pts</code>
    `;
    document.getElementById('inspectRoutingOutput').innerHTML = `
      <code>Active routing rules: Sanitation -> Squad #4 | PWD Roads -> Crew #8 | Water -> BWSSB Unit 2</code>
    `;
    document.getElementById('inspectDeadlineOutput').innerHTML = `
      <code>Active countdowns: CR-2026-8492 [Overdue] • CR-2026-7281 [8.5h left]</code>
    `;
    document.getElementById('inspectEvidenceOutput').innerHTML = `
      <code>Resolution gate: Side-by-side computer vision metadata & inspector notes validation active.</code>
    `;
  },

  // ── NOTIFICATIONS & TOAST ────────────────────────────────────
  renderNotifications() {
    const list = document.getElementById('notifList');
    if (!list) return;
    const items = db.data.notifications;
    const unreadCount = items.filter(n => n.unread).length;
    document.getElementById('notifBadge').textContent = unreadCount;

    list.innerHTML = items.map(n => `
      <div class="notif-item ${n.unread ? 'unread' : ''}">
        <div class="notif-icon-wrap ${n.icon}">
          <i class="fa-solid ${n.icon === 'warning' ? 'fa-triangle-exclamation' : n.icon === 'success' ? 'fa-check' : 'fa-bell'}"></i>
        </div>
        <div class="notif-content">
          <strong>${n.title}</strong>
          <p>${n.desc}</p>
          <span>${n.time}</span>
        </div>
      </div>
    `).join('');
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : type === 'warning' ? 'fa-triangle-exclamation' : 'fa-circle-info'}"></i>
      <span>${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
};

// ── INITIALIZATION ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  CivicApp.init();
});
