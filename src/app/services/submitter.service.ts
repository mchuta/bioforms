import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Events, IonItemSliding } from '@ionic/angular';
import { AwsService } from './aws.service';


export interface SubmissionItem {
  name: string;
  value: any;
}

export interface Submission {
  form: string;
  name: string;
  owner: string;
  timestamp: number;
  datestring: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  items: SubmissionItem[];
}

interface PreSubmission {
  form: string;
  owner: string;
  items: PreSubmissionItem[];
}

interface PreSubmissionItem {
  timestamp: number;
  datestring: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  user: string;
  items: SubmissionItem[];
}

export interface Submit {
  timestamp: number;
  form: string;
}

const TOKEN_KEY_NAME = 'auth-token';

@Injectable({
  providedIn: 'root'
})
export class SubmitterService {

  constructor(private storage: Storage, private events: Events, private awsService: AwsService) {

    const that = this;

    this.events.subscribe('submission-complete', (event) => {
      const token = event[0];
      const submits: Submit[] = event[1];

      this.storage.get(`${token.email}-submissions`).then((submissions: Submission[]) => {
        const newSubmissions: Submission[] = [];

        for (const sub of submissions) {
          if (!submits.indexOf({
            form: sub.form,
            timestamp: sub.timestamp
          })) {
            newSubmissions.push(sub);
          }
        }

        this.storage.set(`${token.email}-submissions`, newSubmissions);

        that.events.publish('submissions-changed', newSubmissions.length);
        that.events.publish('submissions-pushed', newSubmissions);

      });
    });


  }

  clearStored() {
    this.storage.get(TOKEN_KEY_NAME).then(token => {
       this.storage.set(`${token.email}-submissions`, []);
       this.events.publish('submissions-pushed', []);
       this.events.publish('submissions-changed', 0);
    });
  }

  delete(submission: Submission) {

    const that = this;

    this.storage.get(TOKEN_KEY_NAME).then(token => {
      that.storage.get(`${token.email}-submissions`).then((submissions: Submission[]) => {

        const newSubmissions: Submission[] = [];

        for (const sub of submissions) {
          if ((sub.form !== submission.form) || (sub.timestamp !== submission.timestamp)) {
            newSubmissions.push(sub);
          }
        }

        this.storage.set(`${token.email}-submissions`, newSubmissions).then(_ => {
          that.events.publish('submissions-changed', newSubmissions.length);
          that.events.publish('submissions-updated', newSubmissions);
        });

      });
    });
  }

  submitForm(formid: string, owner: string, formname: string, formitems: SubmissionItem[], position: Position) {

    const that = this;

    this.storage.get(TOKEN_KEY_NAME).then(token => {
      that.storage.get(`${token.email}-submissions`).then((submissions: Submission[]) => {

        console.log(submissions);

        if (!submissions) {
          submissions = [];
        }

        const date: Date = new Date(position.timestamp);

        const datestring: string = date.getFullYear() + '-' +
          (date.getMonth() + 1).toString().padStart(2, '0') + '-' +
          date.getDate().toString().padStart(2, '0') + ' ' +
          date.getHours().toString().padStart(2, '0') + ':' +
          date.getMinutes().toString().padStart(2, '0') + ':' +
          date.getSeconds().toString().padStart(2, '0');

        submissions.push({
              owner: owner,
              form: formid,
              name: formname,
              timestamp: position.timestamp,
              datestring: datestring,
              accuracy: position.coords.accuracy,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              items: formitems
            });

        that.events.publish('submissions-changed', submissions.length);

        that.storage.set(`${token.email}-submissions`, submissions);

      });
    });
  }

  pushForms() {

    const that = this;

    this.storage.get(TOKEN_KEY_NAME).then(token => {
      that.storage.get(`${token.email}-submissions`).then((submissions: Submission[]) => {
        if (submissions && submissions.length) {

          const presubmits: PreSubmission[] = [];

          for (const submit of submissions) {
            let presubmitFound = false;

            for (const presubmit of presubmits) {
              if (presubmit.form === submit.form) {
                presubmitFound = true;

                if (!presubmit.owner) {
                  presubmit.owner = submit.owner;
                }

                presubmit.items.push({
                  timestamp: submit.timestamp,
                  datestring: submit.datestring,
                  accuracy: submit.accuracy,
                  latitude: submit.latitude,
                  longitude: submit.longitude,
                  user: token.email,
                  items: submit.items
                });
              }
            }

            if (!presubmitFound) {
              presubmits.push({
                form: submit.form,
                owner: submit.owner,
                items: [{
                  timestamp: submit.timestamp,
                  datestring: submit.datestring,
                  accuracy: submit.accuracy,
                  latitude: submit.latitude,
                  longitude: submit.longitude,
                  user: token.email,
                  items: submit.items
                }]
              });
            }
          }

          for (const presubmit of presubmits) {
            this.awsService.submitForms(token, presubmit).subscribe(async result => {
              if (result.status === 'success') {
                console.log(result.submits);
                this.events.publish('submission-complete', [token, result.submits]);
              } else {
                this.events.publish('submission-failed', result.error);
              }
            });
          }
        } else {
          this.events.publish('submissions-pushed', []);
        }

      });
    });
  }

  refreshSubmissionCount() {

    const that = this;

    this.storage.get(TOKEN_KEY_NAME).then(token => {
      console.log(token.email);
      that.storage.get(`${token.email}-submissions`).then((submissions: Submission[]) => {
        console.log(submissions);
        if (submissions) {
          that.events.publish('submissions-changed', submissions.length);
        } else {
          that.events.publish('submissions-changed', -1);
        }
      });
    });
  }

  // submissions(): Submission[] {

  //   this.storage.get('submissions').then((submissions: Submission[]) => {
  //     this.submissions = submissions;

  //     console.log(submissions);
  //   });
  // }

}
