# PeerLink Capstone Project Walkthrough & Upgrades

We have successfully updated the **PeerLink** system prototype to align with your latest capstone thesis details, resolved all system issues, and upgraded the user experience.

---

## Key Accomplishments & Fixes

### 1. 🤝 Friends/Partners & Pending Requests Sections
- **Interactive Tabs on Matches View**: We added four distinct filter tabs on the Matches pane:
  1. **Recommended for You**: Content-based matching (Cosine Similarity Engine).
  2. **All Students**: Full listing of registered students.
  3. **My Partners / Friends**: Real-time list of all accepted friends/partners.
  4. **Pending Requests**: Displays both incoming and outgoing partner requests with options to **Accept** or **Decline/Cancel** directly from the table.
- **Dynamic Disconnect / Cancel Button**: Users can remove study connections or cancel pending requests at any time.

### 2. 🔔 Real-Time Partner Request Notifications
- **Live Notifications Badge**: A bright red, round notification badge displays on the sidebar next to **Notifications** tab as soon as any student receives a new study request.
- **Instant Toast Notification**: A toast notification alert (`🔔 You have 1 new partner request!`) fires immediately when another student sends a study request.
- **Online/Offline Status Badges**: Integrated green (online) and gray (offline) status indicators in matches list, notifications list, and admin panels.

### 3. 🛡️ Dashboard & User Visibility Filters
- **Hidden Admin Account**: Regular students will **never** see the Admin profile in search lists, matches tables, or dashboards.
- **Hidden Own Profile**: Users will not see their own profile in recommendations or match results.
- **Hidden Banned Profiles**: Banned users are immediately filtered out of matches, dashboard, and messaging options.

### 4. 🌙 High-Contrast Dark Mode Enhancements
- **No-Contrast Elements Resolved**: Recoded Tailwind CSS and base styles so inputs, textareas, headers, cards, and labels have premium contrast.
- **Glowing Semi-Transparent Badges**: Replaced blindingly bright light-colored backgrounds (like `bg-indigo-50`, `bg-emerald-50`, `bg-red-50`) with glowing translucent dark colors in Dark Mode to match premium SaaS aesthetics.
- **Immediate Theme Application**: The dark mode preference is read from local storage and applied **instantly on page load** to prevent white flashes.

### 5. 🔄 Perfect Session Persistence
- **State Restoration**: Fixed a startup routing bug where the app initialized to the landing page on page refresh. Now, the app checks for `peerlink_session_user` and directly restores the user's last active pane (e.g. `profile`, `matches`, `settings`) seamlessly without first rendering the dashboard.
- **Automatic Execution**: Connected the `init()` procedure to the DOMContentLoaded lifecycle so that it triggers automatically.

### 6. 🚀 Smooth Scroll Landing Navigation
- **Scrolling Behavior**: Refactored `scrollToSection` to check if the public container is active. If yes, it scrolls smoothly to target elements (Features, How It Works, About) immediately without scrolling to the top first, guaranteeing a premium scrolling experience.

---

## Local Verification Steps

1. **Start XAMPP / Node server**: Make sure node backend is running on `http://localhost:3000`.
2. **Reload application**: Open the desktop file [index.html](file:///C:/Users/PLPASIG/OneDrive/Desktop/PeerLink%20System%20Cupstone/index.html).
3. **Session Test**: Log in, navigate to **My Profile**, and hit refresh (`F5`). Observe that you remain logged in and stay on the **My Profile** tab.
4. **Smooth Scroll**: Logout, click on the **Features** link in the landing header, and check the smooth direct transition.
5. **Dark Mode Test**: Go to **Settings**, toggle **Dark Mode**, and check contrast on text areas, buttons, and alert highlights.

---

### 7. 📞 Voice Call & Video Call – Full Real-Time Connection

**Problem**: Calls were one-sided — User A would enter the call overlay, but User B received zero notification and was never connected.

**Root Causes Fixed**:
- `window.closeCallOverlay` was called in `pollUpdates` but was **never defined**, causing a silent crash.
- There was no mechanism to detect or notify User B of an incoming call.
- `endVideoCall` did not delete the meeting record, so User B had no way to know the call ended.

**What Changed** (`app.js`):

| Area | Fix |
|---|---|
| `window.closeCallOverlay` | Defined as a proper function (streams/timers stopped, overlay removed, `inCallMeeting = null`) |
| `window.endVideoCall` | Now **async** — deletes the meeting record from the DB so the caller's `pollUpdates` detects the call ended |
| `pollUpdates` | Added **incoming call detection**: finds meetings where `guest_id === currentUser.id` created within the last 45 seconds |
| `showIncomingCallNotification` | New function — renders a full-screen incoming call modal with caller name, avatar, call type icon, **Accept** / **Decline** buttons, and plays the notification sound |
| `window.acceptCall` | Clears the auto-decline timer and calls `joinVideoCall(meetingId)` |
| `window.declineCall` | Deletes the meeting from the DB (caller sees "Call declined" toast) and dismisses the overlay |

**How It Works End-to-End**:
1. **User A** clicks Voice or Video call → meeting saved to DB → User A enters call overlay.
2. **User B's** `pollUpdates` (runs every 2s) detects the new meeting → `showIncomingCallNotification` fires immediately with Accept/Decline.
3. **User B accepts** → `joinVideoCall` → both are now in their respective overlays, sharing the same call room.
4. **User A ends the call** → meeting deleted from DB → User B's `pollUpdates` detects meeting is gone → overlay auto-closes with toast.

---

### 8. 💬 Private In-Call Chat – Real DB, No AI Replies

**Problem**: The in-call chat sidebar was entirely fake — it injected hardcoded mock messages and generated AI auto-replies.

**What Changed**:
- `sendCallMessage` is now **async** and saves messages to the real PostgreSQL chat room (same `roomId` used by the regular Messages pane).
- `pollUpdates` now syncs the `#call-chat-history` panel every 2 seconds using `db.getChatRoom()` — so messages from the partner appear in real time without any page reload.
- **All AI/bot auto-replies completely removed** — no `setTimeout` fake replies anywhere.
- The initial static mock bubble ("Can you explain this part again?") replaced with a clean system notice.

---

### 9. 🌐 Real-Time WebRTC Two-Way Audio/Video Communication

**Problem**: While the call screen opened and connected on both sides, there was no actual audio or video transmission (one-way or no-way).

**What Changed**:
- **Express Server Signaling**: Added `POST /api/meetings/:id/signal` and `GET /api/meetings/:id/signal` to exchange SDP descriptions (offers/answers) and ICE Candidates.
- **RTCPeerConnection Lifecycle**:
  - Automatically initializes on call connection with Google's public STUN servers.
  - Automatically binds local media tracks from `getUserMedia` to the peer connection.
  - Dynamically binds incoming remote audio/video tracks to the caller overlay's `#remote-video-feed` (for video calls) or a hidden `<audio id="remote-audio-feed">` element (for voice calls).
- **Active Signal Polling**: Established a `1.5s` polling loop to retrieve and apply incoming SDP offers, answers, and ICE candidates.
- **Cleanup**: The `closeCallOverlay` function correctly shuts down the peer connection and remote streams to prevent memory leaks and keep cameras/mics from staying active.

---

### 10. 📅 Scheduled Meetings & Real-Time Collaboration Upgrades

**Problems**: 
1. Entering/selecting items on the scheduler form caused input fields to reset and lose focus every 2 seconds.
2. Scheduled meetings only persisted to the local storage of the creator, meaning invited guests never received them.
3. Joining scheduled sessions did not trigger audio/video WebRTC feeds properly due to strict `'voice'` string checks.

**What Changed**:
- **Dynamic Render Protection**: Refactored `renderMeetingsPane()` to only overwrite the `#upcoming-meetings-list` container if the form is already present. This preserves user text, selects, date/time inputs, and cursor focus perfectly while typing.
- **Server Persistence**: Linked the scheduler form to `db.createMeeting()`, saving sessions directly to the PostgreSQL database so they sync globally.
- **Targeted Guest Notifications**: Integrated `showMeetingInvitationNotification()` to detect new scheduled invitations. Invited guests instantly receive a floating notification card with a direct **"Join Meeting"** button and details (host name, topic, date, start/end time, notes).
- **Standardized Meeting Layouts**: Standardized checks to ensure that both `Audio Call`/`Video Call` (scheduled types) and `voice`/`video` (instant types) load the corresponding WebRTC media streams, cameras, microphones, chat sidebar, and screen-sharing controls.

---

### 11. 🎛️ Host Controls & Meeting Panel Enhancements

**Problems**:
1. The call overlay Options pane had no host-specific tools — no participant list, no removal button, no "End for Everyone".
2. `endVideoCall` always redirected to `dashboard`, even after scheduled sessions.
3. Public meeting discovery showed sessions users were already approved/participating in.
4. Join request approval/rejection had no error handling.

**What Changed**:

| Area | Fix |
|---|---|
| Options Pane (`call-pane-options`) | Added host-only **Participants** section with live-rendered list and per-user **Remove** button |
| Options Pane | Added host-only **⛔ End for Everyone** button inside Options tab |
| Footer bar | Added host-only **⛔ End All** button; renamed Leave button from "End Call" to "Leave" for guests |
| `endVideoCall` | Now checks if call was instant (`voice`/`video`) → redirects to `dashboard`. Scheduled calls redirect to `meetings` pane |
| `publicMeetings` filter | Now excludes sessions where the current user is already in `approved_participants` |
| `handleApproveRequest` | Wrapped in try/catch; shows success/failure toast; removed manual cache sync (handled by `pollUpdates` loop) |
| `kickParticipant` | Wrapped in try/catch; `targetUserId` is cast to `String` to avoid type mismatch in signal listener |
| `endVideoCallForEveryone` | Wrapped in try/catch; sends `kick_all` signal then calls `endVideoCall` |
| Signal handler | Detects `kick` (with `targetUserId` match) and `kick_all` signals; closes overlay and shows toast for removed users |
| Host participant list | Polled every 1.5s inside `initiateWebRTCConnection`; renders live Remove buttons from `approved_participants` |
| Join request banner | Polled every 1.5s; shows first pending request with Accept/Reject at top of overlay |

**End-to-End Flow**:
1. **Host** schedules a public meeting → invited guest gets an invitation notification card.
2. **Non-invited user** sees the session under **Public Study Groups** → clicks **Request to Join** → waiting lobby spins.
3. **Host** sees the join request banner at the top of their active call overlay → clicks **Accept** or **Reject**.
4. **Accepted** guest is automatically entered into the call; their waiting modal disappears.
5. **Host** can open the **More Options** tab → view connected participants → click **Remove** on any user → that user is kicked with a toast notification.
6. **Host** can click **⛔ End All** or **⛔ End for Everyone** → all participants receive a `kick_all` signal and their overlays close.
7. After a scheduled meeting, both host and guest return to the **Meetings** pane (not Dashboard).

---

### 12. 📧 Email OTP (Registration & Forgot Password) — Now Working

**Problem**: Server rejected Gmail App Password authentication (`535-5.7.8 Username and Password not accepted`).

**Root Cause**: App Password was stored with spaces (`ksir dbel skpv fdag`). Gmail requires it without spaces. Also, `.env` had no `EMAIL_USER`/`EMAIL_PASS` entries.

**Fixes**:
| File | Change |
|---|---|
| `.env` | Added `EMAIL_USER=vincentpalsi02@gmail.com` and `EMAIL_PASS=ksirdbelskpvfdag` |
| `server.js` | Fixed hardcoded fallback from `'ksir dbel skpv fdag'` → `'ksirdbelskpvfdag'` |

**Verified**: SMTP `verify()` passes. Test forgot-password email sent successfully to `palsimon_markvincent@plpasig.edu.ph`. Server log: `Email successfully sent`.

---

### 13. 🔔 Meeting Notifications — Host Always Notified at Start Time

**Problem**: `checkScheduleNotifications` blocked host notifications when the guest hadn't accepted yet (status ≠ 'accepted').

**Fix** (`app.js`): Separated host logic — hosts always receive start-time notifications regardless of guest acceptance. Guests still require `status = 'accepted'`.

---

### 14. 🚪 Meeting Capacity — Invited Guest Bypass

**Problem**: Directly invited guests (`guest_id` match + `status = 'accepted'`) could be incorrectly blocked by capacity check or `isApproved` check.

- **Fix** (`app.js` → `joinVideoCall`): Added `isInvitedGuest` flag that bypasses both the approved-participants check and the capacity check for privately invited meeting guests.

---

### 15. 🏫 JHS/SHS Platform Transition & Migration Upgrades

**Problem**: The PeerLink system prototype was originally built with college-specific fields (`student_id`, `program` as degree, `yearSection` as course year, `courses` and `skills` as IT-specific strings). To adapt to Junior High School (JHS) and Senior High School (SHS) students under DepEd K-12, the system needed a database migration, new metadata tables, updated validation rules, and completely updated UI layouts without breaking legacy compatibility.

**What Changed**:

#### 1. 🗄️ Database Schema & Migration (`db/migrate_jhs_shs.js`, `db/schema.sql`, `db/seed.sql`)
*   **Idempotent Migration**: Wrote and executed a 6-step database migration to:
    *   Rename legacy columns: `student_id` $\rightarrow$ `student_lrn`, `program` $\rightarrow$ `school_name`, `courses` $\rightarrow$ `subjects_need_help`, `skills` $\rightarrow$ `subjects_can_help`, `schedule` $\rightarrow$ `study_schedule`.
    *   Alter `school_name` column size to `VARCHAR(255)` (previously `VARCHAR(20)` from `program` column) to support long high school names like `"Pasig City Science High School"`.
    *   Add JHS/SHS segment fields: `education_level` (`JHS`/`SHS`), `grade_level` (`Grade 7-12`), `section`, `track`, and `strand` (with check constraints).
    *   Create `subjects` metadata table.
    *   Seed 26 default DepEd secondary education subjects categorized by JHS and SHS levels.
    *   Add index on JHS/SHS columns to optimize searching and matching queries.

#### 2. 📝 JHS/SHS Registration Form (`index.html`)
*   Replaced Panel 1 of the registration wizard with secondary school inputs:
    *   **Education Level Toggle**: High-contrast buttons to select Junior High School (JHS) or Senior High School (SHS).
    *   **Student LRN Input**: Standardized input requiring exactly 12 numeric digits.
    *   **School Name Input**: Autocomplete input backed by existing schools in the system database.
    *   **Grade Level Dropdown**: Dynamically shows JHS grades (Grade 7–10) or SHS grades (Grade 11–12) based on the chosen education level.
    *   **Section Input**: Text field for class section.
    *   **Track & Strand Dropdowns**: Shown and required **only** for SHS students (Academic, TVL, Sports, Arts & Design tracks with corresponding strands like STEM, ABM, HUMSS, ICT, HE, etc.).

#### 3. 🔐 Backend Authentication & API Layer (`server.js`)
*   **Registration Validation**: Added strict validation for 12-digit LRN, duplicate checking, and SHS track/strand requirements before sending email OTP.
*   **OTP Verification & Database Insertion**: Stores registration data temporarily in the `otp_store` table and inserts complete JHS/SHS records on successful OTP verification.
*   **Segmented Subjects Query**: Added `/api/subjects` endpoint to retrieve subjects with optional level filtering (`?level=JHS` or `?level=SHS`).
*   **Legacy Mapping (`mapUser`)**: Keeps legacy aliases (`studentId`, `program`, `yearSection`, `courses`, `skills`, `schedule`) mapped to the new columns in the user response so existing front-end components never break.
*   **Normalizing Skills**: Dynamically normalizes flat array `subjects_can_help` and `subjects_need_help` JSON columns to the legacy `{ have, want }` object format expected by the frontend's matching and skill-listing functions.

#### 4. 📂 Client-Side Interface & UI Refactoring (`app.js`, `api.js`)
*   **Profile Editing**: Replaced college program/year edits with inputs for School Name (with database autocompletion), Grade Level select, Section input, and Track/Strand selects (only active for SHS).
*   **UI Dashboard Updates**: Updated partner cards, matching list tables, call screens, active chat titles, online status subtitled headers, and the Admin user directory to display clean grade, section, and school name details.
*   **Recommendation Segmentation**: Enforced same-level education level segmentation (JHS matches only with JHS, SHS only with SHS) inside the recommendation query engine.
*   **Admin Dashboard Stats**: Computed and rendered JHS and SHS student registration count badges inside the Admin analytics view.

---

### 16. 🧪 Automated Integration Verification

We created and successfully executed a local integration test script (`test_jhs_shs.js`) verifying all aspects of the JHS/SHS transition:
1.  **Stats Endpoint Verification**: Checks initially returned counts.
2.  **LRN & Track Validation**: Rejects invalid student registration formats.
3.  **OTP Verification & Database Storage**: Successfully saved JHS student Rizal High School and SHS student Pasig City Science High School (proving type size fix!).
4.  **Admin Stats Increment**: Verified JHS and SHS stats increased.
5.  **Test Result**: `✅ INTEGRATION TEST PASSED SUCCESSFULLY!`

---

### 17. 📞 Direct Call Connection & Duplicate Notification Overlay Fixes

**Problems**:
1. When initiating a direct call from the Messages panel, double event bindings (`click` + `touchend`) on the call buttons caused the caller to create two separate meeting sessions in rapid succession.
2. The guest joined one session while the host was in the other, preventing a WebRTC connection.
3. The guest received multiple incoming call notifications (one for each session created).
4. The guest accepting the call did not update the meeting status on the server, keeping it in `pending` status, which caused subsequent page polls to trigger the incoming call notification overlay again.

**Fixes Applied**:
*   **Removed Redundant Touch Listeners**: Cleaned up the `touchend` event handlers from chat buttons (send, upload, voice, video, schedule, back) in `renderMessagesPane()`. This stops duplicate event dispatching on iOS Safari and other touch environments.
*   **Debounced Call Initiation**: Added a 3-second `window.isInitiatingCall` debounce guard on `startVoiceCall` and `startVideoCall` to block accidental double-clicks or double-taps from creating duplicate meetings.
*   **Meeting Status Acceptance Sync**: Updated the guest's `acceptCall` function to call `db.acceptInvitation()` on the server *before* entering `joinVideoCall`. This updates the meeting status to `accepted` and registers the guest in `approved_participants` in the PostgreSQL database.
*   **Pending Calls Only filtering**: Added a status filter check (`m.status === 'pending'`) in `pollUpdates()` when searching for incoming voice/video calls. This prevents already accepted call sessions from triggering the overlay again.
