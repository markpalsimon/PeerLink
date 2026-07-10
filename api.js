// PeerLink API Client & Hybrid Database Driver
// Combines mockData.js LocalStorage logic with async Express backend sync.
// Exposes synchronous read cache so app.js runs smoothly without crashes.

const API_BASE = window.location.origin + '/api';

// =============================================
// GLOBAL METADATA CONSTANTS
// =============================================
// JHS Subjects (DepEd K-12)
const DEFAULT_SUBJECTS_JHS = [
  "Mathematics", "Science", "English", "Filipino",
  "Araling Panlipunan", "Technology and Livelihood Education",
  "MAPEH", "Edukasyon sa Pagpapakatao (EsP)"
];

// SHS Subjects (DepEd K-12)
const DEFAULT_SUBJECTS_SHS = [
  "Oral Communication", "Reading and Writing", "Komunikasyon at Pananaliksik",
  "General Mathematics", "Statistics and Probability", "Earth and Life Science",
  "Personal Development", "Media and Information Literacy",
  "Pre-Calculus", "Basic Calculus", "General Physics 1", "General Chemistry 1",
  "Empowerment Technologies", "Introduction to World Religions",
  "Creative Writing", "21st Century Literature",
  "Contemporary Arts from the Regions", "Physical Education and Health"
];

const DEFAULT_SUBJECTS = [...DEFAULT_SUBJECTS_JHS, ...DEFAULT_SUBJECTS_SHS];

// Legacy aliases — kept so existing code referencing DEFAULT_COURSES/DEFAULT_SKILLS doesn't break
const DEFAULT_COURSES = DEFAULT_SUBJECTS;
const DEFAULT_SKILLS  = DEFAULT_SUBJECTS;

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

const DEFAULT_USERS = [
  {
    id: "student_1",
    studentId: "100000000001",
    studentLrn: "100000000001",
    name: "Mark Vincent Palsimon",
    email: "palsimon_markvincent@plpasig.edu.ph",
    schoolName: "Rizal High School",
    program: "Rizal High School",
    educationLevel: "JHS",
    gradeLevel: "Grade 10",
    yearSection: "Grade 10",
    section: "Sampaguita",
    avatar: "👨‍💻",
    bio: "JHS student at Rizal High School. Looking for a study buddy to review Math and Science. I can help with English and Filipino.",
    subjectsNeedHelp: ["Mathematics", "Science"],
    courses: ["Mathematics", "Science"],
    subjectsCanHelp: ["English", "Filipino"],
    skills: {
      have: ["English", "Filipino"],
      want: ["Mathematics", "Science"]
    },
    studySchedule: {
      "Monday": [9, 10, 13, 14],
      "Wednesday": [9, 10, 13, 14]
    },
    schedule: {
      "Monday": [9, 10, 13, 14],
      "Wednesday": [9, 10, 13, 14]
    }
  },
  {
    id: "student_2",
    studentId: "100000000002",
    studentLrn: "100000000002",
    name: "John Kris Rivera",
    email: "rivera_johnkris@plpasig.edu.ph",
    schoolName: "Pasig City Science High School",
    program: "Pasig City Science High School",
    educationLevel: "SHS",
    gradeLevel: "Grade 11",
    yearSection: "Grade 11",
    section: "STEM-A",
    track: "Academic",
    strand: "STEM",
    avatar: "🧑‍💻",
    bio: "SHS STEM student. Interested in General Physics and Calculus. I can help with Empowerment Technologies and Statistics.",
    subjectsNeedHelp: ["General Physics 1", "Basic Calculus"],
    courses: ["General Physics 1", "Basic Calculus"],
    subjectsCanHelp: ["Empowerment Technologies", "Statistics and Probability"],
    skills: {
      have: ["Empowerment Technologies", "Statistics and Probability"],
      want: ["General Physics 1", "Basic Calculus"]
    },
    studySchedule: {
      "Tuesday": [8, 9, 10, 14, 15],
      "Thursday": [8, 9, 10, 14, 15]
    },
    schedule: {
      "Tuesday": [8, 9, 10, 14, 15],
      "Thursday": [8, 9, 10, 14, 15]
    }
  }
];

const INITIAL_LOGS = [
  { time: "2026-06-26 14:02", type: "system", message: "Matching engine weights recalculated successfully." },
  { time: "2026-06-26 14:15", type: "user", message: "New user Althea Joy Santos registered." },
  { time: "2026-06-26 14:22", type: "connection", message: "Mark Vincent Palsimon sent a study request to John Kris Rivera." },
  { time: "2026-06-26 14:30", type: "connection", message: "John Kris Rivera accepted study request from Mark Vincent Palsimon." }
];

// =============================================
// DATABASE CACHE STATE
// =============================================
const cache = {
  courses: [],
  skills: [],
  users: [],
  connections: [],
  chats: [],
  logs: [],
  meetings: []
};

let isOffline = true;

// =============================================
// HELPER: Fetch API Wrapper
// =============================================
async function apiFetch(path, options = {}) {
  const { timeout = 8000, ...fetchOptions } = options; // raised default to 8s for mobile networks
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(API_BASE + path, {
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      ...fetchOptions,
    });
    clearTimeout(id);

    // Safely parse: only call .json() when the server actually returned JSON.
    // If the server returns an HTML error page, response.json() would crash with
    // "Unexpected token '<'" — this guard prevents that.
    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const data = isJson ? await response.json() : { message: await response.text() };

    if (!response.ok) {
      throw new Error(data.message || data.error || `HTTP ${response.status}`);
    }
    return data;
  } catch (err) {
    clearTimeout(id);
    // Friendly message for timeout/network errors
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection and try again.');
    }
    throw err;
  }
}

// =============================================
// HELPER: Initialize Database & Sync
// =============================================
async function initializeDatabase() {
  console.log('🔄 PeerLink DB: Initializing cache from Express/PostgreSQL backend...');
  try {
    // Attempt to load metadata and resources from server
    const [courses, skills, subjects, users, connections, chats, logs, meetings] = await Promise.all([
      apiFetch('/courses'),
      apiFetch('/skills'),
      apiFetch('/subjects'),
      apiFetch('/users'),
      apiFetch('/connections'),
      apiFetch('/chats'),
      apiFetch('/logs'),
      apiFetch('/meetings')
    ]);

    // Populate memory cache
    cache.courses  = courses;
    cache.skills   = skills;
    cache.subjects = subjects; // JHS/SHS subjects (new primary)
    cache.users = users.map(u => ({ ...u, password: u.password || 'password123' })); // Add default password for client compatibility
    cache.connections = connections;
    
    // Chats already arrive with correct shape: { roomId, messages: [...] }
    cache.chats = Array.isArray(chats) ? chats : [];
    
    cache.logs = logs;
    cache.meetings = meetings;
    isOffline = false;
    console.log('✅ PeerLink DB: Online mode. PostgreSQL synced successfully!');
  } catch (err) {
    console.warn('⚠️ PeerLink DB: Server unreachable or database empty. Running in OFFLINE mode (LocalStorage Fallback).', err.message);
    isOffline = true;
    
    // Seed LocalStorage if first time running offline
    if (!localStorage.getItem("peerlink_initialized")) {
      localStorage.setItem("peerlink_courses", JSON.stringify(DEFAULT_COURSES));
      localStorage.setItem("peerlink_skills", JSON.stringify(DEFAULT_SKILLS));
      localStorage.setItem("peerlink_users", JSON.stringify(DEFAULT_USERS));
      localStorage.setItem("peerlink_logs", JSON.stringify(INITIAL_LOGS));
      localStorage.setItem("peerlink_connections", JSON.stringify([
        { id: 101, senderId: "student_1", receiverId: "student_2", status: "accepted", timestamp: Date.now() - 3600000 },
        { id: 102, senderId: "student_3", receiverId: "student_1", status: "pending", timestamp: Date.now() - 1800000 }
      ]));
      localStorage.setItem("peerlink_chats", JSON.stringify([
        {
          roomId: "student_1_student_2",
          messages: [
            { senderId: "student_1", senderName: "Mark Vincent Palsimon", text: "Hey John! Our schedules overlap on Fridays after 2 PM. Want to review Mobile Computing and Cisco?", time: "14:24" },
            { senderId: "student_2", senderName: "John Kris Rivera", text: "Sure Vincent! I really need help on Cisco networking. I can help you with Android layouts.", time: "14:29" }
          ]
        }
      ]));
      localStorage.setItem("peerlink_meetings", JSON.stringify([
        {
          id: 1,
          host_id: "student_1",
          guest_id: "student_2",
          topic: "Mobile Dev & Cisco Sync",
          course_name: "Mobile Computing & Android Dev",
          meeting_date: "2026-06-27",
          start_time: "14:00",
          end_time: "16:00",
          meeting_type: "Video Call",
          notes: "Review project layouts and cisco subnets."
        }
      ]));
      localStorage.setItem("peerlink_initialized", "true");
      console.log("🎒 PeerLink DB: LocalStorage seeded successfully.");
    }

    // Load LocalStorage into memory cache
    cache.courses = JSON.parse(localStorage.getItem("peerlink_courses")) || [];
    cache.skills = JSON.parse(localStorage.getItem("peerlink_skills")) || [];
    cache.users = JSON.parse(localStorage.getItem("peerlink_users")) || [];
    cache.connections = JSON.parse(localStorage.getItem("peerlink_connections")) || [];
    cache.chats = JSON.parse(localStorage.getItem("peerlink_chats")) || [];
    cache.logs = JSON.parse(localStorage.getItem("peerlink_logs")) || [];
    cache.meetings = JSON.parse(localStorage.getItem("peerlink_meetings")) || [];
  }
}

// =============================================
// DATABASE API INTERFACE (Synchronous Reads)
// =============================================
const db = {
  // --- Synchronous Reads (from Cache) ---
  getSubjects:    (level) => {
    const all = cache.subjects && cache.subjects.length > 0 ? cache.subjects : DEFAULT_SUBJECTS;
    if (!level) return all;
    return all.filter(s => !s.level || s.level === level || s.level === 'Both');
  },
  // Legacy aliases — kept for backward compatibility
  getCourses:     () => cache.courses && cache.courses.length > 0 ? cache.courses : DEFAULT_SUBJECTS,
  getSkills:      () => cache.skills  && cache.skills.length  > 0 ? cache.skills  : DEFAULT_SUBJECTS,
  getUsers:       () => cache.users || [],
  getConnections: () => cache.connections || [],
  getChats:       () => cache.chats || [],
  getLogs:        () => cache.logs && cache.logs.length > 0 ? cache.logs : INITIAL_LOGS,
  getMeetings:    () => cache.meetings || [],

  // --- Authentication (real hash verification on server, mock on client) ---
  login: async (emailOrId, password) => {
    if (isOffline) {
      const found = cache.users.find(u => u.email === emailOrId || u.studentId === emailOrId);
      if (!found) {
        throw new Error('Account not found. Check your Email/Student ID.');
      }
      if (found.isBanned) {
        throw new Error('Your account has been banned due to violation of community guidelines.');
      }
      if (found.password && found.password !== password) {
        throw new Error('Incorrect password.');
      }
      return found;
    } else {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        timeout: 10000, // 10s — bcrypt compare can take 1-3s
        body: JSON.stringify({ studentId: emailOrId, password })
      });
      if (res.success && res.user) {
        return res.user;
      } else {
        throw new Error(res.message || 'Login failed.');
      }
    }
  },

  registerSendOTP: async (userData) => {
    if (isOffline) return { success: true };
    return await apiFetch('/auth/register-send-otp', {
      method: 'POST',
      timeout: 30000, // 30s — SMTP email sending can take several seconds
      body: JSON.stringify(userData)
    });
  },

  registerVerifyOTP: async (email, code) => {
    if (isOffline) return { success: true, user: { id: 'mock_' + Date.now(), name: 'Offline User' } };
    return await apiFetch('/auth/register-verify-otp', {
      method: 'POST',
      timeout: 15000, // 15s — involves DB insert + bcrypt hashing
      body: JSON.stringify({ email, code })
    });
  },

  forgotPassword: async (email) => {
    if (isOffline) return { success: true };
    return await apiFetch('/auth/forgot-password', {
      method: 'POST',
      timeout: 30000, // 30s — SMTP email sending can take several seconds
      body: JSON.stringify({ email })
    });
  },

  verifyForgotOTP: async (email, code) => {
    if (isOffline) return { success: true };
    return await apiFetch('/auth/verify-forgot-otp', {
      method: 'POST',
      timeout: 10000,
      body: JSON.stringify({ email, code })
    });
  },

  resetPassword: async (email, code, newPassword) => {
    if (isOffline) return { success: true };
    return await apiFetch('/auth/reset-password', {
      method: 'POST',
      timeout: 15000, // 15s — involves bcrypt hashing for new password
      body: JSON.stringify({ email, code, newPassword })
    });
  },

  getOTP: async (email) => {
    if (isOffline) return { success: true, code: '123456' };
    return await apiFetch(`/auth/get-otp?email=${encodeURIComponent(email)}`, {
      timeout: 10000, // 10s — DB lookup may be slow on mobile/cloud
    });
  },
  
  // createMeeting: POSTs directly to server, returns meeting with real DB id + created_at
  createMeeting: async (meetingData) => {
    if (isOffline) {
      const m = { ...meetingData, id: Date.now(), created_at: Date.now() };
      cache.meetings = [...(cache.meetings || []), m];
      localStorage.setItem('peerlink_meetings', JSON.stringify(cache.meetings));
      return m;
    }
    try {
      const res = await apiFetch('/meetings', {
        method: 'POST',
        body: JSON.stringify(meetingData)
      });
      if (res && res.meeting) {
        const m = res.meeting;
        cache.meetings = [...(cache.meetings || []), m];
        localStorage.setItem('peerlink_meetings', JSON.stringify(cache.meetings));
        return m;
      }
      throw new Error('No meeting in response');
    } catch (err) {
      console.error('Failed to create meeting:', err.message);
      // Fallback: local only
      const m = { ...meetingData, id: Date.now(), created_at: Date.now() };
      cache.meetings = [...(cache.meetings || []), m];
      localStorage.setItem('peerlink_meetings', JSON.stringify(cache.meetings));
      return m;
    }
  },

  // saveMeetings: kept for scheduled meetings form
  saveMeetings: async (meetings) => {
    cache.meetings = meetings;
    localStorage.setItem('peerlink_meetings', JSON.stringify(meetings));
    if (isOffline) return;
    try {
      const serverMeets = await apiFetch('/meetings');
      const serverIds = new Set(serverMeets.map(m => String(m.id)));
      for (const m of meetings) {
        if (!serverIds.has(String(m.id))) {
          await apiFetch('/meetings', { method: 'POST', body: JSON.stringify(m) });
        }
      }
    } catch (err) {
      console.error('Failed to sync meetings to backend:', err.message);
    }
  },

  deleteMeeting: async (meetId) => {
    cache.meetings = cache.meetings.filter(m => String(m.id) !== String(meetId));
    localStorage.setItem('peerlink_meetings', JSON.stringify(cache.meetings));
    if (isOffline) return;
    try {
      await apiFetch(`/meetings/${meetId}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete meeting from backend:', err.message);
    }
  },

  // sendMessage: directly POSTs one message to the server — no race condition
  sendMessage: async (roomId, senderId, senderName, text) => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = { senderId, senderName, text, time: nowStr };

    // Optimistic: add to local cache immediately
    const idx = cache.chats.findIndex(c => c.roomId === roomId);
    if (idx === -1) {
      cache.chats.push({ roomId, messages: [newMsg] });
    } else {
      cache.chats[idx].messages.push(newMsg);
    }
    localStorage.setItem('peerlink_chats', JSON.stringify(cache.chats));

    if (isOffline) return newMsg;
    try {
      const saved = await apiFetch(`/chats/${roomId}`, {
        method: 'POST',
        body: JSON.stringify({ senderId, senderName, text })
      });
      // Update local copy with server-confirmed data
      const roomIdx = cache.chats.findIndex(c => c.roomId === roomId);
      if (roomIdx !== -1) {
        const msgs = cache.chats[roomIdx].messages;
        const pendingIdx = msgs.findLastIndex(m => m.senderId === senderId && m.text === text && !m.id);
        if (pendingIdx !== -1) msgs[pendingIdx] = { ...msgs[pendingIdx], ...saved };
      }
      localStorage.setItem('peerlink_chats', JSON.stringify(cache.chats));
      return saved;
    } catch (err) {
      console.error('Failed to send message to backend:', err.message);
      return newMsg;
    }
  },

  // --- Write-Through Sync Methods (updates cache + LocalStorage + pushes to Server) ---
  
  saveUsers: async (users) => {
    // Diff check: read previous cache from localStorage
    const oldUsersStr = localStorage.getItem("peerlink_users");
    const oldUsers = oldUsersStr ? JSON.parse(oldUsersStr) : [];

    // Clone the users array defensively so concurrent polling/mutations don't affect the save payload
    const clonedUsers = JSON.parse(JSON.stringify(users));

    cache.users = users;
    localStorage.setItem("peerlink_users", JSON.stringify(users));
    if (isOffline) return;

    for (let i = 0; i < clonedUsers.length; i++) {
      const u = clonedUsers[i];
      if (u.id === 'admin') continue; // Never overwrite admin via saveUsers

      // Check if this specific user object has actually changed
      const oldU = oldUsers.find(ou => ou.id === u.id);
      if (oldU && JSON.stringify(oldU) === JSON.stringify(u)) {
        continue; // Skip PUT if unchanged
      }

      try {
        // Exists -> Update details via PUT directly
        const res = await apiFetch(`/users/${u.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: u.name,
            bio: u.bio,
            avatar: u.avatar,
            birthday: u.birthday,
            address: u.address,
            contactInfo: u.contactInfo,
            // JHS/SHS fields
            schoolName: u.schoolName,
            gradeLevel: u.gradeLevel,
            section: u.section,
            track: u.track,
            strand: u.strand,
            subjectsNeedHelp: u.subjectsNeedHelp,
            subjectsCanHelp: u.subjectsCanHelp,
            studySchedule: u.studySchedule,
            // Legacy aliases for fallback
            program: u.schoolName || u.program,
            yearSection: u.gradeLevel || u.yearSection,
            courses: u.subjectsNeedHelp || u.courses,
            skills: u.subjectsCanHelp || u.skills,
            schedule: u.studySchedule || u.schedule
            // Do NOT pass password here - use db.changePassword instead
          })
        });
        if (res && res.user) {
          const liveIdx = cache.users.findIndex(usr => usr.id === u.id);
          if (liveIdx !== -1) {
            cache.users[liveIdx] = res.user;
            localStorage.setItem("peerlink_users", JSON.stringify(cache.users));
          }
        }
      } catch (err) {
        // Log sync failure and propagate the error so the UI can catch it and show error toasts
        console.error(`Failed to sync user ${u.name} to backend:`, err.message);
        throw new Error(`Failed to save changes: ${err.message}`);
      }
    }
  },

  // uploadAvatar: uploads a base64 image as profile picture
  uploadAvatar: async (userId, base64DataUrl) => {
    if (isOffline) {
      const idx = cache.users.findIndex(u => u.id === userId);
      if (idx !== -1) { cache.users[idx].avatar = base64DataUrl; }
      localStorage.setItem('peerlink_users', JSON.stringify(cache.users));
      return { success: true };
    }
    const res = await apiFetch(`/users/${userId}/avatar`, {
      method: 'POST',
      timeout: 30000,
      body: JSON.stringify({ avatarData: base64DataUrl })
    });
    if (res.success && res.user) {
      const idx = cache.users.findIndex(u => u.id === userId);
      if (idx !== -1) { cache.users[idx] = res.user; }
      localStorage.setItem('peerlink_users', JSON.stringify(cache.users));
    }
    return res;
  },

  // Delete a user from backend + cache + localStorage
  deleteUser: async (userId) => {
    cache.users = cache.users.filter(u => u.id !== userId);
    localStorage.setItem("peerlink_users", JSON.stringify(cache.users));
    if (isOffline) return;
    try {
      await apiFetch(`/users/${userId}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete user from backend:', err.message);
    }
  },

  // Change password - verifies current password on server then updates bcrypt hash
  changePassword: async (userId, currentPassword, newPassword) => {
    if (isOffline) {
      const user = cache.users.find(u => u.id === userId);
      if (!user) throw new Error('User not found.');
      if (user.password && user.password !== currentPassword) throw new Error('Current password is incorrect.');
      user.password = newPassword;
      localStorage.setItem("peerlink_users", JSON.stringify(cache.users));
      return;
    }
    // Find the user's studentId (the server login uses student_id or email)
    const userObj = cache.users.find(u => u.id === userId);
    const loginId = (userObj && userObj.studentId) ? userObj.studentId : userId;
    // Verify current password first via login endpoint
    let loginRes;
    try {
      loginRes = await apiFetch('/auth/login', {
        method: 'POST',
        timeout: 10000, // 10s — bcrypt compare can take 1-3s
        body: JSON.stringify({ studentId: loginId, password: currentPassword })
      });
    } catch (err) {
      throw new Error('Current password is incorrect.');
    }
    if (!loginRes || !loginRes.success) throw new Error('Current password is incorrect.');
    // Update the password hash on the server
    await apiFetch(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ password: newPassword })
    });
  },

  saveConnections: async (conns) => {
    const validUserIds = new Set((cache.users || []).map(u => u.id));
    const validConns = (conns || []).filter(c => validUserIds.has(c.senderId) && validUserIds.has(c.receiverId));

    cache.connections = validConns;
    localStorage.setItem("peerlink_connections", JSON.stringify(validConns));
    if (isOffline) return;

    for (const c of validConns) {
      try {
        // Get server connections
        const serverConns = await apiFetch('/connections');
        const existing = serverConns.find(sc => 
          sc.senderId === c.senderId && sc.receiverId === c.receiverId
        );

        if (!existing) {
          // Send connection request
          const res = await apiFetch('/connections', {
            method: 'POST',
            body: JSON.stringify({ senderId: c.senderId, receiverId: c.receiverId })
          });
          // If already accepted locally, update it
          if (c.status === 'accepted' && res.connection) {
            await apiFetch(`/connections/${res.connection.id}`, {
              method: 'PUT',
              body: JSON.stringify({ status: 'accepted' })
            });
          }
        } else if (existing.status !== c.status) {
          // Status changed, update server
          await apiFetch(`/connections/${existing.id}`, {
            method: 'PUT',
            body: JSON.stringify({ status: c.status })
          });
        }
      } catch (err) {
        console.error("Failed to sync connection request to backend:", err.message);
      }
    }
  },

  saveChats: async (chats) => {
    cache.chats = chats;
    localStorage.setItem("peerlink_chats", JSON.stringify(chats));
    if (isOffline) return;

    for (const room of chats) {
      try {
        // Get messages from server for this room
        const serverRoom = await apiFetch(`/chats/${room.roomId}`);
        const serverMsgs = serverRoom.messages || [];

        if (room.messages.length > serverMsgs.length) {
          const newMsgs = room.messages.slice(serverMsgs.length);
          for (const msg of newMsgs) {
            await apiFetch(`/chats/${room.roomId}`, {
              method: 'POST',
              body: JSON.stringify({
                senderId: msg.senderId,
                senderName: msg.senderName,
                text: msg.text
              })
            });
          }
        }
      } catch (err) {
        console.error("Failed to sync message to chat room on backend:", err.message);
      }
    }
  },

  addLog: async (type, message) => {
    const logs = cache.logs || [];
    const now = new Date();
    const timeStr = now.getFullYear() + "-" + 
                    String(now.getMonth() + 1).padStart(2, '0') + "-" + 
                    String(now.getDate()).padStart(2, '0') + " " + 
                    String(now.getHours()).padStart(2, '0') + ":" + 
                    String(now.getMinutes()).padStart(2, '0');
    
    logs.unshift({ time: timeStr, type, message });
    cache.logs = logs.slice(0, 100);
    localStorage.setItem("peerlink_logs", JSON.stringify(cache.logs));

    if (isOffline) return;
    try {
      await apiFetch('/logs', {
        method: 'POST',
        body: JSON.stringify({ type, message })
      });
    } catch (err) {
      console.error("Failed to sync log to backend:", err.message);
    }
  },

  sendHeartbeat: async (userId) => {
    if (isOffline) return { success: true };
    try {
      const res = await apiFetch('/users/heartbeat', {
        method: 'POST',
        body: JSON.stringify({ userId })
      });
      return res;
    } catch (err) {
      console.error('Failed to send heartbeat:', err.message);
      return { success: false, error: err.message };
    }
  },

  logout: async (userId) => {
    if (isOffline) return { success: true };
    try {
      return await apiFetch('/users/logout', {
        method: 'POST',
        body: JSON.stringify({ userId })
      });
    } catch (err) {
      console.error('Failed to notify logout:', err.message);
      return { success: false };
    }
  },

  markMessagesAsRead: async (roomId, userId) => {
    const room = cache.chats.find(c => c.roomId === roomId);
    if (room) {
      room.messages.forEach(m => {
        if (m.senderId !== userId) m.isRead = true;
      });
      localStorage.setItem("peerlink_chats", JSON.stringify(cache.chats));
    }
    if (isOffline) return;
    try {
      await apiFetch(`/chats/${roomId}/read`, {
        method: 'POST',
        body: JSON.stringify({ userId })
      });
    } catch (err) {
      console.error('Failed to mark read receipt:', err.message);
    }
  },

  getChatRoom: async (roomId) => {
    if (isOffline) {
      return cache.chats.find(c => c.roomId === roomId) || { roomId, messages: [] };
    }
    try {
      const serverRoom = await apiFetch(`/chats/${roomId}`);
      const mappedRoom = {
        roomId: serverRoom.roomId || roomId,
        messages: (serverRoom.messages || []).map(m => ({
          id: m.id,
          senderId: m.senderId,
          senderName: m.senderName,
          text: m.text,
          time: m.time,
          isRead: m.isRead
        }))
      };
      const idx = cache.chats.findIndex(c => c.roomId === roomId);
      if (idx !== -1) {
        cache.chats[idx] = mappedRoom;
      } else {
        cache.chats.push(mappedRoom);
      }
      localStorage.setItem("peerlink_chats", JSON.stringify(cache.chats));
      return mappedRoom;
    } catch (err) {
      console.error("Failed to fetch chat room:", err.message);
      return cache.chats.find(c => c.roomId === roomId) || { roomId, messages: [] };
    }
  },

  banUser: async (userId, banStatus) => {
    const users = cache.users;
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      users[idx].isBanned = banStatus;
      localStorage.setItem("peerlink_users", JSON.stringify(users));
    }
    if (isOffline) return;
    try {
      const endpoint = banStatus ? `/users/${userId}/ban` : `/users/${userId}/unban`;
      await apiFetch(endpoint, { method: 'POST' });
    } catch (err) {
      console.error('Failed to update ban status:', err.message);
    }
  },

  deleteConnection: async (connId) => {
    const conn = cache.connections.find(c => c.id === connId);
    if (conn) {
      const roomId1 = `${conn.senderId}_${conn.receiverId}`;
      const roomId2 = `${conn.receiverId}_${conn.senderId}`;
      cache.chats = cache.chats.filter(ch => ch.roomId !== roomId1 && ch.roomId !== roomId2);
      localStorage.setItem("peerlink_chats", JSON.stringify(cache.chats));
    }
    cache.connections = cache.connections.filter(c => c.id !== connId);
    localStorage.setItem("peerlink_connections", JSON.stringify(cache.connections));
    if (isOffline) return;
    try {
      await apiFetch(`/connections/${connId}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete connection:', err.message);
    }
  },

  updateCacheData: (users, connections, meetings) => {
    cache.users = users.map(u => ({ ...u, password: u.password || 'password123' }));
    cache.connections = connections;
    cache.meetings = meetings;
    localStorage.setItem("peerlink_users", JSON.stringify(cache.users));
    localStorage.setItem("peerlink_connections", JSON.stringify(cache.connections));
    localStorage.setItem("peerlink_meetings", JSON.stringify(cache.meetings));
  },

  sendSignal: async (meetingId, senderId, data) => {
    if (isOffline) return;
    try {
      await apiFetch(`/meetings/${meetingId}/signal`, {
        method: 'POST',
        body: JSON.stringify({ senderId, data })
      });
    } catch (err) {
      console.error('Failed to send signaling message:', err.message);
    }
  },

  getSignals: async (meetingId, userId) => {
    if (isOffline) return [];
    try {
      return await apiFetch(`/meetings/${meetingId}/signal?userId=${userId}`);
    } catch (err) {
      console.error('Failed to fetch signals:', err.message);
      return [];
    }
  },

  acceptInvitation: async (meetingId, userId) => {
    if (isOffline) return;
    try {
      await apiFetch(`/meetings/${meetingId}/accept-invitation`, {
        method: 'POST',
        body: JSON.stringify({ userId })
      });
    } catch (err) {
      console.error('Failed to accept invitation:', err.message);
    }
  },

  declineInvitation: async (meetingId) => {
    if (isOffline) return;
    try {
      await apiFetch(`/meetings/${meetingId}/decline-invitation`, { method: 'POST' });
    } catch (err) {
      console.error('Failed to decline invitation:', err.message);
    }
  },

  sendJoinRequest: async (meetingId, userId, name) => {
    if (isOffline) return;
    try {
      await apiFetch(`/meetings/${meetingId}/join-request`, {
        method: 'POST',
        body: JSON.stringify({ userId, name })
      });
    } catch (err) {
      console.error('Failed to send join request:', err.message);
    }
  },

  getJoinRequests: async (meetingId) => {
    if (isOffline) return [];
    try {
      return await apiFetch(`/meetings/${meetingId}/join-requests`);
    } catch (err) {
      console.error('Failed to fetch join requests:', err.message);
      return [];
    }
  },

  approveJoinRequest: async (meetingId, userId, action) => {
    if (isOffline) return;
    try {
      await apiFetch(`/meetings/${meetingId}/approve-request`, {
        method: 'POST',
        body: JSON.stringify({ userId, action })
      });
    } catch (err) {
      console.error('Failed to approve join request:', err.message);
    }
  },

  removeParticipant: async (meetingId, userId) => {
    if (isOffline) return;
    try {
      await apiFetch(`/meetings/${meetingId}/remove-participant`, {
        method: 'POST',
        body: JSON.stringify({ userId })
      });
    } catch (err) {
      console.error('Failed to remove participant:', err.message);
    }
  },

  // Delete a single message for everyone (unsend) — sender only
  deleteMessage: async (roomId, messageId, senderId) => {
    // Remove from local cache
    const idx = cache.chats.findIndex(c => c.roomId === roomId);
    if (idx !== -1) {
      cache.chats[idx].messages = cache.chats[idx].messages.filter(m => String(m.id) !== String(messageId));
      localStorage.setItem('peerlink_chats', JSON.stringify(cache.chats));
    }
    if (isOffline) return { success: true };
    try {
      return await apiFetch(`/chats/${roomId}/messages/${messageId}`, {
        method: 'DELETE',
        body: JSON.stringify({ senderId })
      });
    } catch (err) {
      console.error('Failed to delete message on backend:', err.message);
      return { success: true }; // already removed from local cache
    }
  },

  // Delete a message only for the current user (local only — hides it from view)
  deleteForMe: (roomId, messageId, userId) => {
    const key = `peerlink_deleted_msgs_${userId}`;
    const deleted = JSON.parse(localStorage.getItem(key) || '[]');
    if (!deleted.includes(String(messageId))) deleted.push(String(messageId));
    localStorage.setItem(key, JSON.stringify(deleted));
    return { success: true };
  },

  // Get the set of locally-deleted message IDs for a user
  getDeletedForMe: (userId) => {
    const key = `peerlink_deleted_msgs_${userId}`;
    return new Set(JSON.parse(localStorage.getItem(key) || '[]'));
  },

  // Delete the entire conversation (both sides)
  deleteConversation: async (roomId) => {
    // Remove from local cache
    cache.chats = cache.chats.filter(c => c.roomId !== roomId);
    localStorage.setItem('peerlink_chats', JSON.stringify(cache.chats));
    if (isOffline) return { success: true };
    try {
      return await apiFetch(`/chats/${roomId}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete conversation on backend:', err.message);
      return { success: true };
    }
  },

  // Get online status of users (batch check via server)
  getOnlineStatuses: async () => {
    if (isOffline) return new Set();
    try {
      const res = await apiFetch('/users/online-statuses');
      return new Set((res.onlineIds || []).map(id => String(id)));
    } catch (err) {
      console.error('Failed to fetch online statuses:', err.message);
      return new Set();
    }
  }
};

// =============================================
// SESSION MANAGEMENT (Offline-ready)
// =============================================
const session = {
  save: (userId) => localStorage.setItem('peerlink_session_user', userId),
  get:  ()       => localStorage.getItem('peerlink_session_user'),
  clear: ()      => localStorage.removeItem('peerlink_session_user')
};
