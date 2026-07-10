// PeerLink Logic Controller (Tailwind & Storyboard Edition)

// TOAST NOTIFICATION SYSTEM
// Types: 'success' | 'error' | 'warning' | 'info'

function showToast(message, type = 'success', duration = 3500) {
  const stack = document.getElementById('toast-stack');
  if (!stack) return;

  const configs = {
    success: { icon: '✅', bg: 'bg-white', border: 'border-emerald-200', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', bar: 'bg-emerald-500', label: 'text-emerald-700' },
    error:   { icon: '❌', bg: 'bg-white', border: 'border-red-200',     iconBg: 'bg-red-50',     iconColor: 'text-red-600',     bar: 'bg-red-500',     label: 'text-red-700' },
    warning: { icon: '⚠️', bg: 'bg-white', border: 'border-amber-200',   iconBg: 'bg-amber-50',   iconColor: 'text-amber-600',   bar: 'bg-amber-500',   label: 'text-amber-700' },
    info:    { icon: 'ℹ️', bg: 'bg-white', border: 'border-blue-200',    iconBg: 'bg-blue-50',    iconColor: 'text-blue-600',    bar: 'bg-blue-500',    label: 'text-blue-700' },
  };
  const c = configs[type] || configs.info;

  const toast = document.createElement('div');
  toast.className = `pointer-events-auto flex items-center gap-3 ${c.bg} border ${c.border} rounded-2xl shadow-xl px-4 py-3 min-w-[280px] max-w-xs relative overflow-hidden translate-x-20 opacity-0 transition-all duration-300`;
  toast.innerHTML = `
    <div class="w-9 h-9 shrink-0 ${c.iconBg} rounded-xl flex items-center justify-center text-lg">${c.icon}</div>
    <p class="text-sm font-medium text-slate-800 leading-snug flex-1">${message}</p>
    <button onclick="this.parentElement.remove()" class="shrink-0 text-slate-300 hover:text-slate-500 transition-colors text-base leading-none">✕</button>
    <div class="toast-progress absolute bottom-0 left-0 h-[3px] ${c.bar} rounded-full" style="width:100%;transition:width ${duration}ms linear;"></div>
  `;

  stack.appendChild(toast);

  // Animate in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.classList.remove('translate-x-20', 'opacity-0');
    });
  });

  // Start progress bar shrink
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const bar = toast.querySelector('.toast-progress');
      if (bar) bar.style.width = '0%';
    });
  });

  // Auto remove
  setTimeout(() => {
    toast.classList.add('translate-x-20', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ============================================================
// CUSTOM CONFIRMATION MODAL
// Usage: showConfirm({ title, message, type, okLabel }) → Promise<boolean>
// Types: 'danger' | 'warning' | 'info'
// ============================================================
function showConfirm({ title = 'Are you sure?', message = '', type = 'danger', okLabel = 'Confirm' } = {}) {
  return new Promise((resolve) => {
    const overlay  = document.getElementById('confirm-modal-overlay');
    const box      = document.getElementById('confirm-modal-box');
    const iconEl   = document.getElementById('confirm-modal-icon');
    const titleEl  = document.getElementById('confirm-modal-title');
    const msgEl    = document.getElementById('confirm-modal-message');
    const cancelBtn= document.getElementById('confirm-modal-cancel');
    const okBtn    = document.getElementById('confirm-modal-ok');

    const configs = {
      danger:  { icon: '🗑️', iconBg: 'bg-red-50',    okBg: 'bg-red-500 hover:bg-red-600' },
      warning: { icon: '⚠️', iconBg: 'bg-amber-50',  okBg: 'bg-amber-500 hover:bg-amber-600' },
      info:    { icon: 'ℹ️', iconBg: 'bg-blue-50',   okBg: 'bg-brand-purple hover:bg-indigo-700' },
    };
    const c = configs[type] || configs.danger;

    iconEl.className = `w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner ${c.iconBg}`;
    iconEl.textContent = c.icon;
    titleEl.textContent = title;
    msgEl.textContent   = message;
    okBtn.className     = `flex-1 font-bold py-2.5 rounded-xl text-sm text-white transition-all shadow-sm ${c.okBg}`;
    okBtn.textContent   = okLabel;

    // Show overlay
    overlay.classList.remove('hidden');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        box.classList.remove('scale-95', 'opacity-0');
        box.classList.add('scale-100', 'opacity-100');
      });
    });

    function close(result) {
      box.classList.remove('scale-100', 'opacity-100');
      box.classList.add('scale-95', 'opacity-0');
      setTimeout(() => { overlay.classList.add('hidden'); }, 200);
      // Clean up listeners
      okBtn.removeEventListener('click', onOk);
      cancelBtn.removeEventListener('click', onCancel);
      overlay.removeEventListener('click', onOverlay);
      resolve(result);
    }

    function onOk() { close(true); }
    function onCancel() { close(false); }
    function onOverlay(e) { if (e.target === overlay) close(false); }

    okBtn.addEventListener('click', onOk);
    cancelBtn.addEventListener('click', onCancel);
    overlay.addEventListener('click', onOverlay);
  });
}


// ============================================================
// RESPONSIVE / MOBILE NAVIGATION HELPERS
// ============================================================

/** Toggle the public landing-page hamburger dropdown menu */
window.toggleMobileMenu = function() {
  const menu = document.getElementById('mobile-menu');
  const line1 = document.getElementById('ham-line1');
  const line2 = document.getElementById('ham-line2');
  const line3 = document.getElementById('ham-line3');
  if (!menu) return;
  const isOpen = !menu.classList.contains('hidden');
  menu.classList.toggle('hidden', isOpen);
  // Animate hamburger → X
  if (!isOpen) {
    if (line1) { line1.style.transform = 'translateY(8px) rotate(45deg)'; }
    if (line2) { line2.style.opacity = '0'; }
    if (line3) { line3.style.transform = 'translateY(-8px) rotate(-45deg)'; }
  } else {
    if (line1) { line1.style.transform = ''; }
    if (line2) { line2.style.opacity = '1'; }
    if (line3) { line3.style.transform = ''; }
  }
};

/** Open the system sidebar on mobile */
window.toggleMobileSidebar = function() {
  const sidebar  = document.getElementById('main-sidebar');
  const overlay  = document.getElementById('sidebar-overlay');
  if (!sidebar) return;
  const isOpen = sidebar.classList.contains('sidebar-open');
  if (isOpen) {
    sidebar.classList.remove('sidebar-open');
    if (overlay) overlay.classList.add('hidden');
    document.body.classList.remove('sidebar-open-body');
  } else {
    sidebar.classList.add('sidebar-open');
    if (overlay) overlay.classList.remove('hidden');
    document.body.classList.add('sidebar-open-body');
  }
};

/** Close the system sidebar on mobile (called from overlay click) */
window.closeMobileSidebar = function() {
  const sidebar = document.getElementById('main-sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (sidebar) sidebar.classList.remove('sidebar-open');
  if (overlay) overlay.classList.add('hidden');
  document.body.classList.remove('sidebar-open-body');
};

/** Update the mobile bottom navigation active button */
window.updateMobileBottomNav = function(paneId) {
  const map = {
    dashboard:     'mob-nav-dashboard',
    matches:       'mob-nav-matches',
    messages:      'mob-nav-messages',
    meetings:      'mob-nav-meetings',
    notifications: 'mob-nav-notifications',
  };
  document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  const activeId = map[paneId];
  if (activeId) {
    const btn = document.getElementById(activeId);
    if (btn) btn.classList.add('active');
  }
};

/** Show the mobile bottom nav bar (called when a user logs in) */
window.showMobileBottomNav = function() {
  const nav = document.getElementById('mobile-bottom-nav');
  if (nav) {
    if (window.innerWidth < 1024) {
      nav.classList.remove('hidden');
    } else {
      nav.classList.add('hidden');
    }
  }
};

/** Hide the mobile bottom nav bar (called on logout) */
window.hideMobileBottomNav = function() {
  const nav = document.getElementById('mobile-bottom-nav');
  if (nav) nav.classList.add('hidden');
};

document.addEventListener("DOMContentLoaded", async () => {
  // Apply saved dark mode theme immediately
  if (localStorage.getItem("peerlink_theme") === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }

  // Ensure DB is initialized
  if (typeof initializeDatabase === "function") {
    try {
      await initializeDatabase();
    } catch (err) {
      console.error("Database initialization failed:", err);
    }
  }

  // --- STATE ---
  let currentUser = null;
  let activePublicView = "landing";
  let activeSystemView = "dashboard";
  let activeChatCollabId = null;
  let registrationStep = 1;
  let inCallMeeting = null; // Stores current active meeting when in a call
  let syncIntervalId = null;
  let notifiedMeetings = new Set();
  
  // Dynamic weights for recommendation scoring (persisted in LocalStorage)
  let matchWeights = JSON.parse(localStorage.getItem("peerlink_weights")) || {
    course: 40,
    skill: 30,
    schedule: 30
  };
  
  // Registration Form temporary state
  let regData = {
    name: "",
    studentLrn: "",
    studentId: "", // alias
    email: "",
    password: "",
    schoolName: "",
    educationLevel: "",
    gradeLevel: "",
    section: "",
    track: null,
    strand: null,
    subjectsNeedHelp: [],
    subjectsCanHelp: [],
    studySchedule: {},
    // Legacy aliases
    program: "",
    yearLevel: "",
    courses: [],
    skills: { have: [], want: [] },
    schedule: {} // Day -> [hours]
  };

  // --- SELECTORS ---
  const pubContainer = document.getElementById("public-container");
  const sysContainer = document.getElementById("system-container");
  const publicHeader = document.getElementById("public-header");
  const publicFooter = document.getElementById("public-footer");

  // Navigation Links
  const sideLinks = {
    dashboard: document.getElementById("side-link-dashboard"),
    profile: document.getElementById("side-link-profile"),
    schedule: document.getElementById("side-link-schedule"),
    skills: document.getElementById("side-link-skills"),
    matches: document.getElementById("side-link-matches"),
    meetings: document.getElementById("side-link-meetings"),
    messages: document.getElementById("side-link-messages"),
    notifications: document.getElementById("side-link-notifications"),
    admin: document.getElementById("side-link-admin"),
    settings: document.getElementById("side-link-settings")
  };

  const sysPanes = {
    dashboard: document.getElementById("sys-pane-dashboard"),
    profile: document.getElementById("sys-pane-profile"),
    schedule: document.getElementById("sys-pane-schedule"),
    skills: document.getElementById("sys-pane-skills"),
    matches: document.getElementById("sys-pane-matches"),
    meetings: document.getElementById("sys-pane-meetings"),
    messages: document.getElementById("sys-pane-messages"),
    notifications: document.getElementById("sys-pane-notifications"),
    admin: document.getElementById("sys-pane-admin"),
    settings: document.getElementById("sys-pane-settings")
  };

  // --- 1. CORE ROUTING ---
  
  function init() {
    // Check if session exists
    const savedUserId = localStorage.getItem("peerlink_session_user");
    if (savedUserId) {
      const user = db.getUsers().find(u => u.id === savedUserId);
      if (user || savedUserId === 'admin') {
        const savedPane = localStorage.getItem("peerlink_active_pane");
        const targetUser = user || { id: "admin", name: "Administrator", role: "admin", avatar: "🛡️" };
        if (targetUser.isAdmin || targetUser.role === 'admin' || targetUser.id === 'admin') {
          loginAsAdmin(targetUser, savedPane || "admin");
          const savedAdminTab = localStorage.getItem("peerlink_active_admin_tab");
          if (savedAdminTab) {
            showAdminTab(savedAdminTab);
          }
        } else {
          loginAsUser(targetUser, savedPane || "dashboard");
        }
        return;
      }
    }

    // Restore last active public view on refresh
    const savedPublicView = localStorage.getItem("peerlink_active_public_view");
    if (savedPublicView) {
      if (savedPublicView === "register") {
        const savedRegStep = localStorage.getItem("peerlink_registration_step");
        const savedRegData = localStorage.getItem("peerlink_registration_data");
        if (savedRegStep && savedRegData) {
          try {
            registrationStep = parseInt(savedRegStep);
            regData = JSON.parse(savedRegData);
            showPublicView("register");
            
            // Populate inputs on step 1 if values exist in restored data
            if (regData.name) {
              const nameInput = document.getElementById("reg-name");
              if (nameInput) nameInput.value = regData.name;
            }
            if (regData.studentId) {
              const studentIdInput = document.getElementById("reg-student-id");
              if (studentIdInput) studentIdInput.value = regData.studentId;
            }
            if (regData.email) {
              const emailInput = document.getElementById("reg-email");
              if (emailInput) emailInput.value = regData.email;
              const emailLabel = document.getElementById('reg-otp-email-label');
              if (emailLabel) emailLabel.textContent = regData.email;
            }
            if (regData.password) {
              const passwordInput = document.getElementById("reg-password");
              const confirmInput = document.getElementById("reg-password-confirm");
              if (passwordInput) passwordInput.value = regData.password;
              if (confirmInput) confirmInput.value = regData.password;
            }
            if (regData.studentLrn) {
              const lrnInput = document.getElementById('reg-student-lrn');
              if (lrnInput) lrnInput.value = regData.studentLrn;
            }
            if (regData.educationLevel) {
              selectEducationLevel(regData.educationLevel);
            }
            if (regData.schoolName) {
              const sn = document.getElementById('reg-school-name');
              if (sn) sn.value = regData.schoolName;
            }
            if (regData.gradeLevel) {
              const gl = document.getElementById('reg-grade-level');
              if (gl) gl.value = regData.gradeLevel;
            }
            if (regData.section) {
              const sec = document.getElementById('reg-section');
              if (sec) sec.value = regData.section;
            }
            if (regData.track) {
              const tr = document.getElementById('reg-track');
              if (tr) { tr.value = regData.track; updateStrandOptions(); }
            }
            if (regData.strand) {
              const st = document.getElementById('reg-strand');
              if (st) st.value = regData.strand;
            }
            
            renderRegWizard();
            return;
          } catch (e) {
            console.warn("Failed to restore registration state:", e);
          }
        }
      } else {
        showPublicView(savedPublicView);
        // If they refreshed on a scrolled section (Features, How it works, About)
        const savedSection = localStorage.getItem("peerlink_active_public_section");
        if (savedSection && savedPublicView === 'landing') {
          requestAnimationFrame(() => requestAnimationFrame(() => {
            const element = document.getElementById(savedSection);
            if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }));
        }
        return;
      }
    }
    
    showPublicView("landing");
  }

  window.showPublicView = function(viewId) {
    activePublicView = viewId;
    localStorage.setItem("peerlink_active_public_view", viewId);
    if (viewId !== 'landing') {
      localStorage.removeItem("peerlink_active_public_section");
    }
    pubContainer.classList.remove("hidden");
    sysContainer.classList.add("hidden");
    publicHeader.classList.remove("hidden");
    publicFooter.classList.remove("hidden");

    // Show AI chat widget on public pages
    const chatToggle = document.getElementById('ai-chat-toggle');
    if (chatToggle) chatToggle.classList.remove('hidden');

    document.querySelectorAll(".pub-view").forEach(view => {
      if (view.id === `pub-view-${viewId}`) {
        view.classList.remove("hidden");
      } else {
        view.classList.add("hidden");
      }
    });

    if (viewId === "register") {
      const savedRegStep = localStorage.getItem("peerlink_registration_step");
      const savedRegData = localStorage.getItem("peerlink_registration_data");
      if (savedRegStep && savedRegData) {
        registrationStep = parseInt(savedRegStep);
        regData = JSON.parse(savedRegData);
      } else {
        registrationStep = 1;
        regData = {
          name: '', studentLrn: '', email: '', password: '',
          schoolName: '', educationLevel: '', gradeLevel: '', section: '',
          track: null, strand: null,
          subjectsNeedHelp: [], subjectsCanHelp: [],
          studySchedule: {},
          // legacy aliases used by schedule drag functions
          schedule: {}
        };
      }
      renderRegWizard();
    }
  };

  window.scrollToSection = function(sectionId) {
    localStorage.setItem("peerlink_active_public_section", sectionId);
    // If the public container is visible and landing is active, just scroll
    if (activePublicView === 'landing' && !pubContainer.classList.contains('hidden')) {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      // Show landing first, then scroll after render
      showPublicView('landing');
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const element = document.getElementById(sectionId);
        if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }));
    }
  };

  window.showSystemView = function(paneId) {
    if (!currentUser && paneId !== "admin") {
      showPublicView("login");
      return;
    }

    activeSystemView = paneId;
    localStorage.setItem("peerlink_active_pane", paneId);
    pubContainer.classList.add("hidden");
    sysContainer.classList.remove("hidden");
    publicHeader.classList.add("hidden");
    publicFooter.classList.add("hidden");
    document.body.classList.add("system-active");

    // Hide AI chat widget when logged in
    const chatToggle = document.getElementById('ai-chat-toggle');
    const chatPanel = document.getElementById('ai-chat-panel');
    if (chatToggle) chatToggle.classList.add('hidden');
    if (chatPanel) { chatPanel.classList.add('scale-95', 'opacity-0', 'pointer-events-none'); chatPanel.classList.remove('scale-100', 'opacity-100'); }

    // Toggle active link styles in sidebar navs
    const studentNav = document.getElementById("student-nav");
    const adminNav = document.getElementById("admin-nav");
    const activeNav = currentUser.role === 'admin' ? adminNav : studentNav;
    
    activeNav.querySelectorAll("a[id^='side-link']").forEach(link => {
      const endsWithPane = link.id.endsWith(paneId);
      if (endsWithPane) {
        link.classList.add("active-nav");
      } else {
        link.classList.remove("active-nav");
      }
    });

    // Toggle view panes
    Object.keys(sysPanes).forEach(key => {
      const pane = sysPanes[key];
      if (key === paneId) {
        pane.classList.remove("hidden");
      } else {
        pane.classList.add("hidden");
      }
    });

    // Update Header Text
    const headerTitle = document.getElementById("sys-header-title");
    headerTitle.textContent = paneId.charAt(0).toUpperCase() + paneId.slice(1) + " Panel";
    if (paneId === "dashboard") headerTitle.textContent = "Student Dashboard";
    if (paneId === "admin") headerTitle.textContent = "Admin System Analytics";

    // View specific rendering
    if (paneId === "dashboard") renderDashboardPane();
    else if (paneId === "profile") renderProfilePane();
    else if (paneId === "schedule") renderSchedulePane();
    else if (paneId === "skills") renderSkillsPane();
    else if (paneId === "matches") renderMatchesPane();
    else if (paneId === "meetings") renderMeetingsPane();
    else if (paneId === "messages") renderMessagesPane();
    else if (paneId === "notifications") renderNotificationsPane();
    else if (paneId === "admin") renderAdminPane();
    else if (paneId === "settings") renderSettingsPane();

    // Update mobile bottom nav active state and close sidebar drawer
    updateMobileBottomNav(paneId);
    closeMobileSidebar();
  };

  window.showAdminTab = function(tabId) {
    showSystemView("admin");
    localStorage.setItem("peerlink_active_admin_tab", tabId);
    
    // De-highlight all sub-navs first
    const adminNav = document.getElementById("admin-nav");
    adminNav.querySelectorAll("a[id^='side-link-admin-']").forEach(link => {
      link.classList.remove("active-nav");
    });
    // Highlight selected sub-nav
    const selectedLink = document.getElementById(`side-link-admin-${tabId}`);
    if (selectedLink) {
      selectedLink.classList.add("active-nav");
    }

    // Scroll to the card containing that section
    setTimeout(() => {
      let targetCard = null;
      if (tabId === "users") targetCard = document.getElementById("admin-user-list-card");
      else if (tabId === "meetings") targetCard = document.getElementById("admin-meetings-list-card");
      else if (tabId === "reports") targetCard = document.getElementById("admin-activity-graph-card");
      else if (tabId === "logs") targetCard = document.getElementById("admin-logs-card");

      if (targetCard) {
        targetCard.scrollIntoView({ behavior: "smooth", block: "center" });
        targetCard.classList.add("border-indigo-600");
        setTimeout(() => targetCard.classList.remove("border-indigo-600"), 1500);
      }
    }, 100);
  };

  // Login action
  function loginAsUser(user, targetPane = "dashboard") {
    if (user.isAdmin || user.role === 'admin' || user.id === 'admin') {
      loginAsAdmin(user, targetPane);
      return;
    }

    currentUser = user;
    localStorage.setItem("peerlink_session_user", user.id);
    
    // Set Sidebar User Details
    const sideAvatarEl = document.getElementById('side-avatar');
    if (sideAvatarEl) {
      if (user.avatar && user.avatar.startsWith('data:image')) {
        sideAvatarEl.innerHTML = `<img src="${user.avatar}" class="w-10 h-10 object-cover rounded-full" alt="avatar" />`;
      } else {
        sideAvatarEl.innerHTML = user.avatar || '👤';
      }
    }
    document.getElementById('side-username').textContent = user.name;
    document.getElementById('side-program').textContent = `${user.gradeLevel || user.yearSection || ''} • ${user.schoolName || user.program || ''}`;

    // Toggle navigation panels
    document.getElementById("student-nav").classList.remove("hidden");
    document.getElementById("admin-nav").classList.add("hidden");
    
    db.addLog("user", `${user.name} logged in.`);
    startSyncLoop();
    showMobileBottomNav();
    showSystemView(targetPane);
  }

  function loginAsAdmin(user, targetPane = "admin") {
    currentUser = user || { id: "admin", name: "Administrator", role: "admin", avatar: "🛡️" };
    currentUser.role = 'admin'; // Ensure the role is explicitly 'admin' for navigation toggles
    localStorage.setItem("peerlink_session_user", currentUser.id);

    const sideAvatarElAdmin = document.getElementById('side-avatar');
    if (sideAvatarElAdmin) {
      if (currentUser.avatar && currentUser.avatar.startsWith('data:image')) {
        sideAvatarElAdmin.innerHTML = `<img src="${currentUser.avatar}" class="w-10 h-10 object-cover rounded-full" alt="avatar" />`;
      } else {
        sideAvatarElAdmin.innerHTML = currentUser.avatar || '🛡️';
      }
    }
    document.getElementById('side-username').textContent = currentUser.name || 'System Administrator';
    document.getElementById('side-program').textContent = (currentUser.gradeLevel || currentUser.yearSection) && (currentUser.schoolName || currentUser.program) 
      ? `${currentUser.gradeLevel || currentUser.yearSection} • ${currentUser.schoolName || currentUser.program}` 
      : 'System Overseer';

    // Toggle navigation panels
    document.getElementById("student-nav").classList.add("hidden");
    document.getElementById("admin-nav").classList.remove("hidden");

    db.addLog("system", `${currentUser.name} signed in.`);
    startSyncLoop();
    showMobileBottomNav();
    showSystemView(targetPane);
  }

  window.logout = async function() {
    const confirmed = await showConfirm({
      title: 'Log Out',
      message: 'Are you sure you want to log out of your PeerLink account?',
      type: 'warning',
      okLabel: 'Yes, Log Out'
    });
    if (!confirmed) return;
    try {
      if (currentUser) {
        await db.logout(currentUser.id);
      }
    } catch (e) {
      console.warn("Failed to notify backend of logout:", e);
    }
    stopSyncLoop();
    localStorage.removeItem("peerlink_session_user");
    currentUser = null;
    document.body.classList.remove("system-active");
    hideMobileBottomNav();
    showPublicView("landing");
    showToast('You have been logged out. See you soon! 👋', 'info', 3000);
  };

  function startSyncLoop() {
    if (syncIntervalId) clearInterval(syncIntervalId);
    sendHeartbeatCheck();
    syncIntervalId = setInterval(sendHeartbeatCheck, 2000);
  }

  function stopSyncLoop() {
    if (syncIntervalId) {
      clearInterval(syncIntervalId);
      syncIntervalId = null;
    }
  }

  async function sendHeartbeatCheck() {
    if (!currentUser) return;
    const status = await db.sendHeartbeat(currentUser.id);
    if (status && status.isBanned) {
      stopSyncLoop();
      localStorage.removeItem("peerlink_session_user");
      currentUser = null;
      document.body.classList.remove("system-active");
      document.getElementById("system-container").classList.add("hidden");
      document.getElementById("public-header").classList.remove("hidden");
      document.getElementById("public-footer").classList.remove("hidden");
      showPublicView("login");
      showToast('Your account has been banned due to violation of community guidelines.', 'error', 7000);
      return;
    }
    await pollUpdates();
  }

  // Track which users are currently online
  window.onlineUserIds = window.onlineUserIds || new Set();

  async function pollUpdates() {
    if (!currentUser) return;
    try {
      const [users, connections, meetings] = await Promise.all([
        apiFetch('/users'),
        apiFetch('/connections'),
        apiFetch('/meetings')
      ]);

      // Normalize passwords for comparison
      const normalizedUsers = users.map(u => ({ ...u, password: u.password || 'password123' }));
      
      const cacheStr = JSON.stringify(cache.users);
      const incomingStr = JSON.stringify(normalizedUsers);
      const usersChanged = cacheStr !== incomingStr;

      const cacheConnsStr = JSON.stringify(cache.connections);
      const incomingConnsStr = JSON.stringify(connections);
      const connsChanged = cacheConnsStr !== incomingConnsStr;

      const cacheMeetsStr = JSON.stringify(cache.meetings);
      const incomingMeetsStr = JSON.stringify(meetings);
      const meetsChanged = cacheMeetsStr !== incomingMeetsStr;

      const hasChanges = usersChanged || connsChanged || meetsChanged;

      db.updateCacheData(users, connections, meetings);

      // Keep currentUser object updated in real-time if updated elsewhere/another device
      const myFreshObj = users.find(u => u.id === currentUser.id);
      if (myFreshObj) {
        if (JSON.stringify(myFreshObj) !== JSON.stringify(currentUser)) {
          Object.assign(currentUser, myFreshObj);
        }
      }

      if (hasChanges) {
        if (activeSystemView === 'matches') renderMatchesPane();
        if (activeSystemView === 'dashboard') renderDashboardPane();
        
        // Also refresh the view profile modal if open to show the latest match/profile details
        const modal = document.getElementById("partner-profile-modal");
        if (modal && !modal.classList.contains("hidden")) {
          if (window.currentOpenedPartnerId) {
            openPartnerProfile(window.currentOpenedPartnerId);
          }
        }
      }

      // Check if current meeting got canceled
      if (inCallMeeting) {
        const stillExists = meetings.some(m => m.id === inCallMeeting.id);
        if (!stillExists) {
          window.closeCallOverlay();
          const wasInstant = inCallMeeting.topic && (inCallMeeting.topic.includes('Instant Voice') || inCallMeeting.topic.includes('Instant Video'));
          showToast(wasInstant ? '📞 Call was declined or ended by the other user.' : 'This meeting has been closed or moderated by the Administrator.', 'warning', 5000);
        } else {
          // Sync in-call private chat messages in real time
          const callRoomId = [inCallMeeting.host_id, inCallMeeting.guest_id].sort().join('_');
          db.getChatRoom(callRoomId).then(room => {
            const history = document.getElementById('call-chat-history');
            if (!history || !room) return;
            const msgs = room.messages || [];
            const currentCount = parseInt(history.getAttribute('data-msg-count') || '0');
            if (msgs.length > currentCount) {
              history.setAttribute('data-msg-count', msgs.length);
              history.innerHTML = msgs.map(m => {
                const isMe = String(m.senderId) === String(currentUser.id);
                return `<div class="p-2.5 rounded-lg border ${isMe ? 'bg-indigo-600/30 border-slate-700 ml-auto max-w-[85%]' : 'bg-slate-800/40 border-slate-700 mr-auto max-w-[85%]'}">
                  <span class="text-[10px] ${isMe ? 'text-indigo-400' : 'text-brand-teal'} font-bold block mb-1">${isMe ? 'You' : m.senderName}</span>
                  <p class="text-xs text-slate-100">${m.text}</p>
                </div>`;
              }).join('');
              history.scrollTop = history.scrollHeight;
            }
          }).catch(() => {});
        }
      }

      // Detect incoming voice/video calls — using processedCallIds to avoid clock-skew issues
      if (!inCallMeeting && currentUser) {
        if (!window.processedCallIds) {
          window.processedCallIds = new Set();
          // Seed initial list with existing meeting IDs so old meetings don't trigger alert on load
          meetings.forEach(m => window.processedCallIds.add(String(m.id)));
        }

        const incomingCall = meetings.find(m =>
          (m.meeting_type === 'voice' || m.meeting_type === 'video') &&
          String(m.guest_id) === String(currentUser.id) &&
          !window.processedCallIds.has(String(m.id))
        );

        if (incomingCall && !document.getElementById('incoming-call-overlay')) {
          window.processedCallIds.add(String(incomingCall.id));
          showIncomingCallNotification(incomingCall);
        }
      }

      // Detect newly scheduled meeting invitations for the guest
      if (currentUser) {
        if (!window.notifiedScheduledMeetings) {
          window.notifiedScheduledMeetings = new Set();
          // Seed initial list with existing meeting IDs so old meetings don't trigger invitation alert on load
          meetings.forEach(m => window.notifiedScheduledMeetings.add(String(m.id)));
        }

        const newInvitation = meetings.find(m =>
          (m.meeting_type === 'Video Call' || m.meeting_type === 'Audio Call') &&
          String(m.guest_id) === String(currentUser.id) &&
          !window.notifiedScheduledMeetings.has(String(m.id))
        );

        if (newInvitation) {
          window.notifiedScheduledMeetings.add(String(newInvitation.id));
          showMeetingInvitationNotification(newInvitation);
        }
      }

      // Update notification badge for incoming pending requests
      const incoming = connections.filter(c => c.receiverId === currentUser.id && c.status === 'pending');
      const badge = document.getElementById('notif-badge');
      if (badge) {
        if (incoming.length > 0) {
          badge.textContent = incoming.length;
          badge.classList.remove('hidden');
        } else {
          badge.classList.add('hidden');
        }
      }

      // Toast alert when a new partner request comes in
      if (typeof lastPendingCount === 'undefined') window.lastPendingCount = incoming.length;
      if (incoming.length > window.lastPendingCount) {
        const diff = incoming.length - window.lastPendingCount;
        showToast(`🔔 You have ${diff} new partner request${diff > 1 ? 's' : ''}! Check Notifications.`, 'info', 5000);
        if (activeSystemView === 'notifications') renderNotificationsPane();
      }
      window.lastPendingCount = incoming.length;

      // Refresh online statuses
      db.getOnlineStatuses().then(ids => {
        window.onlineUserIds = ids;
        // Refresh online dots in chat list without full re-render
        if (activeSystemView === 'messages') {
          const partners = db.getUsers().filter(u => !u.isAdmin && u.id !== currentUser.id);
          partners.forEach(p => {
            const dot = document.getElementById(`online-dot-${p.id}`);
            if (dot) {
              dot.className = window.onlineUserIds.has(String(p.id))
                ? 'absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white'
                : 'absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-slate-300 border-2 border-white';
            }
          });
          // Update header status if a chat is open
          const headerStatus = document.getElementById('chat-header-online-status');
          if (headerStatus && activeChatCollabId) {
            const isOnline = window.onlineUserIds.has(String(activeChatCollabId));
            headerStatus.textContent = isOnline ? '● Online' : '● Offline';
            headerStatus.className = isOnline ? 'text-[10px] text-emerald-500 font-semibold' : 'text-[10px] text-slate-400';
          }
        }
      }).catch(() => {});

      // Check notifications
      checkScheduleNotifications(meetings);

      // ── Sync all active chat rooms from server FIRST, then render ──
      // This ensures renderMessagesPane() always shows fresh server data
      // (fixes bug where sent messages weren't visible to receiver)
      const activePartners = connections.filter(c =>
        c.status === "accepted" && (c.senderId === currentUser.id || c.receiverId === currentUser.id)
      ).map(c => c.senderId === currentUser.id ? c.receiverId : c.senderId);

      window._lastRoomMessageIds = window._lastRoomMessageIds || {};
      let totalUnreadMessages = 0;
      let hasNewIncoming = false;

      // Step 1: Fetch all chat rooms from the server, update cache
      await Promise.all(activePartners.map(async (partnerId) => {
        const roomId = [currentUser.id, partnerId].sort().join('_');
        try {
          const room = await db.getChatRoom(roomId);
          if (room) {
            const msgs = room.messages || [];

            // Count unread messages
            const unreadMsgs = msgs.filter(m => m.senderId !== currentUser.id && !m.isRead);
            totalUnreadMessages += unreadMsgs.length;

            if (msgs.length > 0) {
              const lastMsg = msgs[msgs.length - 1];
              const lastMsgId = String(lastMsg.id || lastMsg.time);
              const prevMsgId = window._lastRoomMessageIds[roomId];

              // Detect a brand-new incoming message
              if (lastMsg.senderId !== currentUser.id && prevMsgId && prevMsgId !== lastMsgId) {
                hasNewIncoming = true;
                // Play notification sound
                const sound = document.getElementById('notif-sound');
                if (sound) sound.play().catch(() => {});
                // Toast if not currently viewing this chat
                if (activeChatCollabId !== partnerId || activeSystemView !== 'messages') {
                  let alertText = lastMsg.text;
                  if (alertText.startsWith('data:image/')) alertText = '📷 Sent an image';
                  else if (alertText.startsWith('[FILE]:')) alertText = '📁 Sent a file';
                  showToast(`💬 ${lastMsg.senderName}: "${alertText}"`, 'info', 5000);
                }
              }
              window._lastRoomMessageIds[roomId] = lastMsgId;
            }
          }
        } catch (e) {}
      }));

      // Step 2: Now render UI with up-to-date cache
      if (activeSystemView === "dashboard") {
        renderDashboardPane();
      } else if (activeSystemView === "matches") {
        renderMatchesPane();
      } else if (activeSystemView === "meetings") {
        renderMeetingsPane();
      } else if (activeSystemView === "admin") {
        renderAdminPane();
      } else if (activeSystemView === "messages") {
        renderMessagesPane();
      }

      // Update Messages badges
      const msgBadge = document.getElementById('messages-badge');
      const msgBadgeMobile = document.getElementById('messages-badge-mobile');
      [msgBadge, msgBadgeMobile].forEach(badge => {
        if (badge) {
          if (totalUnreadMessages > 0) {
            badge.textContent = totalUnreadMessages;
            badge.classList.remove('hidden');
          } else {
            badge.classList.add('hidden');
          }
        }
      });
    } catch (err) {
      // Offline fallback
    }
  }

  function checkScheduleNotifications(meetings) {
    if (!currentUser) return;
    const now = new Date();
    const dateStr = now.getFullYear() + "-" + 
                    String(now.getMonth() + 1).padStart(2, '0') + "-" + 
                    String(now.getDate()).padStart(2, '0');
    const timeStr = String(now.getHours()).padStart(2, '0') + ":" + 
                    String(now.getMinutes()).padStart(2, '0');

    meetings.forEach(m => {
      // Direct instant calls should never trigger schedule-starting notifications
      if (m.meeting_type === 'voice' || m.meeting_type === 'video') {
        return;
      }

      const isHost = String(m.host_id) === String(currentUser.id);
      const isAcceptedGuest = String(m.guest_id) === String(currentUser.id) && m.status === 'accepted';
      const isApprovedParticipant = (m.approved_participants || []).map(String).includes(String(currentUser.id));

      // Hosts always get notified at start time; guests only if they accepted
      if (!isHost && !isAcceptedGuest && !isApprovedParticipant) return;

      // For non-public meetings: host always notified, guest only if accepted
      if (!m.is_public && !isHost && m.status !== 'accepted') {
        return;
      }

      if (m.meeting_date === dateStr && m.start_time === timeStr) {
        if (!notifiedMeetings.has(m.id)) {
          notifiedMeetings.add(m.id);
          showMeetingStartingNotification(m);
          db.addLog("system", `Meeting "${m.topic}" started.`);
        }
      }
    });
  }

  window.confirmGetStarted = async function() {
    const confirmed = await showConfirm({
      title: 'Create Your Account',
      message: 'Ready to join PeerLink and find your perfect study partner? This will take you to the registration form.',
      type: 'info',
      okLabel: "Let's Go! 🚀"
    });
    if (confirmed) showPublicView('register');
  };

  window.confirmSignIn = async function() {
    const confirmed = await showConfirm({
      title: 'Sign In to PeerLink',
      message: 'You will be taken to the login page to access your student account.',
      type: 'info',
      okLabel: 'Go to Login'
    });
    if (confirmed) showPublicView('login');
  };

  // --- 2. MATCHING ALGORITHM CALCULATOR ---
  
  // --- 2. MATCHING ALGORITHM CALCULATOR (Cosine Similarity Engine) ---
  
  function getCourseOverlap(userA, userB) {
    const listA = userA.courses || [];
    const listB = userB.courses || [];
    if (listA.length === 0 || listB.length === 0) return { score: 0, shared: [] };

    const shared = listA.filter(c => listB.includes(c));
    const score = shared.length / Math.sqrt(listA.length * listB.length);
    return {
      score: score,
      shared
    };
  }

  function getSkillAlignment(userA, userB) {
    const haveA = userA.skills?.have || [];
    const wantA = userA.skills?.want || [];
    const haveB = userB.skills?.have || [];
    const wantB = userB.skills?.want || [];

    // B has what A wants (A learns from B)
    const canLearn = wantA.filter(s => haveB.includes(s));
    const learnScore = (wantA.length > 0 && haveB.length > 0)
      ? (canLearn.length / Math.sqrt(wantA.length * haveB.length))
      : 0;

    // A has what B wants (A teaches B)
    const canTeach = haveA.filter(s => wantB.includes(s));
    const teachScore = (haveA.length > 0 && wantB.length > 0)
      ? (canTeach.length / Math.sqrt(haveA.length * wantB.length))
      : 0;

    return {
      score: (learnScore + teachScore) / 2,
      canLearn,
      canTeach
    };
  }

  function getScheduleOverlap(userA, userB) {
    const schedA = userA.schedule || {};
    const schedB = userB.schedule || {};

    let overlaps = [];
    let sizeA = 0;
    let sizeB = 0;

    DAYS.forEach(day => {
      const slotsA = schedA[day] || [];
      const slotsB = schedB[day] || [];

      sizeA += slotsA.length;
      sizeB += slotsB.length;

      const intersect = slotsA.filter(h => slotsB.includes(h));
      intersect.forEach(h => overlaps.push({ day, hour: h }));
    });

    const score = (sizeA > 0 && sizeB > 0)
      ? (overlaps.length / Math.sqrt(sizeA * sizeB))
      : 0;

    return {
      score,
      overlaps
    };
  }

  function calculateMatchDetails(userA, userB) {
    const course = getCourseOverlap(userA, userB);
    const skill = getSkillAlignment(userA, userB);
    const schedule = getScheduleOverlap(userA, userB);

    // Weighted Score using dynamic playground sliders
    const wCourse = (matchWeights.course) / 100;
    const wSkill = (matchWeights.skill) / 100;
    const wSchedule = (matchWeights.schedule) / 100;

    const total = Math.round(((course.score * wCourse) + (skill.score * wSkill) + (schedule.score * wSchedule)) * 100);

    return {
      total,
      coursePercent: Math.round(course.score * 100),
      skillPercent: Math.round(skill.score * 100),
      schedulePercent: Math.round(schedule.score * 100),
      sharedCourses: course.shared,
      canLearnSkills: skill.canLearn,
      canTeachSkills: skill.canTeach,
      overlappingSlots: schedule.overlaps
    };
  }

  function getSortedRecommendations(user) {
    const allUsers = db.getUsers().filter(u => {
      if (u.id === user.id || u.isAdmin || u.id === 'admin' || u.isBanned) return false;
      // Segmentation: JHS students match with JHS, SHS students match with SHS
      if (user.educationLevel && u.educationLevel && u.educationLevel !== user.educationLevel) return false;
      return true;
    });
    return allUsers.map(candidate => {
      const match = calculateMatchDetails(user, candidate);
      return {
        candidate,
        match
      };
    }).sort((a, b) => b.match.total - a.match.total);
  }

  // --- 3. REGISTRATION ONBOARDING WIZARD ---
  
  function renderRegWizard() {
    // Show correct pane
    for (let i = 1; i <= 4; i++) {
      const pane = document.getElementById(`reg-pane-${i}`);
      const tab = document.getElementById(`reg-step-tab-${i}`);
      if (!pane || !tab) continue;
      
      if (i === registrationStep) {
        pane.classList.remove("hidden");
        tab.className = "flex-1 py-4 text-center text-xs font-bold border-r border-brand-borderLight text-brand-purple flex items-center justify-center gap-2";
        tab.querySelector("span").className = "w-5 h-5 rounded-full bg-brand-purple text-white flex items-center justify-center text-[10px]";
        tab.querySelector("span").textContent = i;
      } else {
        pane.classList.add("hidden");
        if (i < registrationStep) {
          tab.className = "flex-1 py-4 text-center text-xs font-bold border-r border-brand-borderLight text-slate-700 flex items-center justify-center gap-2";
          tab.querySelector("span").className = "w-5 h-5 rounded-full bg-indigo-200 text-brand-purple flex items-center justify-center text-[10px]";
          tab.querySelector("span").textContent = "✓";
        } else {
          tab.className = "flex-1 py-4 text-center text-xs font-bold border-r border-brand-borderLight text-slate-400 flex items-center justify-center gap-2";
          tab.querySelector("span").className = "w-5 h-5 rounded-full bg-slate-300 text-white flex items-center justify-center text-[10px]";
          tab.querySelector("span").textContent = i;
        }
      }
    }

    // Toggle Back button (hide on Step 1 and Step 4 verification)
    const prevBtn = document.getElementById("reg-btn-prev");
    prevBtn.style.visibility = (registrationStep === 1 || registrationStep === 4) ? "hidden" : "visible";

    // Set Next button label
    const nextBtn = document.getElementById("reg-btn-next");
    if (registrationStep === 3) {
      nextBtn.textContent = "Send Verification Code";
    } else if (registrationStep === 4) {
      nextBtn.textContent = "Verify & Complete";
    } else {
      nextBtn.textContent = "Next Step";
    }

    // Populate subject grids on Step 2 — filtered by education level
    if (registrationStep === 2) {
      const level    = regData.educationLevel || '';
      const allSubjects = db.getSubjects ? db.getSubjects(level || undefined) : db.getCourses();
      // Normalise: getSubjects may return objects {name, level} or plain strings
      const subjectNames = allSubjects.map(s => typeof s === 'string' ? s : s.name);

      const makeTag = (s, prefix) => `
        <label class="tag-checkbox flex items-center gap-2 border border-slate-200 p-2.5 rounded-lg text-xs font-medium cursor-pointer bg-white hover:bg-slate-50 select-none" id="lbl-${prefix}-${s.replace(/[^a-z0-9]/gi, '')}">
          <input type="checkbox" class="sr-only" value="${s}" onchange="toggleRegTag(this, 'lbl-${prefix}-${s.replace(/[^a-z0-9]/gi, '')}')">
          <span>${s}</span>
        </label>
      `;

      document.getElementById('reg-courses-grid').innerHTML =
        subjectNames.map(s => makeTag(s, 'rc')).join('');
      document.getElementById('reg-have-skills-grid').innerHTML =
        subjectNames.map(s => makeTag(s, 'rh')).join('');
      document.getElementById('reg-want-skills-grid').innerHTML =
        subjectNames.map(s => makeTag(s, 'rw')).join('');

      // Restore previously selected values
      (regData.subjectsNeedHelp || []).forEach(v => {
        const el = document.querySelector(`#reg-courses-grid input[value="${v}"]`);
        if (el) { el.checked = true; toggleRegTag(el, el.closest('label').id); }
      });
      (regData.subjectsCanHelp || []).forEach(v => {
        const el = document.querySelector(`#reg-have-skills-grid input[value="${v}"]`);
        if (el) { el.checked = true; toggleRegTag(el, el.closest('label').id); }
      });
    }

    // Render scheduler grid on Step 3
    if (registrationStep === 3) {
      renderRegScheduler();
    }
  }

  window.toggleRegTag = function(checkbox, labelId) {
    const lbl = document.getElementById(labelId);
    if (checkbox.checked) {
      lbl.className = "tag-checkbox flex items-center gap-2 border border-brand-purple p-2.5 rounded-lg text-xs font-semibold cursor-pointer bg-indigo-50 text-brand-purple select-none";
    } else {
      lbl.className = "tag-checkbox flex items-center gap-2 border border-slate-200 p-2.5 rounded-lg text-xs font-medium cursor-pointer bg-white hover:bg-slate-50 select-none";
    }
  };

  // ── JHS/SHS Registration Helpers ───────────────────────────────────────────

  window.selectEducationLevel = function(level) {
    // Store value
    const hidden = document.getElementById('reg-education-level');
    if (hidden) hidden.value = level;

    // Highlight the chosen button
    const jhsBtn = document.getElementById('reg-level-jhs');
    const shsBtn = document.getElementById('reg-level-shs');
    const activeClass  = 'flex-1 py-2.5 rounded-lg border-2 border-brand-purple text-sm font-bold text-brand-purple bg-indigo-50 transition-all';
    const defaultClass = 'flex-1 py-2.5 rounded-lg border-2 border-slate-200 text-sm font-bold text-slate-500 hover:border-brand-purple hover:text-brand-purple transition-all';
    if (jhsBtn) jhsBtn.className = level === 'JHS' ? activeClass : defaultClass;
    if (shsBtn) shsBtn.className = level === 'SHS' ? activeClass : defaultClass;

    // Show/hide Track & Strand for SHS
    const trackGroup  = document.getElementById('reg-track-group');
    const strandGroup = document.getElementById('reg-strand-group');
    if (trackGroup)  trackGroup.classList.toggle('hidden',  level !== 'SHS');
    if (strandGroup) strandGroup.classList.toggle('hidden', level !== 'SHS');

    // Make track/strand required only for SHS
    const trackSel  = document.getElementById('reg-track');
    const strandSel = document.getElementById('reg-strand');
    if (trackSel)  trackSel.required  = level === 'SHS';
    if (strandSel) strandSel.required = level === 'SHS';

    // Filter grade options: show only JHS grades (7-10) or SHS grades (11-12)
    document.querySelectorAll('#reg-grade-level .jhs-option').forEach(o => {
      o.hidden = level === 'SHS';
    });
    document.querySelectorAll('#reg-grade-level .shs-option').forEach(o => {
      o.hidden = level === 'JHS';
    });
    const gradeSelect = document.getElementById('reg-grade-level');
    if (gradeSelect) gradeSelect.value = '';

    // Populate school datalist from existing school names in user cache
    const datalist = document.getElementById('reg-school-datalist');
    if (datalist) {
      const schools = [...new Set(
        (db.getUsers() || [])
          .map(u => u.schoolName || u.program || '')
          .filter(s => s && s !== 'PeerLink Administration' && s !== 'ADMIN')
      )];
      datalist.innerHTML = schools.map(s => `<option value="${s}">`).join('');
    }
  };

  window.updateStrandOptions = function() {
    const track     = document.getElementById('reg-track')?.value || '';
    const strandSel = document.getElementById('reg-strand');
    if (!strandSel) return;

    const strandMap = {
      'Academic':                       ['STEM', 'ABM', 'HUMSS', 'GAS'],
      'Technical-Vocational-Livelihood': ['ICT', 'HE', 'IA', 'CSS', 'Cookery', 'Electronics'],
      'Sports':                         ['Sports Track'],
      'Arts and Design':                ['Arts and Design Track'],
    };

    const options = strandMap[track] || [];
    strandSel.innerHTML = '<option value="" disabled selected>Select strand...</option>' +
      options.map(s => `<option value="${s}">${s}</option>`).join('');

    const strandGroup = document.getElementById('reg-strand-group');
    if (strandGroup) strandGroup.classList.toggle('hidden', options.length === 0);
  };

  // Schedule drag availability selector
  let isRegDragging = false;
  let regDragMode = true; // true=select, false=deselect

  function renderRegScheduler() {
    let html = `
      <div class="grid grid-cols-8 gap-1.5 text-center font-bold text-xs text-brand-purple pb-2 border-b border-slate-100">
        <div>Time</div>
        ${DAYS.map(d => `<div>${d.slice(0,3)}</div>`).join('')}
        <div>Sun</div>
      </div>
    `;

    const allDays = [...DAYS, "Sunday"];
    // 8:00 AM to 10:00 PM (8 to 22)
    const hoursList = [8,9,10,11,12,13,14,15,16,17,18,19,20,21,22];

    hoursList.forEach(hour => {
      const timeStr = hour > 12 ? `${hour - 12} PM` : (hour === 12 ? '12 PM' : `${hour} AM`);
      html += `<div class="grid grid-cols-8 gap-1.5 items-center my-1">
        <div class="text-[10px] text-slate-400 font-semibold text-right pr-2">${timeStr}</div>
      `;

      allDays.forEach(day => {
        const isAvail = regData.schedule[day] && regData.schedule[day].includes(hour);
        html += `
          <div class="h-8 rounded border transition-colors cursor-pointer ${isAvail ? 'bg-brand-purple border-brand-purple' : 'bg-slate-50 hover:bg-indigo-50 border-slate-150'}"
               data-day="${day}"
               data-hour="${hour}"
               onmousedown="startRegSchedDrag(event, this)"
               onmouseenter="hoverRegSchedDrag(this)">
          </div>
        `;
      });

      html += `</div>`;
    });

    document.getElementById("reg-schedule-container").innerHTML = html;

    window.addEventListener("mouseup", () => { isRegDragging = false; });
  }

  window.startRegSchedDrag = function(e, cell) {
    e.preventDefault();
    isRegDragging = true;
    const isAvail = cell.classList.contains("bg-brand-purple");
    regDragMode = !isAvail;
    toggleRegSchedCell(cell, regDragMode);
  };

  window.hoverRegSchedDrag = function(cell) {
    if (isRegDragging) {
      toggleRegSchedCell(cell, regDragMode);
    }
  };

  function toggleRegSchedCell(cell, setAvailable) {
    const day = cell.getAttribute("data-day");
    const hour = parseInt(cell.getAttribute("data-hour"));

    if (!regData.schedule[day]) {
      regData.schedule[day] = [];
    }

    if (setAvailable) {
      cell.className = "h-8 rounded border transition-colors cursor-pointer bg-brand-purple border-brand-purple";
      if (!regData.schedule[day].includes(hour)) {
        regData.schedule[day].push(hour);
      }
    } else {
      cell.className = "h-8 rounded border transition-colors cursor-pointer bg-slate-50 hover:bg-indigo-50 border-slate-150";
      regData.schedule[day] = regData.schedule[day].filter(h => h !== hour);
    }
  }

  window.regNext = function() {
    if (registrationStep === 1) {
      // ── Step 1 validation ──────────────────────────────────────────
      const educationLevel = document.getElementById('reg-education-level').value.trim();
      const name           = document.getElementById('reg-name').value.trim();
      const studentLrn     = document.getElementById('reg-student-lrn').value.trim();
      const schoolName     = document.getElementById('reg-school-name').value.trim();
      const gradeLevel     = document.getElementById('reg-grade-level').value.trim();
      const section        = document.getElementById('reg-section').value.trim();
      const email          = document.getElementById('reg-email').value.trim();
      const pw             = document.getElementById('reg-password').value;
      const pwc            = document.getElementById('reg-password-confirm').value;
      const track          = document.getElementById('reg-track')?.value.trim() || '';
      const strand         = document.getElementById('reg-strand')?.value.trim() || '';

      if (!educationLevel) { showToast('Please select your Education Level (JHS or SHS).', 'warning'); return; }
      if (!name)           { showToast('Please enter your Full Name.', 'warning'); return; }
      if (!/^\d{12}$/.test(studentLrn)) {
        showToast('Student LRN must be exactly 12 numeric digits.', 'error'); return;
      }
      if (!schoolName)  { showToast('Please enter your School Name.', 'warning'); return; }
      if (!gradeLevel)  { showToast('Please select your Grade Level.', 'warning'); return; }
      if (!section)     { showToast('Please enter your Section.', 'warning'); return; }
      if (educationLevel === 'SHS') {
        if (!track)  { showToast('SHS students must select a Track.', 'warning'); return; }
        if (!strand) { showToast('SHS students must select a Strand.', 'warning'); return; }
      }
      if (!email) { showToast('Please enter your Email Address.', 'warning'); return; }
      if (!pw)    { showToast('Please set a Password.', 'warning'); return; }
      if (pw !== pwc) { showToast('Passwords do not match.', 'error'); return; }

      regData.educationLevel = educationLevel;
      regData.name           = name;
      regData.studentLrn     = studentLrn;
      regData.schoolName     = schoolName;
      regData.gradeLevel     = gradeLevel;
      regData.section        = section;
      regData.track          = educationLevel === 'SHS' ? track  : null;
      regData.strand         = educationLevel === 'SHS' ? strand : null;
      regData.email          = email.toLowerCase();
      regData.password       = pw;

      // Legacy aliases so downstream code keeps working
      regData.studentId  = studentLrn;
      regData.program    = schoolName;
      regData.yearLevel  = gradeLevel;

      registrationStep = 2;
      saveRegProgress();
      renderRegWizard();

    } else if (registrationStep === 2) {
      // ── Step 2: collect subject selections ────────────────────────
      const subjectsNeedHelp = [];
      document.querySelectorAll('#reg-courses-grid input:checked').forEach(cb => {
        subjectsNeedHelp.push(cb.value);
      });

      const subjectsCanHelp = [];
      document.querySelectorAll('#reg-have-skills-grid input:checked').forEach(cb => {
        subjectsCanHelp.push(cb.value);
      });

      if (subjectsNeedHelp.length === 0 && subjectsCanHelp.length === 0) {
        showToast('Please select at least one subject you need help with or can help others with.', 'warning');
        return;
      }

      regData.subjectsNeedHelp = subjectsNeedHelp;
      regData.subjectsCanHelp  = subjectsCanHelp;
      // Legacy aliases
      regData.courses      = subjectsNeedHelp;
      regData.skills       = { have: subjectsCanHelp, want: subjectsNeedHelp };

      registrationStep = 3;
      saveRegProgress();
      renderRegWizard();

    } else if (registrationStep === 3) {
      // Send Verification Code to email
      sendRegistrationOTP();
    } else if (registrationStep === 4) {
      // Verify OTP and complete
      verifyAndCompleteRegistration();
    }
  };

  let regOtpTimerInterval = null;

  async function sendRegistrationOTP() {
    try {
      showToast('Sending verification code to your email... 📧', 'info');
      // Sync schedule alias before sending
      regData.studySchedule = regData.schedule || {};
      const res = await db.registerSendOTP(regData);
      if (res && res.success) {
        showToast('Verification code sent!', 'success');
        registrationStep = 4;
        saveRegProgress();
        renderRegWizard();
        
        // Populate email label in Step 4
        const emailLabel = document.getElementById('reg-otp-email-label');
        if (emailLabel) emailLabel.textContent = regData.email;


        // Initialize OTP expiry countdown timer (10 mins)
        startRegisterOTPTimer(600); // 10 minutes
      } else {
        showToast(res.message || 'Failed to send verification code.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error sending verification code.', 'error');
    }
  }

  function startRegisterOTPTimer(durationSeconds) {
    if (regOtpTimerInterval) clearInterval(regOtpTimerInterval);
    let timeRemaining = durationSeconds;
    const timerLabel = document.getElementById('reg-otp-timer');
    const resendBtn = document.getElementById('reg-otp-resend-btn');

    if (resendBtn) {
      resendBtn.classList.add('pointer-events-none', 'text-slate-400');
      resendBtn.classList.remove('text-brand-purple');
    }

    regOtpTimerInterval = setInterval(() => {
      if (timeRemaining <= 0) {
        clearInterval(regOtpTimerInterval);
        if (timerLabel) timerLabel.textContent = 'Expired';
        if (resendBtn) {
          resendBtn.classList.remove('pointer-events-none', 'text-slate-400');
          resendBtn.classList.add('text-brand-purple');
        }
        return;
      }

      timeRemaining--;
      const mins = Math.floor(timeRemaining / 60);
      const secs = timeRemaining % 60;
      if (timerLabel) {
        timerLabel.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }
    }, 1000);
  }

  window.handleResendRegisterOTP = async function(e) {
    if (e) e.preventDefault();
    await sendRegistrationOTP();
  };

  async function verifyAndCompleteRegistration() {
    const code = document.getElementById('reg-otp-code').value.trim();
    if (!code || code.length !== 6) {
      showToast('Please enter the 6-digit verification code.', 'warning');
      return;
    }

    try {
      showToast('Verifying code... ⏳', 'info');
      const res = await db.registerVerifyOTP(regData.email, code);
      if (res && res.success && res.user) {
        if (regOtpTimerInterval) clearInterval(regOtpTimerInterval);

        // Clear saved registration states since it is completed
        localStorage.removeItem("peerlink_registration_step");
        localStorage.removeItem("peerlink_registration_data");

        // Refresh user cache — non-fatal: login proceeds even if this fails
        try {
          const freshUsers = await apiFetch('/users');
          db.updateCacheData(freshUsers, db.getConnections(), db.getMeetings());
        } catch (cacheErr) {
          console.warn('Could not refresh user cache after registration (non-fatal):', cacheErr.message);
        }

        loginAsUser(res.user);
        showToast('🎉 Email verified! Welcome to PeerLink!', 'success', 5000);
      } else {
        showToast(res.message || 'Incorrect verification code. Please try again.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Incorrect or expired verification code.', 'error');
    }
  }


  function saveRegProgress() {
    localStorage.setItem("peerlink_registration_step", registrationStep);
    localStorage.setItem("peerlink_registration_data", JSON.stringify(regData));
  }

  window.regPrev = function() {
    if (registrationStep > 1) {
      registrationStep--;
      saveRegProgress();
      renderRegWizard();
    }
  };

  function completeRegistration() {
    const avatarList = ["👨‍💻", "👩‍💻", "🧑‍💻", "🎨", "✍️", "🧮", "🤖", "🚀", "🎓"];
    const randomAvatar = avatarList[Math.floor(Math.random() * avatarList.length)];

    const newUser = {
      id: "student_" + Date.now(),
      studentLrn: regData.studentLrn,
      studentId: regData.studentLrn,
      name: regData.name,
      email: regData.email,
      password: regData.password,
      schoolName: regData.schoolName,
      program: regData.schoolName,
      educationLevel: regData.educationLevel,
      gradeLevel: regData.gradeLevel,
      section: regData.section,
      track: regData.track,
      strand: regData.strand,
      yearSection: regData.gradeLevel,
      avatar: randomAvatar,
      bio: `I am a ${regData.gradeLevel} student from ${regData.schoolName} looking for a study buddy. Let's learn together!`,
      subjectsNeedHelp: regData.subjectsNeedHelp,
      subjectsCanHelp: regData.subjectsCanHelp,
      courses: regData.subjectsNeedHelp,
      skills: regData.subjectsCanHelp,
      studySchedule: regData.studySchedule,
      schedule: regData.studySchedule,
      profile_completion: 85
    };

    const users = db.getUsers();
    users.push(newUser);
    db.saveUsers(users);

    loginAsUser(newUser);
    showToast('🎉 Onboarding successful! Welcome to PeerLink!', 'success', 4000);
  }

  // --- 4. PUBLIC LOGIN PANEL ---
  
  window.handleLoginSubmit = async function(e) {
    e.preventDefault();
    const email = document.getElementById("login-email").value.trim().toLowerCase();
    const pw = document.getElementById("login-password").value;

    if (email === "admin@school.edu" || email === "admin") {
      loginAsAdmin();
      return;
    }

    try {
      const user = await db.login(email, pw);
      loginAsUser(user);
    } catch (err) {
      showToast(err.message || 'Invalid email or password. Please try again.', 'error');
    }
  };

  // --- FORGOT PASSWORD HANDLERS ---
  let forgotEmailStr = '';
  let forgotOtpCodeStr = '';
  let forgotOtpTimerInterval = null;

  window.handleForgotEmailSubmit = async function(e) {
    e.preventDefault();
    const email = document.getElementById("forgot-email").value.trim().toLowerCase();
    if (!email) return;

    try {
      showToast('Verifying email and sending code... 📧', 'info');
      const res = await db.forgotPassword(email);
      if (res && res.success) {
        forgotEmailStr = email;
        showToast('Verification code sent!', 'success');
        showPublicView('forgot-otp');
        
        // Update label
        const emailLabel = document.getElementById('forgot-otp-email-label');
        if (emailLabel) emailLabel.textContent = email;

        // Start timer
        startForgotOTPTimer(600); // 10 minutes
      } else {
        showToast(res.message || 'Email address not found.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Email address not found.', 'error');
    }
  };

  function startForgotOTPTimer(durationSeconds) {
    if (forgotOtpTimerInterval) clearInterval(forgotOtpTimerInterval);
    let timeRemaining = durationSeconds;
    const timerLabel = document.getElementById('forgot-otp-timer');
    const resendBtn = document.getElementById('forgot-otp-resend-btn');

    if (resendBtn) {
      resendBtn.classList.add('pointer-events-none', 'text-slate-400');
      resendBtn.classList.remove('text-brand-purple');
    }

    forgotOtpTimerInterval = setInterval(() => {
      if (timeRemaining <= 0) {
        clearInterval(forgotOtpTimerInterval);
        if (timerLabel) timerLabel.textContent = 'Expired';
        if (resendBtn) {
          resendBtn.classList.remove('pointer-events-none', 'text-slate-400');
          resendBtn.classList.add('text-brand-purple');
        }
        return;
      }

      timeRemaining--;
      const mins = Math.floor(timeRemaining / 60);
      const secs = timeRemaining % 60;
      if (timerLabel) {
        timerLabel.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }
    }, 1000);
  }

  window.handleResendForgotOTP = async function(e) {
    if (e) e.preventDefault();
    try {
      showToast('Resending code... 📧', 'info');
      const res = await db.forgotPassword(forgotEmailStr);
      if (res && res.success) {
        showToast('Verification code resent!', 'success');
        startForgotOTPTimer(600);
      }
    } catch(err) {
      showToast('Failed to resend code.', 'error');
    }
  };

  window.autofillDemoOTP = async function(mode) {
    try {
      const email = mode === 'reg' ? regData.email : forgotEmailStr;
      if (!email) {
        showToast('Please type your email address first.', 'warning');
        return;
      }
      showToast('Retrieving code... 🔍', 'info');
      const res = await db.getOTP(email);
      if (res && res.success && res.code) {
        const inputId = mode === 'reg' ? 'reg-otp-code' : 'forgot-otp-code';
        const input = document.getElementById(inputId);
        if (input) {
          input.value = res.code;
          showToast('Code retrieved and entered! ✨', 'success');
        }
      } else {
        showToast(res.message || 'Verification code not found.', 'warning');
      }
    } catch (err) {
      showToast('Could not retrieve code automatically.', 'error');
    }
  };

  window.handleForgotOTPVerifySubmit = async function(e) {
    e.preventDefault();
    const code = document.getElementById('forgot-otp-code').value.trim();
    if (!code || code.length !== 6) {
      showToast('Please enter the 6-digit code.', 'warning');
      return;
    }

    try {
      const res = await db.verifyForgotOTP(forgotEmailStr, code);
      if (res && res.success) {
        forgotOtpCodeStr = code;
        if (forgotOtpTimerInterval) clearInterval(forgotOtpTimerInterval);
        showToast('Code verified! Setup your new password.', 'success');
        showPublicView('reset');
      } else {
        showToast(res.message || 'Incorrect verification code.', 'error');
      }
    } catch(err) {
      showToast(err.message || 'Incorrect or expired verification code.', 'error');
    }
  };

  window.handleResetPasswordSubmit = async function(e) {
    e.preventDefault();
    const np = document.getElementById('reset-new-password').value;
    const cp = document.getElementById('reset-confirm-password').value;

    if (!np || np.length < 6) {
      showToast('Password must be at least 6 characters.', 'warning');
      return;
    }
    if (np !== cp) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    try {
      showToast('Updating password... ⏳', 'info');
      const res = await db.resetPassword(forgotEmailStr, forgotOtpCodeStr, np);
      if (res && res.success) {
        showToast('Password updated successfully! Please log in.', 'success', 5000);
        showPublicView('login');
        
        // Reset password fields
        document.getElementById('reset-new-password').value = '';
        document.getElementById('reset-confirm-password').value = '';
        document.getElementById('forgot-otp-code').value = '';
        document.getElementById('forgot-email').value = '';
      } else {
        showToast(res.message || 'Failed to update password.', 'error');
      }
    } catch(err) {
      showToast(err.message || 'Failed to update password.', 'error');
    }
  };

  // --- 5. STUDENT PORTAL DASHBOARD PANE ---
  
  function renderDashboardPane() {
    const recs = getSortedRecommendations(currentUser);
    const conns = db.getConnections() || [];
    const meetings = db.getMeetings() || [];

    // Find next upcoming meeting
    const upcoming = meetings.filter(m => 
      (m.host_id === currentUser.id || m.guest_id === currentUser.id) &&
      new Date(m.meeting_date) >= new Date().setHours(0,0,0,0)
    ).sort((a, b) => new Date(a.meeting_date) - new Date(b.meeting_date))[0];

    // Compute stats
    const matchCount = recs.length;
    const acceptedCount = conns.filter(c => 
      c.status === "accepted" && (c.senderId === currentUser.id || c.receiverId === currentUser.id)
    ).length;
    const meetingCount = meetings.filter(m => m.host_id === currentUser.id || m.guest_id === currentUser.id).length;

    let upcomingMeetingHTML = `
      <div class="p-6 bg-slate-50 border border-slate-200 border-dashed rounded-xl text-center text-slate-500 text-sm">
        No study meetings scheduled today.
      </div>
    `;

    if (upcoming) {
      const partnerId = upcoming.host_id === currentUser.id ? upcoming.guest_id : upcoming.host_id;
      const partner = db.getUsers().find(u => u.id === partnerId);
      upcomingMeetingHTML = `
        <div class="flex items-center justify-between p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl">
          <div class="flex items-center gap-3">
            <span class="text-2xl">📅</span>
            <div>
              <h5 class="text-sm font-semibold text-slate-800">${upcoming.topic}</h5>
              <p class="text-xs text-slate-500">${upcoming.meeting_date} • ${upcoming.start_time} - ${upcoming.end_time} with ${partner ? partner.name : 'Study Buddy'}</p>
            </div>
          </div>
          <button onclick="joinVideoCall(${upcoming.id})" class="bg-brand-purple hover:bg-opacity-90 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-all btn-pulse">
            Join Meeting
          </button>
        </div>
      `;
    }

    // Circular progress stroke dashboard dial
    const strokeDash = 251.2 - (251.2 * 0.85); // 85% completion

    sysPanes.dashboard.innerHTML = `
      <div class="space-y-6">
        <div>
          <h1 class="font-heading font-extrabold text-3xl text-slate-900 mb-1">Welcome back, ${currentUser.name.split(" ")[0]}! 👋</h1>
          <p class="text-slate-500 text-sm">Here's what's happening with your study connections.</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <!-- Column 1 & 2: Meetings & Matches -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Upcoming Meetings -->
            <div class="bg-white border rounded-2xl p-6 shadow-sm">
              <div class="flex justify-between items-center mb-4">
                <h3 class="font-heading font-bold text-slate-800">Upcoming Meeting</h3>
                <span class="text-xs font-bold text-brand-purple hover:underline cursor-pointer" onclick="showSystemView('meetings')">View All</span>
              </div>
              ${upcomingMeetingHTML}
            </div>

             <!-- Top Study Partners -->
             <div class="bg-white border rounded-2xl p-6 shadow-sm">
               <div class="flex justify-between items-center mb-4">
                 <h3 class="font-heading font-bold text-slate-800">Top Study Partners</h3>
                 <span class="text-xs font-bold text-brand-purple hover:underline cursor-pointer" onclick="showSystemView('matches')">View All</span>
               </div>
               <div class="flex flex-wrap gap-4">
                 ${recs.slice(0, 3).map(r => `
                   <div class="flex-1 min-w-[180px] bg-slate-50 hover:bg-slate-100/80 border rounded-xl p-4 text-center cursor-pointer transition-all" onclick="openPartnerProfile('${r.candidate.id}')">
                     <div class="w-12 h-12 rounded-full bg-slate-100 border-2 border-indigo-100 flex items-center justify-center text-3xl overflow-hidden mb-2 mx-auto">${renderAvatar(r.candidate.avatar, 'text-3xl', 'w-full h-full object-cover rounded-full')}</div>
                     <h4 class="font-semibold text-slate-800 text-xs truncate">${r.candidate.name}</h4>
                     <p class="text-[10px] text-slate-400 truncate">${r.candidate.gradeLevel || r.candidate.yearSection || ''} • ${r.candidate.schoolName || r.candidate.program || ''}</p>
                     <span class="inline-block bg-indigo-50 border border-indigo-100 text-brand-purple text-[10px] font-bold px-2 py-0.5 rounded-full mt-2">${r.match.total}% Match</span>
                   </div>
                 `).join('')}
               </div>
             </div>
          </div>

          <!-- Column 3: Profile Progress & Quick Stats -->
          <div class="space-y-6">
            <!-- Profile Completion card -->
            <div class="bg-white border rounded-2xl p-6 shadow-sm flex items-center justify-between">
              <div>
                <h3 class="font-heading font-bold text-slate-800">Profile Completion</h3>
                <p class="text-xs text-slate-500 mt-1 max-w-[140px]">Complete your profile to get more compatible partners.</p>
              </div>
              <div class="circular-progress">
                <svg>
                  <circle class="bg" cx="45" cy="45" r="40"></circle>
                  <circle class="fg" cx="45" cy="45" r="40" style="stroke-dashoffset: ${strokeDash};"></circle>
                </svg>
                <div class="absolute inset-0 flex items-center justify-center font-bold text-sm text-brand-purple">85%</div>
              </div>
            </div>

            <!-- Quick Stats -->
            <div class="bg-white border rounded-2xl p-6 shadow-sm">
              <h3 class="font-heading font-bold text-slate-800 mb-4">Quick Stats</h3>
              <div class="grid grid-cols-3 gap-3 text-center">
                <div class="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div class="text-lg">🤝</div>
                  <div class="text-sm font-bold text-slate-800 mt-1">${matchCount}</div>
                  <div class="text-[9px] text-slate-400 uppercase tracking-wide">Matches</div>
                </div>
                <div class="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div class="text-lg">💻</div>
                  <div class="text-sm font-bold text-slate-800 mt-1">${meetingCount}</div>
                  <div class="text-[9px] text-slate-400 uppercase tracking-wide">Meetings</div>
                </div>
                <div class="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div class="text-lg">💬</div>
                  <div class="text-sm font-bold text-slate-800 mt-1">${acceptedCount}</div>
                  <div class="text-[9px] text-slate-400 uppercase tracking-wide">Partners</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    `;
  }

  // --- 6. MY SCHEDULE PANE ---
  
  let isSchedDragging = false;
  let schedDragMode = true;

  function renderSchedulePane() {
    let calendarRowsHTML = "";
    const allDays = [...DAYS, "Sunday"];
    // 8AM to 10PM
    const hours = [8,9,10,11,12,13,14,15,16,17,18,19,20,21,22];

    hours.forEach(hour => {
      const timeStr = hour > 12 ? `${hour-12} PM` : (hour === 12 ? '12 PM' : `${hour} AM`);
      calendarRowsHTML += `<div class="grid grid-cols-8 gap-1.5 items-center my-1">
        <div class="text-[10px] text-slate-400 font-semibold text-right pr-2">${timeStr}</div>
      `;

      allDays.forEach(day => {
        const isAvail = currentUser.schedule[day] && currentUser.schedule[day].includes(hour);
        calendarRowsHTML += `
          <div class="h-8 rounded border transition-colors cursor-pointer ${isAvail ? 'bg-brand-purple border-brand-purple' : 'bg-slate-50 hover:bg-indigo-50 border-slate-100'}"
               data-day="${day}"
               data-hour="${hour}"
               onmousedown="startSchedDrag(event, this)"
               onmouseenter="hoverSchedDrag(this)">
          </div>
        `;
      });
      calendarRowsHTML += `</div>`;
    });

    sysPanes.schedule.innerHTML = `
      <div class="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
        <div class="flex justify-between items-center border-b pb-4">
          <div>
            <h3 class="font-heading font-bold text-lg text-slate-900">My Weekly Availability</h3>
            <p class="text-xs text-slate-500">Edit your preferred windows to study. Highlights save instantly.</p>
          </div>
          <button class="bg-brand-purple hover:bg-opacity-90 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm" onclick="saveUserSchedule()">
            Save Schedule
          </button>
        </div>

        <div class="overflow-x-auto">
          <div class="min-w-[650px] schedule-grid-container" id="schedule-pane-container">
            <div class="grid grid-cols-8 gap-1.5 text-center font-bold text-xs text-brand-purple pb-2 border-b">
              <div>Time</div>
              ${DAYS.map(d => `<div>${d.slice(0,3)}</div>`).join('')}
              <div>Sun</div>
            </div>
            ${calendarRowsHTML}
          </div>
        </div>
      </div>
    `;

    // Global listener to terminate dragging
    window.addEventListener("mouseup", () => { isSchedDragging = false; });
  }

  window.startSchedDrag = function(e, cell) {
    e.preventDefault();
    isSchedDragging = true;
    const isAvail = cell.classList.contains("bg-brand-purple");
    schedDragMode = !isAvail;
    toggleSchedCell(cell, schedDragMode);
  };

  window.hoverSchedDrag = function(cell) {
    if (isSchedDragging) {
      toggleSchedCell(cell, schedDragMode);
    }
  };

  function toggleSchedCell(cell, setAvailable) {
    const day = cell.getAttribute("data-day");
    const hour = parseInt(cell.getAttribute("data-hour"));

    if (!currentUser.schedule[day]) {
      currentUser.schedule[day] = [];
    }

    if (setAvailable) {
      cell.className = "h-8 rounded border transition-colors cursor-pointer bg-brand-purple border-brand-purple";
      if (!currentUser.schedule[day].includes(hour)) {
        currentUser.schedule[day].push(hour);
      }
    } else {
      cell.className = "h-8 rounded border transition-colors cursor-pointer bg-slate-50 hover:bg-indigo-50 border-slate-100";
      currentUser.schedule[day] = currentUser.schedule[day].filter(h => h !== hour);
    }
  }

  window.saveUserSchedule = async function() {
    const users = db.getUsers();
    const index = users.findIndex(u => u.id === currentUser.id);
    if (index !== -1) {
      currentUser.studySchedule = currentUser.schedule;
      users[index].schedule = currentUser.schedule;
      users[index].studySchedule = currentUser.studySchedule;

      showToast('Saving schedule... ⏳', 'info');
      await db.saveUsers(users);

      const freshUser = db.getUsers().find(u => u.id === currentUser.id);
      if (freshUser) currentUser = freshUser;

      db.addLog("user", `${currentUser.name} updated schedule availability.`);
      showToast('Schedule saved successfully!', 'success');
      showSystemView("schedule"); // Refresh availability view
    }
  };

  // --- 7. MATCHES RECOMMENDATIONS FEED PANE ---
  
  let recommendationsFilter = "recs"; // "recs" or "all"

  window.adjustWeights = function(changedKey, val) {
    val = parseInt(val);
    const keys = ['course', 'skill', 'schedule'];
    const otherKeys = keys.filter(k => k !== changedKey);

    const oldOthersSum = matchWeights[otherKeys[0]] + matchWeights[otherKeys[1]];
    matchWeights[changedKey] = val;
    const remaining = 100 - val;

    if (oldOthersSum > 0) {
      const share0 = Math.round(remaining * (matchWeights[otherKeys[0]] / oldOthersSum));
      matchWeights[otherKeys[0]] = share0;
      matchWeights[otherKeys[1]] = remaining - share0;
    } else {
      const share0 = Math.floor(remaining / 2);
      matchWeights[otherKeys[0]] = share0;
      matchWeights[otherKeys[1]] = remaining - share0;
    }

    localStorage.setItem("peerlink_weights", JSON.stringify(matchWeights));
    
    // Update slider control values directly in DOM to prevent lost focus
    const lblCourse = document.getElementById("lbl-weight-course");
    const lblSkill = document.getElementById("lbl-weight-skill");
    const lblSchedule = document.getElementById("lbl-weight-schedule");
    
    const sliderCourse = document.getElementById("slider-weight-course");
    const sliderSkill = document.getElementById("slider-weight-skill");
    const sliderSchedule = document.getElementById("slider-weight-schedule");

    if (lblCourse) lblCourse.textContent = `${matchWeights.course}%`;
    if (lblSkill) lblSkill.textContent = `${matchWeights.skill}%`;
    if (lblSchedule) lblSchedule.textContent = `${matchWeights.schedule}%`;

    if (sliderCourse) sliderCourse.value = matchWeights.course;
    if (sliderSkill) sliderSkill.value = matchWeights.skill;
    if (sliderSchedule) sliderSchedule.value = matchWeights.schedule;

    // Recalculate and re-render only the table contents
    const allUsers = db.getUsers().filter(u => u.id !== currentUser.id);
    const recs = getSortedRecommendations(currentUser);
    const displayList = recommendationsFilter === "recs" ? recs : allUsers.map(u => ({
      candidate: u,
      match: calculateMatchDetails(currentUser, u)
    }));

    document.getElementById("matches-count-label").textContent = `${displayList.filter(item => !item.candidate.isBanned && !item.candidate.isAdmin).length} Students listed`;
    renderMatchesTableBody(displayList);
  };

  function renderMatchesTableBody(displayList) {
    const conns = db.getConnections() || [];
    const tbody = document.getElementById("matches-table-body");
    if (!tbody) return;

    tbody.innerHTML = displayList.filter(item => !item.candidate.isBanned && !item.candidate.isAdmin).map(item => {
      const p = item.candidate;
      const m = item.match;

      const existing = conns.find(c => 
        (c.senderId === currentUser.id && c.receiverId === p.id) ||
        (c.senderId === p.id && c.receiverId === currentUser.id)
      );

      let statusBtn = "";
      let swipeAction = "connect"; // default swipe-right action
      if (!existing) {
        statusBtn = `<button onclick="sendConnect('${p.id}')" class="bg-brand-purple hover:bg-opacity-90 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-all">Connect</button>`;
        swipeAction = "connect";
      } else if (existing.status === "pending") {
        if (existing.senderId === currentUser.id) {
          statusBtn = `<span class="text-xs font-bold text-slate-400 bg-slate-100 border px-3 py-1.5 rounded-lg">Pending</span>`;
          swipeAction = "none";
        } else {
          statusBtn = `
            <button onclick="acceptConnect('${p.id}')" class="bg-brand-teal hover:bg-opacity-90 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-all">Accept</button>
            <button onclick="declineConnect('${p.id}')" class="bg-red-500 hover:bg-red-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-all">Decline</button>
          `;
          swipeAction = "accept";
        }
      } else if (existing.status === "accepted") {
        statusBtn = `<span class="text-xs font-bold text-brand-teal bg-teal-50 border border-teal-100 px-3 py-1.5 rounded-lg">Connected</span>`;
        swipeAction = "none";
      }

      const coursesHTML = m.sharedCourses.length > 0 ? 
        m.sharedCourses.slice(0, 2).map(c => `<span class="block text-xs font-medium text-slate-800">• ${c}</span>`).join('') :
        `<span class="text-xs text-slate-400">None</span>`;

      const skillsHTML = m.canLearnSkills.concat(m.canTeachSkills).length > 0 ?
        m.canLearnSkills.concat(m.canTeachSkills).slice(0, 2).map(s => `<span class="block text-xs font-medium text-slate-800">• ${s}</span>`).join('') :
        `<span class="text-xs text-slate-400">None</span>`;

      const overlapString = m.overlappingSlots.length > 0 ?
        `${m.overlappingSlots[0].day} @ ${m.overlappingSlots[0].hour > 12 ? m.overlappingSlots[0].hour-12+'PM' : m.overlappingSlots[0].hour+'AM'}` :
        "Flexible / None";

      const onlineBadge = p.isOnline 
        ? `<span class="inline-block w-2 h-2 rounded-full bg-emerald-400 border-2 border-white shadow-sm" title="Online"></span>`
        : `<span class="inline-block w-2 h-2 rounded-full bg-slate-300 border-2 border-white shadow-sm" title="Offline"></span>`;

      return `
        <div class="match-row" data-pid="${p.id}" data-swipe="${swipeAction}">
          <!-- Desktop: grid row (lg+) -->
          <div class="hidden lg:grid lg:items-center hover:bg-slate-50/50" style="grid-template-columns: 2.2fr 0.7fr 1fr 1fr 1fr 1.5fr;">
            <div class="p-4 pl-6">
              <div class="flex items-center gap-3">
                <div class="relative">
                  <div class="text-2xl w-10 h-10 rounded-full bg-slate-100 border flex items-center justify-center overflow-hidden">${renderAvatar(p.avatar, 'text-2xl', 'w-full h-full object-cover rounded-full')}</div>
                  <div class="absolute -bottom-0.5 -right-0.5">${onlineBadge}</div>
                </div>
                <div>
                  <h4 class="font-bold text-slate-800">${p.name}</h4>
                  <p class="text-xs text-slate-400 truncate max-w-[200px]">${p.gradeLevel || p.yearSection || ''} • ${p.schoolName || p.program || ''}</p>
                </div>
              </div>
            </div>
            <div class="p-4">
              <span class="inline-flex bg-green-50 border border-green-100 text-green-600 text-xs font-bold px-2 py-0.5 rounded-full">${m.total}% Match</span>
            </div>
            <div class="p-4"><div>${coursesHTML}</div></div>
            <div class="p-4"><div>${skillsHTML}</div></div>
            <div class="p-4">
              <span class="text-xs font-medium text-slate-600">${overlapString}</span>
            </div>
            <div class="p-4 pr-6 text-right">
              <div class="inline-flex gap-2 flex-wrap justify-end">
                <button onclick="openPartnerProfile('${p.id}')" class="text-slate-500 hover:text-slate-800 border bg-white font-bold text-xs px-3 py-1.5 rounded-lg">View Profile</button>
                ${statusBtn}
              </div>
            </div>
          </div>
          <!-- Mobile: compact swipeable card -->
          <div class="lg:hidden p-4 hover:bg-slate-50/50">
            <div class="flex items-center gap-3 mb-3">
              <div class="relative shrink-0">
                <div class="text-2xl w-11 h-11 rounded-full bg-slate-100 border flex items-center justify-center overflow-hidden">${renderAvatar(p.avatar, 'text-2xl', 'w-full h-full object-cover rounded-full')}</div>
                <div class="absolute -bottom-0.5 -right-0.5">${onlineBadge}</div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <h4 class="font-bold text-slate-800 text-sm">${p.name}</h4>
                  <span class="inline-flex bg-green-50 border border-green-100 text-green-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">${m.total}% match</span>
                </div>
                <p class="text-xs text-slate-400 truncate">${p.gradeLevel || p.yearSection || ''} • ${p.schoolName || p.program || ''}</p>
                <p class="text-[10px] text-slate-400 mt-0.5">📅 ${overlapString}</p>
              </div>
            </div>
            <div class="flex gap-2 flex-wrap items-center">
              <button onclick="openPartnerProfile('${p.id}')" class="text-slate-500 hover:text-slate-800 border bg-white font-bold text-xs px-3 py-1.5 rounded-lg">View Profile</button>
              ${statusBtn}
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach swipe handlers after DOM update
    attachMatchSwipeHandlers();
  }

  // ── Swipe handler for match rows (with touch event overrides for iOS Safari compatibility) ──
  function attachMatchSwipeHandlers() {
    const SWIPE_THRESHOLD = 80;   // px to trigger action
    const VERTICAL_CANCEL = 15;   // px vertical drift cancels horizontal swipe

    document.querySelectorAll('.match-row').forEach(row => {
      // Remove old listeners by cloning
      const fresh = row.cloneNode(true);
      row.parentNode.replaceChild(fresh, row);
      const tr = fresh;

      const pid = tr.dataset.pid;
      const action = tr.dataset.swipe;

      let startX = 0, startY = 0, currentX = 0;
      let dragging = false;
      let cancelled = false;
      let animating = false;

      function applyTranslate(dx) {
        tr.style.transform = `translateX(${dx}px)`;
        tr.style.transition = 'none';
        if (dx > 20) {
          tr.style.background = `rgba(99,102,241,${Math.min(dx / 200, 0.18)})`;
        } else if (dx < -20) {
          tr.style.background = `rgba(239,68,68,${Math.min(-dx / 200, 0.1)})`;
        } else {
          tr.style.background = '';
        }
      }

      function snapBack() {
        tr.style.transition = 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), background 0.3s ease';
        tr.style.transform = 'translateX(0)';
        tr.style.background = '';
        animating = false;
      }

      function triggerAction(dir) {
        const targetX = dir > 0 ? 120 : -120;
        tr.style.transition = 'transform 0.18s ease-out';
        tr.style.transform = `translateX(${targetX}px)`;
        animating = true;
        setTimeout(() => {
          snapBack();
          if (dir > 0) {
            if (action === 'connect') sendConnect(pid);
            else if (action === 'accept') acceptConnect(pid);
          } else {
            openPartnerProfile(pid);
          }
        }, 180);
      }

      // Unified touch start
      function handleStart(clientX, clientY) {
        if (animating) return;
        startX = clientX;
        startY = clientY;
        currentX = 0;
        dragging = true;
        cancelled = false;
      }

      // Unified touch move
      function handleMove(clientX, clientY, e) {
        if (!dragging || animating) return;
        const dx = clientX - startX;
        const dy = clientY - startY;

        if (!cancelled && Math.abs(dy) > VERTICAL_CANCEL && Math.abs(dy) > Math.abs(dx)) {
          cancelled = true;
          dragging = false;
          snapBack();
          return;
        }
        if (cancelled) return;

        // Prevent native horizontal scrolling in Safari/Chrome
        if (e && e.cancelable) {
          e.preventDefault();
        }

        currentX = dx;
        if (action === 'none' && dx > 0) {
          applyTranslate(dx * 0.15);
        } else {
          applyTranslate(dx);
        }
      }

      // Unified touch end
      function handleEnd() {
        if (!dragging || cancelled || animating) {
          dragging = false;
          return;
        }
        dragging = false;
        const dx = currentX;

        if (dx >= SWIPE_THRESHOLD && action !== 'none') {
          triggerAction(1);
        } else if (dx <= -SWIPE_THRESHOLD) {
          triggerAction(-1);
        } else {
          snapBack();
        }
      }

      // --- Bind native touch events for perfect Safari / iPhone support ---
      tr.addEventListener('touchstart', e => {
        if (e.target.closest('button, a')) return;
        const touch = e.touches[0];
        handleStart(touch.clientX, touch.clientY);
      }, { passive: true });

      tr.addEventListener('touchmove', e => {
        if (!dragging) return;
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY, e);
      }, { passive: false }); // Needs passive: false to allow preventDefault (prevents native swipe-back gestures)

      tr.addEventListener('touchend', () => {
        handleEnd();
      }, { passive: true });

      tr.addEventListener('touchcancel', () => {
        dragging = false;
        cancelled = true;
        snapBack();
      }, { passive: true });

      // --- Bind Mouse/Pointer fallback for Desktop support ---
      tr.addEventListener('mousedown', e => {
        if (e.target.closest('button, a')) return;
        handleStart(e.clientX, e.clientY);
        
        const mouseMoveHandler = ev => {
          handleMove(ev.clientX, ev.clientY, ev);
        };
        const mouseUpHandler = () => {
          handleEnd();
          window.removeEventListener('mousemove', mouseMoveHandler);
          window.removeEventListener('mouseup', mouseUpHandler);
        };
        
        window.addEventListener('mousemove', mouseMoveHandler);
        window.addEventListener('mouseup', mouseUpHandler);
      });
    });
  }

  function renderMatchesPane() {
    const recs = getSortedRecommendations(currentUser);
    const allUsers = db.getUsers().filter(u => u.id !== currentUser.id && !u.isAdmin && u.id !== 'admin' && !u.isBanned);
    const conns = db.getConnections() || [];

    let displayList = [];
    if (recommendationsFilter === "recs") {
      displayList = recs;
    } else if (recommendationsFilter === "all") {
      displayList = allUsers.map(u => ({
        candidate: u,
        match: calculateMatchDetails(currentUser, u)
      }));
    } else if (recommendationsFilter === "partners") {
      const partnerIds = conns
        .filter(c => c.status === "accepted" && (c.senderId === currentUser.id || c.receiverId === currentUser.id))
        .map(c => c.senderId === currentUser.id ? c.receiverId : c.senderId);
      displayList = allUsers.filter(u => partnerIds.includes(u.id)).map(u => ({
        candidate: u,
        match: calculateMatchDetails(currentUser, u)
      }));
    } else if (recommendationsFilter === "pending") {
      const pendingIds = conns
        .filter(c => c.status === "pending" && (c.senderId === currentUser.id || c.receiverId === currentUser.id))
        .map(c => c.senderId === currentUser.id ? c.receiverId : c.senderId);
      displayList = allUsers.filter(u => pendingIds.includes(u.id)).map(u => ({
        candidate: u,
        match: calculateMatchDetails(currentUser, u)
      }));
    }

    let weightsCardHTML = "";
    if (recommendationsFilter === "recs" || recommendationsFilter === "all") {
      weightsCardHTML = `
        <!-- Weights Control Card -->
        <div class="bg-white border rounded-2xl p-6 shadow-sm">
          <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 border-b pb-4">
            <div>
              <h3 class="font-heading font-extrabold text-lg text-slate-900 flex items-center gap-2">
                <span>🎛️</span> Recommendation Engine Playground
              </h3>
              <p class="text-xs text-slate-500">Fine-tune matching weights. The sum must always stay 100%.</p>
            </div>
            <span class="inline-flex bg-indigo-50 border border-indigo-100 text-brand-purple text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
              Content-Based Filtering (Cosine Similarity)
            </span>
          </div>

          <!-- Weights Sliders Grid -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="space-y-2">
              <div class="flex justify-between text-xs font-bold text-slate-700">
                <span>📖 Subject Overlap Weight</span>
                <span class="text-brand-purple" id="lbl-weight-course">${matchWeights.course}%</span>
              </div>
              <input type="range" id="slider-weight-course" min="0" max="100" value="${matchWeights.course}" 
                     class="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                     oninput="adjustWeights('course', this.value)">
              <div class="text-[10px] text-slate-400 font-medium">Matches overlapping subjects between students.</div>
            </div>

            <div class="space-y-2">
              <div class="flex justify-between text-xs font-bold text-slate-700">
                <span>💡 Skill Alignment Weight</span>
                <span class="text-brand-purple" id="lbl-weight-skill">${matchWeights.skill}%</span>
              </div>
              <input type="range" id="slider-weight-skill" min="0" max="100" value="${matchWeights.skill}" 
                     class="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                     oninput="adjustWeights('skill', this.value)">
              <div class="text-[10px] text-slate-400 font-medium">Matches complement (what you have vs what they want).</div>
            </div>

            <div class="space-y-2">
              <div class="flex justify-between text-xs font-bold text-slate-700">
                <span>📅 Schedule Sync Weight</span>
                <span class="text-brand-purple" id="lbl-weight-schedule">${matchWeights.schedule}%</span>
              </div>
              <input type="range" id="slider-weight-schedule" min="0" max="100" value="${matchWeights.schedule}" 
                     class="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                     oninput="adjustWeights('schedule', this.value)">
              <div class="text-[10px] text-slate-400 font-medium">Matches overlapping vacant times/schedule gaps.</div>
            </div>
          </div>

          <!-- Formula Explanations Collapsible Details -->
          <details class="mt-6 border-t pt-4 group">
            <summary class="text-xs font-bold text-slate-500 cursor-pointer hover:text-slate-800 transition-colors list-none flex items-center gap-1">
              <span class="transition-transform group-open:rotate-90">▶</span> View Mathematical Matching Formulas (Cosine Similarity)
            </summary>
            <div class="mt-4 p-4 bg-slate-50 rounded-xl border space-y-4 font-mono text-[11px] text-slate-600 font-medium">
              <div>
                <p class="font-bold text-slate-800 text-xs font-sans mb-1">1. Subject Overlap Cosine Similarity:</p>
                <div class="bg-white p-2.5 rounded border border-slate-200 shadow-sm inline-block select-all font-mono">
                  Similarity(A, B) = |A_subjects ∩ B_subjects| / √( |A_subjects| * |B_subjects| )
                </div>
              </div>
              <div>
                <p class="font-bold text-slate-800 text-xs font-sans mb-1">2. Skill Exchange Vector Alignment:</p>
                <div class="bg-white p-2.5 rounded border border-slate-200 shadow-sm inline-block select-all font-mono">
                  LearnCosine = |Want_A ∩ Have_B| / √( |Want_A| * |Have_B| ) <br>
                  TeachCosine = |Have_A ∩ Want_B| / √( |Have_A| * |Want_B| ) <br>
                  SkillScore = ( LearnCosine + TeachCosine ) / 2
                </div>
              </div>
              <div>
                <p class="font-bold text-slate-800 text-xs font-sans mb-1">3. Schedule Spatial-Temporal Gap Sync:</p>
                <div class="bg-white p-2.5 rounded border border-slate-200 shadow-sm inline-block select-all font-mono">
                  ScheduleScore = |Slots_A ∩ Slots_B| / √( |Slots_A| * |Slots_B| )
                </div>
              </div>
            </div>
          </details>
        </div>
      `;
    }

    sysPanes.matches.innerHTML = `
      <div class="space-y-6">
        ${weightsCardHTML}

        <!-- Recommendations Table Card -->
        <div class="bg-white border rounded-2xl shadow-sm overflow-hidden">
          <!-- Filter Tabs -->
          <div class="flex flex-col sm:flex-row border-b bg-slate-50/70 p-4 justify-between items-start sm:items-center gap-4">
            <div class="flex flex-wrap gap-2">
              <button class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${recommendationsFilter === 'recs' ? 'bg-brand-purple text-white' : 'text-slate-600 hover:bg-slate-150'}" onclick="setMatchesFilter('recs')">
                Recommended for You
              </button>
              <button class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${recommendationsFilter === 'all' ? 'bg-brand-purple text-white' : 'text-slate-600 hover:bg-slate-150'}" onclick="setMatchesFilter('all')">
                All Students
              </button>
              <button class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${recommendationsFilter === 'partners' ? 'bg-brand-purple text-white' : 'text-slate-600 hover:bg-slate-150'}" onclick="setMatchesFilter('partners')">
                My Partners / Friends
              </button>
              <button class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${recommendationsFilter === 'pending' ? 'bg-brand-purple text-white' : 'text-slate-600 hover:bg-slate-150'}" onclick="setMatchesFilter('pending')">
                Pending Requests
              </button>
            </div>
            <span class="text-xs text-slate-400 font-semibold" id="matches-count-label">${displayList.length} Students listed</span>
          </div>

          <!-- List header (desktop only) -->
          <div class="hidden lg:grid bg-slate-50 text-[10px] text-slate-400 font-bold uppercase border-b" style="grid-template-columns: 2.2fr 0.7fr 1fr 1fr 1fr 1.5fr;">
            <div class="p-4 pl-6">Student Partner</div>
            <div class="p-4">Match Score</div>
            <div class="p-4">Shared Subjects</div>
            <div class="p-4">Shared Skills</div>
            <div class="p-4">Common Availability</div>
            <div class="p-4 pr-6 text-right">Actions</div>
          </div>
          <!-- Match rows container -->
          <div class="divide-y divide-slate-100" id="matches-table-body"></div>
        </div>
      </div>
    `;

    renderMatchesTableBody(displayList);
  }

  window.setMatchesFilter = function(filter) {
    recommendationsFilter = filter;
    renderMatchesPane();
  };

  window.sendConnect = function(partnerId) {
    const conns = db.getConnections() || [];
    const target = db.getUsers().find(u => u.id === partnerId);
    conns.push({
      senderId: currentUser.id,
      receiverId: partnerId,
      status: "pending",
      timestamp: Date.now()
    });
    db.saveConnections(conns);
    
    db.addLog("connection", `${currentUser.name} requested collaboration with ${target ? target.name : partnerId}.`);
    showToast('Study request sent successfully!', 'success');
    renderMatchesPane();
    if (activeSystemView === "dashboard") renderDashboardPane();
  };

  window.acceptConnect = function(partnerId) {
    const conns = db.getConnections() || [];
    const idx = conns.findIndex(c => c.senderId === partnerId && c.receiverId === currentUser.id);
    if (idx !== -1) {
      conns[idx].status = "accepted";
      db.saveConnections(conns);

      const target = db.getUsers().find(u => u.id === partnerId);
      
      // Setup chat room with sorted ID for bilateral access
      const chats = db.getChats() || [];
      const roomId = [partnerId, currentUser.id].sort().join('_');
      if (!chats.some(c => c.roomId === roomId)) {
        chats.push({
          roomId,
          messages: [{
            senderId: partnerId,
            senderName: target ? target.name : 'Study Partner',
            text: `Hi! Let's arrange a time to study our common subjects!`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]
        });
        db.saveChats(chats);
      }

      // Notify sound
      const sound = document.getElementById("notif-sound");
      if (sound) sound.play().catch(() => {});

      db.addLog("connection", `${currentUser.name} accepted request from ${target ? target.name : partnerId}.`);
      showToast('Study request accepted! Conversation started.', 'success');
      
      if (activeSystemView === "matches") renderMatchesPane();
      if (activeSystemView === "dashboard") renderDashboardPane();
    }
  };

  window.declineConnect = async function(partnerId) {
    const conns = db.getConnections() || [];
    const conn = conns.find(c => c.senderId === partnerId && c.receiverId === currentUser.id);
    if (conn) {
      const confirmed = await showConfirm({
        title: 'Decline Request',
        message: 'Are you sure you want to decline this study partnership invitation?',
        type: 'warning',
        okLabel: 'Yes, Decline'
      });
      if (confirmed) {
        await db.deleteConnection(conn.id);
        showToast('Request declined.', 'info');
        if (activeSystemView === "matches") renderMatchesPane();
        if (activeSystemView === "dashboard") renderDashboardPane();
      }
    }
  };

  window.openPartnerProfile = function(partnerId) {
    window.currentOpenedPartnerId = partnerId;
    const partner = db.getUsers().find(u => u.id === partnerId);
    if (!partner) return;

    const match = calculateMatchDetails(currentUser, partner);
    
    // Find connection status
    const conns = db.getConnections() || [];
    const existing = conns.find(c => 
      (c.senderId === currentUser.id && c.receiverId === partner.id) ||
      (c.senderId === partner.id && c.receiverId === currentUser.id)
    );

    let actionBtnHTML = "";
    if (!existing) {
      actionBtnHTML = `
        <button onclick="sendConnectFromModal('${partner.id}')" class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path></svg>
          Send Connect Request
        </button>
      `;
    } else if (existing.status === "pending") {
      if (existing.senderId === currentUser.id) {
        actionBtnHTML = `
          <button disabled class="flex-1 bg-slate-100 text-slate-400 font-bold py-2.5 px-4 rounded-xl border border-slate-200 text-sm cursor-not-allowed">
            Pending Request
          </button>
        `;
      } else {
        actionBtnHTML = `
          <button onclick="acceptConnectFromModal('${partner.id}')" class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            Accept Request
          </button>
        `;
      }
    } else if (existing.status === "accepted") {
      actionBtnHTML = `
        <button onclick="chatWithPartnerFromModal('${partner.id}')" class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
          Chat Now
        </button>
      `;
    }

    // Format overlap hours
    let overlapHoursHTML = "";
    if (match.overlappingSlots && match.overlappingSlots.length > 0) {
      overlapHoursHTML = match.overlappingSlots.map(slot => {
        let displayHour = slot.hour;
        let suffix = "AM";
        if (slot.hour >= 12) {
          suffix = "PM";
          if (slot.hour > 12) displayHour = slot.hour - 12;
        }
        return `<span class="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-indigo-100">${slot.day} @ ${displayHour}${suffix}</span>`;
      }).join(' ');
    } else {
      overlapHoursHTML = `<span class="text-xs text-slate-400">No overlapping hours found (Flexible availability).</span>`;
    }

    // Shared Courses
    const sharedCoursesHTML = match.sharedCourses.length > 0 
      ? match.sharedCourses.map(c => `<span class="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1.5 rounded-xl"><span class="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>${c}</span>`).join('')
      : `<span class="text-xs text-slate-400">No subjects in common.</span>`;

    // Partner other courses
    const otherCourses = partner.courses.filter(c => !match.sharedCourses.includes(c));
    const otherCoursesHTML = otherCourses.length > 0
      ? otherCourses.map(c => `<span class="inline-flex items-center bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium px-3 py-1.5 rounded-xl">${c}</span>`).join('')
      : "";

    // Skills you can learn (Skills they offer which you want)
    const canLearnSkillsHTML = match.canLearnSkills.length > 0
      ? match.canLearnSkills.map(s => `<span class="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-1.5 rounded-xl"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 13l-7 7-7-7m14-6l-7 7-7-7"></path></svg>${s}</span>`).join('')
      : `<span class="text-xs text-slate-400">None</span>`;

    // Skills you can teach (Skills you offer which they want)
    const canTeachSkillsHTML = match.canTeachSkills.length > 0
      ? match.canTeachSkills.map(s => `<span class="inline-flex items-center gap-1 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1.5 rounded-xl"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 11l7-7 7 7M5 19l7-7 7 7"></path></svg>${s}</span>`).join('')
      : `<span class="text-xs text-slate-400">None</span>`;

    // Other skills they have
    const otherHaves = partner.skills.have.filter(s => !match.canLearnSkills.includes(s));
    const otherHavesHTML = otherHaves.length > 0
      ? otherHaves.map(s => `<span class="inline-flex items-center bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium px-2.5 py-1.5 rounded-xl">${s}</span>`).join('')
      : "";

    // Other skills they want
    const otherWants = partner.skills.want.filter(s => !match.canTeachSkills.includes(s));
    const otherWantsHTML = otherWants.length > 0
      ? otherWants.map(s => `<span class="inline-flex items-center bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium px-2.5 py-1.5 rounded-xl">${s}</span>`).join('')
      : "";

    let modal = document.getElementById("partner-profile-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "partner-profile-modal";
      modal.className = "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300";
      document.body.appendChild(modal);
    } else {
      modal.classList.remove("hidden");
    }

    modal.innerHTML = `
      <div class="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] scale-95 opacity-0 transition-all duration-300 transform" id="modal-card">
        <!-- Modal Header -->
        <div class="relative bg-gradient-to-r from-indigo-50 to-indigo-100/50 p-6 flex items-start gap-4 border-b border-indigo-100 shrink-0">
          <button onclick="closePartnerProfileModal()" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-50 p-1.5 rounded-full border shadow-sm transition-all">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
          
          <div class="text-4xl w-16 h-16 rounded-full bg-white border flex items-center justify-center shadow-inner shrink-0 overflow-hidden">${renderAvatar(partner.avatar, 'text-4xl', 'w-full h-full object-cover rounded-full')}</div>
          <div class="space-y-1 pr-6">
            <h3 class="font-heading font-extrabold text-2xl text-slate-800">${partner.name}</h3>
            <p class="text-sm font-semibold text-indigo-600 flex flex-wrap items-center gap-1.5">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
              <span>${partner.gradeLevel || partner.yearSection || ''} ${partner.section ? `(${partner.section})` : ''} • ${partner.schoolName || partner.program || ''}</span>
              ${partner.track && partner.strand ? `<span class="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full">${partner.track} (${partner.strand})</span>` : ''}
            </p>
          </div>
        </div>

        <!-- Scrollable Modal Content -->
        <div class="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700">
          
          <!-- Recommendation Score Metric -->
          <div class="bg-indigo-50/40 border border-indigo-100 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-6">
            <div class="text-center sm:text-left shrink-0">
              <span class="text-[10px] uppercase font-bold tracking-wider text-indigo-500 block mb-1">Recommendation Engine</span>
              <div class="text-4xl font-black text-indigo-700">${match.total}% <span class="text-lg font-bold text-indigo-500">Match</span></div>
            </div>
            
            <div class="flex-1 w-full space-y-3">
              <!-- Course Similarity Bar -->
              <div>
                <div class="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                  <span>Subject Similarity</span>
                  <span>${match.coursePercent}%</span>
                </div>
                <div class="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden">
                  <div class="bg-indigo-500 h-full rounded-full transition-all duration-500" style="width: ${match.coursePercent}%"></div>
                </div>
              </div>
              
              <!-- Skill Compatibility Bar -->
              <div>
                <div class="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                  <span>Skill Compatibility</span>
                  <span>${match.skillPercent}%</span>
                </div>
                <div class="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden">
                  <div class="bg-emerald-500 h-full rounded-full transition-all duration-500" style="width: ${match.skillPercent}%"></div>
                </div>
              </div>

              <!-- Schedule Sync Bar -->
              <div>
                <div class="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                  <span>Schedule Sync</span>
                  <span>${match.schedulePercent}%</span>
                </div>
                <div class="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden">
                  <div class="bg-blue-500 h-full rounded-full transition-all duration-500" style="width: ${match.schedulePercent}%"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Biography -->
          ${partner.bio ? `
            <div class="space-y-1.5">
              <h4 class="text-xs uppercase font-extrabold tracking-wider text-slate-400">About Me</h4>
              <p class="text-sm bg-slate-50 border rounded-2xl p-4 italic text-slate-600 font-medium leading-relaxed">"${partner.bio}"</p>
            </div>
          ` : ""}

          <!-- Courses -->
          <div class="space-y-2">
            <h4 class="text-xs uppercase font-extrabold tracking-wider text-slate-400">Subjects of Focus</h4>
            <div class="flex flex-wrap gap-2">
              ${sharedCoursesHTML}
              ${otherCoursesHTML}
            </div>
          </div>

          <!-- Skills Alignment -->
          <div class="space-y-4">
            <h4 class="text-xs uppercase font-extrabold tracking-wider text-slate-400">Skills Profile</h4>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Learn from Them -->
              <div class="bg-emerald-50/10 border border-emerald-100 rounded-2xl p-4 space-y-2.5">
                <span class="text-xs font-bold text-emerald-700 block">Skills They Can Teach You</span>
                <div class="flex flex-wrap gap-1.5">
                  ${canLearnSkillsHTML}
                </div>
                ${otherHavesHTML ? `
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-2.5">Other Skills They Have</span>
                  <div class="flex flex-wrap gap-1.5">${otherHavesHTML}</div>
                ` : ""}
              </div>

              <!-- Teach Them -->
              <div class="bg-blue-50/10 border border-blue-100 rounded-2xl p-4 space-y-2.5">
                <span class="text-xs font-bold text-blue-700 block">Skills You Can Teach Them</span>
                <div class="flex flex-wrap gap-1.5">
                  ${canTeachSkillsHTML}
                </div>
                ${otherWantsHTML ? `
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-2.5">Other Skills They Want</span>
                  <div class="flex flex-wrap gap-1.5">${otherWantsHTML}</div>
                ` : ""}
              </div>
            </div>
          </div>

          <!-- Available Hours -->
          <div class="space-y-2 bg-slate-50/60 border rounded-2xl p-4">
            <h4 class="text-xs uppercase font-extrabold tracking-wider text-slate-400 mb-1">Common Study Availability</h4>
            <div class="flex flex-wrap gap-1.5">
              ${overlapHoursHTML}
            </div>
          </div>

        </div>

        <!-- Modal Footer -->
        <div class="bg-slate-50 border-t p-4 flex gap-3 shrink-0">
          <button onclick="closePartnerProfileModal()" class="px-5 py-2.5 bg-white hover:bg-slate-50 border font-bold text-slate-700 rounded-xl text-sm transition-all">
            Cancel
          </button>
          ${actionBtnHTML}
        </div>
      </div>
    `;

    // Animate Card Opening
    setTimeout(() => {
      const card = document.getElementById("modal-card");
      if (card) {
        card.classList.remove("scale-95", "opacity-0");
        card.classList.add("scale-100", "opacity-100");
      }
    }, 10);
  };

  window.closePartnerProfileModal = function() {
    window.currentOpenedPartnerId = null;
    const modal = document.getElementById("partner-profile-modal");
    if (modal) {
      const card = document.getElementById("modal-card");
      if (card) {
        card.classList.remove("scale-100", "opacity-100");
        card.classList.add("scale-95", "opacity-0");
      }
      setTimeout(() => {
        modal.classList.add("hidden");
      }, 200);
    }
  };

  window.sendConnectFromModal = function(partnerId) {
    window.sendConnect(partnerId);
    // Refresh modal
    setTimeout(() => {
      window.openPartnerProfile(partnerId);
    }, 300);
  };

  window.acceptConnectFromModal = function(partnerId) {
    window.acceptConnect(partnerId);
    // Refresh modal
    setTimeout(() => {
      window.openPartnerProfile(partnerId);
    }, 300);
  };

  window.chatWithPartnerFromModal = function(partnerId) {
    window.closePartnerProfileModal();
    window.selectActiveChat(partnerId);
    window.showSystemView('messages');
  };

  // --- 8. MEETINGS SCHEDULER PANE ---
  
  function renderMeetingsPane() {
    const conns = db.getConnections() || [];
    const users = db.getUsers() || [];
    const meetings = db.getMeetings() || [];

    if (!window.requestedMeetingIds) {
      window.requestedMeetingIds = new Set();
    }

    // Filter connected partners
    const partners = conns.filter(c => 
      c.status === "accepted" && (c.senderId === currentUser.id || c.receiverId === currentUser.id)
    ).map(c => {
      const pId = c.senderId === currentUser.id ? c.receiverId : c.senderId;
      return users.find(u => u.id === pId);
    });

    // 1. My Meetings (Host sessions, accepted guest sessions, or approved public sessions)
    const activeMeetings = meetings.filter(m => 
      m.host_id === currentUser.id || 
      (m.guest_id === currentUser.id && m.status === 'accepted') ||
      (m.is_public && (m.approved_participants || []).includes(currentUser.id))
    );

    // 2. Pending invitations (invited to, still pending)
    const pendingInvitations = meetings.filter(m =>
      m.guest_id === currentUser.id && m.status === 'pending'
    );

    // 3. Discoverable Public Meetings (not already participating or approved)
    const publicMeetings = meetings.filter(m => {
      const approved = m.approved_participants || [];
      const alreadyApproved = approved.includes(currentUser.id) || approved.includes(String(currentUser.id));
      return (
        m.is_public &&
        m.host_id !== currentUser.id &&
        m.guest_id !== currentUser.id &&
        !alreadyApproved
      );
    });

    function isMeetingTimeReached(m) {
      const now = new Date();
      const dateStr = now.getFullYear() + "-" + 
                      String(now.getMonth() + 1).padStart(2, '0') + "-" + 
                      String(now.getDate()).padStart(2, '0');
      const timeStr = String(now.getHours()).padStart(2, '0') + ":" + 
                      String(now.getMinutes()).padStart(2, '0');
      if (m.meeting_date < dateStr) {
        return true;
      } else if (m.meeting_date === dateStr) {
        return timeStr >= m.start_time;
      }
      return false;
    }

    // Helper: build HTML for lists to keep things DRY and dynamic
    const buildMeetingListHTML = (list) => {
      return list.map(m => {
        const isHost = m.host_id === currentUser.id;
        const partnerId = isHost ? m.guest_id : m.host_id;
        const p = users.find(u => u.id === partnerId);
        const hostObj = users.find(u => u.id === m.host_id);
        const isAudio = m.meeting_type === 'Audio Call' || m.meeting_type === 'voice';

        // Check if user is approved
        const approved = m.approved_participants || [];
        const isApproved = approved.includes(currentUser.id) || approved.includes(String(currentUser.id));

        const timeReached = isMeetingTimeReached(m);
        let buttonHTML = '';
        if (timeReached) {
          buttonHTML = `<button onclick="joinVideoCall(${m.id})" class="bg-brand-purple hover:bg-opacity-90 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all">Join Call</button>`;
        } else {
          buttonHTML = `<button class="bg-slate-200 text-slate-500 text-xs font-bold px-3 py-1.5 rounded-lg cursor-not-allowed" disabled>Not Started</button>`;
        }
        
        // If invitation list
        if (m.guest_id === currentUser.id && m.status === 'pending') {
          buttonHTML = `
            <div class="flex gap-2">
              <button onclick="declineInvitation(${m.id})" class="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg transition-all">Decline</button>
              <button onclick="acceptInvitation(${m.id})" class="bg-brand-purple hover:bg-opacity-90 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all">Accept</button>
            </div>
          `;
        } 
        // If discoverable public list and not approved
        else if (m.is_public && m.host_id !== currentUser.id && m.guest_id !== currentUser.id && !isApproved) {
          if (window.requestedMeetingIds.has(String(m.id)) || window.requestedMeetingIds.has(Number(m.id))) {
            buttonHTML = `<button class="bg-slate-200 text-slate-500 text-xs font-bold px-3 py-1.5 rounded-lg cursor-not-allowed" disabled>Pending Approval</button>`;
          } else {
            buttonHTML = `<button onclick="requestJoinMeeting(${m.id})" class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all">Request to Join</button>`;
          }
        }

        return `
          <div class="flex items-center justify-between p-4 border rounded-xl hover:border-indigo-200 transition-colors bg-white">
            <div class="flex items-center gap-3">
              <span class="text-2xl">${isAudio ? '📞' : '🎥'}</span>
              <div>
                <h4 class="text-sm font-semibold text-slate-800">${m.topic}</h4>
                <p class="text-xs text-slate-500">${m.meeting_date} • ${m.start_time} - ${m.end_time} with ${p ? p.name : (hostObj ? hostObj.name : 'Study Buddy')}</p>
                <div class="flex items-center gap-2 mt-1">
                  ${m.is_public ? `<span class="bg-indigo-100 text-brand-purple text-[9px] px-1.5 py-0.5 rounded font-bold">Public (${m.active_count || 0}/${m.max_participants})</span>` : `<span class="bg-slate-100 text-slate-600 text-[9px] px-1.5 py-0.5 rounded font-bold">Private (${m.active_count || 0}/${m.max_participants})</span>`}
                  ${m.notes ? `<span class="text-[10px] text-slate-400 italic">Note: "${m.notes}"</span>` : ''}
                </div>
              </div>
            </div>
            ${buttonHTML}
          </div>
        `;
      }).join('');
    };

    // If the form is already rendered, only update lists dynamically to avoid input resetting/disappearing
    const listContainer = document.getElementById("upcoming-meetings-list");
    if (listContainer) {
      const activeHTML = buildMeetingListHTML(activeMeetings) || `<div class="p-4 text-center text-slate-400 text-xs">No upcoming study sessions.</div>`;
      const pendingHTML = buildMeetingListHTML(pendingInvitations) || `<div class="p-4 text-center text-slate-400 text-xs">No pending invitations.</div>`;
      const publicHTML = buildMeetingListHTML(publicMeetings) || `<div class="p-4 text-center text-slate-400 text-xs">No public sessions available to join.</div>`;

      const activeDiv = document.getElementById("active-meetings-sublist");
      const pendingDiv = document.getElementById("pending-meetings-sublist");
      const publicDiv = document.getElementById("public-meetings-sublist");

      if (activeDiv && activeDiv.innerHTML !== activeHTML) activeDiv.innerHTML = activeHTML;
      if (pendingDiv && pendingDiv.innerHTML !== pendingHTML) pendingDiv.innerHTML = pendingHTML;
      if (publicDiv && publicDiv.innerHTML !== publicHTML) publicDiv.innerHTML = publicHTML;
      return;
    }

    sysPanes.meetings.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Left 1 Column: Schedule a Meeting -->
        <div class="lg:col-span-1 bg-white border rounded-2xl p-6 shadow-sm h-fit">
          <h3 class="font-heading font-bold text-slate-800 mb-4">Schedule a New Meeting</h3>
          <form onsubmit="handleScheduleMeeting(event)" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Select Partner</label>
              <select id="meet-partner" class="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none" required>
                ${partners.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
                ${partners.length === 0 ? '<option value="" disabled>No partners connected yet</option>' : ''}
              </select>
            </div>
            
            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Select Subject/Topic</label>
              <input type="text" id="meet-topic" class="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none" placeholder="Mathematics" required>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Date</label>
                <input type="date" id="meet-date" class="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none" required>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Repeat</label>
                <select id="meet-repeat" class="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none">
                  <option>None</option>
                  <option>Weekly</option>
                  <option>Monthly</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Start Time</label>
                <input type="time" id="meet-start" class="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none" required>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase">End Time</label>
                <input type="time" id="meet-end" class="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none" required>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Max Participants</label>
                <input type="number" id="meet-max-participants" min="2" max="100" value="2" class="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none" required>
              </div>
              <div class="flex items-center mt-6">
                <label class="flex items-center gap-1.5 text-xs font-bold text-slate-600 cursor-pointer">
                  <input type="checkbox" id="meet-public" class="rounded border-slate-350 text-indigo-650 focus:ring-indigo-650"> Make Meeting Public
                </label>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Meeting Type</label>
              <div class="flex gap-4 text-xs font-semibold mt-1">
                <label class="flex items-center gap-1.5"><input type="radio" name="meet-type" value="Video Call" checked> Video Call</label>
                <label class="flex items-center gap-1.5"><input type="radio" name="meet-type" value="Audio Call"> Audio Call</label>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1.5 uppercase">Add Note (Optional)</label>
              <textarea id="meet-notes" class="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none h-16" placeholder="Bring your review notes on 1NF..."></textarea>
            </div>

            <button type="submit" class="w-full bg-brand-purple hover:bg-opacity-95 text-white font-bold py-2.5 rounded-lg text-xs shadow-md transition-all">
              Schedule Meeting
            </button>
          </form>
        </div>

        <!-- Right 2 Columns: Scheduled & Discoverable Meetings List -->
        <div id="upcoming-meetings-list" class="lg:col-span-2 space-y-6">
          
          <!-- Section 1: Accepted Sessions -->
          <div class="bg-white border rounded-2xl p-6 shadow-sm">
            <h3 class="font-heading font-bold text-slate-800 mb-3 text-sm">📅 My Study Sessions</h3>
            <div id="active-meetings-sublist" class="space-y-3">
              ${buildMeetingListHTML(activeMeetings) || '<div class="p-4 text-center text-slate-400 text-xs bg-slate-50 rounded-xl">No active study sessions.</div>'}
            </div>
          </div>

          <!-- Section 2: Invitations -->
          <div class="bg-white border rounded-2xl p-6 shadow-sm">
            <h3 class="font-heading font-bold text-slate-800 mb-3 text-sm">✉️ Pending Meeting Invitations</h3>
            <div id="pending-meetings-sublist" class="space-y-3">
              ${buildMeetingListHTML(pendingInvitations) || '<div class="p-4 text-center text-slate-400 text-xs bg-slate-50 rounded-xl">No pending invitations.</div>'}
            </div>
          </div>

          <!-- Section 3: Discoverable Public Sessions -->
          <div class="bg-white border rounded-2xl p-6 shadow-sm">
            <h3 class="font-heading font-bold text-slate-800 mb-3 text-sm">🌐 Public Study Groups</h3>
            <div id="public-meetings-sublist" class="space-y-3">
              ${buildMeetingListHTML(publicMeetings) || '<div class="p-4 text-center text-slate-400 text-xs bg-slate-50 rounded-xl">No public sessions available to join.</div>'}
            </div>
          </div>

        </div>

      </div>
    `;
  }

  window.handleScheduleMeeting = async function(e) {
    e.preventDefault();
    const partnerId = document.getElementById("meet-partner").value;
    if (!partnerId) {
      showToast('Please connect with a partner first before scheduling!', 'warning');
      return;
    }

    const topic = document.getElementById("meet-topic").value.trim();
    const date = document.getElementById("meet-date").value;
    const start = document.getElementById("meet-start").value;
    const end = document.getElementById("meet-end").value;
    const notes = document.getElementById("meet-notes").value;
    const type = document.querySelector("input[name='meet-type']:checked").value;
    const isPublic = document.getElementById("meet-public").checked;
    const maxParticipants = parseInt(document.getElementById("meet-max-participants").value);
    if (isNaN(maxParticipants) || maxParticipants < 2 || maxParticipants > 100) {
      showToast('Maximum participants must be between 2 and 100.', 'error');
      return;
    }

    const meetData = {
      host_id: currentUser.id,
      guest_id: partnerId,
      topic,
      meeting_date: date,
      start_time: start,
      end_time: end,
      meeting_type: type,
      notes,
      is_public: isPublic,
      max_participants: maxParticipants
    };

    const savedMeet = await db.createMeeting(meetData);
    
    const partnerObj = db.getUsers().find(u => u.id === partnerId);
    db.addLog("connection", `${currentUser.name} scheduled a study meeting with ${partnerObj ? partnerObj.name : 'buddy'}.`);
    
    showToast('Study meeting scheduled! 📅', 'success');
    renderMeetingsPane();
  };

  // --- 9. HIGH FIDELITY VIDEO CALL SIMULATOR (WITH ACTUAL USER CAMERA FEED) ---
  
  let webcamStream = null;
  let screenShareStream = null;
  let isMuted = false;
  let isCamStopped = false;
  let activeCallTab = "chat"; // "chat" or "options"
  let screenShareActive = false; // Toggles Screen Share visual overlay
  let peerConnection = null;
  let signalIntervalId = null;

  let joinApprovalIntervalId = null;

  window.acceptInvitation = async function(meetingId) {
    await db.acceptInvitation(meetingId, currentUser.id);
    showToast("Meeting invitation accepted! 📅", "success");
    const fresh = await apiFetch('/meetings');
    db.updateCacheData(db.getUsers(), db.getConnections(), fresh);
    renderMeetingsPane();
  };

  window.declineInvitation = async function(meetingId) {
    await db.declineInvitation(meetingId);
    showToast("Meeting invitation declined.", "warning");
    const fresh = await apiFetch('/meetings');
    db.updateCacheData(db.getUsers(), db.getConnections(), fresh);
    renderMeetingsPane();
  };

  window.requestJoinMeeting = async function(meetingId) {
    if (!window.requestedMeetingIds) {
      window.requestedMeetingIds = new Set();
    }
    window.requestedMeetingIds.add(String(meetingId));
    await db.sendJoinRequest(meetingId, currentUser.id, currentUser.name);
    showToast("Join request sent to the meeting host. Please wait... ⏳", "info");
    renderMeetingsPane();
  };

  function showJoinApprovalWaitingModal(meetObj) {
    const modal = document.createElement('div');
    modal.id = 'join-waiting-modal';
    modal.className = 'fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[99999] flex items-center justify-center text-white p-6';
    modal.innerHTML = `
      <div class="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl flex flex-col items-center gap-6">
        <div class="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <div>
          <h3 class="text-lg font-bold">Waiting for Approval</h3>
          <p class="text-xs text-slate-400 mt-2">Request sent to the host of "${meetObj.topic}". Please wait...</p>
        </div>
        <button id="cancel-join-request-btn" class="w-full bg-slate-800 hover:bg-slate-700 py-3 rounded-xl text-xs font-semibold">
          Cancel Request
        </button>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('cancel-join-request-btn').onclick = () => {
      clearInterval(joinApprovalIntervalId);
      modal.remove();
    };

    joinApprovalIntervalId = setInterval(async () => {
      const freshMeetings = await apiFetch('/meetings');
      const freshMeet = freshMeetings.find(m => String(m.id) === String(meetObj.id));
      if (freshMeet) {
        const approved = freshMeet.approved_participants || [];
        if (approved.includes(currentUser.id) || approved.includes(String(currentUser.id))) {
          clearInterval(joinApprovalIntervalId);
          modal.remove();
          showToast('Request approved! Entering meeting...', 'success');
          db.updateCacheData(db.getUsers(), db.getConnections(), freshMeetings);
          window.joinVideoCall(meetObj.id);
        }
      }
    }, 1500);
  }

  window.joinVideoCall = async function(meetingId) {
    const freshMeetings = await apiFetch('/meetings');
    db.updateCacheData(db.getUsers(), db.getConnections(), freshMeetings);

    const meetObj = freshMeetings.find(m => String(m.id) === String(meetingId));
    if (!meetObj) { showToast('Meeting not found.', 'error'); return; }

    const isAdmin = currentUser.isAdmin;
    const isHost = String(meetObj.host_id) === String(currentUser.id);
    // Guest who was directly invited and has accepted (for scheduled meetings)
    const isInvitedGuest = String(meetObj.guest_id) === String(currentUser.id) && meetObj.status === 'accepted';
    // Direct call guest (instant calls bypass acceptance check)
    const isInstantCallGuest = String(meetObj.guest_id) === String(currentUser.id) && (meetObj.meeting_type === 'voice' || meetObj.meeting_type === 'video');

    if (!isAdmin && !isHost) {
      const approved = meetObj.approved_participants || [];
      const isApproved = approved.includes(currentUser.id) || approved.includes(String(currentUser.id));
      
      if (!isApproved && !isInvitedGuest && !isInstantCallGuest) {
        if (meetObj.is_public) {
          const wantJoin = await showConfirm({
            title: 'Request to Join',
            message: `This is a public meeting. You need approval from the host to enter. Send request?`,
            okLabel: 'Request Access ✉'
          });
          if (wantJoin) {
            await db.sendJoinRequest(meetObj.id, currentUser.id, currentUser.name);
            if (!window.requestedMeetingIds) window.requestedMeetingIds = new Set();
            window.requestedMeetingIds.add(String(meetObj.id));
            showJoinApprovalWaitingModal(meetObj);
          }
          return;
        } else {
          showToast('You do not have permission to join this private meeting.', 'error');
          return;
        }
      }

      // Check capacity — invited guests and instant calls bypass this check
      if (!isInvitedGuest && !isInstantCallGuest && meetObj.active_count >= meetObj.max_participants) {
        showToast(`This meeting has reached its capacity of ${meetObj.max_participants} participants.`, 'error');
        return;
      }
    }

    try {
      await apiFetch(`/meetings/${meetObj.id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
      });
    } catch (err) {
      console.error('Failed to register join on backend:', err);
    }

    inCallMeeting = meetObj;
    const isVoice = meetObj.meeting_type === 'voice' || meetObj.meeting_type === 'Audio Call';
    const partnerId = isAdmin
      ? meetObj.host_id  // Admin "observes" the host
      : (meetObj.host_id === currentUser.id ? meetObj.guest_id : meetObj.host_id);
    const partner = db.getUsers().find(u => u.id === partnerId);

    // Dynamic overlay injector
    const videoCallOverlay = document.createElement("div");
    videoCallOverlay.id = "video-call-overlay";
    videoCallOverlay.className = "fixed inset-0 bg-slate-950 z-[999] flex flex-col justify-between text-white p-6 font-sans";

    videoCallOverlay.innerHTML = `
      <!-- Top Info -->
      <div class="flex justify-between items-center shrink-0">
        <div>
          <h3 class="text-lg font-bold">${meetObj.topic}</h3>
          <p class="text-xs text-slate-400">Collaboration with ${partner ? partner.name : 'Study Partner'}</p>
        </div>
        <div class="bg-indigo-600/40 border border-indigo-500/40 px-3 py-1.5 rounded-lg text-xs font-mono">
          🔴 <span id="call-timer">00:00</span>
        </div>
      </div>

      <!-- Main screen grids -->
      <div class="flex-1 flex gap-6 my-6 overflow-hidden min-h-0 items-stretch">
        
        <!-- Video Canvas Grid (Left Column) -->
        <div class="flex-1 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden relative flex items-center justify-center">
          
          <!-- Actual Screen Share video element -->
          <video id="screen-share-feed" class="absolute inset-0 w-full h-full object-contain bg-slate-950 z-20 hidden" autoplay playsinline></video>

          <!-- Screen Share Slide Deck Overlay -->
          <div id="screenshare-slide-overlay" class="absolute inset-0 bg-slate-900 z-10 flex-col items-center justify-center p-8 hidden">
            <div class="bg-white text-slate-800 w-full max-w-2xl rounded-2xl p-6 shadow-2xl flex flex-col justify-between h-[85%]">
              <div class="border-b pb-4">
                <span class="bg-indigo-100 text-brand-purple text-[10px] font-extrabold px-2 py-0.5 rounded">9. Share Screen</span>
                <h4 class="font-heading font-extrabold text-2xl mt-2 text-slate-900">Normalization - 1st Normal Form (1NF)</h4>
              </div>
              <div class="flex-1 flex items-center justify-center gap-6 my-6">
                <!-- Sample database table visualization -->
                <div class="w-full text-xs font-mono border rounded-lg overflow-hidden">
                  <div class="grid grid-cols-3 bg-slate-100 p-2 font-bold border-b">
                    <div>EnrollmentID</div><div>StudentID</div><div>CourseID</div>
                  </div>
                  <div class="grid grid-cols-3 p-2 border-b bg-white"><div>1</div><div>101</div><div>DM</div></div>
                  <div class="grid grid-cols-3 p-2 border-b bg-slate-50"><div>2</div><div>101</div><div>CS</div></div>
                  <div class="grid grid-cols-3 p-2 border-b bg-white"><div>3</div><div>102</div><div>SE</div></div>
                </div>
              </div>
              <div class="border-t pt-4 text-[10px] text-slate-400 flex justify-between">
                <span>Presenter: ${currentUser.name}</span>
                <span>Active Slideshow</span>
              </div>
            </div>
          </div>

          <!-- Video grid templates -->
          ${isVoice ? `
            <div class="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-indigo-950/30 to-slate-950 p-6 z-10 w-full h-full">
              <!-- Blurred Avatar Background -->
              <div class="absolute inset-0 z-0 overflow-hidden">
                ${partner && partner.avatar && partner.avatar.startsWith('data:image') 
                  ? `<img src="${partner.avatar}" class="w-full h-full object-cover blur-3xl scale-150 opacity-10" alt="blur-bg" />` 
                  : `<div class="w-full h-full bg-gradient-to-tr from-indigo-950 via-slate-950 to-slate-900"></div>`}
              </div>
              
              <!-- Centered Content -->
              <div class="relative z-10 flex flex-col items-center justify-center text-center space-y-5">
                <!-- Avatar with ring-pulse rings -->
                <div class="relative flex items-center justify-center">
                  <!-- Outer pulse rings -->
                  <div class="absolute w-36 h-36 rounded-full border-2 border-indigo-400/30 animate-ping" style="animation-duration: 2s;"></div>
                  <div class="absolute w-44 h-44 rounded-full border border-indigo-400/15 animate-ping" style="animation-duration: 2.5s; animation-delay: 0.4s;"></div>
                  <!-- Avatar circle -->
                  <div class="relative w-28 h-28 rounded-full bg-indigo-900 border-4 border-indigo-400 shadow-2xl shadow-indigo-500/30 flex items-center justify-center text-5xl overflow-hidden z-10">
                    ${renderAvatar(partner ? partner.avatar : '👤', 'text-5xl', 'w-full h-full object-cover rounded-full')}
                  </div>
                  <!-- Online dot -->
                  <div class="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-950 z-20"></div>
                </div>
                <!-- Name & Status -->
                <div>
                  <h4 class="font-heading font-extrabold text-2xl text-white tracking-wide">${partner ? partner.name : 'Study Partner'}</h4>
                  <p class="text-sm text-slate-400 mt-0.5">${partner ? (partner.gradeLevel || partner.yearSection || '') + ' • ' + (partner.schoolName || partner.program || '') : ''}</p>
                </div>
                <!-- Status pill -->
                <div class="bg-emerald-500/10 border border-emerald-500/30 px-5 py-1.5 rounded-full text-xs font-mono tracking-widest text-emerald-400 font-semibold">
                  ● CONNECTED
                </div>
              </div>
            </div>
          ` : `
            <div class="grid grid-cols-2 gap-4 p-4 w-full h-full relative z-10">
              <!-- Self Video Stream Box -->
              <div class="bg-slate-950 rounded-2xl overflow-hidden relative border border-slate-800 shadow-lg">
                <video id="webcam-feed" class="w-full h-full object-cover" autoplay playsinline></video>
                <div id="camera-placeholder" class="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm hidden">
                  <div class="text-4xl mb-2 w-16 h-16 rounded-full overflow-hidden flex items-center justify-center border-2 border-slate-700 bg-slate-800">${renderAvatar(currentUser.avatar, 'text-4xl', 'w-full h-full object-cover rounded-full')}</div>
                  <p class="text-[10px] text-slate-400 font-semibold">Camera Off</p>
                </div>
                <div class="absolute bottom-3 left-3 bg-black/60 backdrop-blur px-2.5 py-1 rounded-md text-[10px] font-semibold text-white">You</div>
              </div>

              <!-- Partner Video Box -->
              <div class="bg-slate-950 rounded-2xl overflow-hidden relative border border-slate-800 shadow-lg">
                <video id="remote-video-feed" class="w-full h-full object-cover hidden" autoplay playsinline></video>
                <div id="remote-camera-placeholder" class="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-sm">
                  <div class="text-5xl mb-3 animate-bounce w-16 h-16 rounded-full overflow-hidden flex items-center justify-center border-2 border-slate-700 bg-slate-800">${renderAvatar(partner ? partner.avatar : '👤', 'text-5xl', 'w-full h-full object-cover rounded-full')}</div>
                  <h5 class="text-xs font-semibold text-white">${partner ? partner.name : 'Partner'}</h5>
                  <p class="text-[10px] text-slate-500 mt-1">Connecting video...</p>
                </div>
                <div class="absolute bottom-3 left-3 bg-black/60 backdrop-blur px-2.5 py-1 rounded-md text-[10px] font-semibold text-white">${partner ? partner.name : 'Partner'}</div>
              </div>
            </div>
          `}
        </div>

        <!-- Sidebar Panel (Right Column) -->
        <div class="w-80 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between shrink-0">
          
          <!-- Tabs selection header -->
          <div class="flex border-b border-slate-800">
            <button id="call-tab-chat" class="flex-1 py-3 text-center text-xs font-bold border-r border-slate-800 text-indigo-400 bg-slate-800/40" onclick="setCallSidebarTab('chat')">
              Private Chat
            </button>
            <button id="call-tab-options" class="flex-1 py-3 text-center text-xs font-bold text-slate-400" onclick="setCallSidebarTab('options')">
              More Options
            </button>
          </div>

          <!-- Chat tab pane -->
          <div id="call-pane-chat" class="flex-1 flex flex-col justify-between overflow-hidden">
            <div class="flex-1 overflow-y-auto p-4 space-y-3" id="call-chat-history" data-msg-count="0">
              <div class="bg-slate-800/60 p-2.5 rounded-lg border border-slate-800">
                <span class="text-[10px] text-slate-400 font-bold block mb-1">System</span>
                <p class="text-xs text-slate-200">Call connected. Messages sent here are private and saved to your chat history.</p>
              </div>
            </div>
            <div class="p-4 border-t border-slate-800 flex gap-2 shrink-0 bg-slate-950/20">
              <input type="text" id="call-chat-input" class="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none" placeholder="Type message...">
              <button onclick="sendCallMessage()" class="bg-indigo-600 px-3 py-2 rounded-lg text-xs font-bold">Send</button>
            </div>
          </div>

          <!-- Options tab pane -->
          <div id="call-pane-options" class="flex-1 p-6 space-y-4 hidden overflow-y-auto">
            <h4 class="font-bold text-xs text-slate-400 uppercase tracking-wider mb-2">Controls</h4>
            <button class="w-full flex items-center justify-between bg-slate-800 hover:bg-slate-700/80 px-4 py-3 rounded-xl text-xs font-semibold" onclick="toggleMute()">
              <span>🎙️ Mute Microphone</span>
              <span id="opt-mute-status" class="text-slate-400 text-[10px]">OFF</span>
            </button>
            ${!isVoice ? `
              <button class="w-full flex items-center justify-between bg-slate-800 hover:bg-slate-700/80 px-4 py-3 rounded-xl text-xs font-semibold" onclick="toggleCamera()">
                <span>📹 Stop Camera</span>
                <span id="opt-cam-status" class="text-slate-400 text-[10px]">ACTIVE</span>
              </button>
              <button class="w-full flex items-center justify-between bg-slate-800 hover:bg-slate-700/80 px-4 py-3 rounded-xl text-xs font-semibold" onclick="toggleScreenShare()">
                <span>🖥️ Share Screen</span>
                <span id="opt-share-status" class="text-indigo-400 text-[10px]">START</span>
              </button>
            ` : ''}

            ${isHost ? `
              <!-- Host-only: Participant Management -->
              <div class="border-t border-slate-800 pt-4 mt-2">
                <h4 class="font-bold text-xs text-slate-400 uppercase tracking-wider mb-3">👥 Participants</h4>
                <div id="host-participant-list" class="space-y-2 mb-4">
                  <div class="text-[10px] text-slate-500">No other participants connected yet.</div>
                </div>
                <button onclick="endVideoCallForEveryone()" class="w-full flex items-center justify-center gap-2 bg-red-900/60 hover:bg-red-800/70 border border-red-800/60 px-4 py-3 rounded-xl text-xs font-bold text-red-300 transition-colors">
                  ⛔ End for Everyone
                </button>
              </div>
            ` : ''}
          </div>

        </div>

      </div>

      <!-- Footer controls bar -->
      <div class="flex justify-center items-center gap-3 sm:gap-5 shrink-0 pt-3 border-t border-slate-900/60 relative z-20 pb-1">
        <!-- Mute btn -->
        <div class="flex flex-col items-center gap-1">
          <button onclick="toggleMute()" id="call-btn-mute" class="w-12 h-12 rounded-full bg-slate-800/90 hover:bg-slate-700 backdrop-blur flex items-center justify-center text-lg border border-slate-700 transition-all active:scale-90 text-white shadow-lg" title="Mute Mic">🎙️</button>
          <span class="text-[9px] text-slate-500 font-medium">Mute</span>
        </div>
        ${!isVoice ? `
          <!-- Camera btn -->
          <div class="flex flex-col items-center gap-1">
            <button onclick="toggleCamera()" id="call-btn-cam" class="w-12 h-12 rounded-full bg-slate-800/90 hover:bg-slate-700 backdrop-blur flex items-center justify-center text-lg border border-slate-700 transition-all active:scale-90 text-white shadow-lg" title="Stop Cam">📹</button>
            <span class="text-[9px] text-slate-500 font-medium">Camera</span>
          </div>
          <!-- Share btn -->
          <div class="flex flex-col items-center gap-1">
            <button onclick="toggleScreenShare()" id="call-btn-share" class="w-12 h-12 rounded-full bg-slate-800/90 hover:bg-slate-700 backdrop-blur flex items-center justify-center text-lg border border-slate-700 transition-all active:scale-90 text-white shadow-lg" title="Share Screen">🖥️</button>
            <span class="text-[9px] text-slate-500 font-medium">Share</span>
          </div>
        ` : ''}
        ${isHost ? `
          <!-- End for all btn -->
          <div class="flex flex-col items-center gap-1">
            <button onclick="endVideoCallForEveryone()" class="w-12 h-12 rounded-full bg-red-900/80 hover:bg-red-800 border border-red-700 flex items-center justify-center text-base font-bold text-red-200 transition-all active:scale-90 shadow-lg" title="End for Everyone">⛔</button>
            <span class="text-[9px] text-red-500 font-medium">End All</span>
          </div>
        ` : ''}
        <!-- End call btn (always visible, prominently) -->
        <div class="flex flex-col items-center gap-1">
          <button onclick="endVideoCall()" class="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center transition-all active:scale-90 shadow-xl shadow-red-600/30 text-white" title="End Call">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="transform: rotate(135deg);"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
          </button>
          <span class="text-[9px] text-red-400 font-medium">End</span>
        </div>
      </div>
    `;

    document.body.appendChild(videoCallOverlay);

    // Initializations
    startCallTimer();
    startWebcamFeed().then(stream => {
      initiateWebRTCConnection(meetObj, stream);
    });

    // Call chat key press listener
    const callInput = document.getElementById("call-chat-input");
    if (callInput) {
      callInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendCallMessage();
      });
    }
  };

  // Timer counter
  let callTimerId = null;
  function startCallTimer() {
    let secs = 0;
    const timerLabel = document.getElementById("call-timer");
    callTimerId = setInterval(() => {
      secs++;
      const m = String(Math.floor(secs / 60)).padStart(2, '0');
      const s = String(secs % 60).padStart(2, '0');
      if (timerLabel) timerLabel.textContent = `${m}:${s}`;
    }, 1000);
  }

  // Camera handler
  function startWebcamFeed() {
    const video = document.getElementById("webcam-feed");
    const placeholder = document.getElementById("camera-placeholder");
    const isVoice = inCallMeeting && (inCallMeeting.meeting_type === "voice" || inCallMeeting.meeting_type === "Audio Call");

    return navigator.mediaDevices.getUserMedia({ video: !isVoice, audio: true })
      .then(stream => {
        webcamStream = stream;
        if (video && !isVoice) {
          video.srcObject = stream;
          video.classList.remove("hidden");
        }
        if (placeholder) placeholder.classList.add("hidden");
        return stream;
      })
      .catch(err => {
        console.warn("Local Web camera access denied or unavailable: ", err);
        // Show placeholders instead of crashing
        if (video) video.classList.add("hidden");
        if (placeholder) placeholder.classList.remove("hidden");
        return null;
      });
  }

  // WebRTC Peer Connection logic
  async function initiateWebRTCConnection(meetObj, localStream) {
    if (currentUser.isAdmin) return; // Admin spectator only

    const isHost = String(meetObj.host_id) === String(currentUser.id);

    peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    if (localStream) {
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
      });
    }

    const isVoice = meetObj.meeting_type === 'voice' || meetObj.meeting_type === 'Audio Call';
    peerConnection.ontrack = (event) => {
      const remoteStream = event.streams[0];
      if (isVoice) {
        let remoteAudio = document.getElementById('remote-audio-feed');
        if (!remoteAudio) {
          remoteAudio = document.createElement('audio');
          remoteAudio.id = 'remote-audio-feed';
          remoteAudio.autoplay = true;
          document.body.appendChild(remoteAudio);
        }
        remoteAudio.srcObject = remoteStream;
      } else {
        const remoteVideo = document.getElementById('remote-video-feed');
        const remotePlaceholder = document.getElementById('remote-camera-placeholder');
        if (remoteVideo) {
          remoteVideo.srcObject = remoteStream;
          remoteVideo.classList.remove('hidden');
        }
        if (remotePlaceholder) {
          remotePlaceholder.classList.add('hidden');
        }
      }
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        db.sendSignal(meetObj.id, currentUser.id, {
          type: 'candidate',
          candidate: event.candidate
        });
      }
    };

    if (isHost) {
      try {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        await db.sendSignal(meetObj.id, currentUser.id, {
          type: 'offer',
          sdp: offer.sdp
        });
      } catch (err) {
        console.error("Error creating WebRTC offer:", err);
      }
    }

    // Poll for signaling updates every 1.5 seconds
    signalIntervalId = setInterval(async () => {
      if (!inCallMeeting) return;
      
      // Host specific operations: poll join requests & refresh participant list
      if (isHost) {
        try {
          const requests = await db.getJoinRequests(meetObj.id);
          const listDiv = document.getElementById("host-participant-list");
          if (listDiv) {
            const freshMeetings = db.getMeetings() || [];
            const currentMeet = freshMeetings.find(m => String(m.id) === String(meetObj.id)) || meetObj;
            const approved = currentMeet.approved_participants || [];
            const usersList = db.getUsers() || [];
            
            listDiv.innerHTML = approved.filter(id => String(id) !== String(currentUser.id)).map(id => {
              const uObj = usersList.find(u => String(u.id) === String(id));
              return uObj ? `
                <div class="flex justify-between items-center bg-slate-800/50 p-2 rounded-lg border border-slate-850">
                  <span class="text-xs font-semibold text-slate-350">${uObj.name}</span>
                  <button onclick="kickParticipant('${uObj.id}')" class="text-[10px] text-red-400 hover:text-red-300 font-bold bg-slate-900/60 px-2 py-0.5 rounded border border-red-950">Remove</button>
                </div>
              ` : '';
            }).join('') || `<div class="text-[10px] text-slate-500">No other participants connected yet.</div>`;
          }

          // Render banner at top of overlay for join requests
          if (requests.length > 0) {
            let banner = document.getElementById("host-join-requests-banner");
            if (!banner) {
              banner = document.createElement("div");
              banner.id = "host-join-requests-banner";
              banner.className = "absolute top-4 left-1/2 transform -translate-x-1/2 bg-slate-900 border border-slate-750 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-4 z-[9999] text-xs font-semibold";
              const overlay = document.getElementById("video-call-overlay");
              if (overlay) overlay.appendChild(banner);
            }
            const req = requests[0];
            banner.innerHTML = `
              <span>Join request from ${req.name}</span>
              <div class="flex gap-2">
                <button onclick="handleApproveRequest(${meetObj.id}, '${req.userId}', 'reject')" class="bg-slate-700 hover:bg-slate-650 px-2 py-1 rounded text-[10px] font-bold">Reject</button>
                <button onclick="handleApproveRequest(${meetObj.id}, '${req.userId}', 'accept')" class="bg-emerald-600 hover:bg-emerald-500 px-2 py-1 rounded text-[10px] font-bold">Accept</button>
              </div>
            `;
          } else {
            const banner = document.getElementById("host-join-requests-banner");
            if (banner) banner.remove();
          }
        } catch (e) {
          console.error("Host poll error:", e);
        }
      }

      const signals = await db.getSignals(meetObj.id, currentUser.id);
      for (const sig of signals) {
        const { type, sdp, candidate, targetUserId } = sig.data;
        
        // Handle kick and kick_all signals
        if (type === 'kick' && String(targetUserId) === String(currentUser.id)) {
          window.closeCallOverlay();
          showToast('You have been removed from the meeting by the host.', 'warning');
          showSystemView('meetings');
          return;
        }
        if (type === 'kick_all') {
          window.closeCallOverlay();
          showToast('The host has ended this meeting.', 'warning');
          showSystemView('meetings');
          return;
        }

        if (type === 'offer') {
          try {
            await peerConnection.setRemoteDescription(new RTCSessionDescription({ type, sdp }));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            await db.sendSignal(meetObj.id, currentUser.id, {
              type: 'answer',
              sdp: answer.sdp
            });
          } catch (err) {
            console.error("Error handling WebRTC offer:", err);
          }
        } else if (type === 'answer') {
          try {
            await peerConnection.setRemoteDescription(new RTCSessionDescription({ type, sdp }));
          } catch (err) {
            console.error("Error setting WebRTC remote answer:", err);
          }
        } else if (type === 'candidate') {
          try {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (err) {
            console.error("Error adding ICE candidate:", err);
          }
        }
      }
    }, 1500);
  }

  // Host Action helper functions
  window.handleApproveRequest = async function(meetingId, userId, action) {
    try {
      await db.approveJoinRequest(meetingId, userId, action);
      const banner = document.getElementById("host-join-requests-banner");
      if (banner) banner.remove();
      showToast(action === 'accept' ? '✅ Participant approved!' : '❌ Request rejected.', action === 'accept' ? 'success' : 'warning');
    } catch(e) {
      console.error('Approve request error:', e);
      showToast('Failed to process request.', 'error');
    }
  };

  window.kickParticipant = async function(userId) {
    if (!inCallMeeting) return;
    try {
      await db.removeParticipant(inCallMeeting.id, userId);
      await db.sendSignal(inCallMeeting.id, currentUser.id, {
        type: 'kick',
        targetUserId: String(userId)
      });
      showToast('Participant removed from the meeting.', 'warning');
    } catch(e) {
      console.error('Kick participant error:', e);
      showToast('Failed to remove participant.', 'error');
    }
  };

  window.endVideoCallForEveryone = async function() {
    if (!inCallMeeting) return;
    try {
      await db.sendSignal(inCallMeeting.id, currentUser.id, {
        type: 'kick_all'
      });
    } catch(e) {
      console.error('End for everyone error:', e);
    }
    window.endVideoCall();
  };

  // Controls actions
  window.setCallSidebarTab = function(tabName) {
    activeCallTab = tabName;
    const tabChat = document.getElementById("call-tab-chat");
    const tabOpt = document.getElementById("call-tab-options");
    const paneChat = document.getElementById("call-pane-chat");
    const paneOpt = document.getElementById("call-pane-options");

    if (tabName === "chat") {
      tabChat.className = "flex-1 py-3 text-center text-xs font-bold border-r border-slate-800 text-indigo-400 bg-slate-800/40";
      tabOpt.className = "flex-1 py-3 text-center text-xs font-bold text-slate-400";
      paneChat.classList.remove("hidden");
      paneOpt.classList.add("hidden");
    } else {
      tabChat.className = "flex-1 py-3 text-center text-xs font-bold border-r border-slate-800 text-slate-400";
      tabOpt.className = "flex-1 py-3 text-center text-xs font-bold text-indigo-400 bg-slate-800/40";
      paneChat.classList.add("hidden");
      paneOpt.classList.remove("hidden");
    }
  };

  window.toggleMute = function() {
    isMuted = !isMuted;
    if (webcamStream) {
      webcamStream.getAudioTracks().forEach(track => track.enabled = !isMuted);
    }
    const btn = document.getElementById("call-btn-mute");
    const label = document.getElementById("opt-mute-status");
    if (btn) btn.className = `w-12 h-12 rounded-full flex items-center justify-center text-lg border border-slate-750 transition-colors ${isMuted ? 'bg-red-600/80 text-white' : 'bg-slate-800 hover:bg-slate-700'}`;
    if (label) label.textContent = isMuted ? "MUTED" : "OFF";
  };

  window.toggleCamera = function() {
    isCamStopped = !isCamStopped;
    const video = document.getElementById("webcam-feed");
    const placeholder = document.getElementById("camera-placeholder");

    if (webcamStream) {
      webcamStream.getVideoTracks().forEach(track => track.enabled = !isCamStopped);
    }

    if (isCamStopped) {
      if (video) video.classList.add("hidden");
      if (placeholder) placeholder.classList.remove("hidden");
    } else {
      if (video && webcamStream) {
        video.classList.remove("hidden");
        if (placeholder) placeholder.classList.add("hidden");
      }
    }

    const btn = document.getElementById("call-btn-cam");
    const label = document.getElementById("opt-cam-status");
    if (btn) btn.className = `w-12 h-12 rounded-full flex items-center justify-center text-lg border border-slate-750 transition-colors ${isCamStopped ? 'bg-red-600/80 text-white' : 'bg-slate-800 hover:bg-slate-700'}`;
    if (label) label.textContent = isCamStopped ? "STOPPED" : "ACTIVE";
  };

  window.stopScreenShare = function() {
    screenShareActive = false;
    if (screenShareStream) {
      screenShareStream.getTracks().forEach(track => track.stop());
      screenShareStream = null;
    }
    const screenVideo = document.getElementById("screen-share-feed");
    if (screenVideo) {
      screenVideo.srcObject = null;
      screenVideo.classList.add("hidden");
    }
    const overlay = document.getElementById("screenshare-slide-overlay");
    if (overlay) overlay.classList.add("hidden");
    updateScreenShareUI(false);
  };

  function updateScreenShareUI(isSharing) {
    const btn = document.getElementById("call-btn-share");
    const label = document.getElementById("opt-share-status");
    if (isSharing) {
      if (btn) btn.className = `w-12 h-12 rounded-full flex items-center justify-center text-lg border border-slate-750 transition-colors bg-brand-teal text-white`;
      if (label) label.textContent = "SHARING";
    } else {
      if (btn) btn.className = `w-12 h-12 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-lg border border-slate-750 transition-colors`;
      if (label) label.textContent = "START";
    }
  }

  window.toggleScreenShare = async function() {
    if (!screenShareActive) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenShareStream = stream;
        
        const screenVideo = document.getElementById("screen-share-feed");
        if (screenVideo) {
          screenVideo.srcObject = stream;
          screenVideo.classList.remove("hidden");
        }
        
        // Handle when user clicks browser's native "Stop sharing" button
        stream.getVideoTracks()[0].onended = () => {
          stopScreenShare();
        };
        
        screenShareActive = true;
        updateScreenShareUI(true);
      } catch (err) {
        console.warn("Actual screen capture failed/denied, falling back to mock slideshow:", err);
        // Graceful fallback to mock slideshow
        const overlay = document.getElementById("screenshare-slide-overlay");
        if (overlay) overlay.classList.remove("hidden");
        screenShareActive = true;
        updateScreenShareUI(true);
      }
    } else {
      stopScreenShare();
    }
  };

  window.sendCallMessage = async function() {
    const input = document.getElementById('call-chat-input');
    const msg = (input && input.value) ? input.value.trim() : '';
    if (!msg || !inCallMeeting) return;
    if (input) input.value = '';

    const callRoomId = [inCallMeeting.host_id, inCallMeeting.guest_id].sort().join('_');

    // Optimistically append the bubble immediately
    const history = document.getElementById('call-chat-history');
    if (history) {
      const div = document.createElement('div');
      div.className = 'p-2.5 rounded-lg border bg-indigo-600/30 border-slate-700 ml-auto max-w-[85%]';
      div.innerHTML = `
        <span class="text-[10px] text-indigo-400 font-bold block mb-1">You</span>
        <p class="text-xs text-slate-100">${msg}</p>
      `;
      history.appendChild(div);
      history.scrollTop = history.scrollHeight;
      const c = parseInt(history.getAttribute('data-msg-count') || '0');
      history.setAttribute('data-msg-count', c + 1);
    }

    // Save to real DB — same room as regular chat so partner receives it
    await db.sendMessage(callRoomId, currentUser.id, currentUser.name, msg);
  };


  // closeCallOverlay is an alias for endVideoCall, used by pollUpdates
  window.closeCallOverlay = function() {
    if (inCallMeeting) {
      const meetId = inCallMeeting.id;
      apiFetch(`/meetings/${meetId}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id })
      }).catch(err => console.error('Failed to notify leave to backend:', err));
    }

    if (webcamStream) {
      webcamStream.getTracks().forEach(track => track.stop());
      webcamStream = null;
    }
    if (screenShareStream) {
      screenShareStream.getTracks().forEach(track => track.stop());
      screenShareStream = null;
    }
    if (callTimerId) {
      clearInterval(callTimerId);
      callTimerId = null;
    }
    if (peerConnection) {
      peerConnection.close();
      peerConnection = null;
    }
    if (signalIntervalId) {
      clearInterval(signalIntervalId);
      signalIntervalId = null;
    }
    const remoteAudio = document.getElementById('remote-audio-feed');
    if (remoteAudio) remoteAudio.remove();

    const overlay = document.getElementById("video-call-overlay");
    if (overlay) overlay.remove();
    inCallMeeting = null;
  };

  window.endVideoCall = async function() {
    const meetingToEnd = inCallMeeting;
    const wasInstant = meetingToEnd && (
      meetingToEnd.meeting_type === 'voice' ||
      meetingToEnd.meeting_type === 'video'
    );
    
    // Check if the user is the actual host of the call/meeting
    const isHost = meetingToEnd && String(meetingToEnd.host_id) === String(currentUser.id);

    window.closeCallOverlay();
    db.addLog("connection", `${currentUser.name} left study call.`);

    // If this was an instant call/meeting, only the host deleting it should remove it for everyone
    if (meetingToEnd && isHost && (meetingToEnd.meeting_type === 'voice' || meetingToEnd.meeting_type === 'video' || meetingToEnd.meeting_type === 'Audio Call' || meetingToEnd.meeting_type === 'Video Call')) {
      try {
        await db.deleteMeeting(meetingToEnd.id);
      } catch (e) { /* already deleted */ }
    }

    // Redirect: instant calls -> dashboard, scheduled meetings -> meetings pane
    if (wasInstant) {
      showSystemView("dashboard");
    } else {
      showSystemView("meetings");
    }
  };

  // --- Incoming Call Notification ---
  function showIncomingCallNotification(meetObj) {
    if (document.getElementById('incoming-call-overlay')) return;

    const caller = (db.getUsers() || []).find(u => String(u.id) === String(meetObj.host_id));
    const callerName = caller ? caller.name : 'Study Buddy';
    const callerAvatar = caller ? (caller.avatar || '👤') : '👤';
    const isVoice = meetObj.meeting_type === 'voice' || meetObj.meeting_type === 'Audio Call';

    const overlay = document.createElement('div');
    overlay.id = 'incoming-call-overlay';
    overlay.className = 'fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[9999] flex flex-col items-center justify-center text-white p-6';
    overlay.innerHTML = `
      <div class="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-xs w-full text-center shadow-2xl flex flex-col items-center gap-6">
        <div class="relative">
          <div class="text-6xl w-24 h-24 bg-indigo-600/20 border-2 border-indigo-500 rounded-full flex items-center justify-center overflow-hidden" style="animation: pulse 1.5s infinite;">${renderAvatar(callerAvatar, 'text-6xl', 'w-full h-full object-cover rounded-full')}</div>
          <span class="absolute -bottom-1 -right-1 text-2xl">${isVoice ? '📞' : '📹'}</span>
        </div>
        <div>
          <h3 class="text-xl font-bold text-white">${callerName}</h3>
          <p class="text-sm text-slate-400 mt-1">Incoming ${isVoice ? 'Voice' : 'Video'} Call...</p>
        </div>
        <div class="flex gap-4 w-full">
          <button onclick="declineCall(${meetObj.id})" class="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-sm py-3 rounded-xl transition-all">
            ❌ Decline
          </button>
          <button onclick="acceptCall(${meetObj.id})" class="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3 rounded-xl transition-all">
            ✅ Accept
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    // Play notification sound
    const sound = document.getElementById('notif-sound');
    if (sound) sound.play().catch(() => {});

  // Auto-decline after 30 seconds
    window._incomingCallTimeout = setTimeout(() => {
      window.declineCall(meetObj.id);
    }, 30000);
  }

  function showMeetingInvitationNotification(meetObj) {
    if (document.getElementById(`meet-invitation-${meetObj.id}`)) return;

    const host = (db.getUsers() || []).find(u => String(u.id) === String(meetObj.host_id));
    const hostName = host ? host.name : 'Study Partner';

    const notif = document.createElement('div');
    notif.id = `meet-invitation-${meetObj.id}`;
    notif.className = 'fixed bottom-6 right-6 bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl shadow-2xl max-w-sm z-[9999] flex flex-col gap-3 animate-slide-in';
    notif.innerHTML = `
      <div class="flex items-start gap-3">
        <span class="text-2xl">📅</span>
        <div class="flex-1">
          <h4 class="text-sm font-bold text-slate-100">New Meeting Scheduled</h4>
          <p class="text-xs text-slate-400 mt-0.5">${hostName} invited you to a study session.</p>
        </div>
      </div>
      <div class="bg-slate-950/50 p-3 rounded-lg border border-slate-800 text-xs space-y-1">
        <div class="font-semibold text-indigo-400">${meetObj.topic}</div>
        <div class="text-slate-300">Date: ${meetObj.meeting_date}</div>
        <div class="text-slate-300">Time: ${meetObj.start_time} - ${meetObj.end_time}</div>
        ${meetObj.notes ? `<div class="text-slate-400 italic mt-1">"${meetObj.notes}"</div>` : ''}
      </div>
      <div class="flex gap-2 justify-end">
        <button onclick="this.parentElement.parentElement.remove(); declineInvitation(${meetObj.id})" class="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold">Decline</button>
        <button onclick="this.parentElement.parentElement.remove(); acceptInvitation(${meetObj.id})" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold">Accept</button>
      </div>
    `;
    document.body.appendChild(notif);

    // Play notification sound
    const sound = document.getElementById('notif-sound');
    if (sound) sound.play().catch(() => {});
  }

  function showMeetingStartingNotification(meetObj) {
    if (document.getElementById(`meet-starting-${meetObj.id}`)) return;

    const notif = document.createElement('div');
    notif.id = `meet-starting-${meetObj.id}`;
    notif.className = 'fixed bottom-6 right-6 bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl shadow-2xl max-w-sm z-[9999] flex flex-col gap-3 animate-slide-in';
    notif.innerHTML = `
      <div class="flex items-start gap-3">
        <span class="text-2xl">📅</span>
        <div class="flex-1">
          <h4 class="text-sm font-bold text-slate-100">Meeting is starting now</h4>
          <p class="text-xs text-slate-400 mt-0.5">Your scheduled study session "${meetObj.topic}" is starting.</p>
        </div>
      </div>
      <div class="flex gap-2 justify-end">
        <button onclick="this.parentElement.parentElement.remove()" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold">Dismiss</button>
        <button onclick="this.parentElement.parentElement.remove(); joinVideoCall(${meetObj.id})" class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold">Join Meeting</button>
      </div>
    `;
    document.body.appendChild(notif);

    // Play notification sound
    const sound = document.getElementById('notif-sound');
    if (sound) sound.play().catch(() => {});
  }

  window.acceptCall = function(meetingId) {
    clearTimeout(window._incomingCallTimeout);
    const overlay = document.getElementById('incoming-call-overlay');
    if (overlay) overlay.remove();
    window.joinVideoCall(meetingId);
  };

  window.declineCall = async function(meetingId) {
    clearTimeout(window._incomingCallTimeout);
    const overlay = document.getElementById('incoming-call-overlay');
    if (overlay) overlay.remove();
    try {
      await db.deleteMeeting(meetingId);
    } catch (e) { /* already gone */ }
    showToast('Call declined.', 'info');
  };

  // --- 10. MESSAGES OUTSIDE MEETING PANE ---
  
  function renderMessagesPane() {
    const conns = db.getConnections() || [];
    const users = db.getUsers() || [];
    const chats = db.getChats() || [];

    // Find accepted partners
    const partners = conns.filter(c => 
      c.status === "accepted" && (c.senderId === currentUser.id || c.receiverId === currentUser.id)
    ).map(c => {
      const partnerId = c.senderId === currentUser.id ? c.receiverId : c.senderId;
      return users.find(u => u.id === partnerId);
    }).filter(Boolean);

    // If users haven't loaded from server yet, show loading state and retry
    if (users.length === 0 || conns.length === 0) {
      // Show loading only if we don't already have a layout rendered
      if (!document.getElementById('chat-messages-container')) {
        sysPanes.messages.innerHTML = `
          <div class="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-sm">
            <div class="text-2xl mb-3 animate-spin inline-block">⟳</div>
            <p>Loading conversations...</p>
          </div>
        `;
        // Retry after 1.5s to let the server response arrive
        setTimeout(() => { if (activeSystemView === 'messages') renderMessagesPane(); }, 1500);
      }
      return;
    }

    if (partners.length === 0) {
      sysPanes.messages.innerHTML = `
        <div class="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-sm">
          No connections found. Send study partner requests on matches tab to begin chatting!
        </div>
      `;
      return;
    }

    if (!activeChatCollabId && partners.length > 0) {
      // Only auto-select on desktop, leave null on mobile so it shows the list first
      if (window.innerWidth >= 768) {
        window.selectActiveChat(partners[0].id);
      }
    }

    const activePartnerObj = partners.find(p => String(p.id) === String(activeChatCollabId));


    // Fetch active messages
    const activeRoom = activeChatCollabId ? chats.find(c =>
      c.roomId === `${currentUser.id}_${activeChatCollabId}` ||
      c.roomId === `${activeChatCollabId}_${currentUser.id}`
    ) : null;
    const messagesList = activeRoom ? activeRoom.messages : [];

    // Helper to render message text (handles images and files)
    const renderMessageBubbleContent = (text) => {
      if (text.startsWith('data:image/')) {
        return `<img src="${text}" class="max-w-full max-h-60 rounded-xl object-cover cursor-pointer hover:opacity-90 transition-opacity" onclick="window.open('${text}')" alt="Attachment" />`;
      }
      if (text.startsWith('[FILE]:')) {
        try {
          const parts = text.substring(7).split('|');
          const filename = parts[0];
          const fileData = parts.slice(1).join('|');
          return `
            <div class="flex items-center gap-3 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 rounded-xl max-w-xs">
              <div class="text-2xl shrink-0">📂</div>
              <div class="min-w-0 flex-1">
                <p class="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">${filename}</p>
                <a href="${fileData}" download="${filename}" class="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline font-bold block mt-0.5">Download File</a>
              </div>
            </div>
          `;
        } catch (e) {
          return `<span class="italic text-slate-400">Broken file attachment</span>`;
        }
      }
      return text;
    };

    // Check if the chat layout is already rendered in sysPanes.messages
    const messagesListContainer = document.getElementById("chat-messages-container");
    const chatInput = document.getElementById("chat-pane-input");

    const isMobile = window.innerWidth < 768;

    if (messagesListContainer && chatInput) {
      // Chat layout is already present! Let's update elements dynamically to preserve input focus & value.
      
      // Update display properties for mobile view toggling
      const listPanel = document.getElementById('chat-list-panel');
      const convPanel = document.getElementById('chat-conv-panel');
      const headerName = document.getElementById('chat-header-partner-name');
      const headerSection = document.getElementById('chat-header-online-status');
      const headerStatus = headerSection;
      
      // Update partner avatar dynamically (target inside the relative class specifically to avoid back-button)
      const partnerAvatarContainer = convPanel ? convPanel.querySelector('.relative .w-8.h-8') : null;
      if (partnerAvatarContainer) {
        partnerAvatarContainer.innerHTML = renderAvatar(activePartnerObj ? activePartnerObj.avatar : null, 'text-base', 'w-full h-full object-cover rounded-full');
      }

      // Update online status text/color and dot
      const isOnline = activeChatCollabId && (window.onlineUserIds || new Set()).has(String(activeChatCollabId));
      if (headerSection) {
        headerSection.textContent = isOnline ? '● Online' : '● Offline';
        headerSection.className = isOnline ? 'text-[10px] text-emerald-500 font-semibold' : 'text-[10px] text-slate-400';
      }

      // Update online dot on header
      const partnerDot = convPanel ? convPanel.querySelector('.absolute.bottom-0.right-0') : null;
      if (partnerDot) {
        partnerDot.className = `absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-slate-300'} border-2 border-white`;
      }
      if (listPanel && convPanel && isMobile) {
        if (activeChatCollabId) {
          listPanel.style.setProperty('display', 'none', 'important');
          convPanel.style.setProperty('display', 'flex', 'important');
        } else {
          listPanel.style.setProperty('display', 'flex', 'important');
          convPanel.style.setProperty('display', 'none', 'important');
        }
      } else if (listPanel && convPanel) {
        listPanel.style.display = '';
        convPanel.style.display = '';
      }

      // Dynamically update input and button disabled/placeholder states
      const uploadBtn = document.getElementById("chat-upload-btn");
      const sendBtn = document.getElementById("chat-send-btn");
      const schedBtn = document.getElementById("chat-header-schedule-btn");
      const voiceBtn = document.getElementById("chat-header-voice-btn");
      const videoBtn = document.getElementById("chat-header-video-btn");

      if (activeChatCollabId) {
        if (chatInput) {
          chatInput.removeAttribute('disabled');
          chatInput.placeholder = 'Type a message...';
        }
        if (uploadBtn) uploadBtn.removeAttribute('disabled');
        if (sendBtn) sendBtn.removeAttribute('disabled');
        if (schedBtn) {
          schedBtn.removeAttribute('disabled');
          schedBtn.setAttribute("onclick", `scheduleMeetingWith('${activeChatCollabId}')`);
        }
        if (voiceBtn) {
          voiceBtn.removeAttribute('disabled');
          voiceBtn.setAttribute("onclick", `startVoiceCall('${activeChatCollabId}')`);
        }
        if (videoBtn) {
          videoBtn.removeAttribute('disabled');
          videoBtn.setAttribute("onclick", `startVideoCall('${activeChatCollabId}')`);
        }
      } else {
        if (chatInput) {
          chatInput.setAttribute('disabled', 'true');
          chatInput.placeholder = 'Select a conversation to start';
        }
        if (uploadBtn) uploadBtn.setAttribute('disabled', 'true');
        if (sendBtn) sendBtn.setAttribute('disabled', 'true');
        if (schedBtn) schedBtn.setAttribute('disabled', 'true');
        if (voiceBtn) voiceBtn.setAttribute('disabled', 'true');
        if (videoBtn) videoBtn.setAttribute('disabled', 'true');
      }

      // 1. Update Active Partner Header Name and details
      if (headerName) headerName.textContent = activePartnerObj ? activePartnerObj.name : 'Select a conversation';
      if (headerSection && !activeChatCollabId) {
        headerSection.textContent = activePartnerObj ? `${activePartnerObj.gradeLevel || activePartnerObj.yearSection || ''} • ${activePartnerObj.schoolName || activePartnerObj.program || ''}` : '';
      }

      // 4. Update Left Sidebar Room List last-texts
      partners.forEach(p => {
        const room = chats.find(c => c.roomId === `${currentUser.id}_${p.id}` || c.roomId === `${p.id}_${currentUser.id}`);
        let lastText = room && room.messages.length > 0 ? room.messages[room.messages.length - 1].text : "Say hello!";
        if (lastText.startsWith('data:image/')) lastText = "📷 Sent an image";
        if (lastText.startsWith('[FILE]:')) lastText = "📁 Sent a file";
        const itemElement = document.getElementById(`chat-list-item-${p.id}`);
        if (itemElement) {
          const isActive = String(p.id) === String(activeChatCollabId);
          itemElement.className = `flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${isActive ? 'bg-indigo-50 border-indigo-100' : 'border-transparent hover:bg-slate-50'}`;
          const textElem = itemElement.querySelector(".chat-list-last-text");
          if (textElem) textElem.textContent = lastText;
        }
      });

      // 5. Update Messages HTML content only if message count or contents changed
      const oldHTML = messagesListContainer.innerHTML;
      const _deletedForMe = db.getDeletedForMe(currentUser.id);
      const _activeRoomId = activeChatCollabId ? [currentUser.id, activeChatCollabId].sort().join('_') : '';
      let newHTML = messagesList.filter(m => !_deletedForMe.has(String(m.id))).map((m, idx, arr) => {
        const isMe = m.senderId === currentUser.id;
        const seenTick = isMe ? (m.isRead
          ? `<span class="text-[9px] font-bold text-indigo-500" title="Seen">✓✓</span>`
          : `<span class="text-[9px] text-slate-300" title="Delivered">✓</span>`
        ) : '';
        const safeText = JSON.stringify(m.text);
        const msgId = m.id || '';
        return `
          <div class="flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-0.5"
               data-msg-id="${msgId}" data-sender-id="${m.senderId}" data-room-id="${_activeRoomId}"
               oncontextmenu="event.preventDefault();showMsgMenu(event,'${msgId}','${m.senderId}','${_activeRoomId}',${safeText})"
               ontouchstart="window._msgPressTimer=setTimeout(()=>showMsgMenu(event,'${msgId}','${m.senderId}','${_activeRoomId}',${safeText}),600)"
               ontouchend="clearTimeout(window._msgPressTimer)"
               ontouchmove="clearTimeout(window._msgPressTimer)">
            <div class="px-3.5 py-2 rounded-2xl text-xs max-w-[75%] select-text transition-transform active:scale-[0.98] ${isMe ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-slate-100 text-slate-800 rounded-bl-sm'}">
              ${renderMessageBubbleContent(m.text)}
            </div>
            <div class="flex items-center gap-1 px-1">
              <span class="text-[9px] text-slate-400">${isMe ? 'You' : m.senderName} · ${m.time}</span>
              ${seenTick}
            </div>
          </div>
        `;
      }).join('');
      if (messagesList.length === 0) {
        newHTML = `
          <div class="flex flex-col items-center justify-center h-full text-center text-slate-400 py-12 gap-3">
            <div class="text-4xl">💬</div>
            <p class="text-xs">No messages yet. Say hi!</p>
          </div>
        `;
      }

      if (oldHTML.trim() !== newHTML.trim()) {
        messagesListContainer.innerHTML = newHTML;
        messagesListContainer.scrollTop = messagesListContainer.scrollHeight;
      }

      // Auto-mark incoming messages as read if this chat is currently open
      if (activeChatCollabId) {
        const hasUnreadFromPartner = messagesList.some(m => m.senderId !== currentUser.id && !m.isRead);
        if (hasUnreadFromPartner) {
          const activeRoomId = [currentUser.id, activeChatCollabId].sort().join('_');
          db.markMessagesAsRead(activeRoomId, currentUser.id).catch(() => {});
        }
      }

      return;
    }

    // If layout does not exist, do a full initial render of the structure
    sysPanes.messages.innerHTML = `
      <div id="chat-layout-grid" class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-stretch" style="height: ${isMobile ? 'calc(100dvh - 8.5rem)' : 'min(600px, calc(100dvh - 9rem))'}">
        
        <!-- Left Panel: Chat List -->
         <div id="chat-list-panel" class="bg-white border rounded-2xl flex flex-col overflow-hidden shadow-sm" style="${isMobile && activeChatCollabId ? 'display: none !important;' : ''}">
           <div class="px-4 pt-4 pb-2 border-b shrink-0">
             <h3 class="font-heading font-bold text-slate-800 text-sm">Messages</h3>
             <p class="text-[10px] text-slate-400 mt-0.5">${partners.length} connections</p>
           </div>
           <div class="flex-1 overflow-y-auto py-2 px-2 space-y-1">
               ${partners.map(p => {
               const isActive = String(p.id) === String(activeChatCollabId);
               const isOnline = (window.onlineUserIds || new Set()).has(String(p.id));
               const room = chats.find(c => c.roomId === `${currentUser.id}_${p.id}` || c.roomId === `${p.id}_${currentUser.id}`);
               let lastText = room && room.messages.length > 0 ? room.messages[room.messages.length - 1].text : "Say hello!";
               if (lastText.startsWith('data:image/')) lastText = "📷 Sent an image";
               if (lastText.startsWith('[FILE]:')) lastText = "📁 Sent a file";
               const lastMsg = room && room.messages.length > 0 ? room.messages[room.messages.length - 1] : null;
               const lastTime = lastMsg ? lastMsg.time : '';
               const unreadCount = room ? (room.messages || []).filter(m => m.senderId !== currentUser.id && !m.isRead).length : 0;
               return `
                 <div id="chat-list-item-${p.id}" onclick="selectActiveChat('${p.id}')" class="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all border ${isActive ? 'bg-indigo-50 border-indigo-100' : 'border-transparent hover:bg-slate-50'} group">
                   <div class="relative shrink-0">
                     <div class="w-9 h-9 rounded-full bg-slate-100 border flex items-center justify-center overflow-hidden text-lg">${renderAvatar(p.avatar, 'text-lg', 'w-full h-full object-cover rounded-full')}</div>
                     <div id="online-dot-${p.id}" class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-slate-300'} border-2 border-white"></div>
                   </div>
                   <div class="overflow-hidden flex-1 min-w-0">
                     <h4 class="text-xs font-semibold truncate ${isActive ? 'text-indigo-700' : 'text-slate-800'}">${p.name}</h4>
                     <p class="text-[10px] text-slate-400 truncate chat-list-last-text">${lastText}</p>
                   </div>
                   <div class="flex flex-col items-end gap-1 shrink-0">
                     <span class="text-[9px] text-slate-400">${lastTime}</span>
                     ${unreadCount > 0 ? `<span class="w-4 h-4 rounded-full bg-indigo-600 text-white text-[8px] font-bold flex items-center justify-center">${unreadCount > 9 ? '9+' : unreadCount}</span>` : ''}
                   </div>
                 </div>
               `;
             }).join('')}
             ${partners.length === 0 ? `<div class="p-8 text-center text-xs text-slate-400">No accepted connections yet.<br>Connect with peers first.</div>` : ''}
           </div>
         </div>

         <!-- Right 2 Panels: Conversations -->
         <div id="chat-conv-panel" class="md:col-span-2 bg-white border rounded-2xl flex flex-col justify-between overflow-hidden shadow-sm" style="${isMobile && !activeChatCollabId ? 'display: none !important;' : ''}">
           <!-- Chat header -->
           <div class="px-4 py-3 border-b flex items-center gap-3 bg-slate-50/80 shrink-0">
             <!-- Mobile back button -->
             <button class="md:hidden w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 shrink-0" onclick="activeChatCollabId = null; renderMessagesPane();" title="Back">
               <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg>
             </button>
             <!-- Partner avatar + online indicator -->
             <div class="flex items-center gap-2.5 flex-1 min-w-0">
               <div class="relative shrink-0">
                 <div class="w-8 h-8 rounded-full bg-slate-200 border overflow-hidden flex items-center justify-center text-base">${renderAvatar(activePartnerObj ? activePartnerObj.avatar : null, 'text-base', 'w-full h-full object-cover rounded-full')}</div>
                 ${activeChatCollabId ? `<div class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ${(window.onlineUserIds||new Set()).has(String(activeChatCollabId)) ? 'bg-emerald-400' : 'bg-slate-300'} border-2 border-white"></div>` : ''}
               </div>
               <div class="min-w-0">
                 <h4 class="font-bold text-sm text-slate-800 truncate" id="chat-header-partner-name">${activePartnerObj ? activePartnerObj.name : 'Select a conversation'}</h4>
                 <div class="flex items-center gap-1.5">
                   <span id="chat-header-online-status" class="${activeChatCollabId && (window.onlineUserIds||new Set()).has(String(activeChatCollabId)) ? 'text-[10px] text-emerald-500 font-semibold' : 'text-[10px] text-slate-400'}">${activeChatCollabId ? ((window.onlineUserIds||new Set()).has(String(activeChatCollabId)) ? '● Online' : '● Offline') : (activePartnerObj ? `${activePartnerObj.gradeLevel || activePartnerObj.yearSection || ''} • ${activePartnerObj.schoolName || activePartnerObj.program || ''}` : '')}</span>
                 </div>
               </div>
             </div>
             <!-- Action buttons -->
             <div class="flex items-center gap-1 shrink-0">
               <button id="chat-header-voice-btn" class="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors" title="Voice Call">
                 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
               </button>
               <button id="chat-header-video-btn" class="w-8 h-8 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors" title="Video Call">
                 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
               </button>
               <button id="chat-header-schedule-btn" class="w-8 h-8 rounded-full flex items-center justify-center text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-colors" title="Schedule Meeting">
                 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
               </button>
             </div>
           </div>

           <!-- Chat body messages -->
           <div class="flex-1 overflow-y-auto px-4 py-4 space-y-3" id="chat-messages-container" data-msg-count="${messagesList.length}">
             ${(() => {
               const deletedSet = db.getDeletedForMe(currentUser.id);
               const activeRoomId = activeChatCollabId ? [currentUser.id, activeChatCollabId].sort().join('_') : '';
               const visibleMsgs = messagesList.filter(m => !deletedSet.has(String(m.id)));
               if (visibleMsgs.length === 0) return `
                 <div class="flex flex-col items-center justify-center h-full text-center text-slate-400 py-12 gap-3">
                   <div class="text-4xl">💬</div>
                   <p class="text-xs">No messages yet. Say hi!</p>
                 </div>`;
               return visibleMsgs.map(m => {
                 const isMe = m.senderId === currentUser.id;
                 const safeText = JSON.stringify(m.text || '');
                 const msgId = m.id || '';
                 const seenTick = isMe
                   ? (m.isRead
                     ? '<span class="text-[9px] font-bold text-indigo-500" title="Seen">✓✓</span>'
                     : '<span class="text-[9px] text-slate-300" title="Delivered">✓</span>')
                   : '';
                 return `
                   <div class="flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-0.5 group"
                        oncontextmenu="event.preventDefault();showMsgMenu(event,'${msgId}','${m.senderId}','${activeRoomId}',${safeText})"
                        ontouchstart="window._msgPressTimer=setTimeout(()=>showMsgMenu(event,'${msgId}','${m.senderId}','${activeRoomId}',${safeText}),500)"
                        ontouchend="clearTimeout(window._msgPressTimer)"
                        ontouchmove="clearTimeout(window._msgPressTimer)">
                     <div class="px-3.5 py-2 rounded-2xl text-xs max-w-[78%] leading-relaxed select-text transition-transform active:scale-[0.98]
                       ${isMe ? 'bg-indigo-600 hover:bg-indigo-700 text-white rounded-br-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-bl-sm'}">
                       ${renderMessageBubbleContent(m.text)}
                     </div>
                     <div class="flex items-center gap-1 px-1">
                       <span class="text-[9px] text-slate-400">${isMe ? 'You' : m.senderName} · ${m.time}</span>
                       ${seenTick}
                     </div>
                   </div>`;
               }).join('');
             })()}
           </div>

           <!-- Chat inputs -->
           <div id="chat-input-bar" class="p-3 border-t bg-white shrink-0">
             <div class="flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2 border border-slate-200/60 focus-within:ring-2 focus-within:ring-indigo-400 focus-within:bg-white transition-all">
               <!-- File Upload Button -->
               <button id="chat-upload-btn" class="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors shrink-0" title="Upload File/Image">
                 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 11-2.828-2.828l6.414-6.414a4 4 0 015.656 5.656l-6.415 6.415a6 6 0 11-8.486-8.486L10.5 5"/></svg>
               </button>
               <input type="file" id="chat-file-upload-input" class="hidden">
               
               <input type="text" id="chat-pane-input" class="flex-1 bg-transparent border-none text-xs focus:outline-none placeholder-slate-400 text-slate-800 py-1" placeholder="${activeChatCollabId ? 'Type a message...' : 'Select a conversation to start'}" ${!activeChatCollabId ? 'disabled' : ''}>
               <button id="chat-send-btn" class="w-7 h-7 rounded-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-colors shrink-0 ${!activeChatCollabId ? 'opacity-30' : ''}" title="Send">
                 <svg class="w-3.5 h-3.5 text-white transform rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
               </button>
             </div>
           </div>
         </div>

      </div>
    `;

    // Scroll chat to bottom
    const container = document.getElementById("chat-messages-container");
    if (container) container.scrollTop = container.scrollHeight;

    // Bind events via addEventListener (works on mobile regardless of disabled attribute)
    const newChatInput = document.getElementById("chat-pane-input");
    if (newChatInput) {
      newChatInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendChatMessage();
      });
    }

    // Send button — use both click and touchend for mobile
    const sendBtnEl = document.getElementById('chat-send-btn');
    if (sendBtnEl) {
      sendBtnEl.addEventListener('click', () => { if (activeChatCollabId) sendChatMessage(); });
      sendBtnEl.addEventListener('touchend', (e) => { e.preventDefault(); if (activeChatCollabId) sendChatMessage(); }, { passive: false });
    }

    // Upload button — use both click and touchend for mobile
    const uploadBtnEl = document.getElementById('chat-upload-btn');
    if (uploadBtnEl) {
      uploadBtnEl.addEventListener('click', () => { if (activeChatCollabId) triggerChatFileUpload(); });
      uploadBtnEl.addEventListener('touchend', (e) => { e.preventDefault(); if (activeChatCollabId) triggerChatFileUpload(); }, { passive: false });
    }

    // File input change
    const fileInput = document.getElementById('chat-file-upload-input');
    if (fileInput) {
      fileInput.addEventListener('change', handleChatFileUpload);
    }

    // Header action buttons — bind via addEventListener
    const voiceBtnEl = document.getElementById('chat-header-voice-btn');
    const videoBtnEl = document.getElementById('chat-header-video-btn');
    const schedBtnEl = document.getElementById('chat-header-schedule-btn');
    if (voiceBtnEl) {
      voiceBtnEl.addEventListener('click', () => { if (activeChatCollabId) startVoiceCall(activeChatCollabId); });
      voiceBtnEl.addEventListener('touchend', (e) => { e.preventDefault(); if (activeChatCollabId) startVoiceCall(activeChatCollabId); }, { passive: false });
    }
    if (videoBtnEl) {
      videoBtnEl.addEventListener('click', () => { if (activeChatCollabId) startVideoCall(activeChatCollabId); });
      videoBtnEl.addEventListener('touchend', (e) => { e.preventDefault(); if (activeChatCollabId) startVideoCall(activeChatCollabId); }, { passive: false });
    }
    if (schedBtnEl) {
      schedBtnEl.addEventListener('click', () => { if (activeChatCollabId) scheduleMeetingWith(activeChatCollabId); });
      schedBtnEl.addEventListener('touchend', (e) => { e.preventDefault(); if (activeChatCollabId) scheduleMeetingWith(activeChatCollabId); }, { passive: false });
    }
    // Back button (mobile) — bind touchend too for reliable mobile tap
    const backBtnEl = document.querySelector('#chat-conv-panel .md\\:hidden');
    if (backBtnEl) {
      backBtnEl.addEventListener('click', () => { activeChatCollabId = null; renderMessagesPane(); });
      backBtnEl.addEventListener('touchend', (e) => { e.preventDefault(); activeChatCollabId = null; renderMessagesPane(); }, { passive: false });
    }
  }

  window.selectActiveChat = async function(partnerId) {
    activeChatCollabId = partnerId;
    const roomId = [currentUser.id, partnerId].sort().join('_');

    // On mobile: immediately switch to conversation panel
    if (window.innerWidth < 768) {
      const listPanel = document.getElementById('chat-list-panel');
      const convPanel = document.getElementById('chat-conv-panel');
      if (listPanel) listPanel.style.setProperty('display', 'none', 'important');
      if (convPanel) convPanel.style.setProperty('display', 'flex', 'important');
    }

    // Mark messages as read
    db.markMessagesAsRead(roomId, currentUser.id).catch(() => {});

    // Show inline loading in message area while fetching from server
    const existingContainer = document.getElementById('chat-messages-container');
    if (existingContainer) {
      existingContainer.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full text-slate-400 text-xs gap-2">
          <div class="text-xl animate-spin">⟳</div>
          <span>Loading messages...</span>
        </div>
      `;
    }

    // ALWAYS fetch fresh from server before rendering
    // This guarantees messages show even on first load / after reload
    try {
      await db.getChatRoom(roomId);
    } catch(e) {}

    // Single authoritative render with fresh server data
    renderMessagesPane();

    // Scroll to bottom
    const container = document.getElementById('chat-messages-container');
    if (container) container.scrollTop = container.scrollHeight;
  };

  window.sendChatMessage = async function() {
    const input = document.getElementById('chat-pane-input');
    const text = input ? input.value.trim() : '';
    if (!text || !activeChatCollabId) return;
    if (input) input.value = '';

    const roomId = [currentUser.id, activeChatCollabId].sort().join('_');
    
    // Send message (optimistic update to cache + POST to server)
    await db.sendMessage(roomId, currentUser.id, currentUser.name, text);
    
    // Re-fetch from server to get the confirmed message with server ID
    // This ensures the receiver sees the message on their next poll
    try {
      await db.getChatRoom(roomId);
    } catch(e) {}
    
    renderMessagesPane();
  };

  window.triggerChatFileUpload = function() {
    const fileInput = document.getElementById('chat-file-upload-input');
    if (fileInput) fileInput.click();
  };

  window.handleChatFileUpload = function(event) {
    const file = event.target.files[0];
    if (!file || !activeChatCollabId) return;

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      showToast('File size exceeds the 5MB limit.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async function(e) {
      const dataUrl = e.target.result;
      const roomId = [currentUser.id, activeChatCollabId].sort().join('_');
      let msgText = dataUrl;

      // If it's not an image, prefix with [FILE]:filename|dataUrl
      if (!file.type.startsWith('image/')) {
        msgText = `[FILE]:${file.name}|${dataUrl}`;
      }

      showToast('Sending attachment...', 'info');
      await db.sendMessage(roomId, currentUser.id, currentUser.name, msgText);
      // Refetch from server to ensure receiver sees the message
      try { await db.getChatRoom(roomId); } catch(e) {}
      renderMessagesPane();
      // Clear file input
      event.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  // Dismiss any open context menu when clicking or touching elsewhere
  document.addEventListener('click', () => {
    const existing = document.getElementById('msg-context-menu');
    if (existing) existing.remove();
  });

  // Show message context menu (works for both right-click and long-press on mobile)
  window.showMsgMenu = function(event, msgId, senderId, roomId, text) {
    if (event && event.preventDefault) event.preventDefault();
    if (event && event.stopPropagation) event.stopPropagation();
    const existing = document.getElementById('msg-context-menu');
    if (existing) existing.remove();

    const isMe = String(senderId) === String(currentUser.id);
    const menu = document.createElement('div');
    menu.id = 'msg-context-menu';
    menu.className = 'fixed z-[9999] bg-white border border-slate-200 rounded-2xl shadow-2xl py-1.5 text-xs font-medium overflow-hidden';
    menu.style.minWidth = '170px';

    const items = [
      { label: '📋 Copy Text', action: `navigator.clipboard.writeText(${JSON.stringify(text)});document.getElementById('msg-context-menu').remove();showToast('Copied!','info',1500)` },
      isMe ? { label: '↩️ Unsend (for everyone)', action: `unsendMessage('${roomId}','${msgId}','${senderId}')`, className: 'text-orange-600' } : null,
      { label: '🗑️ Delete for me', action: `deleteMessageForMe('${roomId}','${msgId}')`, className: 'text-red-500' },
    ].filter(Boolean);

    menu.innerHTML = items.map(item =>
      `<button class="w-full text-left px-4 py-3 hover:bg-slate-50 active:bg-slate-100 transition-colors ${item.className || 'text-slate-700'}" onclick="${item.action}">${item.label}</button>`
    ).join('') +
    `<div class="border-t border-slate-100 mt-1 pt-1">
      <button class="w-full text-left px-4 py-3 hover:bg-red-50 active:bg-red-100 transition-colors text-red-600" onclick="confirmDeleteConversation('${roomId}')">🗑️ Delete Conversation</button>
    </div>`;

    // Position relative to click or touch (touch events have .touches[0])
    document.body.appendChild(menu);
    const rect = menu.getBoundingClientRect();
    let x, y;
    if (event && event.clientX !== undefined && event.clientX !== 0) {
      x = event.clientX; y = event.clientY;
    } else if (event && event.touches && event.touches[0]) {
      x = event.touches[0].clientX; y = event.touches[0].clientY;
    } else {
      x = window.innerWidth / 2 - 85; y = window.innerHeight / 2;
    }
    if (x + rect.width > window.innerWidth) x = window.innerWidth - rect.width - 8;
    if (y + rect.height > window.innerHeight) y = y - rect.height - 4;
    if (y < 4) y = 4;
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';

    // Dismiss on any touch outside the menu
    setTimeout(() => {
      function _dismissOnTouch(e) {
        if (!menu.contains(e.target)) {
          menu.remove();
          document.removeEventListener('touchstart', _dismissOnTouch);
          document.removeEventListener('click', _dismissOnTouch);
        }
      }
      document.addEventListener('touchstart', _dismissOnTouch, { passive: true });
      document.addEventListener('click', _dismissOnTouch);
    }, 100);
  };

  window.unsendMessage = async function(roomId, msgId, senderId) {
    const existing = document.getElementById('msg-context-menu');
    if (existing) existing.remove();
    const confirmed = await showConfirm({ title: 'Unsend Message', message: 'Remove this message for everyone?', okLabel: 'Unsend', type: 'danger' });
    if (!confirmed) return;
    await db.deleteMessage(roomId, msgId, senderId);
    showToast('Message unsent.', 'info', 2000);
    renderMessagesPane();
  };

  window.deleteMessageForMe = function(roomId, msgId) {
    const existing = document.getElementById('msg-context-menu');
    if (existing) existing.remove();
    db.deleteForMe(roomId, msgId, currentUser.id);
    showToast('Message hidden for you.', 'info', 2000);
    renderMessagesPane();
  };

  window.confirmDeleteConversation = async function(roomId) {
    const existing = document.getElementById('msg-context-menu');
    if (existing) existing.remove();
    const confirmed = await showConfirm({ title: 'Delete Conversation', message: 'This will permanently delete all messages in this conversation for everyone. Continue?', okLabel: 'Delete', type: 'danger' });
    if (!confirmed) return;
    await db.deleteConversation(roomId);
    activeChatCollabId = null;
    showToast('Conversation deleted.', 'success', 2000);
    renderMessagesPane();
  };

  window.startVoiceCall = async function(partnerId) {
    const partner = db.getUsers().find(u => u.id === partnerId);
    const partnerName = partner ? partner.name : 'Partner';
    showToast(`📞 Calling ${partnerName}...`, 'info');

    const meetData = {
      host_id:      currentUser.id,
      guest_id:     partnerId,
      topic:        `Instant Voice Call with ${partnerName}`,
      meeting_date: new Date().toISOString().split('T')[0],
      start_time:   new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      end_time:     new Date(Date.now() + 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      meeting_type: 'voice',
      notes:        'Instant peer-to-peer voice collaboration call.'
    };

    const savedMeet = await db.createMeeting(meetData);
    window.joinVideoCall(savedMeet.id);
  };

  window.startVideoCall = async function(partnerId) {
    const partner = db.getUsers().find(u => u.id === partnerId);
    const partnerName = partner ? partner.name : 'Partner';
    showToast(`📹 Calling ${partnerName}...`, 'info');

    const meetData = {
      host_id:      currentUser.id,
      guest_id:     partnerId,
      topic:        `Instant Video Call with ${partnerName}`,
      meeting_date: new Date().toISOString().split('T')[0],
      start_time:   new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      end_time:     new Date(Date.now() + 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      meeting_type: 'video',
      notes:        'Instant peer-to-peer video collaboration call.'
    };

    const savedMeet = await db.createMeeting(meetData);
    window.joinVideoCall(savedMeet.id);
  };

  window.scheduleMeetingWith = function(partnerId) {
    showSystemView("meetings");
    const select = document.getElementById("meet-partner");
    if (select) select.value = partnerId;
  };

  // --- 11. ADMIN ANALYTICS PANE ---
  
  function renderAdminPane() {
    const users = db.getUsers() || [];
    const conns = db.getConnections() || [];
    const meetings = db.getMeetings() || [];
    const logs = db.getLogs() || [];

    const jhsUsers = users.filter(u => !u.isAdmin && u.educationLevel === 'JHS').length;
    const shsUsers = users.filter(u => !u.isAdmin && u.educationLevel === 'SHS').length;

    // SVG graph parameters (representing registrations over time)
    // Draw an SVG path based on mock registration trends
    const dataPoints = [25, 45, 30, 65, 80, 55, 95];
    const pathString = dataPoints.map((val, idx) => {
      const x = idx * 60 + 10;
      const y = 100 - val * 0.8;
      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    const pointsHTML = dataPoints.map((val, idx) => {
      const x = idx * 60 + 10;
      const y = 100 - val * 0.8;
      return `<circle cx="${x}" cy="${y}" r="4" fill="#6366f1" stroke="white" stroke-width="1.5" class="cursor-pointer" title="Day ${idx+1}: ${val} users"></circle>`;
    }).join('');

    sysPanes.admin.innerHTML = `
      <div class="space-y-6">
        <!-- 4 Stats Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-white border rounded-2xl p-5 shadow-sm">
            <span class="text-2xl">👥</span>
            <div class="text-2xl font-bold text-slate-800 mt-2">${users.filter(u => !u.isAdmin).length}</div>
            <div class="text-[10px] text-slate-400 uppercase tracking-wide">Total Students</div>
            <div class="mt-2.5 flex flex-wrap gap-1.5 text-[9px] font-bold">
              <span class="bg-indigo-50 border border-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">🏫 JHS: ${jhsUsers}</span>
              <span class="bg-indigo-50 border border-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">🎓 SHS: ${shsUsers}</span>
            </div>
          </div>
          <div class="bg-white border rounded-2xl p-5 shadow-sm">
            <span class="text-2xl">🤝</span>
            <div class="text-2xl font-bold text-slate-800 mt-2">${conns.filter(c => c.status === 'accepted').length}</div>
            <div class="text-[10px] text-slate-400 uppercase tracking-wide">Matches Formed</div>
          </div>
          <div class="bg-white border rounded-2xl p-5 shadow-sm">
            <span class="text-2xl">💻</span>
            <div class="text-2xl font-bold text-slate-800 mt-2">${meetings.length}</div>
            <div class="text-[10px] text-slate-400 uppercase tracking-wide">Meetings Held</div>
          </div>
          <div class="bg-white border rounded-2xl p-5 shadow-sm">
            <span class="text-2xl">🟢</span>
            <div class="text-2xl font-bold text-slate-800 mt-2">${users.filter(u => u.isOnline && !u.isAdmin).length}</div>
            <div class="text-[10px] text-slate-400 uppercase tracking-wide">Active Users</div>
          </div>
        </div>

        <!-- Lower charts & logs split -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <!-- Student Directory -->
          <div id="admin-user-list-card" class="lg:col-span-2 bg-white border rounded-2xl p-6 shadow-sm transition-all border-slate-200">
            <h3 class="font-heading font-bold text-slate-800 mb-4 pb-2 border-b">Recent Registrations</h3>
            <div class="overflow-x-auto max-h-[350px]">
              <table class="w-full text-left text-xs">
                <thead class="bg-slate-50 text-[10px] text-slate-400 font-bold uppercase border-b">
                  <tr>
                    <th class="p-3">Student</th>
                    <th class="p-3">Status</th>
                    <th class="p-3">ID</th>
                    <th class="p-3">Email</th>
                    <th class="p-3">Section</th>
                    <th class="p-3 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  ${users.filter(u => !u.isAdmin).map(u => {
                    const onlineDot = u.isOnline 
                      ? `<span class="inline-flex items-center gap-1 text-emerald-600 font-bold"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>Online</span>`
                      : `<span class="inline-flex items-center gap-1 text-slate-400 font-bold"><span class="w-1.5 h-1.5 rounded-full bg-slate-300 inline-block"></span>Offline</span>`;
                    const banLabel = u.isBanned
                      ? `<span class="ml-1 text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">BANNED</span>`
                      : '';
                    return `
                    <tr class="${u.isBanned ? 'opacity-60' : ''}">
                      <td class="p-3 font-semibold text-slate-800">${u.name}${banLabel}</td>
                      <td class="p-3">${onlineDot}</td>
                      <td class="p-3 text-slate-500">${u.studentId || 'N/A'}</td>
                      <td class="p-3 text-slate-500">${u.email}</td>
                      <td class="p-3 text-slate-500 truncate max-w-[200px]">${u.gradeLevel || u.yearSection || 'N/A'} ${u.section ? `(${u.section})` : ''} • ${u.schoolName || u.program || 'N/A'}</td>
                      <td class="p-3 pr-4 text-right">
                        <div class="inline-flex gap-1 flex-wrap justify-end">
                          ${u.isBanned
                            ? `<button onclick="adminBanUser('${u.id}', false)" class="text-emerald-600 hover:text-emerald-700 border border-emerald-200 bg-emerald-50 px-2 py-0.5 rounded font-bold text-[10px]">Unban</button>`
                            : `<button onclick="adminBanUser('${u.id}', true)" class="text-amber-600 hover:text-amber-700 border border-amber-200 bg-amber-50 px-2 py-0.5 rounded font-bold text-[10px]">Ban</button>`
                          }
                          <button onclick="adminRemoveUser('${u.id}')" class="text-red-500 hover:text-red-700 border border-red-200 bg-red-50 px-2 py-0.5 rounded font-bold text-[10px]">Delete</button>
                        </div>
                      </td>
                    </tr>
                  `}).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- Line Graph -->
          <div id="admin-activity-graph-card" class="bg-white border rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all border-slate-200">
            <div>
              <h3 class="font-heading font-bold text-slate-800 mb-1">System Activity</h3>
              <p class="text-[10px] text-slate-400">Student logins recorded over the past week</p>
            </div>
            
            <div class="w-full h-36 bg-slate-50 rounded-xl border border-slate-150 p-2 flex items-center justify-center my-4">
              <svg viewBox="0 0 400 100" class="w-full h-full">
                <!-- Grid Lines -->
                <line x1="0" y1="20" x2="400" y2="20" stroke="#f1f5f9" stroke-width="1"></line>
                <line x1="0" y1="50" x2="400" y2="50" stroke="#f1f5f9" stroke-width="1"></line>
                <line x1="0" y1="80" x2="400" y2="80" stroke="#f1f5f9" stroke-width="1"></line>
                
                <!-- Path line -->
                <path d="${pathString}" fill="none" stroke="#6366f1" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></path>
                ${pointsHTML}
              </svg>
            </div>
            
            <button onclick="resetSystemDB()" class="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-[10px] py-2 rounded-lg transition-all">
              🗑️ Reset System Data
            </button>
          </div>

        </div>

        <!-- Meetings Directory Card -->
        <div id="admin-meetings-list-card" class="bg-white border rounded-2xl p-6 shadow-sm transition-all border-slate-200">
          <h3 class="font-heading font-bold text-slate-800 mb-4 pb-2 border-b">Active Collaborative Meetings</h3>
          <div class="overflow-x-auto max-h-[300px]">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 text-[10px] text-slate-400 font-bold uppercase border-b">
                <tr>
                  <th class="p-3">Host</th>
                  <th class="p-3">Guest / Partner</th>
                  <th class="p-3">Topic / Subject</th>
                  <th class="p-3">Schedule Date</th>
                  <th class="p-3">Time Window</th>
                  <th class="p-3">Call Type</th>
                  <th class="p-3 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${meetings.map(m => {
                  const host = users.find(u => u.id === m.host_id) || { name: 'Host' };
                  const guest = users.find(u => u.id === m.guest_id) || { name: 'Guest' };
                  return `
                    <tr>
                      <td class="p-3 font-semibold text-slate-800">${host.name}</td>
                      <td class="p-3 font-semibold text-slate-800">${guest.name}</td>
                      <td class="p-3 text-slate-600">${m.topic}</td>
                      <td class="p-3 text-slate-500">${m.meeting_date}</td>
                      <td class="p-3 text-slate-500">${m.start_time} - ${m.end_time}</td>
                      <td class="p-3"><span class="bg-indigo-50 text-brand-purple px-2 py-0.5 rounded text-[10px] font-bold">${m.meeting_type}</span></td>
                      <td class="p-3 pr-4 text-right">
                        <div class="inline-flex gap-1">
                          <button onclick="adminJoinMeeting('${m.id}')" class="text-indigo-600 hover:text-indigo-700 border border-indigo-200 bg-indigo-50 px-2 py-0.5 rounded font-bold text-[10px]">Join</button>
                          <button onclick="adminDeleteMeeting('${m.id}')" class="text-red-500 hover:text-red-700 border border-red-200 bg-red-50 px-2 py-0.5 rounded font-bold text-[10px]">Delete</button>
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
                ${meetings.length === 0 ? `
                  <tr>
                    <td colspan="7" class="p-6 text-center text-slate-400">No scheduled study calls registered yet.</td>
                  </tr>
                ` : ''}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Logs events -->
        <div id="admin-logs-card" class="bg-white border rounded-2xl p-6 shadow-sm transition-all border-slate-200">
          <h3 class="font-heading font-bold text-slate-800 mb-4 pb-2 border-b">System Activity Log</h3>
          <div class="space-y-2 max-h-[250px] overflow-y-auto pr-2 text-xs font-mono">
            ${logs.map(l => `
              <div class="flex justify-between border-b pb-1.5 border-slate-100">
                <div>
                  <span class="font-bold uppercase text-[9px] px-1.5 py-0.5 rounded ${l.type === 'system' ? 'bg-slate-200 text-slate-700' : (l.type === 'user' ? 'bg-indigo-100 text-indigo-700' : 'bg-green-100 text-green-700')}">${l.type}</span>
                  <span class="text-slate-800 ml-2">${l.message}</span>
                </div>
                <span class="text-slate-400 text-[10px]">${l.time}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  window.adminRemoveUser = async function(userId) {
    const confirmed = await showConfirm({
      title: 'Delete Student Account',
      message: 'Are you sure you want to permanently delete this user profile? All their matches, connections, and logs will be lost.',
      type: 'danger',
      okLabel: 'Yes, Delete'
    });
    if (confirmed) {
      try {
        await db.deleteUser(userId);
        db.addLog("system", "Admin removed student account.");
        showToast('Student account removed successfully.', 'info');
        renderAdminPane();
      } catch (err) {
        showToast('Failed to delete user: ' + err.message, 'error');
      }
    }
  };

  window.adminBanUser = async function(userId, banStatus) {
    const user = db.getUsers().find(u => u.id === userId);
    const userName = user ? user.name : userId;
    const action = banStatus ? 'Ban' : 'Unban';
    const confirmed = await showConfirm({
      title: `${action} User`,
      message: `Are you sure you want to ${action.toLowerCase()} ${userName}? ${banStatus ? 'They will be immediately logged out and blocked from logging in.' : 'They will be able to log in again.'}`,
      type: banStatus ? 'danger' : 'info',
      okLabel: `Yes, ${action}`
    });
    if (confirmed) {
      try {
        await db.banUser(userId, banStatus);
        db.addLog("system", `Admin ${banStatus ? 'banned' : 'unbanned'} user: ${userName}.`);
        showToast(`User ${userName} has been ${banStatus ? 'banned' : 'unbanned'}.`, banStatus ? 'warning' : 'success');
        renderAdminPane();
      } catch (err) {
        showToast('Failed to update ban status: ' + err.message, 'error');
      }
    }
  };

  window.adminJoinMeeting = function(meetingId) {
    const meetings = db.getMeetings() || [];
    const meeting = meetings.find(m => String(m.id) === String(meetingId));
    if (!meeting) {
      showToast('Meeting not found.', 'error');
      return;
    }
    // Admin joins as observer
    inCallMeeting = meeting;
    showToast(`Admin joined meeting: "${meeting.topic}"`, 'info');
    window.joinVideoCall(meeting.id);
  };

  window.adminDeleteMeeting = async function(meetingId) {
    const confirmed = await showConfirm({
      title: 'Delete Meeting / Collaboration',
      message: 'Are you sure you want to delete this meeting? It will be removed for all participants.',
      type: 'danger',
      okLabel: 'Yes, Delete Meeting'
    });
    if (confirmed) {
      try {
        await db.deleteMeeting(meetingId);
        db.addLog("system", `Admin deleted meeting ${meetingId}.`);
        showToast('Meeting deleted successfully.', 'info');
        renderAdminPane();
      } catch (err) {
        showToast('Failed to delete meeting: ' + err.message, 'error');
      }
    }
  };

  window.resetSystemDB = async function() {
    const confirmed = await showConfirm({
      title: 'Reset Database',
      message: 'This will restore the system to its initial default state. All registered users, connections, and chat history will be permanently erased.',
      type: 'warning',
      okLabel: 'Yes, Reset Everything'
    });
    if (confirmed) {
      localStorage.removeItem("peerlink_initialized");
      localStorage.removeItem("peerlink_courses");
      localStorage.removeItem("peerlink_skills");
      localStorage.removeItem("peerlink_users");
      localStorage.removeItem("peerlink_connections");
      localStorage.removeItem("peerlink_meetings");
      localStorage.removeItem("peerlink_chats");
      localStorage.removeItem("peerlink_logs");

      initializeDatabase();
      currentUser = null;
      showPublicView("landing");
    }
  };

  // --- 12. OTHER PANES STUBS ---
  
  // Helper: render an avatar as either an <img> (photo) or emoji span
  function renderAvatar(avatar, sizeClass = 'text-2xl', imgClass = 'w-full h-full object-cover rounded-full') {
    if (avatar && avatar.startsWith('data:image')) {
      return `<img src="${avatar}" class="${imgClass}" alt="avatar" />`;
    }
    return `<span class="${sizeClass}">${avatar || '👤'}</span>`;
  }
  window.renderAvatar = renderAvatar;

  window.updateProfileStrandOptions = function(selectedStrand) {
    const track = document.getElementById('prof-track')?.value || '';
    const strandSel = document.getElementById('prof-strand');
    if (!strandSel) return;

    const strandMap = {
      'Academic':                       ['STEM', 'ABM', 'HUMSS', 'GAS'],
      'Technical-Vocational-Livelihood': ['ICT', 'HE', 'IA', 'CSS', 'Cookery', 'Electronics'],
      'Sports':                         ['Sports Track'],
      'Arts and Design':                ['Arts and Design Track'],
    };

    const options = strandMap[track] || [];
    strandSel.innerHTML = options.map(s => `<option value="${s}" ${s === selectedStrand ? 'selected' : ''}>${s}</option>`).join('');
  };

  function renderProfilePane() {
    const avatarOptions = ['👤','🧑','👦','👧','🧑‍💻','👨‍💻','👩‍💻','🧑‍🎓','👨‍🎓','👩‍🎓','🦊','🐻','🐼','🦁','🐯','🐨','🐸','🦄'];
    const isPhoto = currentUser.avatar && currentUser.avatar.startsWith('data:image');
    sysPanes.profile.innerHTML = `
      <div class="space-y-6 max-w-2xl">
        <div class="bg-white border rounded-2xl p-6 shadow-sm space-y-6">
          <div class="flex justify-between items-center border-b pb-4">
            <div>
              <h3 class="font-heading font-bold text-lg text-slate-900">My Profile</h3>
              <p class="text-xs text-slate-500">Edit your personal information and biography.</p>
            </div>
            <button class="bg-brand-purple hover:bg-opacity-90 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm" onclick="saveUserProfile()">
              Save Changes
            </button>
          </div>

          <!-- Avatar Picker -->
          <div class="flex items-center gap-6">
            <div class="relative shrink-0">
              <div class="w-20 h-20 rounded-full bg-slate-100 border-2 border-brand-purple flex items-center justify-center text-4xl overflow-hidden" id="profile-avatar-preview">
                ${isPhoto ? `<img src="${currentUser.avatar}" class="w-full h-full object-cover" alt="avatar" />` : (currentUser.avatar || '👤')}
              </div>
              <label for="avatar-file-input" class="absolute -bottom-1 -right-1 w-7 h-7 bg-brand-purple rounded-full flex items-center justify-center cursor-pointer border-2 border-white shadow text-white text-xs hover:bg-indigo-700 transition-all" title="Upload photo">
                📷
              </label>
              <input type="file" id="avatar-file-input" accept="image/jpeg,image/jpg,image/png,image/webp" class="hidden" onchange="handleAvatarFileSelect(event)" />
            </div>
            <div class="flex-1">
              <p class="text-xs font-bold text-slate-700 mb-1 uppercase">Profile Picture</p>
              <p class="text-[11px] text-slate-400 mb-3">Upload a photo (JPG, PNG, WebP — max 5MB) or choose an emoji avatar below.</p>
              <div class="flex flex-wrap gap-1.5">
                ${avatarOptions.map(a => `
                  <button onclick="selectProfileAvatar('${a}')" class="text-xl w-8 h-8 rounded-lg hover:bg-slate-100 border transition-all ${currentUser.avatar === a ? 'bg-indigo-50 border-brand-purple' : 'border-slate-200'}">${a}</button>
                `).join('')}
              </div>
              <input type="hidden" id="prof-avatar" value="${currentUser.avatar || '👤'}">
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Full Name</label>
              <input type="text" id="prof-name" class="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300" value="${currentUser.name || ''}">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Education Level</label>
              <span class="block px-3 py-2 text-xs font-bold bg-slate-100 rounded-lg text-slate-700 select-none">
                ${currentUser.educationLevel === 'JHS' ? '🏫 Junior High School' : (currentUser.educationLevel === 'SHS' ? '🎓 Senior High School' : '🛡️ Admin')}
              </span>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5 uppercase">School Name</label>
              <input type="text" id="prof-school-name" list="prof-school-datalist" class="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300" value="${currentUser.schoolName || ''}">
              <datalist id="prof-school-datalist"></datalist>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Grade Level</label>
              <select id="prof-grade-level" class="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300">
                ${currentUser.educationLevel === 'JHS' ? `
                  <option value="Grade 7" ${currentUser.gradeLevel === 'Grade 7' ? 'selected' : ''}>Grade 7</option>
                  <option value="Grade 8" ${currentUser.gradeLevel === 'Grade 8' ? 'selected' : ''}>Grade 8</option>
                  <option value="Grade 9" ${currentUser.gradeLevel === 'Grade 9' ? 'selected' : ''}>Grade 9</option>
                  <option value="Grade 10" ${currentUser.gradeLevel === 'Grade 10' ? 'selected' : ''}>Grade 10</option>
                ` : `
                  <option value="Grade 11" ${currentUser.gradeLevel === 'Grade 11' ? 'selected' : ''}>Grade 11</option>
                  <option value="Grade 12" ${currentUser.gradeLevel === 'Grade 12' ? 'selected' : ''}>Grade 12</option>
                `}
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Section</label>
              <input type="text" id="prof-section" class="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300" value="${currentUser.section || ''}">
            </div>
            ${currentUser.educationLevel === 'SHS' ? `
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Track</label>
                <select id="prof-track" onchange="updateProfileStrandOptions()" class="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300">
                  <option value="Academic" ${currentUser.track === 'Academic' ? 'selected' : ''}>Academic</option>
                  <option value="Technical-Vocational-Livelihood" ${currentUser.track === 'Technical-Vocational-Livelihood' ? 'selected' : ''}>Technical-Vocational-Livelihood (TVL)</option>
                  <option value="Sports" ${currentUser.track === 'Sports' ? 'selected' : ''}>Sports</option>
                  <option value="Arts and Design" ${currentUser.track === 'Arts and Design' ? 'selected' : ''}>Arts and Design</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Strand</label>
                <select id="prof-strand" class="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300">
                  <!-- dynamically populated -->
                </select>
              </div>
            ` : ''}
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Birthday</label>
              <input type="date" id="prof-birthday" class="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300" value="${currentUser.birthday || ''}">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Contact Number</label>
              <input type="text" id="prof-contact" class="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="09XXXXXXXXX" value="${currentUser.contactInfo || ''}">
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Address</label>
            <input type="text" id="prof-address" class="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="City, Province" value="${currentUser.address || ''}">
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Short Biography</label>
            <textarea id="prof-bio" class="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300 h-24" placeholder="Tell others about your study habits and academic goals...">${currentUser.bio || ''}</textarea>
          </div>

          <div class="border-t pt-4">
            <label class="block text-xs font-bold text-slate-700 mb-1.5 uppercase">Email</label>
            <input type="text" class="w-full border rounded-lg px-3 py-2 text-xs bg-slate-50 text-slate-400 cursor-not-allowed" value="${currentUser.email}" disabled>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => {
      const datalist = document.getElementById('prof-school-datalist');
      if (datalist) {
        const schools = [...new Set(
          (db.getUsers() || [])
            .map(u => u.schoolName || u.program || '')
            .filter(s => s && s !== 'PeerLink Administration' && s !== 'ADMIN')
        )];
        datalist.innerHTML = schools.map(s => `<option value="${s}">`).join('');
      }
      if (currentUser.educationLevel === 'SHS') {
        updateProfileStrandOptions(currentUser.strand);
      }
    }, 0);
  }

  window.selectProfileAvatar = function(avatar) {
    document.getElementById('prof-avatar').value = avatar;
    const preview = document.getElementById('profile-avatar-preview');
    if (preview) {
      preview.innerHTML = avatar; // emoji
    }
  };

  window.handleAvatarFileSelect = function(event) {
    const file = event.target.files[0];
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showToast('Invalid file type. Please use JPG, PNG, or WebP.', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image is too large. Maximum size is 5MB.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
      const base64 = e.target.result;
      // Show preview immediately
      const preview = document.getElementById('profile-avatar-preview');
      if (preview) {
        preview.innerHTML = `<img src="${base64}" class="w-full h-full object-cover" alt="preview" />`;
      }
      document.getElementById('prof-avatar').value = base64;
      showToast('Photo selected! Click Save Changes to apply. 📷', 'info');
    };
    reader.readAsDataURL(file);
  };

  window.saveUserProfile = async function() {
    const users = db.getUsers();
    const index = users.findIndex(u => u.id === currentUser.id);
    if (index !== -1) {
      currentUser.name        = (document.getElementById('prof-name')?.value || currentUser.name).trim();
      currentUser.schoolName  = (document.getElementById('prof-school-name')?.value || currentUser.schoolName || '').trim();
      currentUser.gradeLevel  = document.getElementById('prof-grade-level')?.value || currentUser.gradeLevel || '';
      currentUser.section     = (document.getElementById('prof-section')?.value || currentUser.section || '').trim();
      currentUser.track       = document.getElementById('prof-track')?.value || currentUser.track || null;
      currentUser.strand      = document.getElementById('prof-strand')?.value || currentUser.strand || null;

      // Legacy compatibility mapping
      currentUser.program     = currentUser.schoolName;
      currentUser.yearSection = currentUser.gradeLevel;

      currentUser.bio         = (document.getElementById('prof-bio')?.value || '').trim();
      currentUser.birthday    = document.getElementById('prof-birthday')?.value || currentUser.birthday || '';
      currentUser.address     = (document.getElementById('prof-address')?.value || '').trim();
      currentUser.contactInfo = (document.getElementById('prof-contact')?.value || '').trim();
      const newAvatar = document.getElementById('prof-avatar')?.value || currentUser.avatar;
      const isPhotoUpload = newAvatar && newAvatar.startsWith('data:image');

      showToast('Saving profile... ⏳', 'info');

      // If a photo was selected, upload it separately via dedicated endpoint
      if (isPhotoUpload && newAvatar !== currentUser.avatar) {
        try {
          const res = await db.uploadAvatar(currentUser.id, newAvatar);
          if (res && res.success) {
            currentUser.avatar = newAvatar;
          } else {
            showToast(res.message || 'Failed to upload photo.', 'error');
            return;
          }
        } catch(e) {
          showToast('Failed to upload photo. Try a smaller image.', 'error');
          return;
        }
      } else {
        currentUser.avatar = newAvatar;
      }

      users[index] = { ...users[index], ...currentUser };
      await db.saveUsers(users);

      const freshUser = db.getUsers().find(u => u.id === currentUser.id);
      if (freshUser) currentUser = freshUser;

      // Update sidebar avatar
      const sideAvatar = document.getElementById('side-avatar');
      if (sideAvatar) {
        if (currentUser.avatar && currentUser.avatar.startsWith('data:image')) {
          sideAvatar.innerHTML = `<img src="${currentUser.avatar}" class="w-10 h-10 object-cover rounded-full" alt="avatar" />`;
        } else {
          sideAvatar.innerHTML = currentUser.avatar || '👤';
        }
      }
      document.getElementById('side-username').textContent  = currentUser.name;
      document.getElementById('side-program').textContent   = `${currentUser.gradeLevel || currentUser.yearSection || ''} • ${currentUser.schoolName || currentUser.program || ''}`;
      
      db.addLog('user', `${currentUser.name} updated profile details.`);
      showToast('Profile updated successfully! ✨', 'success');
    }
  };

  function renderSkillsPane() {
    const skills = db.getSkills() || [];
    // Prefer modern fields (subjectsCanHelp / subjectsNeedHelp) with legacy fallback
    const userHave = (currentUser.subjectsCanHelp?.length ? currentUser.subjectsCanHelp : null)
                  || currentUser.skills?.have
                  || [];
    const userWant = (currentUser.subjectsNeedHelp?.length ? currentUser.subjectsNeedHelp : null)
                  || currentUser.skills?.want
                  || [];

    sysPanes.skills.innerHTML = `
      <div class="bg-white border rounded-2xl p-6 shadow-sm space-y-6">
        <div class="flex justify-between items-center border-b pb-4">
          <div>
            <h3 class="font-heading font-bold text-lg text-slate-900">Manage My Skills</h3>
            <p class="text-xs text-slate-500">Edit skills you can tutor, or topics you want learning assistance in.</p>
          </div>
          <button class="bg-brand-purple hover:bg-opacity-90 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm" onclick="saveUserSkills()">
            Save Skills
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 class="font-bold text-sm text-slate-700 mb-3 uppercase tracking-wider">Skills You Can Offer (Tutoring)</h4>
            <div class="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto p-3 border rounded-xl bg-slate-50" id="edit-have-skills-grid">
              ${skills.map(s => {
                const isSelected = userHave.includes(s);
                return `
                  <label class="flex items-center gap-2 border p-2.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${isSelected ? 'border-brand-purple bg-indigo-50/50 font-semibold text-brand-purple' : 'border-slate-200 bg-white hover:bg-slate-50'}" id="lbl-eh-${s.replace(/\s+/g, '')}">
                    <input type="checkbox" class="sr-only" value="${s}" ${isSelected ? 'checked' : ''} onchange="toggleRegTag(this, 'lbl-eh-${s.replace(/\s+/g, '')}')">
                    <span>${s}</span>
                  </label>
                `;
              }).join('')}
            </div>
          </div>
          <div>
            <h4 class="font-bold text-sm text-slate-700 mb-3 uppercase tracking-wider">Skills You Want to Learn</h4>
            <div class="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto p-3 border rounded-xl bg-slate-50" id="edit-want-skills-grid">
              ${skills.map(s => {
                const isSelected = userWant.includes(s);
                return `
                  <label class="flex items-center gap-2 border p-2.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${isSelected ? 'border-brand-purple bg-indigo-50/50 font-semibold text-brand-purple' : 'border-slate-200 bg-white hover:bg-slate-50'}" id="lbl-ew-${s.replace(/\s+/g, '')}">
                    <input type="checkbox" class="sr-only" value="${s}" ${isSelected ? 'checked' : ''} onchange="toggleRegTag(this, 'lbl-ew-${s.replace(/\s+/g, '')}')">
                    <span>${s}</span>
                  </label>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  window.saveUserSkills = async function() {
    const users = db.getUsers();
    const index = users.findIndex(u => u.id === currentUser.id);
    if (index !== -1) {
      const have = [];
      document.querySelectorAll("#edit-have-skills-grid input:checked").forEach(cb => have.push(cb.value));

      const want = [];
      document.querySelectorAll("#edit-want-skills-grid input:checked").forEach(cb => want.push(cb.value));

      currentUser.skills = { have, want };
      currentUser.subjectsCanHelp = have;
      currentUser.subjectsNeedHelp = want;
      currentUser.courses = want;

      users[index].skills = currentUser.skills;
      users[index].subjectsCanHelp = currentUser.subjectsCanHelp;
      users[index].subjectsNeedHelp = currentUser.subjectsNeedHelp;
      users[index].courses = currentUser.courses;

      showToast('Saving skills... ⏳', 'info');
      await db.saveUsers(users);

      const freshUser = db.getUsers().find(u => u.id === currentUser.id);
      if (freshUser) currentUser = freshUser;

      db.addLog("user", `${currentUser.name} updated matching skill metrics.`);
      showToast('Skills saved! Your matches will update. 🎯', 'success');
      showSystemView("dashboard");
    }
  };

  function renderNotificationsPane() {
    const conns = db.getConnections() || [];
    const users = db.getUsers() || [];
    
    // Incoming pending requests
    const incoming = conns.filter(c => c.receiverId === currentUser.id && c.status === 'pending');
    // Recent accepted connections
    const recentAccepted = conns.filter(c => 
      (c.senderId === currentUser.id || c.receiverId === currentUser.id) && c.status === 'accepted'
    ).slice(-3);

    const pendingHTML = incoming.length === 0 ? '' : incoming.map(c => {
      const sender = users.find(u => u.id === c.senderId);
      const onlineDot = sender && sender.isOnline 
        ? `<span class="w-2 h-2 rounded-full bg-emerald-400 inline-block mr-1"></span>`
        : `<span class="w-2 h-2 rounded-full bg-slate-300 inline-block mr-1"></span>`;
      return `
        <div class="py-3 flex justify-between items-center text-xs border-b border-slate-100">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-slate-100 border flex items-center justify-center text-xl overflow-hidden">${renderAvatar(sender?.avatar, 'text-xl', 'w-full h-full object-cover rounded-full')}</div>
            <div>
              <p class="text-slate-800 font-semibold">${sender?.name || 'Unknown'} sent you a study request ${onlineDot}</p>
              <p class="text-slate-400 text-[10px]">Partner request • pending your response</p>
            </div>
          </div>
          <div class="flex gap-2 ml-2 shrink-0">
            <button onclick="acceptConnect('${c.senderId}'); renderNotificationsPane();" class="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-3 py-1 rounded-lg text-[10px]">Accept</button>
            <button onclick="declineConnect('${c.senderId}')" class="bg-red-500 hover:bg-red-600 text-white font-bold px-3 py-1 rounded-lg text-[10px]">Decline</button>
          </div>
        </div>
      `;
    }).join('');

    const acceptedHTML = recentAccepted.map(c => {
      const partnerId = c.senderId === currentUser.id ? c.receiverId : c.senderId;
      const partner = users.find(u => u.id === partnerId);
      return `
        <div class="py-3 flex justify-between items-center text-xs border-b border-slate-100">
          <p class="text-slate-700">🤝 Study connection with <strong>${partner?.name || 'a partner'}</strong> is active. Start chatting!</p>
          <button onclick="selectActiveChat('${partnerId}'); showSystemView('messages')" class="text-brand-purple font-bold text-[10px] hover:underline">Chat</button>
        </div>
      `;
    }).join('');

    sysPanes.notifications.innerHTML = `
      <div class="space-y-6 max-w-2xl">
        ${incoming.length > 0 ? `
        <div class="bg-white border border-amber-200 rounded-2xl p-6 shadow-sm">
          <h3 class="font-heading font-bold text-slate-800 border-b pb-3 flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block animate-pulse"></span>
            Pending Partner Requests (${incoming.length})
          </h3>
          <div class="mt-2">${pendingHTML}</div>
        </div>` : ''}

        <div class="bg-white border rounded-2xl p-6 shadow-sm">
          <h3 class="font-heading font-bold text-slate-800 border-b pb-3">Activity Notifications</h3>
          <div class="divide-y divide-slate-100">
            ${acceptedHTML || ''}
            <div class="py-3 flex justify-between items-center text-xs">
              <p class="text-slate-700">👋 Welcome to PeerLink! Fill out your subject list and weekly schedule details to start matching.</p>
              <span class="text-slate-400 shrink-0 ml-4">Welcome</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderSettingsPane() {
    const isDark = document.documentElement.classList.contains("dark") || localStorage.getItem("peerlink_theme") === "dark";
    sysPanes.settings.innerHTML = `
      <div class="space-y-6 max-w-2xl">
        <div class="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
          <h3 class="font-heading font-bold text-slate-800 border-b pb-3">Theme & System Settings</h3>
          <div class="space-y-4 text-xs">
            <div class="flex justify-between items-center">
              <div>
                <h4 class="font-semibold text-slate-800">Dark Mode Interface</h4>
                <p class="text-slate-400 text-[10px] mt-0.5">Toggle dark/light theme dynamically across all views.</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer select-none">
                <input type="checkbox" id="set-darkmode-toggle" class="sr-only peer" ${isDark ? 'checked' : ''} onchange="toggleSettingsDarkmode(this)">
                <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-purple"></div>
              </label>
            </div>
            <div class="flex justify-between items-center border-t pt-4">
              <div>
                <h4 class="font-semibold text-slate-800">Email Notifications</h4>
                <p class="text-slate-400 text-[10px] mt-0.5">Receive copy of study requests in school mailbox.</p>
              </div>
              <input type="checkbox" class="w-4 h-4 text-brand-purple" checked>
            </div>
          </div>
        </div>

        <div class="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
          <h3 class="font-heading font-bold text-slate-800 border-b pb-3">Change Account Password</h3>
          <form onsubmit="changeUserPassword(event)" id="change-pw-form" class="space-y-3 text-xs">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Current Password</label>
              <input type="password" id="set-curr-pw" class="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none" placeholder="••••••••" required>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">New Password</label>
                <input type="password" id="set-new-pw" class="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none" placeholder="••••••••" required>
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Confirm New Password</label>
                <input type="password" id="set-new-pw-confirm" class="w-full border rounded-lg px-3 py-2 text-xs focus:outline-none" placeholder="••••••••" required>
              </div>
            </div>
            <button type="submit" class="bg-brand-purple hover:bg-opacity-90 text-white font-bold px-4 py-2 rounded-lg transition-all shadow-sm">
              Save New Password
            </button>
          </form>
        </div>

        <div class="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
          <h3 class="font-heading font-bold text-slate-800 border-b pb-3">About PeerLink</h3>
          <div class="text-xs text-slate-600 space-y-2">
            <p><strong>System Name:</strong> PeerLink (v1.0.0-Prototype)</p>
            <p><strong>Focus:</strong> Subject compatibility, skill sets, and study schedule matching for secondary schools.</p>
            <p><strong>Research Thesis Project:</strong> Pamantasan ng Lungsod ng Pasig (PLP)</p>
            <p><strong>Adviser:</strong> Noreen A. Perez, DIT</p>
            <p><strong>Development Team:</strong> Mark Vincent Palsimon, John Kris Rivera, Francis Carl Eguerra</p>
            <p><strong>Date of Development:</strong> June 2026</p>
          </div>
          <button onclick="logout()" class="w-full border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2.5 rounded-lg text-xs transition-all mt-4 animate-pulse">
            🚪 Logout of Current Account
          </button>
        </div>
      </div>
    `;
  }

  window.toggleSettingsDarkmode = function(checkbox) {
    if (checkbox.checked) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("peerlink_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("peerlink_theme", "light");
    }
  };

  window.changeUserPassword = async function(e) {
    e.preventDefault();
    const currEl = document.getElementById("set-curr-pw");
    const curr = currEl ? currEl.value : "";
    const np = document.getElementById("set-new-pw").value;
    const npc = document.getElementById("set-new-pw-confirm").value;

    if (np !== npc) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    if (np.length < 6) {
      showToast('New password must be at least 6 characters.', 'error');
      return;
    }

    try {
      await db.changePassword(currentUser.id, curr, np);
      db.addLog("user", `${currentUser.name} changed account password.`);
      showToast('Password changed successfully! 🔐', 'success');
      document.getElementById("change-pw-form").reset();
    } catch (err) {
      showToast(err.message || 'Failed to change password.', 'error');
    }
  };

  // Run initialization
  init();
});
