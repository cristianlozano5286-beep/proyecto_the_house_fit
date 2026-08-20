import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResenasComponent } from './resenas';

describe('ResenasComponent', () => {
  let component: ResenasComponent;
  let fixture: ComponentFixture<ResenasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResenasComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ResenasComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
