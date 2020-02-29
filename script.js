"use strict";


class Vec2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

let board;
let message;
let turn;
let cursorPos = new Vec2(0, 0);
const boardSize = new Vec2(8, 8);
const diskColor = {
    dark: 0,
    light: 1,
    none: 2,
    max: 3
};
const diskAA = [
    '●',
    '○',
    '・'
];
const diskNames = [
    '黒',
    '白'
];


function onKeyDown(e) {
    if (isGameEnd()) {
        init();
        return;
    }

    message = '';

    switch (e.key) {
      case 'k': cursorPos.y--; break;
      case 'j': cursorPos.y++; break;
      case 'h': cursorPos.x--; break;
      case 'l': cursorPos.x++; break;
      default: onOtherKeyDown();
    }

    if (cursorPos.x < 0) cursorPos.x += boardSize.x;
    if (cursorPos.x >= boardSize.x) cursorPos.x -= boardSize.x;
    if (cursorPos.y < 0) cursorPos.y += boardSize.y;
    if (cursorPos.y >= boardSize.y) cursorPos.y -= boardSize.y;

    draw();
}


function onOtherKeyDown() {
    if (checkCanPlace(turn, cursorPos, false)) {
        checkCanPlace(turn, cursorPos, true);
        board[cursorPos.y][cursorPos.x] = turn;

        if(isGameEnd()) {
            let count = [0, 0];
            for (let i=0; i < boardSize.y; i++) {
                for (let j=0; j < boardSize.x; j++) {
                    if (board[i][j] !== diskColor.none) {
                        count[board[i][j]]++;
                    }
                }
            }

            message =
                diskNames[diskColor.dark] + ':'
                + count[diskColor.dark]
                + ' - '
                + diskNames[diskColor.light]
                + count[diskColor.light]
                + '<br>';

            let winner = diskColor.none;
            if (count[diskColor.dark] > count[diskColor.light]) {
                winner = diskColor.dark;
            } else if (count[diskColor.dark < count[diskColor.light]]) {
                winner = diskColor.light;
            }

            if (winner !== diskColor.none) {
                message += `${diskNames[winner]}の勝ちです。<br>`;
            } else {
                message += '引き分けです。<br>';
            }
            message += '<br>';

            return;
        }
        takeTurn();
        if (!checkCanPlaceAll(turn)) {
            message = diskNames[turn] + 'はパスしました。<br>';
            takeTurn();
        }
    } else {
        message += 'そこには置けません。<br>';
    } 
}


function takeTurn() {
    if (turn === diskColor.dark) {
        turn = diskColor.light;
    } else {
        turn = diskColor.dark;
    }
}


function checkCanPlace(color, pos, reverse) {
    let result = false;
    
    if (board[pos.y][pos.x] !== diskColor.none) {
        return false
    }

    for (let i=-1; i <= 1; i++) {
        for (let j=-1; j <= 1; j++) {
            let dir = new Vec2(j, i);

            if ((dir.x === 0) && (dir.y === 0)) {
                continue;
            }

            let checkPos = new Vec2(
                pos.x + dir.x,
                pos.y + dir.y
            )
            
            if (!isInBoard(checkPos)) {
                continue;
            }

            let opponent;

            if (color === diskColor.dark) {
                opponent = diskColor.light;
            } else {
                opponent = diskColor.dark;
            }
            if (board[checkPos.y][checkPos.x] !== opponent) {
                continue;
            }

            while (true) {
                checkPos.x += dir.x;
                checkPos.y += dir.y;

                if (!isInBoard(checkPos)) break;
                if (board[checkPos.y][checkPos.x] === diskColor.none) break;
                if (board[checkPos.y][checkPos.x] === color) {
                    result = true;

                    if (reverse) {
                        let reversePos = new Vec2(pos.x, pos.y);

                        while (true) {
                            reversePos.x += dir.x;
                            reversePos.y += dir.y;

                            if ((reversePos.x === checkPos.x) && (reversePos.y === checkPos.y)) break;
                            board[reversePos.y][reversePos.x] = color;
                        }
                    }
                }
            }
        }
    }
    return result;
}


function checkCanPlaceAll(color) {
    for (let i=0; i < boardSize.y; i++) {
        for (let j=0; j < boardSize.x; j++) {
            if (checkCanPlace(color, new Vec2(j, i), false)) {
                return true;
            }
        }
    }
    return false;
}


function isGameEnd() {
    return (!checkCanPlaceAll(diskColor.dark)) && (!checkCanPlaceAll(diskColor.light))
}


function isInBoard(v) {
    return v.x >= 0
        && v.x < boardSize.x
        && v.y >= 0
        && v.y < boardSize.y;
}


function init() {
    message = '';
    board = [];
    turn = diskColor.dark;

    for (let i=0; i < boardSize.y; i++) {
        board[i] = [];
        for (let j=0; j < boardSize.x; j++) {
            board[i][j] = diskColor.none;
        }
    }

    board[3][4] = diskColor.dark;
    board[4][3] = diskColor.dark;
    board[3][3] = diskColor.light;
    board[4][4] = diskColor.light;

    window.onkeydown = onKeyDown;

    draw();
}


function draw() {
    let html = '';

    for (let i=0; i < boardSize.y; i++) {
        for (let j=0; j < boardSize.x; j++) {
            html += diskAA[board[i][j]];
        } 
        if (i === cursorPos.y) {
            html += '←';
        }
        html += '<br>';
    }

    for (let i=0; i < boardSize.x; i++) {
        html += (i === cursorPos.x) ? '↑' : '　';
    }
    html += '<br>';

    if (!isGameEnd()) {
        message += `${diskNames[turn]}のターンです。<br>`;
        message += `<br>
            [h, j, k, l]:カーソル移動<br>
            [その他のキー]:石を置く`;
    } else {
        message += '何かキーを押して下さい。';
    }
    html += '<br>' + message;

    let div = document.querySelector('div');
    div.innerHTML = html;
}


init();