// ============================================================
// PEERLINK AI CHAT ASSISTANT — Compact Edition
// ============================================================

(function () {
  'use strict';

  let chatOpen = false;
  let initialized = false;
  const TYPING_DELAY_MS = 900;

  // ─── KNOWLEDGE BASE (SHORT ANSWERS) ──────────────────────
  const KNOWLEDGE_BASE = [
    {
      id: 'what-is',
      chip: '🔗 What is PeerLink?',
      keywords: ['what is', 'about', 'peerlink', 'system', 'explain', 'overview', 'platform'],
      answer: `<strong>PeerLink</strong> is a Smart Study Partner Finder for IT/CS students at <strong>PLP</strong>. It matches you with compatible peers based on courses, skills, and schedule using <em>Cosine Similarity</em>. 🎓`
    },
    {
      id: 'how-register',
      chip: '📝 How do I sign up?',
      keywords: ['sign up', 'register', 'create account', 'join', 'get started', 'new account'],
      answer: `Click <strong>"Get Started"</strong> on the landing page and complete the 3-step wizard:<br>
      1️⃣ Enter your name, Student ID & email<br>
      2️⃣ Pick your courses & skills<br>
      3️⃣ Set your weekly schedule<br>
      Done — you're matched! 🎉`
    },
    {
      id: 'how-matching',
      chip: '🎯 How does matching work?',
      keywords: ['match', 'matching', 'algorithm', 'recommend', 'compatible', 'cosine'],
      answer: `The system scores compatibility across 3 dimensions:<br>
      📚 <strong>Course Overlap</strong><br>
      💡 <strong>Skill Exchange</strong> (teach ↔ learn)<br>
      📅 <strong>Schedule Sync</strong><br>
      You get a <strong>0–100% score</strong> per match. You can adjust weights in the Matches tab!`
    },
    {
      id: 'what-courses',
      chip: '📚 Available courses?',
      keywords: ['course', 'subject', 'enrolled', 'syllabus', 'class', 'available course'],
      answer: `Covers common IT/CS subjects at PLP — Java, Python, Web Dev, Data Structures, OS, Databases, AI/ML, Capstone, and more. Select your enrolled courses during registration. 📖`
    },
    {
      id: 'schedule',
      chip: '📅 Can I set my schedule?',
      keywords: ['schedule', 'availability', 'free time', 'time slot', 'calendar', 'available'],
      answer: `Yes! Go to the <strong>Schedule</strong> tab after login. Click or drag cells on the weekly grid to mark your free hours, then click <strong>"Save Schedule"</strong>. The system only matches you with students who share your free slots. ✅`
    },
    {
      id: 'connect-partner',
      chip: '🤝 How to connect?',
      keywords: ['connect', 'invite', 'partner', 'send request', 'study buddy', 'add', 'request'],
      answer: `Go to <strong>Matches</strong>, browse ranked partners, and click <strong>"Send Invite"</strong>. Once accepted, you can <strong>chat</strong> and <strong>schedule meetings</strong> together. 🔗`
    },
    {
      id: 'programs',
      chip: '🏫 Supported programs?',
      keywords: ['program', 'bsit', 'bscs', 'bscpe', 'degree', 'department', 'supported'],
      answer: `Supports all <strong>College of Computer Studies</strong> students at PLP:<br>
      🎓 BSIT &nbsp;🎓 BSCS &nbsp;🎓 BSCPE &nbsp;🎓 BSA`
    },
    {
      id: 'video-call',
      chip: '🎥 Video call?',
      keywords: ['video', 'call', 'meet', 'meeting', 'virtual', 'camera', 'online meeting'],
      answer: `Schedule a meeting in the <strong>Meetings</strong> tab, then click <strong>"Join Video Call"</strong>. Allow camera & mic access. Chat is built-in — no external app needed! 🚀`
    },
    {
      id: 'who-made',
      chip: '👨‍💻 Who made PeerLink?',
      keywords: ['who made', 'developer', 'team', 'created', 'built', 'capstone', 'thesis', 'author'],
      answer: `BSIT Capstone Project by:<br>
      👨‍💻 Mark Vincent Palsimon<br>
      👨‍💻 John Kris Rivera<br>
      👨‍💻 Francis Carl Eguerra<br>
      📌 Adviser: <strong>Noreen A. Perez, DIT</strong> — June 2026`
    },
    {
      id: 'is-free',
      chip: '💸 Is it free?',
      keywords: ['free', 'cost', 'price', 'pay', 'subscription', 'fee', 'charge', 'money'],
      answer: `<strong>Yes, completely free!</strong> 🎉 PeerLink is an academic prototype for PLP students. No fees, no subscriptions — just a valid Student ID to register.`
    }
  ];

  // ─── HELPERS ─────────────────────────────────────────────

  function scrollToBottom() {
    const el = document.getElementById('ai-chat-messages');
    if (el) el.scrollTop = el.scrollHeight;
  }

  function appendMessage(text, sender = 'bot', isHTML = false) {
    const container = document.getElementById('ai-chat-messages');
    if (!container) return;

    const wrapper = document.createElement('div');
    wrapper.className = sender === 'user' ? 'flex justify-end' : 'flex justify-start items-end gap-1.5';

    if (sender === 'bot') {
      const avatar = document.createElement('div');
      avatar.className = 'w-6 h-6 rounded-lg bg-gradient-to-br from-brand-purple to-indigo-600 flex items-center justify-center text-white text-[10px] shrink-0 mb-0.5';
      avatar.textContent = '🤖';
      wrapper.appendChild(avatar);
    }

    const bubble = document.createElement('div');
    bubble.className = sender === 'user'
      ? 'bg-brand-purple text-white rounded-2xl rounded-tr-sm px-3 py-2 text-xs max-w-[82%] leading-relaxed shadow-sm'
      : 'bg-white border border-slate-200 text-slate-800 rounded-2xl rounded-tl-sm px-3 py-2 text-xs max-w-[82%] leading-relaxed shadow-sm';

    if (isHTML) bubble.innerHTML = text;
    else bubble.textContent = text;

    wrapper.appendChild(bubble);
    container.appendChild(wrapper);
    scrollToBottom();
  }

  function showTypingIndicator() {
    const container = document.getElementById('ai-chat-messages');
    if (!container) return;
    const wrapper = document.createElement('div');
    wrapper.id = 'ai-typing-indicator';
    wrapper.className = 'flex justify-start items-end gap-1.5';
    wrapper.innerHTML = `
      <div class="w-6 h-6 rounded-lg bg-gradient-to-br from-brand-purple to-indigo-600 flex items-center justify-center text-[10px] shrink-0">🤖</div>
      <div class="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-3 py-2.5 shadow-sm flex items-center gap-1">
        <span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style="animation-delay:0ms"></span>
        <span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style="animation-delay:150ms"></span>
        <span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style="animation-delay:300ms"></span>
      </div>`;
    container.appendChild(wrapper);
    scrollToBottom();
  }

  function removeTypingIndicator() {
    const el = document.getElementById('ai-typing-indicator');
    if (el) el.remove();
  }

  function findMatch(input) {
    const normalized = input.toLowerCase().trim();
    let bestMatch = null;
    let bestScore = 0;
    for (const entry of KNOWLEDGE_BASE) {
      let score = 0;
      for (const kw of entry.keywords) {
        if (normalized.includes(kw)) score += kw.split(' ').length;
      }
      if (score > bestScore) { bestScore = score; bestMatch = entry; }
    }
    return bestScore > 0 ? bestMatch : null;
  }

  function renderChips() {
    const container = document.getElementById('ai-chips-container');
    if (!container) return;
    container.innerHTML = '';
    KNOWLEDGE_BASE.forEach(entry => {
      const chip = document.createElement('button');
      chip.className = 'text-[10px] font-medium bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-indigo-700 rounded-full px-2.5 py-1 transition-all whitespace-nowrap shrink-0';
      chip.textContent = entry.chip;
      chip.onclick = () => {
        const input = document.getElementById('ai-chat-input');
        if (input) { input.value = entry.chip.replace(/^\S+\s/, ''); }
        sendAIMessage();
      };
      container.appendChild(chip);
    });
  }

  function handleUserMessage(text) {
    if (!text.trim()) return;
    appendMessage(text, 'user');
    showTypingIndicator();
    setTimeout(() => {
      removeTypingIndicator();
      const match = findMatch(text);
      if (match) {
        appendMessage(match.answer, 'bot', true);
      } else {
        appendMessage(
          `I don't have an answer for that yet. 😔<br>Please <strong>wait for an Admin</strong> to assist you, or try one of the quick questions below! 💡`,
          'bot', true
        );
      }
      scrollToBottom();
    }, TYPING_DELAY_MS);
  }

  function initChat() {
    if (initialized) return;
    initialized = true;
    renderChips();
    appendMessage(
      `👋 Hi! I'm the <strong>PeerLink Assistant</strong>. Ask me anything about PeerLink, or tap a quick question below! 😊`,
      'bot', true
    );
  }

  // ─── PUBLIC API ──────────────────────────────────────────

  window.toggleAIChat = function () {
    const panel = document.getElementById('ai-chat-panel');
    const icon  = document.getElementById('ai-chat-toggle-icon');
    chatOpen = !chatOpen;
    if (chatOpen) {
      panel.classList.remove('scale-95', 'opacity-0', 'pointer-events-none');
      panel.classList.add('scale-100', 'opacity-100');
      icon.textContent = '✕';
      initChat();
      setTimeout(() => { document.getElementById('ai-chat-input')?.focus(); scrollToBottom(); }, 300);
    } else {
      panel.classList.remove('scale-100', 'opacity-100');
      panel.classList.add('scale-95', 'opacity-0', 'pointer-events-none');
      icon.textContent = '💬';
    }
  };

  window.sendAIMessage = function () {
    const input = document.getElementById('ai-chat-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    handleUserMessage(text);
  };

})();
