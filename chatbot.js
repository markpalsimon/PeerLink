// ============================================================
// PEERLINK AI CHAT ASSISTANT — JHS/SHS Edition
// ============================================================

(function () {
  'use strict';

  let chatOpen = false;
  let initialized = false;
  const TYPING_DELAY_MS = 900;

  // ─── KNOWLEDGE BASE (JHS/SHS ANSWERS) ──────────────────────
  const KNOWLEDGE_BASE = [
    {
      id: 'what-is',
      chip: '🔗 What is PeerLink?',
      keywords: ['what is', 'about', 'peerlink', 'system', 'explain', 'overview', 'platform'],
      answer: `<strong>PeerLink</strong> is an AI-Based Student Collaboration System for Secondary Education. It matches Junior High School (JHS) and Senior High School (SHS) students with study partners based on shared subjects, study schedules, and skills/interests using a <em>Cosine Similarity</em> recommendation engine. 🏫`
    },
    {
      id: 'how-register',
      chip: '📝 How do I sign up?',
      keywords: ['sign up', 'register', 'create account', 'join', 'get started', 'new account'],
      answer: `Click <strong>"Sign Up"</strong> on the top right and complete the onboarding wizard:<br>
      1️⃣ Enter your Name, 12-digit LRN, School Name, and Grade Level (Grade 7–12)<br>
      2️⃣ Select the subjects you need help with and subjects you can teach/help others with<br>
      3️⃣ Mark your free hours on the weekly study schedule grid<br>
      Done — the system will immediately rank your matching peers! 🎉`
    },
    {
      id: 'how-matching',
      chip: '🎯 How does matching work?',
      keywords: ['match', 'matching', 'algorithm', 'recommend', 'compatible', 'cosine'],
      answer: `The matching engine calculates compatibility scores across 3 primary areas:<br>
      📖 <strong>Subject Overlap</strong> (common subjects)<br>
      💡 <strong>Reciprocal Help</strong> (matching what you want to learn with what others can teach)<br>
      📅 <strong>Schedule Sync</strong> (overlapping free study hours)<br>
      You will see a <strong>0–100% match score</strong> next to each student. You can adjust matching weights in the Matches tab!`
    },
    {
      id: 'what-courses',
      chip: '📚 Available subjects?',
      keywords: ['course', 'subject', 'enrolled', 'syllabus', 'class', 'available subjects'],
      answer: `Covers DepEd secondary education subjects, including Core, Applied, and Specialized subjects like Mathematics, Science, Basic Calculus, General Physics, Creative Writing, Oral Communication, Araling Panlipunan, and MAPEH. 📖`
    },
    {
      id: 'schedule',
      chip: '📅 Can I set my schedule?',
      keywords: ['schedule', 'availability', 'free time', 'time slot', 'calendar', 'available'],
      answer: `Yes! Go to your profile or the **Schedule** tab after logging in. Click or drag slots on the weekly grid to show when you're free, then click **"Save"**. You will only be matched with study partners who share your free hours. ✅`
    },
    {
      id: 'connect-partner',
      chip: '🤝 How to connect?',
      keywords: ['connect', 'invite', 'partner', 'send request', 'study buddy', 'add', 'request'],
      answer: `Go to your **Matches** tab, select a study partner, and click **"Send Invite"**. Once they accept your invitation, you can chat, schedule virtual meetings, and call each other. 🔗`
    },
    {
      id: 'programs',
      chip: '🏫 Strands & Tracks?',
      keywords: ['program', 'track', 'strand', 'stem', 'abm', 'humss', 'tvl', 'arts', 'sports'],
      answer: `PeerLink supports all DepEd high school tracks:<br>
      🎓 **Academic Track** (STEM, ABM, HUMSS, GAS)<br>
      🎓 **Technical-Vocational-Livelihood (TVL)**<br>
      🎓 **Arts and Design**<br>
      🎓 **Sports**<br>
      JHS matches with JHS, and SHS matches with SHS to keep collaboration peer-focused.`
    },
    {
      id: 'video-call',
      chip: '🎥 Video call?',
      keywords: ['video', 'call', 'meet', 'meeting', 'virtual', 'camera', 'online meeting'],
      answer: `Yes! Schedule a study session in the **Meetings** tab, then click **"Join Video Call"** at the set time. You can video call and text chat in real-time right inside the app! 🚀`
    },
    {
      id: 'who-made',
      chip: '👨‍💻 System Developers?',
      keywords: ['who made', 'developer', 'team', 'created', 'built', 'thesis', 'author'],
      answer: `PeerLink was designed and developed as a research thesis project by:<br>
      👨‍💻 Mark Vincent Palsimon<br>
      👨‍💻 John Kris Rivera<br>
      👨‍💻 Francis Carl Eguerra<br>
      📌 Adviser: <strong>Noreen A. Perez, DIT</strong> — June 2026`
    },
    {
      id: 'is-free',
      chip: '💸 Is it free?',
      keywords: ['free', 'cost', 'price', 'pay', 'subscription', 'fee', 'charge', 'money'],
      answer: `<strong>Yes, completely free!</strong> 🎉 PeerLink is a student collaboration tool. No fees or subscriptions required — just sign up using your 12-digit Learner Reference Number (LRN).`
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

  // Exports
  window.toggleAIChat = function () {
    const panel = document.getElementById('ai-chat-panel');
    const icon  = document.getElementById('ai-chat-toggle-icon');
    chatOpen = !chatOpen;
    if (chatOpen) {
      panel.classList.remove('scale-95', 'opacity-0', 'pointer-events-none');
      panel.classList.add('scale-100', 'opacity-100');
      icon.textContent = '✕';
      if (!initialized) {
        initialized = true;
        renderChips();
        appendMessage(
          `👋 Hi! I'm the <strong>PeerLink Assistant</strong>. Ask me anything about PeerLink, or tap a quick question below! 😊`,
          'bot', true
        );
      }
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
