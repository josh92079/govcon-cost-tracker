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
import { TooltipModule } from 'primeng/tooltip';
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

interface RateCalculationInput {
  baseSalary: number;
  utilizationHours: number;
  contractType?: 'FFP' | 'T&M' | 'CPFF';
  fringeBenefits: {
    healthInsurance: number;
    dentalInsurance: number;
    visionInsurance: number;
    ltdInsurance: number;
    stdInsurance: number;
    lifeInsurance: number;
    trainingBudget: number;
    match401k: number;
    ptoCost: number;
    cellAllowance: number;
    internetAllowance: number;
  };
}

interface ComparisonScenario {
  utilizationHours: number;
  contractType?: 'FFP' | 'T&M' | 'CPFF';
  billRate?: number;
}

@Component({
  selector: 'app-rate-calculator',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputNumberModule,
    DropdownModule,
    DividerModule,
    MessageModule,
    TooltipModule,
    TabViewModule,
    TableModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './rate-calculator.component.html',
  styleUrl: './rate-calculator.component.scss',
})
export class RateCalculatorComponent implements OnInit {
  // Main calculation inputs
  inputs: RateCalculationInput = {
    baseSalary: 100000,
    utilizationHours: 1800,
    contractType: undefined,
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

  // Options for dropdowns
  utilizationOptions = [
    { label: '1800 hours (86.5% utilization)', value: 1800 },
    { label: '1860 hours (89.4% utilization)', value: 1860 },
    { label: '1920 hours (92.3% utilization)', value: 1920 },
    { label: '2080 hours (100% utilization)', value: 2080 },
  ];

  contractTypeOptions = [
    { label: 'None (Default)', value: null },
    { label: 'Fixed Price (FFP)', value: 'FFP' },
    { label: 'Time & Materials (T&M)', value: 'T&M' },
    { label: 'Cost Plus Fixed Fee (CPFF)', value: 'CPFF' },
  ];

  // Results
  results: any = null;
  loading = false;
  error: string | null = null;

  // Comparison mode
  comparisonScenarios: ComparisonScenario[] = [];
  comparisonResults: any[] = [];
  comparisonLoading = false;

  // Company rates for display
  companyRates: any = null;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadCompanyRates();
    this.initializeComparisonScenarios();
  }

  loadCompanyRates() {
    this.apiService.getCompanyRates().subscribe({
      next: (rates) => {
        this.companyRates = rates;
      },
      error: (error) => {
        console.error('Error loading company rates:', error);
      },
    });
  }

  initializeComparisonScenarios() {
    this.comparisonScenarios = [
      { utilizationHours: 1800, contractType: 'FFP', billRate: 150 },
      { utilizationHours: 1800, contractType: 'T&M', billRate: 140 },
      { utilizationHours: 1800, contractType: 'CPFF', billRate: 130 },
      { utilizationHours: 1860, contractType: 'T&M', billRate: 140 },
    ];
  }

  calculateRates() {
    this.loading = true;
    this.error = null;

    const payload = {
      ...this.inputs,
      contractType: this.inputs.contractType || undefined,
    };

    console.log('Calculating rates with contract type:', payload.contractType);

    this.apiService.calculateRates(payload).subscribe({
      next: (data) => {
        this.results = data;
        this.loading = false;
        console.log('Results received:', data);
      },
      error: (error) => {
        this.error = error.error?.error || 'Error calculating rates';
        this.loading = false;
      },
    });
  }

  compareScenarios() {
    this.comparisonLoading = true;

    const payload = {
      baseSalary: this.inputs.baseSalary,
      fringeBenefits: this.inputs.fringeBenefits,
      scenarios: this.comparisonScenarios.filter((s) => s.utilizationHours > 0),
    };

    this.apiService.compareRates(payload).subscribe({
      next: (data) => {
        this.comparisonResults = data.comparisons;
        this.comparisonLoading = false;
      },
      error: (error) => {
        console.error('Error comparing scenarios:', error);
        this.comparisonLoading = false;
      },
    });
  }

  addComparisonScenario() {
    this.comparisonScenarios.push({
      utilizationHours: 1800,
      contractType: 'T&M',
      billRate: 150,
    });
  }

  removeComparisonScenario(index: number) {
    this.comparisonScenarios.splice(index, 1);
  }

  // Helper methods
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

  getTotalFringeBenefits(): number {
    return Object.values(this.inputs.fringeBenefits).reduce(
      (sum, value) => sum + (value || 0),
      0
    );
  }

  getFringePercentage(): number {
    if (this.inputs.baseSalary === 0) return 0;
    return (this.getTotalFringeBenefits() / this.inputs.baseSalary) * 100;
  }

  getWrapRateSeverity(wrapRate: number): string {
    if (wrapRate < 1.5) return 'warning';
    if (wrapRate > 3.5) return 'danger';
    return 'success';
  }

  getMarginSeverity(margin: number): string {
    if (margin < 5) return 'danger';
    if (margin < 10) return 'warning';
    return 'success';
  }

  hasValidationWarnings(): boolean {
    // For T&M contracts, filter out compensation cap warnings
    if (
      this.inputs.contractType === 'T&M' &&
      this.results?.validation?.warnings?.length > 0
    ) {
      const nonCapWarnings = this.results.validation.warnings.filter(
        (w: string) => !w.includes('compensation cap')
      );
      return nonCapWarnings.length > 0;
    }
    return this.results?.validation?.warnings?.length > 0;
  }

  getFilteredWarnings(): string[] {
    if (!this.results?.validation?.warnings) return [];

    // For T&M contracts, filter out compensation cap warnings
    if (this.inputs.contractType === 'T&M') {
      return this.results.validation.warnings.filter(
        (w: string) => !w.includes('compensation cap')
      );
    }

    return this.results.validation.warnings;
  }

  isCompensationCapApplicable(): boolean {
    return (
      this.inputs.contractType !== 'T&M' &&
      this.inputs.baseSalary > (this.companyRates?.compensationCap || 0)
    );
  }

  shouldShowCapExemptionNotice(): boolean {
    return (
      this.inputs.contractType === 'T&M' &&
      this.inputs.baseSalary > (this.companyRates?.compensationCap || 0)
    );
  }

  exportResults() {
    if (!this.results) return;

    const exportData = {
      inputs: this.inputs,
      results: this.results,
      timestamp: new Date().toISOString(),
      companyRates: this.companyRates,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rate-calculation-${
      new Date().toISOString().split('T')[0]
    }.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
