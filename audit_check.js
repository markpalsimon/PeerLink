const fs = require('fs');
const app = fs.readFileSync('app.js', 'utf8');
const api = fs.readFileSync('api.js', 'utf8');
const srv = fs.readFileSync('server.js', 'utf8');

const checks = [
  ['sendChatMessage is async and uses db.sendMessage',
    app.includes('window.sendChatMessage = async function') && app.includes('await db.sendMessage(roomId')],
  ['sendCallMessage is async and uses db.sendMessage',
    app.includes('window.sendCallMessage = async function') && app.includes('db.sendMessage(callRoomId')],
  ['startVoiceCall uses db.createMeeting (not saveMeetings)',
    app.includes('const savedMeet = await db.createMeeting') && !app.includes('meetings.push(newMeet)')],
  ['startVideoCall uses db.createMeeting',
    app.includes("meeting_type: 'video'") && app.includes('window.joinVideoCall(savedMeet.id)')],
  ['initiateWebRTCConnection function exists',
    app.includes('async function initiateWebRTCConnection')],
  ['RTCPeerConnection is created in initiateWebRTCConnection',
    app.includes('new RTCPeerConnection(')],
  ['WebRTC STUN servers configured',
    app.includes('stun:stun.l.google.com:19302')],
  ['ontrack handler shows remote video/audio',
    app.includes('remote-video-feed') && app.includes('remote-audio-feed')],
  ['Signal polling interval exists (signalIntervalId)',
    app.includes('signalIntervalId = setInterval')],
  ['closeCallOverlay closes peerConnection',
    app.includes('peerConnection.close()')],
  ['closeCallOverlay clears signalIntervalId',
    app.includes('clearInterval(signalIntervalId)')],
  ['closeCallOverlay removes remote-audio-feed element',
    app.includes("getElementById('remote-audio-feed')") && app.includes('.remove()')],
  ['Incoming calls use processedCallIds (no clock skew)',
    app.includes('window.processedCallIds') && app.includes('processedCallIds.has(String(m.id))')],
  ['processedCallIds seeded on first load to skip old meetings',
    app.includes('meetings.forEach(m => window.processedCallIds.add(String(m.id)))')],
  ['All active chat rooms synced in pollUpdates (not just active one)',
    app.includes('activePartners.map(async (partnerId)')],
  ['In-call chat sync block in pollUpdates',
    app.includes('call-chat-history') && app.includes('callRoomId')],
  ['db.sendMessage exists in api.js',
    api.includes('sendMessage: async (roomId')],
  ['db.sendMessage POSTs directly to /chats/:roomId',
    api.includes("apiFetch(`/chats/${roomId}`")],
  ['db.createMeeting exists in api.js',
    api.includes('createMeeting: async (meetingData)')],
  ['db.createMeeting POSTs to /meetings and returns server response',
    api.includes("apiFetch('/meetings'") && api.includes('res.meeting')],
  ['db.sendSignal exists in api.js',
    api.includes('sendSignal: async (meetingId')],
  ['db.getSignals exists in api.js',
    api.includes('getSignals: async (meetingId')],
  ['Signal POST route in server.js',
    srv.includes('/api/meetings/:id/signal') && srv.includes("method: 'POST'") || srv.includes("app.post('/api/meetings/:id/signal'")],
  ['Signal GET route in server.js',
    srv.includes('callSignals')],
  ['meetings GET response includes created_at',
    srv.includes('created_at:   new Date(r.created_at).getTime()')],
  ['No AI auto-reply patterns',
    !app.includes('aiResponse') && !app.includes('autoReply') && !app.includes('AI reply') && !app.includes('bot reply')],
];

let passed = 0;
checks.forEach(([name, pass]) => {
  const icon = pass ? '✅' : '❌';
  console.log(icon + ' ' + name);
  if (pass) passed++;
});
console.log('\n' + passed + '/' + checks.length + ' checks passed');
