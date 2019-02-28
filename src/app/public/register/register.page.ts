import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { FormsModule } from '@angular/forms';
import { Events, ToastController, LoadingController } from '@ionic/angular';


interface RegisterForm {
  username: string;
  password: string;
  first: string;
  last: string;
}


@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})

export class RegisterPage implements OnInit {

  registerForm: RegisterForm = {
    username: '',
    password: '',
    first: '',
    last: ''
  };

  constructor(private authService: AuthenticationService,
    private formModule: FormsModule,
    private events: Events,
    private toastController: ToastController,
    private loadingController: LoadingController) {

    this.events.subscribe('register-failed', (message: string) => {
      this.presentToast(message, 'danger', 5000);
    });

    this.events.subscribe('register-complete', () => {
      this.loadingController.dismiss();
    });

  }


  ngOnInit() {
  }

  register() {
    this.presentLoadingWithOptions();
    this.authService.register(this.registerForm.username, this.registerForm.password, this.registerForm.first, this.registerForm.last);
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
      message: 'Registering...',
      translucent: true,
      cssClass: 'custom-class custom-loading'
    });
    return await loading.present();
  }


}
