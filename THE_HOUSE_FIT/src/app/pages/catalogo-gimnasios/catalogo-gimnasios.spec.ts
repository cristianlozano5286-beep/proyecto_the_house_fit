import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatalogoGimnasios } from './catalogo-gimnasios';

describe('CatalogoGimnasios', () => {
  let component: CatalogoGimnasios;
  let fixture: ComponentFixture<CatalogoGimnasios>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogoGimnasios]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CatalogoGimnasios);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
