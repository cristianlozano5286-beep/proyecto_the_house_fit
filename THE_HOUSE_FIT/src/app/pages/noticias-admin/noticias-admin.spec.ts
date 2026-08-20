import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoticiasAdminComponent } from './noticias-admin';

describe('NoticiasAdminComponent', () => {
  let component: NoticiasAdminComponent;
  let fixture: ComponentFixture<NoticiasAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoticiasAdminComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NoticiasAdminComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
