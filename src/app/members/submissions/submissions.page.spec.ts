import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmissionsPage } from './submissions.page';

describe('SubmissionsPage', () => {
  let component: SubmissionsPage;
  let fixture: ComponentFixture<SubmissionsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubmissionsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmissionsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
