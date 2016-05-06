import { Component } from 'angular2/core';
import {ROUTER_DIRECTIVES} from 'angular2/router';

@Component({
    selector: 'main-area',
    directives: [ROUTER_DIRECTIVES],
    template: `
    <div class="pane">
        <router-outlet></router-outlet>
    </div>
    `
})

export default class MainArea {
    constructor() { }
}