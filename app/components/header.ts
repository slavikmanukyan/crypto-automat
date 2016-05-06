import { Component } from 'angular2/core';

const electron = require('electron');
const remote = electron.remote;

@Component({
    selector: 'app-header',
    template: `
     <header class="toolbar toolbar-header" style="-webkit-app-region: drag">
        <div class="btn-group pull-right" style="padding: 5px;">
          <button class="btn btn-mini btn-default" (click)="minimize()">
            <i class="fa fa-chevron-down" aria-hidden="true"></i>
          </button>
          <button class="btn btn-mini btn-primary" (click)="maximize()">
            <i class="fa fa-expand" aria-hidden="true"></i>
          </button>
          <button class="btn btn-mini btn-negative" (click)="close()">
            <i class="fa fa-times" aria-hidden="true"></i>
          </button>
        </div>
        <h1 class="title" style="font-size: 14px; margin-top: 5px;">Crypto automat</h1>
      </header>
    `
})

export default class Header {
    constructor() { }

    minimize() {
        remote.getCurrentWindow().minimize()
    }

    maximize() {
        const win = remote.getCurrentWindow();

        if (win.isMaximized()) {
            win.unmaximize()
        } else {
            win.maximize();
        }
    }

    close() {
        remote.getCurrentWindow().close();
    }


}