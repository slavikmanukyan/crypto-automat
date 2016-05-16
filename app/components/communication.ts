import {Component, OnInit} from 'angular2/core';
import {NgZone} from "angular2/core";

const ipcRenderer = require('electron').ipcRenderer;

@Component({
    selector: 'communication',
    styles: [
        `
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
                <form [hidden]="connected || listening" class="form-inline" (sumbit)="connect()">
                    <div class="form-group">
                        <label style="margin-bottom: -5px;">IP to connect: </label>
                        <input  [ngModel]="remote">
                    </div>
                    <button type="submit" class="btn btn-primary">Connect</button>
                </form>
              <form [hidden]="!connected" (submit)="send()">
                   <div class="form-group">
                        <div>
                          <textarea style="resize: vertical;" [(ngModel)]="message"></textarea>
                        </div>
                        <div class="col-lg-4">
                            <button type="submit" class="btn btn-success" >Send</button>
                        </div>
                   </div>
                   <div style="max-height: 200px; overflow-y: scroll;">
                        <div class="clearfix" *ngFor="#msg of messages">
                            <p class="msg" [ngClass]="{'pull-left msg-other': !msg.my, 'pull-right msg-my':msg.my}">{{msg.message}}</p>
                        </div>
                   </div>
              </form>
            </div>
        </div>
    `
})

export default class Communcation implements OnInit {
    ip:string;
    error:boolean;
    listening:string;
    action:string;
    connected: string;
    messages: any[];
    message:string;

    constructor(private _zone:NgZone) {

    }

    ngOnInit() {
        ipcRenderer.send('get-ip');
        ipcRenderer.on('get-ip', (event, ip) => this.ip = ip);
        this.action = 'Start listening';

        this.messages = [];
        ipcRenderer.on('data', (event, data) => this._zone.run(() => this.messages.push({ my: false, message: data.toString() })));
        ipcRenderer.on('connected', (event, remoteIp) => this._zone.run(() => { console.log(remoteIp); this.connected = remoteIp; }));
    }

    listen() {
        if (!this.listening) {
            ipcRenderer.send('listen', this.ip);
            ipcRenderer.once('listen', (event, err, address) => this._zone.run(() => {
                    if (err) {
                        console.log(err)
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
            ipcRenderer.once('stop-listening', (event, err) => this._zone.run(() => {
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
        this.messages.push({ my: true, message: this.message });
        this.message = "";
    }
}