
let ws;
let listeners = [];

function initWebSocket() {
  ws = new WebSocket("wss://94.136.190.133:6020/ws/data");

  ws.onopen = () => console.log("WS Connected");

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('weight data',data)
    // notify all listeners
    listeners.forEach((cb) => cb(data.weight));
  };

  ws.onerror = () => console.log("WS Error");
  ws.onclose = () => {
    console.log("WS Closed. Reconnecting in 2 seconds...");
    setTimeout(initWebSocket, 2000);
  };
}

initWebSocket();


export const subscribeWeight = (callback) => {
  listeners.push(callback);

  return () => {
    // Unsubscribe
    listeners = listeners.filter((cb) => cb !== callback);
  };
};
