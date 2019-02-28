import { AuthenticationService } from './../../services/authentication.service';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Events, ToastController, LoadingController } from '@ionic/angular';

interface LoginForm {
  username: string;
  password: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  loginForm: LoginForm = {
    username: '',
    password: ''
  };

  constructor(private authService: AuthenticationService,
    private formModule: FormsModule,
    private events: Events,
    private toastController: ToastController,
    private loadingController: LoadingController) {

    this.events.subscribe('login-failed', (message: string) => {
      this.presentToast(message, 'danger', 5000);
    });

    this.events.subscribe('login-complete', () => {
      this.loadingController.dismiss();
    });

  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.loginForm.password = '';
  }

  login() {
    this.presentLoadingWithOptions();
    this.authService.login(this.loginForm.username, this.loginForm.password);
  }

  async presentToast(message: string, color: string, duration: number) {
    const toast = await this.toastController.create({
      message: message,
      duration: duration,
      color: color
    });
    this.loadingController.dismiss();
    toast.present();
  }

  async presentLoadingWithOptions() {
    const loading = await this.loadingController.create({
      spinner: 'circles',
      duration: 5000,
      message: 'Logging in...',
      translucent: true,
      cssClass: 'custom-class custom-loading'
    });
    return await loading.present();
  }

}
