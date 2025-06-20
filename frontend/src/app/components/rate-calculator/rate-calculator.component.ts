// frontend/src/app/components/rate-calculator/rate-calculator.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { DividerModule } from 'primeng/divider';
import { MessageModule } from 'primeng/message';
import { CompanyRates } from '../../models/company.model';

@Component({
  selector: 'app-rate-calculator',
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputNumberModule,
    DropdownModule,
    DividerModule,
    MessageModule,
  ],
  templateUrl: './rate-calculator.component.html',
  styleUrl: './rate-calculator.component.scss',
})
export class RateCalculatorComponent implements OnInit {
  inputs = {
    baseSalary: 100000,
    utilizationHours: 1800,
    contractType: 'T&M', // Add contract type
    fringeBenefits: {
      healthInsurance: 12000,
      dentalInsurance: 1200,
      visionInsurance: 600,
      ltdInsurance: 500,
      stdInsurance: 300,
      lifeInsurance: 400,
      trainingBudget: 2000,
      match401k: 4000,
      ptoCost: 8000,
      cellAllowance: 1200,
      internetAllowance: 600,
    },
  };

  utilizationOptions = [
    { label: '1800 hours (86.5% utilization)', value: 1800 },
    { label: '1860 hours (89.4% utilization)', value: 1860 },
    { label: '1920 hours (92.3% utilization)', value: 1920 },
    { label: '2080 hours (100% utilization)', value: 2080 },
  ];

  contractTypes = [
    { label: 'Time & Materials (T&M)', value: 'T&M' },
    { label: 'Firm Fixed Price (FFP)', value: 'FFP' },
    { label: 'Cost Plus Fixed Fee (CPFF)', value: 'CPFF' },
  ];

  wrapRateWarning =
    'Wrap rate is unusually low. Verify overhead and G&A rates.';

  results: any = null;
  companyRates: CompanyRates | null = null;
  showFarWarning = false;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadCompanyRates();
  }

  loadCompanyRates() {
    this.apiService.getCompanyRates().subscribe({
      next: (rates) => {
        this.companyRates = rates;
        this.checkFarWarning();
      },
      error: (error) => console.error('Error loading company rates:', error),
    });
  }

  calculateRates() {
    this.apiService.calculateRates(this.inputs).subscribe({
      next: (data) => {
        this.results = data;
        this.checkFarWarning();
      },
      error: (error) => console.error('Error calculating rates:', error),
    });
  }

  checkFarWarning() {
    if (this.companyRates && this.inputs.contractType !== 'T&M') {
      this.showFarWarning =
        this.inputs.baseSalary > this.companyRates.compensationCap;
    } else {
      this.showFarWarning = false;
    }
  }

  onContractTypeChange() {
    this.checkFarWarning();
    if (this.results) {
      this.calculateRates(); // Recalculate when contract type changes
    }
  }

  onSalaryChange() {
    this.checkFarWarning();
  }

  getAnnualCost(): number {
    if (!this.results) return 0;
    return this.results.costs.totalBurdenedCost * this.inputs.utilizationHours;
  }

  getAnnualRevenue(): number {
    if (!this.results) return 0;
    return this.results.targetBillRate * this.inputs.utilizationHours;
  }

  getAnnualProfit(): number {
    return this.getAnnualRevenue() - this.getAnnualCost();
  }

  getTotalFringe(): number {
    return Object.values(this.inputs.fringeBenefits).reduce(
      (sum: number, value: any) => sum + (value || 0),
      0
    );
  }
}
