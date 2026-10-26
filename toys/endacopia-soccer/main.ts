const TARGET_FPS = 30

const BALL_FRAMES = 20
const HIT_WINDOW = 3
const MAX_EXTRA_HIT_FRAMES = 5

const MUSIC_START = 5
const MUSIC_VOL_INC = 0.05
const SPOTLIGHT_START = 26 //this might be based on the music in game but i dont wanna do all that

const LS_BEST_KEY = "best"

const medals = [50, 100, 200]

let score = 0
let bestScore = 0
let ballFrame = 0

let audioVolume = 0

let curGameCooldown = 0
let running = false
let stopped = true

let debugMode = false
let extraHitFrames = 0
let autoplay = false
let autoplayWasEnabled = false

const musicElement = document.getElementById("music") as HTMLMediaElement
const kickSfxElement = document.getElementById("kick") as HTMLMediaElement
const failSfxElement = document.getElementById("fail") as HTMLMediaElement
const spotlightSfxElement = document.getElementById("spotlight-sfx") as HTMLMediaElement
failSfxElement.volume = 0.4

function playAudio(audioElement: HTMLMediaElement) {
	audioElement.fastSeek(0)
	audioElement.play()
}

function playMusic() {
	playAudio(musicElement)
}

function stopMusic() {
	musicElement.pause()
}

function setMusicVolume(vol: number) {
	audioVolume = Math.min(1, Math.max(vol, 0))
	musicElement.volume = audioVolume
}

function cheated() {
	return debugMode || extraHitFrames > 0 || autoplayWasEnabled
}

function startGame() {
	if (curGameCooldown > 0) return

	ballFrame = 0
	score = 0 //just in case
	running = true
	stopped = false

	playAudio(kickSfxElement)
}

function endGame() {
	stopMusic()
	setMusicVolume(0)
	turnOffSpotlight()
	if (score > 2)
		playAudio(failSfxElement)

	score = 0
	running = false
	autoplayWasEnabled = false
	curGameCooldown = 20

	localStorage.setItem(LS_BEST_KEY, bestScore.toString())
}

function stopLoseAnim() {
	stopped = true
}

function kick() {
	//if not in hit window, fail
	console.log("kick at frame " + ballFrame)
	if (ballFrame < BALL_FRAMES - HIT_WINDOW - extraHitFrames) {
		console.log("too early, fail")
		endGame()
		return
	}

	ballFrame = 0
	score += 1

	if (score == MUSIC_START)
		playMusic()
	if (score == SPOTLIGHT_START)
		turnOnSpotlight()

	if (!cheated())
		bestScore = Math.max(score, bestScore)
	playAudio(kickSfxElement)
}

function tick() {
	curGameCooldown -= 1

	if (stopped) return

	if (running && autoplay && ballFrame == BALL_FRAMES - 1)
		kick()
	ballFrame += 1

	if (!running && ballFrame >= BALL_FRAMES + 6) {
		console.log("stop lose anim")
		stopLoseAnim()
	}
	if (running && ballFrame >= BALL_FRAMES) { //running means game still playing
		console.log("too late, fail")
		endGame()
	}
}

const scoreEl = document.getElementById("score")!
const bestEl = document.getElementById("best-score")!
const spotlightEl = document.getElementById("spotlight")!
const mellow = document.getElementById("mellow") as HTMLImageElement
const dbgTogEl = document.getElementById("dbg-toggle")!
const dbgHitTogEl = document.getElementById("dbg-hit-toggle")!
const dbgAutoTogEl = document.getElementById("dbg-auto-toggle")!

function turnOnSpotlight() {
	spotlightEl.style.visibility = "visible"
	playAudio(spotlightSfxElement)
}
function turnOffSpotlight() {
	spotlightEl.style.visibility = "hidden"
}
function positionSpotlight() {
	const mellowRect = mellow.getBoundingClientRect()
	spotlightEl.style.setProperty("--x", `${mellowRect.left + mellowRect.width / 2}px`)
	spotlightEl.style.setProperty("--y", `${mellowRect.top + mellowRect.height / 2}px`)
}
window.addEventListener("resize", positionSpotlight)
window.addEventListener("scroll", positionSpotlight)
positionSpotlight()

function draw() {

	let img = "idle.png"
	if (running || (!stopped && ballFrame < 21))
		img = `main${Math.floor(ballFrame / 3)}.png`
	else if (!stopped) {//we lost but need to finish animations (ball frame >= 21)
		img = `lose${Math.floor((ballFrame - 21) / 3)}.png`
	}
	mellow.src = `/endacopia-soccer/img/${img}`


	setMusicVolume((score - MUSIC_START) * MUSIC_VOL_INC) //gets clamped by setVolume

	scoreEl.innerHTML = score.toString()
	bestEl.innerHTML = bestScore.toString()

	let debugText = document.getElementById("dbg-mellow-state")!;
	debugText.innerHTML = `frame ${ballFrame} - running ${running}`;
	debugText.style.color = (!running || ballFrame <= BALL_FRAMES - HIT_WINDOW) ? "white" : "green"
	debugText.style.visibility = debugMode ? "visible" : "hidden";

	for (let i = 0; i < medals.length; i++)
		document.getElementById("medal" + i)!.style.visibility = (bestScore >= medals[i] ? "visible" : "hidden")
}

//don't change settings during run
dbgTogEl.addEventListener("click", () => {
	if (running) return
	debugMode = !debugMode
	dbgTogEl.innerHTML = `DEBUG MODE: ${debugMode ? "ON" : "OFF"}`
	dbgTogEl.style.color = debugMode ? "red" : "white"
})
dbgHitTogEl.innerHTML = "EXTRA HIT FRAMES: 0"
dbgHitTogEl.addEventListener("click", () => {
	if (running) return
	extraHitFrames = (extraHitFrames + 1) % (MAX_EXTRA_HIT_FRAMES + 1)
	dbgHitTogEl.innerHTML = `EXTRA HIT FRAMES: ${extraHitFrames}`
	dbgHitTogEl.style.color = extraHitFrames > 0 ? "red" : "white"
})
dbgAutoTogEl.innerHTML = "AUTOPLAY: OFF"
dbgAutoTogEl.addEventListener("click", () => {
	if (running) return
	autoplay = !autoplay
	autoplayWasEnabled = autoplay || autoplayWasEnabled
	dbgAutoTogEl.innerHTML = `AUTOPLAY: ${autoplay ? "ON" : "OFF"}`
	dbgAutoTogEl.style.color = autoplay ? "red" : "white"
})


function hitActionButton() {
	if (running) kick()
	else if (stopped) startGame()
}

function onKeyDown(event: KeyboardEvent) {
	switch (event.key) {
		case " ":
			hitActionButton()
			break
	}
}

function onMouseClick() {
	if (!stopped) hitActionButton()
}

if (localStorage.getItem(LS_BEST_KEY))
	bestScore = parseInt(localStorage.getItem(LS_BEST_KEY)!)

addEventListener("keydown", onKeyDown)
addEventListener("mousedown", onMouseClick)
mellow.addEventListener("click", () => { if (!running) startGame() })
setInterval(() => {
	tick()
	draw()
}, 1000 / TARGET_FPS)
