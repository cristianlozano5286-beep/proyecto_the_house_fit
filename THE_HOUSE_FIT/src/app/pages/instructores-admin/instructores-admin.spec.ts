import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstructoresAdminComponent } from './instructores-admin';

describe('InstructoresAdminComponent', () => {
  let component: InstructoresAdminComponent;
  let fixture: ComponentFixture<InstructoresAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstructoresAdminComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InstructoresAdminComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
