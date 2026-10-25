import { Chart, LANE_COUNT } from "./chart"

const GRACE_PERIOD_SECS = 1

class Game{
    private _time = 0
    private _running = false
    private _chart: Chart | undefined

    get time(){
        return this._time
    }

    get running(){
        return this._running
    }

    get chart(){
        return this._chart
    }

    playChart(chart: Chart){
        this._time = Math.min(0, chart.offset) - GRACE_PERIOD_SECS
        this._chart = chart
        this._running = true
    }

    stopChart(){
        this._running = false
    }

    tapInLane(lane: number){
        if(lane < 0 || lane >= LANE_COUNT) throw new Error(`Attempted to tap in lane ${lane}`)
        
    }

    update(delta: number){
        this._time += delta
    }
}
export { Game }