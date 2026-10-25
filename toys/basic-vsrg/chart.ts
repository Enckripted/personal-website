
type Note = {
	empty: boolean
	duration: number //where 0 means not LN
}

const TRACK_COUNT = 4

class TrackNoteData {
	notes: Map<number, Note>

	constructor() {
		this.notes = new Map()
	}
}

class NoteData {
	private tracks: TrackNoteData[] //should always be 4 for this
	private bpm: number //FOR NOW WE ONLY SUPPORT CONSTANT BPM

	constructor() {
		this.tracks = []
		this.bpm = 100

		for (let i = 0; i < 4; i++)
			this.tracks[i] = new TrackNoteData()
	}

	public getRowTime(row: number): number {
		return 0
	}


	public getRow(row: number): Note[] {
		const rowNotes: Note[] = this.tracks.map((track) => {
			const note = track.notes.get(row)
			return note ?? {
				duration: 0,
				empty: true,
			}
		})
		return rowNotes
	}
}

function readChart(chartData: string): NoteData {
	//TODO: maybe add a check for LN
	const noteData: NoteData = {
		tracks: [],
		bpm: 100
	}
	for (let i = 0; i < 4; i++) {
		noteData.tracks.push({
			notes: new Map()
		})
	}

	return noteData
}

function playChart() {

}

export { playChart, }