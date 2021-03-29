require('dotenv').config();
const WebSocket = require('ws');

const ws = new WebSocket(process.env.SERVER_ADDRESS);

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

ws.on('close', () => {
    console.log('Connection has closed');
});

ws.on('message', data => {
    const message = JSON.parse(data);
    const type = message.type, value = JSON.parse(decodeURIComponent(message.value));

    if (type === 'Ping') {
        sendMessage('Pong', {});
    } else {
        gotMessage(type, value);
    }
});
