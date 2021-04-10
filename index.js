// init canvas
const canvas = document.getElementById("canvas");
/**  @type {CanvasRenderingContext2D} */
let c = canvas.getContext("2d");

// define vars
let mainLoop, player, mazeMap, tickSpeed, blured=false;
const _playerDirections = {
    ArrowUp   : {x:  0, y: -1},
    ArrowDown : {x:  0, y:  1},
    ArrowLeft : {x: -1, y:  0},
    ArrowRight: {x:  1, y:  0}
}

function generateMaze(x=0) {
    const r = BigInt(Math.floor(Math.random()*Number.MAX_SAFE_INTEGER));
    const m = 2n**BigInt(mazeMap.yHeight);
    const n = r*m/BigInt(Number.MAX_SAFE_INTEGER);
    const s = n.toString(2).padStart(mazeMap.yHeight, "0");
    mazeMap.map[x] = s;
}

// game functions
function startGame({yHeight, acceleration, tick}) {
    tickSpeed = tick;
    mazeMap = {
        map: {},
        yHeight: yHeight ?? 15,
        acceleration: acceleration ?? 0.1,
        speed: 0,
        x: 0
    };
    player = {
        x: 0, y: 0
    };

    for (let i = 0; i < 30; i++) generateMaze(i);

    startLoop(tick ?? 15);
}

// loop
function loop() {
    mazeMap.speed += mazeMap.acceleration/1000*tickSpeed;
    mazeMap.x += mazeMap.speed/1000*tickSpeed;

    // canvas
    canvas.width = innerWidth;
    canvas.height = innerHeight*(3/5);

    // canvas draw & player collision
    const unitLeng = canvas.height/mazeMap.yHeight;
    c.lineCap = "round";
    c.shadowBlur = 10;
    for (let x = Math.floor(mazeMap.x), xl = x+mazeMap.yHeight*4; x < xl; x++) {
        if (typeof mazeMap.map[Math.floor(x)] === "undefined") generateMaze(Math.floor(x));
        const mapUnit = mazeMap.map[Math.floor(x)];

        for (let y = 0; y < mazeMap.yHeight; y++) {
            const d = Number(mapUnit[y]);
            c.beginPath();
            c.lineWidth = unitLeng/4;
            c.strokeStyle = `hsl(${(x+y)*Math.sqrt(10)%360}, 80%, 50%)`;
            c.shadowColor = c.strokeStyle;
            c.moveTo(unitLeng*(x-mazeMap.x+1), unitLeng*(y+1));
            c.lineTo(unitLeng*(x-mazeMap.x+1-d), unitLeng*(y+1-!d));
            c.stroke();
        }

        if (x%5 === 0) {
            const textToDraw = x.toString();
            c.beginPath();
            c.lineWidth = 0.3;
            c.font = `bold ${100/mazeMap.yHeight}vh Arial`;
            c.fillStyle = `hsla(${(x*Math.sqrt(10)+180)%360}, 60%, 60%, 0.5)`;
            c.shadowColor = c.fillStyle;
            const t = [textToDraw, unitLeng*(x-mazeMap.x+0.5)-c.measureText(textToDraw).width/2, canvas.height-50];
            c.fillText(...t);
            c.strokeText(...t);
        }
    }

    // player
    const playerSize = 0.4;
    const playerDrawSize = playerSize*unitLeng;
    const playerDrawOffset = unitLeng*(1-playerSize)/2;

    /* player move */
    const playerSpeed = Math.max(0.1, mazeMap.yHeight*mazeMap.speed/300);
    const c1 = keyPressed.ArrowUp || keyPressed.ArrowDown && (keyPressed.ArrowUp && keyPressed.ArrowDown);
    const c2 = keyPressed.ArrowLeft || keyPressed.ArrowRight && (keyPressed.ArrowLeft && keyPressed.ArrowRight);
    const c3 = c1 && c2;
    if (c3) playerSpeed/Math.SQRT2;

    for (const key in _playerDirections) if (keyPressed[key]) for (const axis in player) player[axis] += _playerDirections[key][axis]*playerSpeed;

    if (player.y > mazeMap.yHeight+0.2-playerSize) player.y = playerSize/2-0.5;
    if (player.y < playerSize-1) player.y = playerSize-1;

    /* draw player */
    c.fillStyle = "#f00";
    c.shadowColor = c.fillStyle;

    c.beginPath();
    c.fillRect(playerDrawOffset+(player.x-mazeMap.x)*unitLeng, playerDrawOffset+player.y*unitLeng, playerDrawSize, playerDrawSize);
    c.stroke();
}
startLoop = (t) => mainLoop = mainLoop ?? setInterval(loop, t);

startGame({yHeight: 15, acceleration: 0.1, tick: 20});

// keypress
let keyPressed = {};
document.onkeydown = (e) => keyPressed[e.key] = true;
document.onkeyup = (e) => keyPressed[e.key] = false;

// window.blur
window.onblur = () => {
    blured = 1;
    keyPressed = {};
    mainLoop = clearInterval(mainLoop);
}
window.onfocus = () => {
    blured = 0;
    mainLoop = startLoop(tickSpeed);
}