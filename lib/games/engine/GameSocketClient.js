let socket;

export function connectToGameServer() {
  socket = new WebSocket("ws://localhost:8081");

  socket.onopen = () => {
    console.log("Connected to SafeSteps Game Server");
  };

  socket.onmessage = (msg) => {
    const data = JSON.parse(msg.data);
    handleMessage(data);
  };

  socket.onerror = (err) => {
    console.log("WebSocket error:", err);
  };
}

export function sendMessage(payload) {
  socket.send(JSON.stringify(payload));
}

const listeners = [];

export function onMessage(callback) {
  listeners.push(callback);
}

function handleMessage(data) {
  listeners.forEach(cb => cb(data));
}
