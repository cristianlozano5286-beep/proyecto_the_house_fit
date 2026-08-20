import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContenidoAdmin } from './contenido-admin';

describe('ContenidoAdmin', () => {
  let component: ContenidoAdmin;
  let fixture: ComponentFixture<ContenidoAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContenidoAdmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContenidoAdmin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
