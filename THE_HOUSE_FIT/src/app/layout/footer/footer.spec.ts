import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Footercomponent } from './footer';

describe('Footer', () => {
  let component: Footercomponent;
  let fixture: ComponentFixture<Footercomponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Footercomponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Footercomponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
