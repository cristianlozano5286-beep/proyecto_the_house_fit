import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NutricionComponent } from './nutricion';

describe('Nutricion', () => {
  let component: NutricionComponent;
  let fixture: ComponentFixture<NutricionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NutricionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NutricionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
