let pos = 0
let time = 0
const speed = 700

function renderNotes(delta: number, ctx: CanvasRenderingContext2D) {
	time += delta
	pos = (pos + speed * delta) % ctx.canvas.height
	ctx.fillStyle = "#aa0000"
	ctx.fillRect(50, pos, 60, 20)
}

export { renderNotes }