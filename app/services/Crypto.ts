/**
 * Created by Slavik on 4/28/16.
 */
import Automat from './Automat';
import { SymbolMatrix, StateMatrix } from './Matrix';
import { base64Symbols, revObj } from '../lib/helpers';
const Random = require('random-js');

export class KeyGenerator {
    public symbols:SymbolMatrix;
    public states:StateMatrix;

    public revSymbols:SymbolMatrix;
    public revStates:StateMatrix;

    public isKeysAvailable:Boolean;
    public stateCount:number;

    private engine;

    public setKeys(keys) {
        this.symbols = keys.symbols;
        this.states = keys.states;
        this.stateCount = keys.stateCount || keys.symbols.columnsCount;
        this.isKeysAvailable = true;
        this.revSymbols = new SymbolMatrix(65, keys.stateCount);
        this.revStates = new StateMatrix(65, keys.stateCount);
        this.reverseKeys();
    }

    constructor() {
        this.isKeysAvailable = false;
    }

    generateKeys(states:number, engine?:Array<number>) {
        if (states < 65) throw new Error('State must be gte 65');
        this.stateCount = states;
        this.symbols = new SymbolMatrix(65, states);
        this.revSymbols = new SymbolMatrix(65, states);
        this.symbols.setRows(base64Symbols);

        if (!engine) this.engine = Random.engines.browserCrypto;
        else this.engine = Random.engines.mt19937().seedWithArray(engine);
        let sr = new Random(this.engine);
        for (let i = 0; i < states; i++) {
            let newColumn = [...base64Symbols.split('')];
            sr.shuffle(newColumn);
            this.symbols.insertColumn(newColumn);
        }
        let str = new Random(this.engine);
        this.states = new StateMatrix(65, states);
        this.revStates = new StateMatrix(65, states);
        this.states.setRows(base64Symbols);
        const statesArray = Array(states).fill(0).map((e, i) => i);
        for (let i = 0; i < states; i++) {
            this.states.insertColumn(str.sample(statesArray, 65));
        }
        this.isKeysAvailable = true;
        this.reverseKeys();
    }

    reverseKeys() {
        const row = this.states.getRows();
        this.revStates.setRows(base64Symbols);
        this.revSymbols.setRows(base64Symbols);
        for (let i = 0; i < this.stateCount; i++) {
            const sCol = this.symbols.getColumn(i);
            const stCol = this.states.getColumn(i);
            const y = {};
            const z = {};

            for (let j in row) {
                y[row[j]] = sCol[j];
                z[row[j]] = stCol[j];
            }

            const shObj = revObj(y);
            const ysh = [];
            const zsh = [];

            row.forEach(c => {
                ysh.push(shObj[c]);
                zsh.push(z[shObj[c]]);
            });

            this.revSymbols.insertColumn(ysh);
            this.revStates.insertColumn(zsh);
        }
    }
}

export class Cipher {
    public keyGen:KeyGenerator;
    protected atm:Automat;

    constructor(states:number, keys?) {
        this.keyGen = new KeyGenerator();
        if (keys) {
            this.keyGen.setKeys(keys);
        } else {
            this.keyGen.generateKeys(states);
        }
        this.keyGen.reverseKeys();
        this.atm = new Automat(states);
    }

    private processText(symbols, states, data) {
        let newText = '';
        for (let ch of data) {
            newText += symbols.get(ch, this.atm.currentState);
            this.atm.changeStateTo(states.get(ch, this.atm.currentState));
        }
        this.atm.changeStateTo(0);
        return newText;
    }

    encrypt(buf:Buffer):string {
        const data = buf.toString('base64');
        return this.processText(this.keyGen.symbols, this.keyGen.states, data);
    }

    decrypt(buf:Buffer):string {
        const data = buf.toString();
        const ret = this.processText(this.keyGen.revSymbols, this.keyGen.revStates, data);
        return new Buffer(ret, 'base64').toString();
    }

    decryptBinary(buf:Buffer):Buffer {
        const data = buf.toString();
        const ret = this.processText(this.keyGen.revSymbols, this.keyGen.revStates, data);
        return new Buffer(ret, 'base64');
    }
}