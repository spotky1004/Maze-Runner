// init canvas
const canvas = document.getElementById("canvas");
/**  @type {CanvasRenderingContext2D} */
let c = canvas.getContext("2d");

// define vars
let mainLoop, player, mazeMap, tickSpeed;

function generateMaze(x=0) {
    mazeMap.map[x] = Math.floor(Math.random()*2**mazeMap.yHeight).toString(2).padStart(mazeMap.yHeight, "0");
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
    c.lineWidth = unitLeng/4;
    c.lineCap = "round";
    for (let x = Math.floor(mazeMap.x), xl = x+mazeMap.yHeight*4; x < xl; x++) {
        if (typeof mazeMap.map[Math.floor(x)] === "undefined") generateMaze(Math.floor(x));
        const mapUnit = mazeMap.map[Math.floor(x)];

        for (let y = 0; y < mazeMap.yHeight; y++) {
            const d = Number(mapUnit[y]);
            c.beginPath();
            c.strokeStyle = `hsl(${(x+y)*Math.sqrt(10)%360}, 80%, 50%)`;
            c.moveTo(unitLeng*(x-mazeMap.x+1), unitLeng*(y+1));
            c.lineTo(unitLeng*(x-mazeMap.x+1-d), unitLeng*(y+1-!d));
            c.stroke();
        }
    }
}

startLoop = (t) => mainLoop = mainLoop ?? setInterval(loop, t);

startGame({yHeight: 20, acceleration: 0.1, tick: 30});

// keypress

