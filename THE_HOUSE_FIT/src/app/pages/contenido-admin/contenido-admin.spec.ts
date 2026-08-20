import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContenidoAdminComponent } from './contenido-admin';

describe('ContenidoAdminComponent', () => {
  let component: ContenidoAdminComponent;
  let fixture: ComponentFixture<ContenidoAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContenidoAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContenidoAdminComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
