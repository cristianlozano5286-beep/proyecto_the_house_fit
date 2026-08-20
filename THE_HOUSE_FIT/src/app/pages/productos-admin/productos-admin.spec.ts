import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductosAdminComponent } from './productos-admin';

describe('ProductosAdmin', () => {
  let component: ProductosAdminComponent;
  let fixture: ComponentFixture<ProductosAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductosAdminComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductosAdminComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
