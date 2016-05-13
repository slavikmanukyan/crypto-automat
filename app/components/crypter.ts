import { Component, NgZone } from 'angular2/core';
import { NgFor } from 'angular2/common';
import { Cipher } from '../services/Crypto';
import {Matrix} from '../services/Matrix';

import ByteFormat from '../filters/byte-format';
import Config from '../lib/config';

import { Loading } from './loading';
import {OnInit} from "angular2/core";
import {base64Symbols, getFileClass} from "../lib/helpers";
import SaveDialogOptions = Electron.Dialog.SaveDialogOptions;
const denodefiy = require('promise-denodeify');

const { remote, clipboard } = require('electron');
const ipcRenderer = require('electron').ipcRenderer;
const dialog = remote.dialog;

const fs = require('fs');
const writeFile = denodefiy(fs.writeFile.bind(fs), Promise, false);
const readFile = denodefiy(fs.readFile.bind(fs), Promise, false);
const write = denodefiy(fs.write.bind(fs), Promise, false);

const path = require('path');
const fileType = require('file-type');


declare var jQuery;

@Component({
    styles: [
        `
         textarea {
          resize: vertical;
          min-height: 150px;
          max-height: 220px;
         }

         textarea[disabled] {
            cursor: default;
            -webkit-user-select: initial;
         }

         .not-visible {
            visibility: hidden;
         }
        `
    ],
    pipes: [ByteFormat],
    template: `
        <div class="text-center container-fluid">
            <h2>Encrypt/Decrypt your information</h2>
            <div class="clearfix">
                <div class="pull-left alert-info" style="margin-top: 3px;">
                Keys: {{readyState}}
                </div>
                <div class="pull-right">
                   <button (click)="generateKeys()" class="btn btn-positive">Generate Keys</button>
                   <button (click)="getKeys()" class="btn">Keys from file</button>
                   <button *ngIf="readyState == 'Ready'" (click)="seeKeys()" class="btn">See keys</button>
                   <button *ngIf="readyState == 'Ready'" (click)="saveKeys()" class="btn">Save keys in file</button>
                </div>
            </div>
        <br>
        <div [hidden]="readyState != 'Ready' || isSelectedBinary">
            <form>
                <div class="form-group">
                    <label>Enter text: </label>
                    <div class="dropdown pull-left">
                      <button class="btn btn-primary dropdown-toggle" type="button" id="dropdownMenu1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">
                        Use file
                        <span class="caret"></span>
                      </button>
                      <ul class="dropdown-menu" aria-labelledby="dropdownMenu1">
                        <li><a (click)="fromTextFile()">Text from file</a></li>
                        <li><a (click)="selectBinary()">Binary file</a></li>
                      </ul>
                    </div>
                    <button (click)="paste()" class="pull-right btn btn-info">Paste from clipboard</button>
                    <textarea id="input" class="form-control" [(ngModel)]="text"></textarea>
                </div>
                <div class="form-group text-center">
                    <div class="btn-group btn-group-lg" role="group">
                        <button (click)="encrypt()" class="btn btn-primary">Encrypt</button>
                        <button (click)="change()" class="btn btn-primary"><i class="fa fa-arrows-v" aria-hidden="true"></i></button>
                        <button (click)="decrypt()" class="btn btn-primary">Decrypt</button>
                    </div>
                </div>
                <div class="form-group">
                    <label>Result: </label>
                    <button (click)="saveInFile()" class="pull-left btn btn-success" [ngClass]="{'not-visible': !result.length}">Save in file</button>
                    <button (click)="copy()" class="pull-right btn btn-positive">Copy to clipboard</button>
                    <textarea class="form-control" [value]="result" disabled></textarea>
                </div>
            </form>
         </div>
         <div *ngIf="isSelectedBinary">
            <div>
                <h5>Encrypt binary files</h5>
                <button (click)="returnTextMode()" class="btn btn-primary"><i class="fa fa-arrow-left"></i> Return</button>
                <button (click)="selectBinary()" class="btn btn-success"><i class="fa fa-file"></i>Select file</button>
                <div style="font-size: 70px;"><i class="fa" [ngClass]="fileClass()"></i> </div>
                <p>Name: {{file.fileName}}</p>
                <p>Size:: {{file.buffer.length | byteFormat}}</p>
                <div>
                    <button class="btn btn-positive" (click)="encryptFile()">Encrypt</button>
                    <button class="btn btn-negative" (click)="decryptFile()">Decrypt</button>
                </div>
                <div *ngIf="resultFile.buffer">
                    <div style="font-size: 70px;"><i class="fa" [ngClass]="resultFileClass()"></i> </div>
                    <p>Size:: {{resultFile.buffer.length | byteFormat}}</p>
                    <div>
                        <button class="btn btn-warning" (click)="saveFile()">Save</button>
                    </div>
                </div>
            </div>
         </div>
        </div>
    `,
    directives: [[Loading]]
})

export default class Crypter implements OnInit{
    cp:Cipher;
    readyState:string;
    result: string;
    text:string;
    isSelectedBinary:boolean;
    file;
    resultFile;
    fileName: string;
    constructor(private _zone:NgZone) { }

    ngOnInit() {
        this.readyState = 'Not ready';
        this.result = '';
        this.resultFile = {};
        this.text = '';
        this.file = {};
        jQuery('#input').textareaAutoSize();
    }

    returnTextMode() {
        this.isSelectedBinary = false;
    }

    encryptFile() {
        if (!this.file.buffer) return;
        this.resultFile.decrypted = false;
        this.resultFile.buffer = new Buffer(this.cp.encrypt(this.file.buffer));
    }

    decryptFile() {
        if (!this.file.buffer) return;
        this.resultFile.decrypted = true;
        this.resultFile.buffer = this.cp.decryptBinary(this.file.buffer);
        this.resultFile.ext =  fileType(this.resultFile.buffer) && fileType(this.resultFile.buffer).ext || '*';
    }

    fileClass() {
        return this.file ? getFileClass(fileType(this.file.buffer) || { mime: 'file'}) : 'fa-file-o';
    }

    resultFileClass() {
        if (!this.resultFile.decrypted) {
            return 'fa-file-o';
        }
        return getFileClass(fileType(this.resultFile.buffer) || { mime: 'file' });
     }

    saveFile() {
        let options:SaveDialogOptions = {
            filters: [this.resultFile.decrypted ? { name: `${this.resultFile.ext} file`, extensions: [this.resultFile.ext] }
                : { name: 'All files', extensions: ['*'] }],
            title: 'Save result',
        };
        dialog.showSaveDialog(null,
            options
            ,
            (file) => {
                if (file === undefined) return;
                let prom;
                if (this.resultFile.decrypted) {
                    prom = writeFile(file, new global.Buffer(this.resultFile.buffer));
                } else {
                    prom = writeFile(file, this.resultFile.buffer);
                }

                return prom
                    .then(() => dialog.showMessageBox({ message: 'Result has been successfuly saved', buttons: ['Ok'] }))
                    .catch((e) => dialog.showErrorBox('Error', `Something went wrong\n${e}`));
            }
        )
    }

    selectBinary() {
        dialog.showOpenDialog(
            {
                title: 'Open binary file',
                filters: [
                    { name: 'All', extensions: ['*'] }
                ]
            },
            (file) => {
                if (file === undefined) return;
                this.file.fileName = path.basename(file[0]);
                this.file.fileDir = path.dirname(file[0]);
                return readFile(file[0])
                    .then((data) => this._zone.run(() => { this.file.buffer = data; this.resultFile = {}; this.isSelectedBinary = true;}))
                    .catch((e) => dialog.showErrorBox('Error', `Something went wrong.\n${e}`))
            }
        )
    }

    fromTextFile() {
        dialog.showOpenDialog(
            {
                title: 'Open text file',
                filters: [
                    { name: 'All', extensions: ['*'] }
                ]
            },
            (file) => {
                if (file === undefined) return;
                return readFile(file[0])
                    .then((data) => this._zone.run(() => this.text = data.toString()))
                    .catch((e) => dialog.showErrorBox('Error', `Something went wrong.\n${e}`))
            }
        )
    }

    saveInFile() {
        dialog.showSaveDialog(null,
            {
                filters: [{ name: 'All', extensions: ['*']}],
                title: 'Save result',
            },
            (file) => {
                if (file === undefined) return;
                return writeFile(file, this.result)
                    .then(() => dialog.showMessageBox({ message: 'Result has been successfuly saved', buttons: ['Ok'] }))
                    .catch((e) => dialog.showErrorBox('Error', `Something went wrong\n${e}`));
            }
        )
    }

    paste() {
        this.text = clipboard.readText();
        this.result = '';
    }

    copy() {
        clipboard.writeText(this.result);
    }

    change() {
        this.text = this.result;
        this.result = '';
    }

    encrypt() {
        this.result = this.cp.encrypt(new Buffer(this.text));
    }

    decrypt() {
        this.result = this.cp.decrypt(new Buffer(this.text));
    }

    generateKeys() {
        this.cp = new Cipher(Config.statesCount);
        this.readyState = 'Ready';
    }
    private checkKeys() {
        if (!this.cp || !this.cp.keyGen.isKeysAvailable) {
            dialog.showMessageBox(
                {
                    message: 'Pleas first generate keys',
                    type: 'warning',
                    title: 'Warning',
                    buttons: ['Ok']
                });
            return false;
        }
        return true;
    }
    getKeys() {
        dialog.showOpenDialog(
            {
                title: 'Open key',
                filters: [
                    { name: 'Crypto keys', extensions: ['ckey'] },
                    { name: 'All', extensions: ['*'] }
                ]
            },
            (file) => {
                if (file === undefined) return;
                return readFile(file[0])
                    .then((data) => Matrix.from(data.toString(), Config.statesCount))
                    .then(([symbols, states]) => {
                        const keys = {
                            symbols,
                            states,
                            stateCount: Config.statesCount
                        }
                        this._zone.run(() => {
                            if (!this.cp) {
                                this.cp = new Cipher(Config.statesCount, keys);
                            } else {
                                this.cp.keyGen.setKeys(keys);
                            }
                            this.readyState = 'Ready';
                        });
                    })
                    .catch((e) => dialog.showErrorBox('Error', `Something went wrong.\n${e}`))
            }
        )
    }
    saveKeys() {
        if (!this.checkKeys()) return;
        dialog.showSaveDialog(null,
            {
                filters: [{ name: 'Crypto keys', extensions: ['ckey']}],
                title: 'Save keys',
                defaultPath: 'key'
            },
            (file) => {
                if (file === undefined) return;
                return Promise.all([this.cp.keyGen.symbols.toString(), this.cp.keyGen.states.toString()])
                    .then(([symbs, states]) => writeFile(file, symbs + '\n' + states))
                    .then(() => dialog.showMessageBox({ message: 'Keys has been successfuly saved', buttons: ['Ok'] }))
                    .catch((e) => dialog.showErrorBox('Error', `Something went wrong\n${e}`));
            }
        )
    }

    seeKeys() {
        if (!this.checkKeys()) return;

        ipcRenderer.send('show-keys', {
            symbols: {
                stateCount: this.cp.keyGen.stateCount,
                table: this.cp.keyGen.symbols.getTable()
            },
            states: {
                stateCount: this.cp.keyGen.stateCount,
                table: this.cp.keyGen.states.getTable()
            }
        });
    }
}