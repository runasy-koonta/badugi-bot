require('dotenv').config();
const WebSocket = require('ws');

const ws = new WebSocket(process.env.SERVER_ADDRESS);
const verdict = require('./verdict');

const sendMessage = (type, value) => {
    ws.send(JSON.stringify({
        'type': type,
        'value': encodeURIComponent(JSON.stringify(value))
    }));
};

let card = null, shouldChange = null, gameTurn = 0, v = null;
const gotMessage = (type, value) => {
    console.log(type, value);
    switch (type) {
        case 'ROOM_LIST':
            sendMessage('RoomJoinInfo', {
                'isCreate': false,
                'condition': 0,
                'buyin': 40000
            });
            break;
        case 'GAME_STARTED':
            card = value.cardData;
            shouldChange = JSON.parse(JSON.stringify(card));

            v = verdict(card);
            for (let i = 0; i < v.mades.length; i++) {
                shouldChange.splice(shouldChange.indexOf(v.mades[i]), 1);
            }
            break;
        case 'GAME_PLAY_TIME':
            if (value === 2) {
                gameTurn++;
            }
            break;
        case 'YOUR_BET_TURN':
            if (gameTurn === 2 && v.madeType !== 1) {
                sendMessage('BetData', {
                    'betState': 'DIE'
                });
            } else if (gameTurn === 2 && v.madeType === 1 && value.available_options === 'RAISEABLE') {
                sendMessage('BetData', {
                    'betState': 'HALF'
                });
            } else {
                if (['CHECKABLE_CANTPING', 'CHECKABLE'].indexOf(value.available_options) !== -1) {
                    sendMessage('BetData', {
                        'betState': 'CHECK'
                    });
                } else {
                    sendMessage('BetData', {
                        'betState': 'CALL'
                    });
                }
            }
            break;
        case 'CHANGE_TURN':
            if (value.userIndex === 0) {
                sendMessage('ChangeData', {
                    'changeCards': shouldChange
                });
                for (let i = 0; i < shouldChange.length; i++) {
                    card.splice(card.indexOf(shouldChange[i]), 1);
                }
            }
            break;
        case 'USER_CHANGE':
            card = card.concat(value.changeCards);
            shouldChange = JSON.parse(JSON.stringify(card));

            v = verdict(card);
            for (let i = 0; i < v.mades.length; i++) {
                shouldChange.splice(shouldChange.indexOf(v.mades[i]), 1);
            }
            break;
    }
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
