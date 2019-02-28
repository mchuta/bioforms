import { Platform, Events } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { BehaviorSubject } from 'rxjs';
import { AwsService } from './aws.service';


const TOKEN_KEY_NAME = 'auth-token';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {


  constructor(private storage: Storage, private plt: Platform, private awsService: AwsService, private events: Events) {
    this.plt.ready().then(() => {
        this.checkToken();
    });
  }

  authenticationState = new BehaviorSubject(false);

  checkToken() {
    this.storage.get(TOKEN_KEY_NAME).then(res => {
      if (res) {
        // console.log('res is something');
        this.authenticationState.next(true);
      } else {
        // console.log('res is nothing');
      }
    });
  }

  login(username: string, password: string) {
    this.awsService.authenticate(username, password).subscribe(async result => {
      if (result.status === 'success') {
        await this.storage.set(TOKEN_KEY_NAME, {'token': result.token, 'email': username});
        this.authenticationState.next(true);
        this.events.publish('login-complete');
      } else {
        this.events.publish('login-failed', result.error);
      }
    });
  }

  register(username: string, password: string, first: string, last: string) {
    this.awsService.register(username, password, first, last).subscribe(async result => {
      if (result.status === 'success') {
        await this.storage.set(TOKEN_KEY_NAME,  {'token': result.token, 'email': username});
        this.authenticationState.next(true);
        this.events.publish('login-complete');
      } else {
        this.events.publish('login-failed', result.error);
      }
    });
  }



  async logout() {
    await this.storage.remove(TOKEN_KEY_NAME);
    this.authenticationState.next(false);
  }

  isAuthenticated() {
    // console.log('checking authentication');
    // console.log(this.authenticationState.value);
    return this.authenticationState.value;
  }


}
