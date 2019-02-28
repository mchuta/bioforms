import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { SubmitterService, Submission } from '../../services/submitter.service';
import { Events } from '@ionic/angular';

const TOKEN_KEY_NAME = 'auth-token';

@Component({
  selector: 'app-submissions',
  templateUrl: './submissions.page.html',
  styleUrls: ['./submissions.page.scss'],
})

export class SubmissionsPage implements OnInit {

  private submissions: Submission[];

  constructor(private storage: Storage, private submitterService: SubmitterService, private events: Events) {

    this.events.subscribe('submissions-pushed', (submissions: Submission[]) => {
      this.submissions = submissions;
    });

   }

  ngOnInit() {
    this.storage.get(TOKEN_KEY_NAME).then(token => {
      this.storage.get(`${token.email}-submissions`).then((submissions: Submission[]) => {
        this.submissions = submissions;

        console.log(submissions);
      });
    });
  }

  initiateUpload() {
    console.log('initiateUpload');
    this.submitterService.pushForms();
  }

}
