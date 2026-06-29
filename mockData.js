// PeerLink Mock Data & LocalStorage Database Initializer

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

// 12-hour schedule slots: 8:00 AM (8) to 7:00 PM (19)
// Days: Monday (1) to Saturday (6)
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
    // Schedule format: { Day: [available hours as integers] }
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

// Default admin notifications & stats
const INITIAL_LOGS = [
  { time: "2026-06-26 14:02", type: "system", message: "Matching engine weights recalculated successfully." },
  { time: "2026-06-26 14:15", type: "user", message: "New user Althea Joy Santos registered." },
  { time: "2026-06-26 14:22", type: "connection", message: "Mark Vincent Palsimon sent a study request to John Kris Rivera." },
  { time: "2026-06-26 14:30", type: "connection", message: "John Kris Rivera accepted study request from Mark Vincent Palsimon." }
];

// Initialize DB if not present
function initializeDatabase() {
  if (!localStorage.getItem("peerlink_initialized")) {
    localStorage.setItem("peerlink_courses", JSON.stringify(DEFAULT_COURSES));
    localStorage.setItem("peerlink_skills", JSON.stringify(DEFAULT_SKILLS));
    localStorage.setItem("peerlink_users", JSON.stringify(DEFAULT_USERS));
    localStorage.setItem("peerlink_logs", JSON.stringify(INITIAL_LOGS));
    localStorage.setItem("peerlink_connections", JSON.stringify([
      { senderId: "student_1", receiverId: "student_2", status: "accepted", timestamp: Date.now() - 3600000 },
      { senderId: "student_3", receiverId: "student_1", status: "pending", timestamp: Date.now() - 1800000 }
    ]));
    // Save user chat messages
    localStorage.setItem("peerlink_chats", JSON.stringify([
      {
        roomId: "student_1_student_2",
        messages: [
          { senderId: "student_1", senderName: "Mark Vincent Palsimon", text: "Hey John! Our schedules overlap on Fridays after 2 PM. Want to review Mobile Computing and Cisco?", time: "14:24" },
          { senderId: "student_2", senderName: "John Kris Rivera", text: "Sure Vincent! I really need help on Cisco networking. I can help you with Android layouts.", time: "14:29" }
        ]
      }
    ]));
    localStorage.setItem("peerlink_initialized", "true");
    console.log("PeerLink mock database initialized successfully.");
  }
}

// Helper methods to interact with localStorage
const db = {
  getCourses: () => JSON.parse(localStorage.getItem("peerlink_courses")),
  getSkills: () => JSON.parse(localStorage.getItem("peerlink_skills")),
  getUsers: () => JSON.parse(localStorage.getItem("peerlink_users")),
  getLogs: () => JSON.parse(localStorage.getItem("peerlink_logs")),
  getConnections: () => JSON.parse(localStorage.getItem("peerlink_connections")),
  getChats: () => JSON.parse(localStorage.getItem("peerlink_chats")),

  saveUsers: (users) => localStorage.setItem("peerlink_users", JSON.stringify(users)),
  saveConnections: (conns) => localStorage.setItem("peerlink_connections", JSON.stringify(conns)),
  saveChats: (chats) => localStorage.setItem("peerlink_chats", JSON.stringify(chats)),
  addLog: (type, message) => {
    const logs = db.getLogs() || [];
    const now = new Date();
    const timeStr = now.getFullYear() + "-" + 
                    String(now.getMonth() + 1).padStart(2, '0') + "-" + 
                    String(now.getDate()).padStart(2, '0') + " " + 
                    String(now.getHours()).padStart(2, '0') + ":" + 
                    String(now.getMinutes()).padStart(2, '0');
    logs.unshift({ time: timeStr, type, message });
    localStorage.setItem("peerlink_logs", JSON.stringify(logs.slice(0, 100))); // keep last 100 logs
  }
};

// Auto run initialization on load
initializeDatabase();
