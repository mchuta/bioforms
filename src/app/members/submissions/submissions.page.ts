import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { SubmitterService, Submission } from '../../services/submitter.service';
import { Events, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';

const TOKEN_KEY_NAME = 'auth-token';

@Component({
  selector: 'app-submissions',
  templateUrl: './submissions.page.html',
  styleUrls: ['./submissions.page.scss'],
})

export class SubmissionsPage implements OnInit {

  private submissions: Submission[];

  constructor(private storage: Storage, 
    private submitterService: SubmitterService,
    private events: Events, 
    private loadingController: LoadingController,
    private router: Router) {

    this.events.subscribe('submissions-pushed', (submissions: Submission[]) => {
      console.log('submission-pushed caught');
      this.submissions = submissions;
      this.loadingController.dismiss();

      if (submissions.length === 0) {
        this.router.navigate(['members', 'forms']);
      }
    });

    this.events.subscribe('submission-failed', (error) => {
      console.log(error);
      this.loadingController.dismiss();
    });

   }

  ngOnInit() {
    this.storage.get(TOKEN_KEY_NAME).then(token => {
      this.storage.get(`${token.email}-submissions`).then((submissions: Submission[]) => {
        this.submissions = submissions;
      });
    });
  }

  initiateUpload() {
    this.presentLoadingWithOptions();
    this.submitterService.pushForms();
  }

  clearStoredSubmissions() {
    this.submitterService.clearStored();
  }

  deleteSubmission(submission: Submission) {

    this.submitterService.delete(submission);
  }

  async presentLoadingWithOptions() {
    const loading = await this.loadingController.create({
      spinner: 'lines',
      duration: 30000,
      message: 'Submitting data...',
      translucent: true,
      cssClass: 'custom-class custom-loading'
    });
    return await loading.present();
  }

}
