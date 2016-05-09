/**
 * Created by Slavik on 4/23/16.
 */
export default class Automat {
    nextState: number;
    constructor(public stateCount: number, public currentState:number = 0){ }
    changeStateTo(s: number) {
        this.currentState = s;
    }
    changeNextState() {
        this.currentState = this.nextState;
    }
    setNextState(s: number) {
        this.nextState = s;
    }
}