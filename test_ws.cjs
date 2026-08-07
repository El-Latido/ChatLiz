const WebSocket = require('ws');
const ws = new WebSocket('wss://listen.moe/gateway_v2');
ws.on('open', () => {
    console.log("Connected");
});
ws.on('message', (data) => {
    console.log("Received:", data.toString());
    ws.close();
});
ws.on('error', (err) => {
    console.log("Error:", err);
});
