import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogoGimnasiosComponent } from './catalogo-gimnasios';

describe('CatalogoGimnasiosComponent', () => {
  let component: CatalogoGimnasiosComponent;
  let fixture: ComponentFixture<CatalogoGimnasiosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogoGimnasiosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CatalogoGimnasiosComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
