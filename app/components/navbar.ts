import { Component } from 'angular2/core';
import {ROUTER_DIRECTIVES, RouteParams, RouteConfig} from 'angular2/router';

import Crypter from './crypter';
import Welcome from './welcome';

@Component({
    selector: 'nav-bar',
    directives: [ROUTER_DIRECTIVES],
    styles: [
        `
        nav a {
            text-decoration: none;
        }
        nav a:hover {
            cursor: pointer;
        }
        nav .ico {
            height: 140px;
        }
        nav .ico img {
            display: block;
            margin: 8px auto;
        }

        nav .nav-group-item  {
            padding-left: 15px;
        }
        `
    ],
    template: `
        <nav class="nav-group">
          <h5 class="nav-group-title text-center">Crypto Automat System</h5>
          <div class="ico">
            <img src="images/crypto.png">
          </div>
          <a class="nav-group-item" [routerLink]="['Crypter']">
            <span class="icon icon-lock"></span>
            Encrypt/Decrypt
          </a>
          <a class="nav-group-item">
            <span class="icon icon-signal"></span>
            Connect
          </a>
          <a class="nav-group-item">
            <span class="icon icon-info"></span>
            About
          </a>
        </nav>
    `
})

export default class NavBar {
    constructor() { }
}