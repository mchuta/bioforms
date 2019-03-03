import {
  Injectable, OnInit
} from '@angular/core';
import { AwsService } from './aws.service';
import { Storage } from '@ionic/storage';
import { Observable } from 'rxjs';
import { Events } from '@ionic/angular';

interface FormxItemOption {
  label: string;
  value: any;
}

interface FormxItemDependency {
  form: string;
  met: boolean;
}

interface FormxItemDependent {
  form: string;
  criteria: FormxItemDependencyCriteria;
}

interface FormxItemDependencyCriteria {
  hasvalue?: boolean;
  minimum?: number;
  maximum?: number;
  matches?: string;
  modulus?: number;
}

export interface FormxItem {
  icon: string;
  name: string;
  label: string;
  type: string;
  min?: number;
  max?: number;
  placeholder: string;
  required: boolean;
  options?: FormxItemOption[];
  persist: boolean;
  value?: any;
  dependencies: FormxItemDependency[];
  dependents: FormxItemDependent[];
}

export interface Formx {
  id: string;
  name: string;
  owner: string;
  email: string;
  items: FormxItem[];
}


const TOKEN_KEY_NAME = 'auth-token';


@Injectable({
  providedIn: 'root'
})
export class FormsService {

  public forms: Formx[] = [];

  constructor(private awsService: AwsService, private storage: Storage, private events: Events ) {

   }

  getForm(id: string): Formx {
    return this.forms.find(formx => formx.id === id);
  }

  clearForms() {
    this.forms.length = 0;
  }

  getForms(force: boolean) {

    this.storage.get(TOKEN_KEY_NAME).then(token => {
      if (token) {

        this.storage.get(`${token.email}-forms`).then(savedForms => {
          if (savedForms) {
            this.forms = savedForms;
          }

          if ((!savedForms) || force || this.forms.length === 0) {
            this.awsService.getForms(token.token, token.email).subscribe(async result => {

              console.log(result);

              if (result) {
                this.forms = result;
                this.storage.set(`${token.email}-forms`, result);

                this.events.publish('forms-refreshed', true);

              } else {
                this.events.publish('forms-refreshed', false);
              }
            });
          }
        });

      }
    });
  }

}
