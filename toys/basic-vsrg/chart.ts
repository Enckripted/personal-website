//implemneted using https://github.com/barrysir/stepmania-parsing-code/wiki

const LANE_COUNT = 4
const EMPTY_ROW = Array(4).fill("0").join("")

type Row = {
	type: string //LANE_COUNT length string where 0=empty,1=tap,2=hold,3=release
	time: number
}
type Bpm = {
	row: number
	bpm: number
} //from my reading, most charts use 4/4 so for now this will be yet another assumption
type MeasureData = string[] //direct chart data

class RowData{
	private _rows: Row[] = [] 

	get rows(): readonly Row[]{
		return this._rows
	}

	constructor(laneData: MeasureData[], offset: number, bpms: Bpm[]){
		let curRow = 0
		let curBpm = 0
		let curTime = offset
		
		//parse one lane into events
		for(let i = 0; i < laneData.length; i++){
			const measure = laneData[i]

			for(let j = 0; j < measure.length; j++){
				//check if we move up bpms
				while(curBpm < bpms.length-1 && bpms[curBpm+1].row == curRow)
					curBpm += 1

				//beat length for 4 beats a measurea
				let beatLength = 60 / bpms[curBpm].bpm
				let rowLength = beatLength * (4 / measure.length)
				
				if(measure[j] != EMPTY_ROW){
					this._rows.push({
						type: measure[j],
						time: curTime,
					})
				}
				curTime += rowLength
				curRow += 1
			}
		}
	}
}

class Chart{
	public readonly rowData: RowData
	private _bpms: Bpm[] = []
	private _offset = 0

	get bpms(): readonly Bpm[]{
		return this._bpms
	}

	get offset(): number{
		return this._offset
	}

	//parses all header tags and fills out any data we need
	private parseTags(chartLines: string[]){
		let i = -1
		while(i < chartLines.length-1 && chartLines[i+1] != "#NOTES:"){ //we'll abort at note data
			i += 1
			if(chartLines[i][0] != "#"){ //if first char not # then it not header
				continue
			}  

			const s = chartLines[i].split(":")
			const key = s[0].slice(1)
			const val = s[1].slice(0, s[1].length-1)
			console.log(`Found ${key} = ${val}`)

			switch(key.toLowerCase()){
				case "offset":
					this._offset = parseFloat(val)
					break
				case "bpms":
					for(const change of val.split(",")){
						this._bpms.push({
							row: parseInt(change.split("=")[0]),
							bpm: parseFloat(change.split("=")[1]),
						})
					}
					break
			}
		}

		//for debug purposes
		console.log("OFFSET: "+this._offset)
		console.log("BPMS:")
		for(const bpm of this._bpms)
			console.log(`${bpm.bpm} at row ${bpm.row}`)

		//all chart header related error handling will go here
		if(this._bpms.length == 0) throw new Error("No BPMs found in chart")
	}

	private parseMeasureData(chartLines: string[], startIndex: number): MeasureData[]{
		let i = startIndex-1
		const measures: MeasureData[] = [[]]
		while(i < chartLines.length-1 && chartLines[i+1] != ";"){
			i += 1
			if(chartLines[i][0] == ","){
				measures.push([])
				continue
			}

			if(chartLines[i].length != LANE_COUNT){ //TODO: introduce data verification step (is every note a valid type)
				throw new Error("Attempted to parse line "+chartLines[i]
					+" as note data and failed (not LANE_COUNT chars)")
			}
			measures[measures.length-1].push(chartLines[i])
		}
		return measures
	}

	constructor(chartData: string){
		const chartLines = chartData.split("\n").map((s) => s.trim())

		console.log("Beginning to parse")
		this.parseTags(chartLines)

		//assuming one difficulty for now
		let measureData: MeasureData[] | null = null
		for(let i = 0; i < chartLines.length; i++){
			if(chartLines[i] == "#NOTES:"){
				measureData = this.parseMeasureData(chartLines, i+6)
				break
			}
		}
		if(!measureData) throw new Error("No #NOTES header found in file")

		this.rowData = new RowData(measureData, this._offset, this._bpms)
		console.log("Generated chart: ")
		console.log(this.rowData)
	}
}

class RowIterator{
	public readonly rowData: RowData
	private pos = 0

	private rowAtInd(ind: number){
		if(ind >= this.rowData.rows.length) return {
			type: EMPTY_ROW,
			time: Infinity
		}
		return this.rowData.rows[ind]
	}

	get currentRow(){
		return this.rowAtInd(this.pos)
	}

	constructor(chart: Chart){
		this.rowData = chart.rowData
	}

	peekNext()
	{
		return this.rowAtInd(this.pos+1)
	}

	decrement(){
		this.pos -=1 
	}

	increment(){
		this.pos += 1
	}

	seekTime(time: number){
		let low = 0
		let high = this.rowData.rows.length

		while(low < high){
			const mid = Math.floor((low+high+1) / 2)
			if(this.rowData.rows[mid].time <= time)
				low = mid
			else
				high = mid-1
		}

		this.pos = low
	}
}

async function readChart(simFile: File | Response): Promise<Chart> {
	const fileData = await simFile.text().then()
	return new Chart(fileData)
}

export type { Chart, }
export { LANE_COUNT, readChart, Row, RowIterator, }