import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanySummaryComponent } from './company-summary.component';

describe('CompanySummaryComponent', () => {
  let component: CompanySummaryComponent;
  let fixture: ComponentFixture<CompanySummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanySummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanySummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
