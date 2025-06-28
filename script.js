// Generate or load permanent peer ID
const storedId = localStorage.getItem('peer-id') || crypto.randomUUID();
localStorage.setItem('peer-id', storedId);

// Create PeerJS connection
const peer = new Peer(storedId);
document.getElementById('myId').textContent = "My ID: " + storedId;

let conn;

// Incoming connection
peer.on('connection', c => {
  conn = c;
  setupConnection();
});

// Outgoing connection (optional function to use)
function connectToOther(id) {
  conn = peer.connect(id);
  setupConnection();
}

// Setup communication
function setupConnection() {
  conn.on('data', data => {
    if (data.type === 'dot') updateDot(data.value);
    if (data.type === 'cam') updateCam(data.value);
  });

  document.getElementById('dotToggle').addEventListener('change', () => {
    const value = document.getElementById('dotToggle').checked;
    send({ type: 'dot', value });
    updateDot(value);
  });

  document.getElementById('camSwitch').addEventListener('input', () => {
    const value = parseInt(document.getElementById('camSwitch').value);
    send({ type: 'cam', value });
    updateCam(value);
  });
}

// Send message to peer
function send(msg) {
  if (conn && conn.open) conn.send(msg);
}

// Dot UI
function updateDot(state) {
  const dot = document.getElementById('dot');
  document.getElementById('dotToggle').checked = state;
  dot.style.backgroundColor = state ? 'white' : 'black';
}

// Camera control
let stream = null;
function updateCam(mode) {
  const video = document.getElementById('video');
  if (stream) stopCam();

  if (mode === 1) {
    video.style.display = 'none';
    return;
  }

  navigator.mediaDevices.getUserMedia({
    video: { facingMode: mode === 0 ? 'environment' : 'user' },
    audio: false
  }).then(s => {
    stream = s;
    video.srcObject = stream;
    video.style.display = 'block';
  }).catch(console.error);
}

function stopCam() {
  if (stream) {
    stream.getTracks().forEach(t => t.stop());
    stream = null;
  }
  document.getElementById('video').style.display = 'none';
                               }
