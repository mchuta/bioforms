import {
  Component
} from '@angular/core';
import {
  ActivatedRoute, Router
} from '@angular/router';
import {
  FormsService,
  FormxItem,
  Formx
} from '../../services/forms-service.service';
import {
  SubmitterService
} from '../../services/submitter.service';
import {
  ToastController
} from '@ionic/angular';

@Component({
  selector: 'app-form',
  templateUrl: 'form.page.html',
  styleUrls: ['form.page.scss']
})
export class FormPage {

  private formx: Formx;

  constructor(private route: ActivatedRoute, private formService: FormsService,
    private submitterService: SubmitterService,
    private toastController: ToastController,
    private router: Router) {

  }

  ionViewWillEnter() {
    const formId = this.route.snapshot.paramMap.get('id');
    this.formx = this.formService.getForm(formId);


  }

  isVisible(formitem: FormxItem) {
    if (formitem.dependencies.length > 0) {
      for (const dep of formitem.dependencies) {
        if (!dep.met) {
          return false;
        }
      }
    }

    return true;
  }

  checkDependencies(formitem: FormxItem) {

      if (formitem.dependents.length > 0) {
        for (const dependent of formitem.dependents) {

          for (const form of this.formx.items) {
            if (form.name === dependent.form) {

              let requirementsMet = true;

              if (dependent.criteria.hasvalue ) {

                if (formitem.value) {
                  requirementsMet = requirementsMet && true;
                } else {
                  requirementsMet = requirementsMet && false;
                }
              }

              if (dependent.criteria.maximum) {

                if (formitem.value <= dependent.criteria.maximum) {
                  requirementsMet = requirementsMet && true;
                } else {
                  requirementsMet = requirementsMet && false;
                }
              }

              if (dependent.criteria.minimum) {

                if (formitem.value >= dependent.criteria.minimum) {
                  requirementsMet = requirementsMet && true;
                } else {
                  requirementsMet = requirementsMet && false;
                }
              }

              if (dependent.criteria.modulus) {

                if (formitem.value % dependent.criteria.modulus === 0) {
                  requirementsMet = requirementsMet && true;
                } else {
                  requirementsMet = requirementsMet && false;
                }
              }

              if (dependent.criteria.matches) {

                const rex = new RegExp(dependent.criteria.matches);
                if (rex.test(formitem.value)) {
                  requirementsMet = requirementsMet && true;
                } else {
                  requirementsMet = requirementsMet && false;
                }
              }

              for (const formdep of form.dependencies) {

                if (formdep.form === formitem.name) {
                  formdep.met = requirementsMet;
                }
              }
            }
          }
        }
      }
  }

  saveAndReload() {

    const failedRequirements: string[] = [];

    for (const item of this.formx.items) {
      if (item.required && (!item.value) && (this.isVisible(item))) {
        failedRequirements.push('"' + item.label + '" is required');
        continue;
      }

      switch (item.type) {
        case 'integer':
          if (!Number.isInteger(item.value)) {
            failedRequirements.push('"' + item.label + '" is not a valid integer');
          } else {
            const value = Number.parseInt(item.value, 10);
            if (value > item.max) {
              failedRequirements.push('"' + item.label + '" is larger than max value: ' + item.max);
            } else if (value < item.min) {
              failedRequirements.push('"' + item.label + '" is smaller than min value: ' + item.min);
            }

          }
          break;
        case 'real':
            const n = Number.parseFloat(item.value);
            if (n > item.max) {
              failedRequirements.push('"' + item.label + '" is larger than max value: ' + item.max);
            } else if (n < item.min) {
              failedRequirements.push('"' + item.label + '" is smaller than min value: ' + item.min);
            }

          break;
      }
    }

    if (failedRequirements.length === 0) {

      navigator.geolocation.getCurrentPosition(
        this.onLocationSuccess, this.onLocationError
      );

    } else {
      console.log(failedRequirements);

      this.presentToast(failedRequirements.join('\n'), 'danger', 2000);

    }

  }

  onLocationSuccess = (position: Position) => {

    const items = [];

    for (const item of this.formx.items) {
      if (item.value) {
        items.push({
          'name': item.name,
          'value': item.value
        });
      }
    }

    this.submitterService.submitForm(this.formx.id, this.formx.email, this.formx.name, items, position);

    this.presentToastWithCallback('Successfully submitted', 'primary', 2000, () => {
      this.router.navigate(['members', 'submissions']);
    });

    for (const item of this.formx.items) {
      if (!item.persist) {
        item.value = null;
      }
    }

  }

  onLocationError = (error: PositionError) => {

  }

  async presentToastWithCallback(message: string, color: string, duration: number, callback: Function) {

    const toast = await this.toastController.create({
      message: message,
      color: color,
      showCloseButton: true,
      closeButtonText: 'View'
    });

    const timeoutHandler = setTimeout( () => { toast.dismiss(); }, duration);

    toast.onDidDismiss().then((data: any) => {
      clearTimeout(timeoutHandler);
      console.log('time elapsed', data);
        if (data.role === 'cancel') {
          callback();
        }
    });

    toast.present();
  }

  async presentToast(message: string, color: string, duration: number) {
    const toast = await this.toastController.create({
      message: message,
      color: color,
      duration: duration,
      showCloseButton: true,
      closeButtonText: 'Close'
    });
    toast.present();
  }
}
