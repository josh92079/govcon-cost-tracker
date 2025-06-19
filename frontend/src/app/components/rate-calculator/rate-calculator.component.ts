import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { DividerModule } from 'primeng/divider';

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
  ],
  templateUrl: './rate-calculator.component.html',
  styleUrl: './rate-calculator.component.scss',
})
export class RateCalculatorComponent {
  inputs = {
    baseSalary: 100000,
    utilizationHours: 1800,
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
    { label: '1800 hours', value: 1800 },
    { label: '1860 hours', value: 1860 },
  ];

  results: any = null;

  constructor(private apiService: ApiService) {}

  calculateRates() {
    this.apiService.calculateRates(this.inputs).subscribe({
      next: (data) => {
        this.results = data;
        console.log(data);
      },
      error: (error) => console.error('Error calculating rates:', error),
    });
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
}
