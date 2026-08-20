import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GimnasiosAdminComponent } from './gimnasios-admin';

describe('GimnasiosAdminComponent', () => {
  let component: GimnasiosAdminComponent;
  let fixture: ComponentFixture<GimnasiosAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GimnasiosAdminComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GimnasiosAdminComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
