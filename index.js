const WebSocket = require('ws');

const ws = new WebSocket('wss://baduki.progames.world');

ws.on('open', () => {
    console.log('Successfully connected!');
});

ws.on('message', data => {
    console.log(data);
});