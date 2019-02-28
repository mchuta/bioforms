import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsService} from '../../services/forms-service.service';
import { Events, IonRefresher } from '@ionic/angular';

@Component({
  selector: 'app-forms',
  templateUrl: './forms.page.html',
  styleUrls: ['./forms.page.scss']
})

export class FormsPage implements OnInit {

  @ViewChild('refresherRef') refresherRef: IonRefresher;

  constructor(private formsService: FormsService, private events: Events) { }

  ngOnInit() {
    this.events.subscribe('forms-refreshed', (successful: boolean) => {
      this.refresherRef.complete();
    });
  }

  ionViewWillEnter() {
    this.formsService.getForms(false);

  }

  refreshForms() {
    this.formsService.getForms(true);
  }

}
