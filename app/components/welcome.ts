import { Component } from 'angular2/core';
import {ROUTER_DIRECTIVES, RouteParams, RouteConfig} from 'angular2/router';

@Component({
    directives: [ROUTER_DIRECTIVES],
    template: `
        <div class="text-center">
            <h3 style="color: blue;">Welcome Automaton Cryptographic System</h3>
            <p>Use it right now!</p>
            <a [routerLink]="['Crypter']" class="btn btn-large btn-positive" style="cursor: pointer">
                Use
            </a>
        </div>
    `
})

export default class Welcome {
    constructor() { }
}