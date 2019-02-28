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

  //   this.forms = [{
  //       'id': '1001',
  //       'name': 'Form #1',
  //       'owner': 'Kris M',
  //       'items': [
  //         {
  //           'icon': 'pricetag',
  //           'name': 'bucket-number',
  //           'label': 'Bucket #',
  //           'type': 'integer',
  //           'min': 1,
  //           'max': 10,
  //           'placeholder': 'Enter a number between 1 and 10',
  //           'required': true,
  //           'persist': false,
  //           'dependents': [
  //             {
  //             'form': 'larvae-comp',
  //             'criteria': {
  //                 minimum: 3,
  //                 maximum: 6
  //              }
  //             }
  //           ],
  //           'dependencies': []
  //         },
  //         {
  //           'icon': 'locate',
  //           'name': 'site-number',
  //           'label': 'Site #',
  //           'type': 'integer',
  //           'min': 1,
  //           'max': 6  ,
  //           'placeholder': 'Enter a number between 1 and 6',
  //           'required': true,
  //           'persist': false,
  //           'dependents': [
  //             {
  //             'form': 'larvae-comp',
  //             'criteria': {
  //                 modulus: 3
  //              }
  //             }
  //           ],
  //           'dependencies': []
  //         },
  //         {
  //           'icon': 'water',
  //           'name': 'bucket-fill',
  //           'label': 'Fill Level',
  //           'type': 'select',
  //           'options': [{
  //               'label': 'Empty',
  //               'value': 'dry'
  //             },
  //             {
  //               'label': 'Full',
  //               'value': 'full'
  //             },
  //             {
  //               'label': 'Middle',
  //               'value': 'mid'
  //             }
  //           ],
  //           'placeholder': 'Enter the bucket water level',
  //           'required': true,
  //           'persist': true,
  //           'dependents': [
  //             {
  //             'form': 'larvae-comp',
  //             'criteria': {
  //                 'matches': 'mid|full'
  //              }
  //             }
  //           ],
  //           'dependencies': []
  //         },
  //         {
  //           'icon': 'alert',
  //           'name': 'need-not',
  //           'label': 'Meh?',
  //           'type': 'text',
  //           'placeholder': 'Whatever...no fucks to be found',
  //           'required': false,
  //           'persist': false,
  //           'dependents': [{
  //             'form': 'larvae-comp',
  //             'criteria': {
  //               'hasvalue': true
  //             }
  //           }],
  //           'dependencies': []
  //         },
  //         {
  //           'icon': 'alert',
  //           'name': 'larvae-comp',
  //           'label': 'Larvae Composition',
  //           'type': 'select',
  //           'options': [
  //             {
  //               'label': 'Only Triseriatus',
  //               'value': 'tris'
  //             },
  //             {
  //               'label': 'No Triseriatus',
  //               'value': 'notris'
  //             }
  //           ],
  //           'placeholder': 'What species exist?',
  //           'required': true,
  //           'persist': false,
  //           'dependents': [],
  //           'dependencies': [
  //             {
  //               'form': 'bucket-number',
  //               'met': false
  //             },
  //             {
  //               'form': 'bucket-fill',
  //               'met': false
  //             },
  //             {
  //               'form': 'site-number',
  //               'met': false
  //             },
  //             {
  //               'form': 'need-not',
  //               'met': false
  //             }
  //           ]
  //         }
  //       ]
  //     },
  //     {
  //       'id': '1002',
  //       'name': 'Form #2',
  //       'owner': 'Jane D',
  //       'items': [{
  //           'icon': 'pricetag',
  //           'name': 'bucket-number',
  //           'label': 'Bucket #',
  //           'type': 'integer',
  //           'min': 1,
  //           'max': 10,
  //           'placeholder': 'Enter the bucket number',
  //           'required': true,
  //           'persist': false,
  //           'dependents': [],
  //           'dependencies': []
  //         },
  //         {
  //           'icon': 'water',
  //           'name': 'bucket-fill',
  //           'label': 'Fill Level',
  //           'type': 'select',
  //           'options': [{
  //               'label': 'Empty',
  //               'value': 'dry'
  //             },
  //             {
  //               'label': 'Full',
  //               'value': 'full'
  //             },
  //             {
  //               'label': 'Middle',
  //               'value': 'mid'
  //             }
  //           ],
  //           'placeholder': 'Enter the bucket water level',
  //           'required': true,
  //           'persist': false,
  //           'dependents': [],
  //           'dependencies': []
  //         }
  //       ]
  //     }
  //   ];

   }

  getForm(id: string): Formx {
    return this.forms.find(formx => formx.id === id);
  }

  clearForms() {
    this.forms.length = 0;
  }

  getForms(force: boolean) {

    console.log('getting forms. force: ' + force);
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
