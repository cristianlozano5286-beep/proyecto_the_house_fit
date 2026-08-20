import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GimnasiosAdmin } from './gimnasios-admin';

describe('GimnasiosAdmin', () => {
  let component: GimnasiosAdmin;
  let fixture: ComponentFixture<GimnasiosAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GimnasiosAdmin],
    }).compileComponents();

    fixture = TestBed.createComponent(GimnasiosAdmin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
