import {Component, OnInit} from 'angular2/core';

const ipcRenderer = require('electron').ipcRenderer;

@Component({
    selector: 'communication',
    template: `
        <div class="text-center">
            <h2>Communicate with others in your network</h2>
            <div class="container-fluid">
              <div class="text-left">
                 <p class="alert-success pull-left">Your ip in this network: <b>{{ip}}</b></p>
                    <div class="pull-right">
                        <button class="btn btn-positive" (click)="listen()" [disabled]="!ip">Start listening</button>
                    </div>
              </div>
              <form>

              </form>
            </div>
        </div>
    `
})

export default class Communcation implements OnInit{
    ip: string;

    ngOnInit() {
        ipcRenderer.send('get-ip');
        ipcRenderer.once('get-ip', (event, ip) => this.ip = ip);
    }

    click() {
        ipcRenderer.send('listen', this.ip);
    }
}