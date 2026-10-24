const TARGET_FPS = 30;

const BALL_FRAMES = 20;
const HIT_WINDOW = 3;
const GAME_COOLDOWN = 20;

const LSTORAGE_KEY = "best";

let score = 0;
let bestScore = 0;
let ballFrame = 0;

let curGameCooldown = 0;
let running = false;

function endGame() {
  bestScore = Math.max(score, bestScore);
  score = 0;
  curGameCooldown = GAME_COOLDOWN;
  running = false;

  localStorage.setItem(LSTORAGE_KEY, bestScore.toString());
}

function startGame() {
  if (curGameCooldown > 0) return;

  console.log("GAME START");
  ballFrame = 0;
  running = true;
}

function kick() {
  //if not in hit window, fail
  console.log("kick at frame " + ballFrame);
  if (ballFrame <= BALL_FRAMES - HIT_WINDOW) {
    console.log("too early, fail");
    endGame();
    return;
  }

  ballFrame = 0;
  score += 1;
}

function tick() {
  curGameCooldown -= 1;

  if (!running) return;

  ballFrame += 1;
  if (ballFrame >= BALL_FRAMES) {
    //kick();
    //return;
    console.log("too late, fail");
    endGame();
    return;
  }
}

function draw() {
  const mellow = document.getElementById("mellow") as HTMLImageElement;
  mellow.src = `img/main${Math.floor(ballFrame / 3)}.png`;
  document.getElementById("score")!.innerHTML = score.toString();
  document.getElementById("best-score")!.innerHTML = bestScore.toString();
  /*
  let debugText = document.getElementById("dbg-mellow-state")!;
  debugText.innerHTML = `frame ${ballFrame} - running ${running}`;

  document.getElementById("dbg-canplay")!.innerHTML =
    curGameCooldown > 0 ? "WAIT TO PLAY" : "";*/
}

function onKeyDown(event: KeyboardEvent) {
  switch (event.key) {
    case " ":
      if (running) kick();
      else startGame();
      break;
  }
}

if (localStorage.getItem(LSTORAGE_KEY))
  bestScore = parseInt(localStorage.getItem(LSTORAGE_KEY)!);

addEventListener("keydown", onKeyDown);
setInterval(() => {
  tick();
  draw();
}, 1000 / TARGET_FPS);
