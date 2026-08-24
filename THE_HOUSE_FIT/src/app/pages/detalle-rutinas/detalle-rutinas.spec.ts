import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalleRutinasComponent } from './detalle-rutinas';

describe('DetalleRutinas', () => {
  let component: DetalleRutinasComponent;
  let fixture: ComponentFixture<DetalleRutinasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleRutinasComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleRutinasComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
