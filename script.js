// Generate or load permanent peer ID
const storedId = localStorage.getItem('peer-id') || crypto.randomUUID();
localStorage.setItem('peer-id', storedId);

// Show ID in UI
document.getElementById('myId').textContent = "My ID: " + storedId;

// Create PeerJS connection
const peer = new Peer(storedId);
let conn;

// Incoming connection (from other peer)
peer.on('connection', c => {
  conn = c;
  setupConnection();
});

// Outgoing connection (you initiate)
function connectToOther(id) {
  conn = peer.connect(id);
  conn.on('open', () => {
    setupConnection();
  });
}

// Common setup for both directions
function setupConnection() {
  // Receive data
  conn.on('data', data => {
    if (data.type === 'dot') updateDot(data.value);
    if (data.type === 'cam') updateCam(data.value);
  });

  // Dot toggle change
  document.getElementById('dotToggle').addEventListener('change', () => {
    const value = document.getElementById('dotToggle').checked;
    send({ type: 'dot', value });
    updateDot(value);
  });

  // Cam switch change
  document.getElementById('camSwitch').addEventListener('input', () => {
    const value = parseInt(document.getElementById('camSwitch').value);
    send({ type: 'cam', value });
    updateCam(value);
  });
}

// Send message to peer
function send(msg) {
  if (conn && conn.open) {
    conn.send(msg);
  }
}

// Update Dot UI
function updateDot(state) {
  const dot = document.getElementById('dot');
  document.getElementById('dotToggle').checked = state;
  dot.style.backgroundColor = state ? 'white' : 'black';
}

// Camera handling
let stream = null;

function updateCam(mode) {
  const video = document.getElementById('video');

  stopCam();

  if (mode === 1) {
    video.style.display = 'none';
    return;
  }

  navigator.mediaDevices.getUserMedia({
    video: { facingMode: mode === 0 ? 'environment' : 'user' },
    audio: true
  }).then(s => {
    stream = s;
    video.srcObject = stream;
    video.style.display = 'block';
  }).catch(err => {
    console.error("Camera error:", err);
  });
}

function stopCam() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
  document.getElementById('video').style.display = 'none';
}

// On page load, ask for peer ID to connect
window.onload = () => {
  const otherId = prompt("Enter peer ID to connect or leave blank to wait:");
  if (otherId) {
    connectToOther(otherId);
  }
};
