import { LANE_COUNT, Row, RowIterator } from "./chart"
import type { Game } from "./game"

let pos = 0
let time = 0

const HIT_MARKER_X = 30
const HIT_MARKER_Y = 600
const HIT_MARKER_W = 70
const HIT_MARKER_H = 25
const HIT_MARKER_SPACE = 20

const NOTE_SPEED = 1000


let renderIterator: RowIterator
let game: Game
let renderedRows: Row[] = []

function calcLaneX(lane: number){
	return HIT_MARKER_X+(HIT_MARKER_W+HIT_MARKER_SPACE)*lane
}

function calcRowY(row: Row){
	return HIT_MARKER_Y - (row.time - game.time)*NOTE_SPEED
}

function initNoteRenderer(gameObj: Game){
	game = gameObj

	if(!game.chart) throw new Error("Attempt to initialize note renderer outside of game")
	renderIterator = new RowIterator(game.chart)
	//FIXME: this should be a deque
	renderedRows = []
}

function renderNotes(ctx: CanvasRenderingContext2D) {
	//const TIME_UNTIL_MARKER = HIT_MARKER_Y / NOTE_SPEED
	//const TIME_PAST_MARKER = (ctx.canvas.height-HIT_MARKER_Y) / NOTE_SPEED
	if(!game || !game.running) return
	console.log(`time: ${game.time} - row time: ${renderIterator.currentRow.time}`)

	while(calcRowY(renderIterator.currentRow) >= 0){
		renderedRows.push(renderIterator.currentRow)
		renderIterator.increment()
	}

	while(renderedRows.length > 0 && calcRowY(renderedRows[0]) > ctx.canvas.height){
		renderedRows.shift()
	}

	ctx.strokeStyle = "rgba(255,255,255,1)"
	for(let i = 0; i < LANE_COUNT; i++){
		ctx.strokeRect(calcLaneX(i), HIT_MARKER_Y, HIT_MARKER_W, HIT_MARKER_H)
	}

	ctx.fillStyle = "rgba(60,0,0,1)"
	for(const row of renderedRows){
		for(let i = 0; i < LANE_COUNT; i++){
			if(row.type[i] === "0") continue
			ctx.fillRect(calcLaneX(i), calcRowY(row), HIT_MARKER_W, HIT_MARKER_H)
		}
	}
}

export { renderNotes, initNoteRenderer }