require('dotenv').config();
const WebSocket = require('ws');

const ws = new WebSocket('wss://baduki.progames.world');

const sendMessage = (type, value) => {
    ws.send(JSON.stringify({
        'type': type,
        'value': encodeURIComponent(JSON.stringify(value))
    }));
};

const gotMessage = (type, value) => {
    console.log(type, value);
};

ws.on('open', () => {
    console.log('Successfully connected!');
    sendMessage('UserLogin', {
        'token': process.env.TOKEN
    });
});

ws.on('message', data => {
    const message = JSON.parse(data);

    if (message.type === 'PING') {
        sendMessage('PONG', {});
    } else {
        const type = message.type, value = JSON.parse(decodeURIComponent(message.value));
        gotMessage(type, value);
    }
});
