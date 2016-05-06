import {bootstrap} from 'angular2/platform/browser';
import {Component, provide} from 'angular2/core';
import {RouteConfig, ROUTER_PROVIDERS, APP_BASE_HREF, LocationStrategy, HashLocationStrategy} from 'angular2/router';

import Header from './components/header';
import NavBar from './components/navbar';
import MainArea from './components/main-area';

import Crypter from './components/crypter';
import Welcome from './components/welcome';

@Component({
    selector: 'app',
    directives: [Header, NavBar, MainArea],
    template: `
    <div class="window">
      <app-header></app-header>
      <div class="window-content">
        <div class="pane-group">
          <div class="pane-sm sidebar">
               <nav-bar></nav-bar>
          </div>
             <main-area></main-area>
        </div>
      </div>
    </div>
  `
})

@RouteConfig([
    { path: '/welcome', component: Welcome, name: 'Welcome', useAsDefault: true },
    { path: '/crypt', component: Crypter,  name: 'Crypter' }
])

export class App {

    constructor() { }

}

bootstrap(App, [
    ROUTER_PROVIDERS,
    provide(APP_BASE_HREF, { useValue: '/' }),
    provide(LocationStrategy, { useClass: HashLocationStrategy })
]);