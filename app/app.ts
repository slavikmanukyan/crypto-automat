import {bootstrap} from 'angular2/platform/browser';
import {Component} from 'angular2/core';
import {NgFor} from 'angular2/common';

@Component({
    selector: 'app',
    template: `
    <div class="window">
      <header class="toolbar toolbar-header" style="-webkit-app-region: drag">
        <div class="btn-group pull-right">
          <button class="btn btn-mini btn-default">
            <i class="fa fa-chevron-down" aria-hidden="true"></i>
          </button>
          <button class="btn btn-mini btn-primary">
            <i class="fa fa-expand" aria-hidden="true"></i>
          </button>
          <button class="btn btn-mini btn-negative">
            <i class="fa fa-times" aria-hidden="true"></i>
          </button>
        </div>
        <h1 class="title" style="font-size: 14px; margin-top: 3px;">Crypto automat</h1>
      </header>
      <div class="window-content">
        <div class="pane-group">
          <div class="pane-sm sidebar">...</div>
          <div class="pane">...</div>
        </div>
      </div>
      <footer class="toolbar toolbar-footer">
        <h1 class="title">Footer</h1>
      </footer>
    </div>
  `
})

export class App {

    constructor() { }

}

bootstrap(App);