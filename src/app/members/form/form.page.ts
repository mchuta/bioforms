import {
  Component
} from '@angular/core';
import {
  ActivatedRoute
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
    private toastController: ToastController) {


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

    this.submitterService.submitForm(this.formx.id, this.formx.name, items, position);

    this.presentToast('Successfully submitted', 'primary', 1000);

    for (const item of this.formx.items) {
      if (!item.persist) {
        item.value = null;
      }
    }

  }

  onLocationError = (error: PositionError) => {

  }
  async presentToast(message: string, color: string, duration: number) {
    const toast = await this.toastController.create({
      message: message,
      duration: duration,
      color: color
    });
    toast.present();
  }

  async presentToastWithOptions() {
    const toast = await this.toastController.create({
      message: 'Click to Close',
      showCloseButton: true,
      position: 'top',
      closeButtonText: 'Done'
    });
    toast.present();
  }
}
