const splitCard = (cards) => {
    let cardsNum = [], cardsShape = [];
    for (const i in cards) {
        const card = cards[i];
        cardsNum.push(card % 100);
        cardsShape.push(Math.floor(card / 100));
    }

    return {
        'number': cardsNum,
        'shape': cardsShape
    };
};

const sortCardByNum = (cards) => {
    let card_numbers = splitCard(cards)['number'];

    for (let i = 0; i < card_numbers.length; i++) {
        for (let j = i; j < card_numbers.length; j++) {
            if (card_numbers[i] > card_numbers[j]) {
                [ card_numbers[i], card_numbers[j] ] = [ card_numbers[j], card_numbers[i] ];
                [ cards[i], cards[j] ] = [ cards[j], cards[i] ];
            }
        }
    }

    return cards;
};

const cardNumberToString = (num) => {
    switch (num) {
        case 1:
            return 'A';
        case 11:
            return 'J';
        case 12:
            return 'Q';
        case 13:
            return 'K';
        default:
            return num.toString();
    }
};

module.exports = (cards, return_sorted_card = false) => {
    if (typeof cards !== 'object' || cards.length !== 4) {
        throw new Error('Invalid cards');
    }

    const sorted_cards = sortCardByNum(JSON.parse(JSON.stringify(cards)));

    const splitted_cards = splitCard(sorted_cards);
    let mades = [], last = 0, mPatterns = [];

    for (let i = 0; i < sorted_cards.length - 1; i++) {
        for (let j = i + 1; j < sorted_cards.length; j++) {
            if (splitted_cards['shape'][i] === splitted_cards['shape'][j] && mPatterns.indexOf(splitted_cards['shape'][i]) === -1) {
                mPatterns.push(splitted_cards['shape'][i]);
            }
        }
    }

    mades.push(sorted_cards[0]);
    for (let i = 0; i < sorted_cards.length; i++) {
        const mades_splitted = splitCard(mades);
        if (splitted_cards['number'][i] === mades_splitted['number'][last]) {
            if (mPatterns.indexOf(splitted_cards['shape'][last]) !== -1) {
                if (mPatterns.indexOf(splitted_cards['shape'][i]) !== -1) {
                    if (i < 3 && splitted_cards['shape'][3] === splitted_cards['shape'][3]) {
                        mades[last] = sorted_cards[i];
                    }
                } else {
                    mades[last] = sorted_cards[i]
                }
            }
        } else if (mades_splitted['shape'].indexOf(splitted_cards['shape'][i]) === -1) {
            mades.push(sorted_cards[i]);
            last++;
        }
    }
    let returnStr = "";

    const specialMades = {
        "골프": JSON.stringify([ 1, 2, 3, 4 ]),
        "세컨드": JSON.stringify([ 1, 2, 3, 5 ]),
        "서드": JSON.stringify([ 1, 2, 4, 5 ])
    };

    if (last === 3) {
        const numbers = [];
        for (let i = 0; i < mades.length; i++) {
            numbers.push(mades[i] % 100);
        }
        const j = Object.values(specialMades).indexOf(JSON.stringify(numbers));
        if (j !== -1) {
            returnStr = Object.keys(specialMades)[j];
        } else {
            returnStr = cardNumberToString(mades[last] % 100) + " 메이드";
        }
    } else {
        const madeStr = [ '탑', '투베이스', '베이스', '메이드' ];
        returnStr = cardNumberToString(mades[last] % 100) + " " + madeStr[last];
    }

    const mades_splitted = splitCard(mades);
    const topCard = Math.max.apply(null, Object.values(mades_splitted['number']));
    let MadeScore = "", sortedTargetNumbers = Object.values(mades_splitted['number']);
    sortedTargetNumbers.sort((a, b) => b - a);

    /*
        패 점수 계산 (low is better)
     */
    MadeScore = (4 - last).toString();
    const strLoc = (MadeScore[0] * 1) - 1;
    for (let i = 0; i < 4; i++) {
        if (strLoc <= i) {
            MadeScore += (sortedTargetNumbers[i - strLoc]).toString().padStart(2, '0');
        } else {
            MadeScore += "00";
        }
    }

    return {
        'card': return_sorted_card ? sorted_cards : cards,
        'result': returnStr,
        'score': MadeScore * 1,
        'madeType': 4 - last,
        'topCard': topCard,
        'mades': mades
    };
};
