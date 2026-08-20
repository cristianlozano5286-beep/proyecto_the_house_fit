import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoticiasAdmin } from './noticias-admin';

describe('NoticiasAdmin', () => {
  let component: NoticiasAdmin;
  let fixture: ComponentFixture<NoticiasAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoticiasAdmin],
    }).compileComponents();

    fixture = TestBed.createComponent(NoticiasAdmin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
