import { renderNotes } from "./noteRenderer"

const gameEl = document.querySelector("#game") as HTMLCanvasElement
const ctx = gameEl.getContext("2d")

const CWIDTH = 400
const CHEIGHT = 700

const bgColor = "#444444"

let lastDraw = Date.now()

function draw() {
	if (!ctx) return

	const curTime = Date.now()
	const delta = (curTime - lastDraw) / 1000
	lastDraw = curTime

	//fill background and reset
	ctx.fillStyle = bgColor
	ctx.fillRect(0, 0, CWIDTH, CHEIGHT)

	ctx.textBaseline = "top"

	ctx.fillStyle = "#7777cc"
	ctx.font = "30px serif"
	ctx.textAlign = "center"
	ctx.fillText("MARVELOUS", 200, 100)

	//fps counter always do last
	ctx.fillStyle = "#FFFFFF"
	ctx.font = "10px serif"
	ctx.textAlign = "left"

	ctx.fillText(`FPS: ${(1 / delta).toFixed(2)}`, 5, 5)

	renderNotes(delta, ctx)
}

//canvas is currently 400x700
setInterval(draw)