const TARGET_FPS = 30

const BALL_FRAMES = 20
const HIT_WINDOW = 3

const AUDIO_START = 3
const AUDIO_INC = 0.05

const LSTORAGE_KEY = "best"

let score = 0
let bestScore = 0
let ballFrame = 0

let audioVolume = 0

let curGameCooldown = 0
let running = false
let stopped = true

const musicElement = document.getElementById("music") as HTMLMediaElement
const kickSfxElement = document.getElementById("kick") as HTMLMediaElement
const failSfxElement = document.getElementById("fail") as HTMLMediaElement
failSfxElement.volume = 0.6

function playMusic() {
	musicElement.fastSeek(0)
	musicElement.play()
}

function stopMusic() {
	musicElement.pause()
}

function setVolume(vol: number) {
	audioVolume = Math.min(1, Math.max(vol, 0))
	musicElement.volume = audioVolume
}

function playKickSound() {
	kickSfxElement.fastSeek(0)
	kickSfxElement.play()
}

//i should have made a general function for these but idrc atp
function playFailSound() {
	failSfxElement.fastSeek(0)
	failSfxElement.play()
}

function stopAnims() {
	stopped = true
}

function startGame() {
	if (curGameCooldown > 0) return

	ballFrame = 0
	score = 0 //just in case
	running = true
	stopped = false

	playKickSound()
}

function endGame() {
	stopMusic()
	setVolume(0)
	if (score > 2)
		playFailSound()

	score = 0
	running = false

	localStorage.setItem(LSTORAGE_KEY, bestScore.toString())
}

function kick() {
	//if not in hit window, fail
	console.log("kick at frame " + ballFrame)
	if (ballFrame <= BALL_FRAMES - HIT_WINDOW) {
		console.log("too early, fail")
		endGame()
		return
	}

	ballFrame = 0
	score += 1
	bestScore = Math.max(score, bestScore)
	playKickSound()
}

function tick() {
	curGameCooldown -= 1

	if (stopped) return

	ballFrame += 1

	if (!running && ballFrame >= BALL_FRAMES + 6) {
		console.log("stop lose anim")
		stopAnims()
	}
	if (running && ballFrame >= BALL_FRAMES) { //running means game still playing
		console.log("too late, fail")
		endGame()
	}
}

function draw() {
	const mellow = document.getElementById("mellow") as HTMLImageElement
	let img = "idle.png"
	if (running || (!stopped && ballFrame < 21))
		img = `main${Math.floor(ballFrame / 3)}.png`
	else if (!stopped) {//we lost but need to finish animations (ball frame >= 21)
		img = `lose${Math.floor((ballFrame - 21) / 3)}.png`
	}
	mellow.src = `img/${img}`

	//start playing a bit earlier than the real game to sync the "you're the soccer ball!"
	if (running && score == AUDIO_START && audioVolume == 0)
		playMusic()
	setVolume((score - AUDIO_START) * AUDIO_INC) //gets clamped by setVolume

	document.getElementById("score")!.innerHTML = score.toString()
	document.getElementById("best-score")!.innerHTML = bestScore.toString()
	/*
	let debugText = document.getElementById("dbg-mellow-state")!;
	debugText.innerHTML = `frame ${ballFrame} - running ${running}`;
  
	document.getElementById("dbg-canplay")!.innerHTML =
	  curGameCooldown > 0 ? "WAIT TO PLAY" : "";*/
}

function onKeyDown(event: KeyboardEvent) {
	switch (event.key) {
		case " ":
			if (running) kick()
			else if (stopped) startGame()
			break
	}
}

if (localStorage.getItem(LSTORAGE_KEY))
	bestScore = parseInt(localStorage.getItem(LSTORAGE_KEY)!)

addEventListener("keydown", onKeyDown)
setInterval(() => {
	tick()
	draw()
}, 1000 / TARGET_FPS)
