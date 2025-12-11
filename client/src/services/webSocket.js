// let ws;
// let listeners = [];

// export function initWebSocket() {
//   if (ws) return; // prevent multiple connections

//   ws = new WebSocket("wss://wss1_ibacus.octosignals.com/ws/stream");

//   ws.onopen = () => console.log("WS Connected");

//   ws.onmessage = (event) => {
//     const data = JSON.parse(event.data);
//     console.log("WS DATA:", data);

//     listeners.forEach(cb => cb(data.weight));
//   };

//   ws.onerror = (err) => console.log("WS Error", err);

//   ws.onclose = () => {
//     console.log("WS Closed… reconnecting");
//     ws = null;
//     setTimeout(initWebSocket, 2000);
//   };
// }

// initWebSocket()

// export function subscribeWeight(callback) {
//   listeners.push(callback);

//   return () => {
//     listeners = listeners.filter(cb => cb !== callback);
//   };
// }
