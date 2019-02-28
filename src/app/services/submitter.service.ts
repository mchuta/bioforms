import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Events } from '@ionic/angular';


export interface SubmissionItem {
  name: string;
  value: any;
}

export interface Submission {
  form: string;
  name: string;
  timestamp: number;
  datestring: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  items: SubmissionItem[];
}

const TOKEN_KEY_NAME = 'auth-token';

@Injectable({
  providedIn: 'root'
})
export class SubmitterService {

  constructor(private storage: Storage, private events: Events) { }

  submitForm(formid: string, formname: string, formitems: SubmissionItem[], position: Position) {

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
          submissions.shift();

          this.storage.set(`${token.email}-submissions`, submissions);

          that.events.publish('submissions-changed', submissions.length);
          that.events.publish('submissions-pushed', submissions);
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
