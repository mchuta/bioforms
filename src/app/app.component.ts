import { Component } from '@angular/core';

import { Platform, Events } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { SubmitterService } from './services/submitter.service';
import { AuthenticationService } from './services/authentication.service';
import { Router } from '@angular/router';
import { FormsService } from './services/forms-service.service';


interface PageItem {
  title: string;
  url?: string;
  icon: string;
  loggedin: boolean;
  click?: string;
  badge?: number;
  color?: string;
  display: boolean;
}

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  public appPages: PageItem[] = [
    {
      title: 'Login',
      url: '/login',
      icon: 'log-in',
      loggedin: false,
      display: true
    },
    {
      title: 'Register',
      url: '/register',
      icon: 'create',
      loggedin: false,
      display: true
    },
    {
      title: 'Forms',
      url: '/members/forms',
      icon: 'list',
      loggedin: true,
      display: false
    }
    ,
    {
      title: 'Submissions',
      url: '/members/submissions',
      icon: 'cloud-upload',
      badge: 0,
      color: 'success',
      loggedin: true,
      display: false
    },
    {
      title: 'Logout',
      click: 'logout',
      icon: 'log-out',
      loggedin: true,
      display: false
    }
  ];

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private events: Events,
    private submitterService: SubmitterService,
    private authenticationService: AuthenticationService,
    private router: Router,
    private formsService: FormsService
  ) {
    this.initializeApp();

    this.events.subscribe('submissions-changed', (submissionCount: number) => {
      for (const page of this.appPages) {
        if (page.title === 'Submissions') {
          page.badge = submissionCount;
          page.color = page.badge === 0 ? 'success' : 'danger';
        }
      }
    });

  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });

     this.authenticationService.authenticationState.subscribe(state => {
       // console.log('checking state. state is :' + state);
        if (state) {
          for (const item of this.appPages) {
            item.display = item.loggedin;
          }
          this.router.navigate(['members', 'forms']);
          this.submitterService.refreshSubmissionCount();
        } else {

          for (const item of this.appPages) {
            item.display = !item.loggedin;
          }
          
          this.formsService.clearForms();
          this.router.navigate(['login']);

        }
      });
  }

  logout() {
    this.authenticationService.logout();
  }

  isDisplayable(pageitem: PageItem) {
    return pageitem.display;
  }

}
