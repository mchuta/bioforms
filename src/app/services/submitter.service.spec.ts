import { TestBed } from '@angular/core/testing';

import { SubmitterService } from './submitter.service';

describe('SubmitterService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SubmitterService = TestBed.get(SubmitterService);
    expect(service).toBeTruthy();
  });
});
