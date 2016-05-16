import {Component, OnInit, OnDestroy, ViewChild, ElementRef} from 'angular2/core';
import {NgZone} from "angular2/core";
import {Cipher} from "../services/Crypto";
import {connect} from "net";

const ipcRenderer = require('electron').ipcRenderer;
declare var jQuery;

@Component({
    selector: 'communication',
    styles: [
        `
            #send {
                resize: vertical;
                min-height: 100px;
                max-height: 150px;
                width: 50%
            }
            .msg {
                padding: 5px;
                border: 1px solid #eeeeee;
                border-radius: 5px;
            }
            .msg-other {
                margin-left: 20px;
                border-color: pink;
            }
            .msg-my {
                margin-right: 20px;
                border-color: blue;
            }
        `
    ],
    template: `
        <div class="text-center">
            <h2>Communicate with others in your network</h2>
            <div class="container-fluid">
              <div class="text-left clearfix">
                 <p class="alert-success pull-left">Your ip in this network: <b>{{ip}}</b></p>
                    <div class="pull-right" [hidden]="connected">
                        <button [hidden]="listening" class="btn" [ngClass]="{'btn-positive':!listening, 'btn-danger':listening}" (click)="listen()" [disabled]="!ip">{{action}}</button>
                        <p [hidden]="!listening" class="text-info">Listening {{listening}}</p>
                        <p [hidden]="!error">{{error | json}}</p>
                    </div>
                    <div [hidden]="!connected" class="pull-right">
                        <button class="btn-danger" (click)="disconnect()">Disconnect</button>
                        <p class="text-muted">Connected to: <b>{{connected}}</b></p>
                    </div>
              </div>
                <form  [hidden]="connected || listening" class="form-inline" (submit)="connect()">
                    <div class="form-group">
                        <label style="margin-bottom: -5px;">IP to connect: </label>
                        <input [(ngModel)]="remote">
                    </div>
                    <button type="submit" class="btn btn-primary">Connect</button>
                </form>
                <div [hidden]="!connected">
                  <form (submit)="send()">
                       <div class="form-group">
                            <div>
                              <textarea id="send" [(ngModel)]="message" (keydown)="onKeyDown($event)"></textarea>
                            </div>
                            <div>
                                <button type="submit" class="btn btn-success" >Send</button>
                            </div>
                       </div>
                       <div #messagesDiv [ngStyle]="{maxHeight: messagesHeight + 'px'}" style="overflow-y: scroll;" (window:resize)="onWindowResize($event)">
                            <div class="clearfix" *ngFor="#msg of messages">
                                <p class="msg" [ngClass]="{'pull-left msg-other': !msg.my, 'pull-right msg-my':msg.my}">{{msg.message}}</p>
                            </div>
                       </div>
                  </form>
                </div>
            </div>
        </div>
    `
})

export default class Communcation implements OnInit, OnDestroy {
    ip:string;
    error:boolean;
    listening:string;
    action:string;
    connected:string;
    messages:any[];
    message:string;
    remote:string;
    cipher;
    messagesHeight:number;
    @ViewChild('messagesDiv') private messagesDiv: ElementRef;

    constructor(private _zone:NgZone) {

    }

    ngOnInit() {
        ipcRenderer.send('get-ip');
        ipcRenderer.on('get-ip', (event, ip) => this.ip = ip);
        this.action = 'Start listening';

        this.messages = [];
        ipcRenderer.on('data', (event, data) => this._zone.run(() => {
            this.messages.push({
                my: false,
                message: this.cipher.decrypt(data)
            });
            this.scrollToBottom();
        }));
        ipcRenderer.on('connected', (event, seed, remoteIp) => this._zone.run(() => {
            this.connected = remoteIp;
            this.cipher = new Cipher(72, null, seed.toString('hex').match(/[a-f0-9]{8}/g).map(n => parseInt(n, 16)));
        }));
        ipcRenderer.on('disconnected', () => this._zone.run(() => {
            this.action = 'Start listening';
            this.listening = null;
            this.connected = null;
        }));

        ipcRenderer.on('error', (e, err) => {
            console.log(err);
        })

        this.messagesHeight = 300;
        jQuery('#send').textareaAutoSize();

    }

    listen() {
        if (!this.listening) {
            ipcRenderer.send('listen', this.ip);
            ipcRenderer.on('listen', (event, err, address) => this._zone.run(() => {
                    if (err) {
                        this.listening = null;
                        return this.error = err
                    }

                    this.action = 'Stop listening';
                    this.error = false;
                    this.listening = address.address;
                })
            );
        } else {
            ipcRenderer.send('stop-listening');
            ipcRenderer.on('stop-listening', (event, err) => this._zone.run(() => {
                    if (err) {
                        return this.error = err;
                    }
                    this.error = null;
                    this.action = 'Start listening';
                    return this.listening = null;
                })
            );
        }
    }

    send() {
        if (!this.message.length) return;
        ipcRenderer.send('send', new Buffer(this.cipher.encrypt(new Buffer(this.message))));
        ipcRenderer.once('recived', () => this._zone.run(() => {
            this.messages.push({my: true, message: this.message});
            this.message = "";
            this.scrollToBottom();
        }));
    }

    connect() {
        ipcRenderer.send('connect', this.remote)
    }

    disconnect() {
        ipcRenderer.send('disconnect');
    }

    ngOnDestroy() {
        this.disconnect();
    }

    onWindowResize(event) {
        this.messagesHeight = event.target.innerHeight - 300;
    }

    scrollToBottom(): void {
            this._zone.run(() => this.messagesDiv.nativeElement.scrollTop = this.messagesDiv.nativeElement.scrollHeight);
    }

    onKeyDown(e) {
        if (e.keyCode === 13 && e.ctrlKey) {
            this.send();
            e.preventDefault();
        }
    }

}