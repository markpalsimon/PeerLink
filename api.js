// PeerLink API Client & Hybrid Database Driver
// Combines mockData.js LocalStorage logic with async Express backend sync.
// Exposes synchronous read cache so app.js runs smoothly without crashes.

const API_BASE = window.location.origin + '/api';

// =============================================
// GLOBAL METADATA CONSTANTS
// =============================================
const DEFAULT_COURSES = [
  "Web Development 2 (SPA)",
  "Software Engineering 1",
  "Database Management Systems 2",
  "Information Assurance & Security",
  "Mobile Computing & Android Dev",
  "Technopreneurship & Ethics",
  "Quantitative Methods with Modeling",
  "Discrete Mathematics",
  "Computer Networks & Cisco 2",
  "Data Structures & Algorithms"
];

const DEFAULT_SKILLS = [
  "HTML / CSS Styling",
  "JavaScript & Web Tech",
  "React / Frontend Frameworks",
  "Node.js Backend / API Design",
  "SQL & Database Querying",
  "Python & Machine Learning",
  "Git & Collaborative Work",
  "UI/UX Design in Figma",
  "Technical Writing & Thesis Editing",
  "Public Speaking & Presentation",
  "Java & Android Application Dev"
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

const DEFAULT_USERS = [
  {
    id: "student_1",
    studentId: "24-87654",
    name: "Mark Vincent Palsimon",
    email: "24-87654@plpasig.edu.ph",
    program: "BSIT",
    yearSection: "BSIT 3A",
    avatar: "👨‍💻",
    bio: "Co-author of PeerLink. Focuses on full-stack web dev and database design. Looking for partner to study Advanced Software Engineering concepts and Cisco networking.",
    courses: ["Web Development 2 (SPA)", "Software Engineering 1", "Database Management Systems 2", "Information Assurance & Security"],
    skills: {
      have: ["JavaScript & Web Tech", "React / Frontend Frameworks", "SQL & Database Querying", "Git & Collaborative Work"],
      want: ["Computer Networks & Cisco 2", "UI/UX Design in Figma", "Python & Machine Learning"]
    },
    schedule: {
      "Monday": [9, 10, 13, 14, 15],
      "Wednesday": [9, 10, 13, 14, 15],
      "Friday": [10, 11, 14, 15, 16, 17],
      "Saturday": [9, 10, 11, 12]
    }
  },
  {
    id: "student_2",
    studentId: "23-01108",
    name: "John Kris Rivera",
    email: "23-01108@plpasig.edu.ph",
    program: "BSIT",
    yearSection: "BSIT 3A",
    avatar: "🧑‍💻",
    bio: "Co-author of PeerLink. Highly interested in Mobile computing, Android development, and UI/UX design. Let's design premium mobile layouts together!",
    courses: ["Software Engineering 1", "Database Management Systems 2", "Mobile Computing & Android Dev", "Technopreneurship & Ethics"],
    skills: {
      have: ["Java & Android Application Dev", "UI/UX Design in Figma", "HTML / CSS Styling"],
      want: ["Node.js Backend / API Design", "SQL & Database Querying", "Technical Writing & Thesis Editing"]
    },
    schedule: {
      "Tuesday": [8, 9, 10, 14, 15, 16],
      "Thursday": [8, 9, 10, 14, 15, 16],
      "Friday": [9, 10, 11, 14, 15, 16],
      "Saturday": [13, 14, 15, 16, 17]
    }
  },
  {
    id: "student_3",
    studentId: "23-01109",
    name: "Francis Carl Eguerra",
    email: "23-01109@plpasig.edu.ph",
    program: "BSIT",
    yearSection: "BSIT 3A",
    avatar: "✍️",
    bio: "Co-author of PeerLink. Specialized in Technical Writing, document formatting, and system analysis. Happy to help you clean up research documentation in exchange for coding tips.",
    courses: ["Software Engineering 1", "Database Management Systems 2", "Technopreneurship & Ethics", "Quantitative Methods with Modeling"],
    skills: {
      have: ["Technical Writing & Thesis Editing", "Public Speaking & Presentation", "Git & Collaborative Work"],
      want: ["JavaScript & Web Tech", "SQL & Database Querying", "React / Frontend Frameworks"]
    },
    schedule: {
      "Monday": [10, 11, 12, 14, 15],
      "Tuesday": [13, 14, 15, 16],
      "Thursday": [13, 14, 15, 16],
      "Friday": [10, 11, 12, 14, 15]
    }
  },
  {
    id: "student_4",
    studentId: "23-01110",
    name: "Althea Joy Santos",
    email: "23-01110@plpasig.edu.ph",
    program: "BSIT",
    yearSection: "BSIT 3B",
    avatar: "👩‍💻",
    bio: "Web developer enthusiast. Working on a personal ecommerce site. Looking for a study buddy for database modeling and setting up SQL constraints.",
    courses: ["Web Development 2 (SPA)", "Database Management Systems 2", "Data Structures & Algorithms"],
    skills: {
      have: ["HTML / CSS Styling", "JavaScript & Web Tech", "React / Frontend Frameworks"],
      want: ["SQL & Database Querying", "Node.js Backend / API Design", "Git & Collaborative Work"]
    },
    schedule: {
      "Monday": [9, 10, 11, 13, 14],
      "Tuesday": [9, 10, 11, 15, 16],
      "Wednesday": [9, 10, 11, 13, 14],
      "Friday": [13, 14, 15, 16]
    }
  },
  {
    id: "student_5",
    studentId: "23-01111",
    name: "Christian Dave Reyes",
    email: "23-01111@plpasig.edu.ph",
    program: "BSIT",
    yearSection: "BSIT 3B",
    avatar: "🤖",
    bio: "Interested in machine learning and Python. Struggling a bit with Mobile Computing (Android studio). Willing to tutor Python/Math in exchange for Android help.",
    courses: ["Mobile Computing & Android Dev", "Quantitative Methods with Modeling", "Discrete Mathematics"],
    skills: {
      have: ["Python & Machine Learning", "SQL & Database Querying", "Public Speaking & Presentation"],
      want: ["Java & Android Application Dev", "UI/UX Design in Figma", "Git & Collaborative Work"]
    },
    schedule: {
      "Wednesday": [13, 14, 15, 16, 17, 18],
      "Thursday": [10, 11, 12, 14, 15, 16],
      "Friday": [14, 15, 16, 17, 18],
      "Saturday": [10, 11, 12, 13, 14]
    }
  },
  {
    id: "student_6",
    studentId: "23-01112",
    name: "Patricia Mae Cruz",
    email: "23-01112@plpasig.edu.ph",
    program: "BSCS",
    yearSection: "BSCS 3A",
    avatar: "🧮",
    bio: "Computer Science major focusing on core algorithms and discrete structures. Need to review networking and information security. Let's study math!",
    courses: ["Discrete Mathematics", "Data Structures & Algorithms", "Information Assurance & Security"],
    skills: {
      have: ["Python & Machine Learning", "SQL & Database Querying", "Git & Collaborative Work"],
      want: ["Computer Networks & Cisco 2", "React / Frontend Frameworks", "Technical Writing & Thesis Editing"]
    },
    schedule: {
      "Monday": [13, 14, 15, 16],
      "Tuesday": [10, 11, 12, 14, 15],
      "Wednesday": [13, 14, 15, 16],
      "Thursday": [10, 11, 12, 14, 15],
      "Saturday": [9, 10, 11, 12, 13]
    }
  },
  {
    id: "student_7",
    studentId: "23-01113",
    name: "Jerome Gabriel Aquino",
    email: "23-01113@plpasig.edu.ph",
    program: "BSCS",
    yearSection: "BSCS 3B",
    avatar: "🕸️",
    bio: "Working on backends using Node.js and SQL. I have a lot of free time on weekends. Let's collaborate and build project prototypes.",
    courses: ["Database Management Systems 2", "Data Structures & Algorithms", "Computer Networks & Cisco 2"],
    skills: {
      have: ["Node.js Backend / API Design", "SQL & Database Querying", "Git & Collaborative Work", "Java & Android Application Dev"],
      want: ["UI/UX Design in Figma", "React / Frontend Frameworks", "Public Speaking & Presentation"]
    },
    schedule: {
      "Friday": [15, 16, 17, 18, 19],
      "Saturday": [8, 9, 10, 11, 12, 13, 14, 15, 16, 17]
    }
  },
  {
    id: "student_8",
    studentId: "24-02201",
    name: "Lhea Coleen Garcia",
    email: "24-02201@plpasig.edu.ph",
    program: "BSIT",
    yearSection: "BSIT 2A",
    avatar: "🎨",
    bio: "Second year student eager to learn frontend web dev and Figma. Can help with basic HTML/CSS and slide presentations.",
    courses: ["Discrete Mathematics", "Data Structures & Algorithms"],
    skills: {
      have: ["HTML / CSS Styling", "UI/UX Design in Figma", "Public Speaking & Presentation"],
      want: ["JavaScript & Web Tech", "Git & Collaborative Work", "SQL & Database Querying"]
    },
    schedule: {
      "Monday": [8, 9, 10, 11],
      "Tuesday": [13, 14, 15],
      "Wednesday": [8, 9, 10, 11],
      "Thursday": [13, 14, 15]
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
  const { timeout = 2000, ...fetchOptions } = options; // allow custom timeout, default 2s
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(API_BASE + path, {
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      ...fetchOptions,
    });
    clearTimeout(id);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.error || `HTTP ${response.status}`);
    }
    return data;
  } catch (err) {
    clearTimeout(id);
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
    const [courses, skills, users, connections, chats, logs, meetings] = await Promise.all([
      apiFetch('/courses'),
      apiFetch('/skills'),
      apiFetch('/users'),
      apiFetch('/connections'),
      apiFetch('/chats'),
      apiFetch('/logs'),
      apiFetch('/meetings')
    ]);

    // Populate memory cache
    cache.courses = courses;
    cache.skills = skills;
    cache.users = users.map(u => ({ ...u, password: u.password || 'password123' })); // Add default password for client compatibility
    cache.connections = connections;
    
    // Map chats format if needed
    cache.chats = chats.map(room => ({
      roomId: room.room_id,
      messages: room.messages || []
    }));
    
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
  getCourses:     () => cache.courses && cache.courses.length > 0 ? cache.courses : DEFAULT_COURSES,
  getSkills:      () => cache.skills && cache.skills.length > 0 ? cache.skills : DEFAULT_SKILLS,
  getUsers:       () => cache.users && cache.users.length > 0 ? cache.users : DEFAULT_USERS,
  getConnections: () => cache.connections,
  getChats:       () => cache.chats,
  getLogs:        () => cache.logs && cache.logs.length > 0 ? cache.logs : INITIAL_LOGS,
  getMeetings:    () => cache.meetings,

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
    return await apiFetch(`/auth/get-otp?email=${encodeURIComponent(email)}`);
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
    cache.users = users;
    localStorage.setItem("peerlink_users", JSON.stringify(users));
    if (isOffline) return;

    for (const u of users) {
      if (u.id === 'admin') continue; // Never overwrite admin via saveUsers
      try {
        // Quick check to see if user exists on backend
        await apiFetch(`/users/${u.id}`);
        // Exists -> Update details via PUT
        await apiFetch(`/users/${u.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: u.name,
            bio: u.bio,
            program: u.program,
            yearSection: u.yearSection,
            avatar: u.avatar,
            courses: u.courses,
            skills: u.skills,
            schedule: u.schedule
            // Do NOT pass password here - use db.changePassword instead
          })
        });
      } catch (err) {
        // Not Found -> Register them
        try {
          await apiFetch('/auth/register', {
            method: 'POST',
            body: JSON.stringify({
              name: u.name,
              studentId: u.studentId,
              email: u.email,
              password: u.password || 'password123',
              program: u.program,
              yearLevel: u.yearSection.split(" ").slice(-1)[0] || '3rd Year',
              courses: u.courses,
              skills: u.skills,
              schedule: u.schedule
            })
          });
        } catch (regErr) {
          console.error("Failed to register user on backend sync:", regErr.message);
        }
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
