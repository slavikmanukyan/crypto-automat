import {debug} from "util";
/**
 * Created by Slavik on 4/28/16.
 */

const  PrettyTable  = require('prettytable');
import { forOf } from '../lib/helpers';
import {base64Symbols} from "../lib/helpers";
const zlib = require('zlib');
const denodify = require('promise-denodeify');


const gzip = denodify(zlib.gzip.bind(zlib), Promise, false);
const unzip = denodify(zlib.unzip.bind(zlib), Promise, false);

export  class Matrix<T> {
    protected rows:Array<string>;
    protected columns: Array<Array<T>>;
    protected table:Map<string, Array<T>>;
    static from(compressed, stateCount):Promise<any> {
        const zippedKey = compressed.match(/^======= Crypto Automaton Key =======\n(.+)\n======= End Key =======\n======= Crypto Automaton Key =======\n(.+)\n======= End Key =======$/i);
        if (!zippedKey || !zippedKey[1] || !zippedKey[2])
            return Promise.reject('Wrong key');
        return Promise.all([unzip(new global.Buffer(zippedKey[1], 'base64')), unzip(new global.Buffer(zippedKey[2], 'base64'))]).
            then(([symbols, states]) => {
            return [SymbolMatrix.fromTable(new Map(JSON.parse(symbols.toString())), stateCount), StateMatrix.fromTable(new Map(JSON.parse(states.toString())), stateCount)];
        })
    }
    constructor(public rowsCount:number, public columnsCount:number) {
        this.rows = Array<string>();
        this.columns = Array<Array<T>>();
        this.table = new Map<string, Array<T>>();
    }
    insertColumn(col:Array<T>):Matrix<T> {
        this.columns.push(col);
        col.forEach((c, i) => this.table.get(this.rows[i]).push(c));
        return this;
    }
    setRows(row:string):Matrix<T> {
        this.rows = row.split('');
        this.rows.forEach(row => this.table.set(row, []));
        return this;
    }
    get(r:string, c:number) {
        return this.table.get(r)[c];
    }

    getColumn(n:number) {
        return this.columns[n];
    }

    getRows() {
        return this.rows;
    }

    static fromTable(table, stateCount) {
        const matrix = new Matrix(65, stateCount);
        matrix.setRows(base64Symbols);
        const columns = Array(stateCount).fill(0).map(() => new Array());

        for (let row of forOf(table.entries())) {
            for(let i in row[1]) {
                columns[i].push(row[1][i]);
            }
        }
        for (let col of columns) {
            matrix.insertColumn(col);
        }
        matrix.table = table;
        return matrix;
    }

    getTable() {
        return forOf(this.table.entries());
    }

    dump(){
        const pt = new PrettyTable();
        const headers = [ '', ...Array(this.columnsCount).fill(0).map((e, i) => i.toString()) ];
        const rows = [];
        let it = this.table.entries();
        for (let r of forOf(it)) {
            rows.push([r[0], ...r[1]]);
        }
        pt.create(headers, rows);
        pt.print();
    }

    toString() {
        return gzip(JSON.stringify(forOf(this.table.entries())))
                .then(buf => `======= Crypto Automaton Key =======\n${buf.toString('base64')}\n======= End Key =======`);
    }
}

export class SymbolMatrix extends Matrix<string> {
    constructor(rowsCount:number, columnsCount:number){
        super(rowsCount, columnsCount);
    }
}

export class StateMatrix extends Matrix<number> {
    constructor(rowsCount:number, columnsCount:number){
        super(rowsCount, columnsCount);
    }
}
