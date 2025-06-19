// frontend/src/app/components/contract-detail/contract-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import {
  ContractProfitability,
  ContractRateAnalysis,
} from '../../models/contract.model';
import { Employee } from '../../models/employee.model';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { CalendarModule } from 'primeng/calendar';
import { TooltipModule } from 'primeng/tooltip';
import { TabViewModule } from 'primeng/tabview';
import { MessageModule } from 'primeng/message';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-contract-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TableModule,
    TagModule,
    DialogModule,
    DropdownModule,
    InputNumberModule,
    CalendarModule,
    TooltipModule,
    TabViewModule,
    MessageModule,
    ChartModule,
  ],
  templateUrl: './contract-detail.component.html',
  styleUrl: './contract-detail.component.scss',
})
export class ContractDetailComponent implements OnInit {
  contractData: ContractProfitability | null = null;
  rateAnalysis: ContractRateAnalysis | null = null;
  availableEmployees: Employee[] = [];
  displayAssignDialog = false;
  loadingRateAnalysis = false;

  assignment = {
    employeeId: null as number | null,
    allocationPercentage: 0,
    billRate: 0,
    startDate: new Date(),
    endDate: null as Date | null,
  };

  // Chart data for profitability visualization
  profitabilityChartData: any = null;
  chartOptions: any = {
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.loadContract(id);
    this.loadRateAnalysis(id);
    this.loadEmployees();
  }

  loadContract(id: number) {
    this.apiService.getContract(id).subscribe({
      next: (data) => {
        this.contractData = data;
        this.updateProfitabilityChart();
      },
      error: (error) => {
        console.error('Error loading contract:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load contract data',
        });
      },
    });
  }

  loadRateAnalysis(id: number) {
    this.loadingRateAnalysis = true;
    this.apiService.getContractRates(id).subscribe({
      next: (data) => {
        this.rateAnalysis = data;
        this.loadingRateAnalysis = false;
      },
      error: (error) => {
        console.error('Error loading rate analysis:', error);
        this.loadingRateAnalysis = false;
      },
    });
  }

  loadEmployees() {
    this.apiService.getEmployees().subscribe({
      next: (data) => (this.availableEmployees = data),
      error: (error) => console.error('Error loading employees:', error),
    });
  }

  showAssignDialog() {
    this.assignment = {
      employeeId: null,
      allocationPercentage: 0,
      billRate: 0,
      startDate: new Date(),
      endDate: null,
    };
    this.displayAssignDialog = true;
  }

  assignEmployee() {
    if (!this.contractData || !this.assignment.employeeId) return;

    this.apiService
      .assignEmployeeToContract(this.contractData.contract.id!, this.assignment)
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Employee assigned to contract',
          });
          this.displayAssignDialog = false;
          this.loadContract(this.contractData!.contract.id!);
          this.loadRateAnalysis(this.contractData!.contract.id!);
        },
        error: (error) => {
          console.error('Error assigning employee:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to assign employee',
          });
        },
      });
  }

  updateProfitabilityChart() {
    if (!this.contractData) return;

    const data = this.contractData.profitability;
    this.profitabilityChartData = {
      labels: ['Revenue', 'Cost', 'Profit'],
      datasets: [
        {
          data: [data.revenue, data.cost, Math.max(0, data.profit)],
          backgroundColor: ['#10b981', '#ef4444', '#3b82f6'],
          borderWidth: 0,
        },
      ],
    };
  }

  getContractTypeSeverity(type: string): string {
    switch (type) {
      case 'FFP':
        return 'success';
      case 'T&M':
        return 'info';
      case 'CPFF':
        return 'warning';
      default:
        return 'secondary';
    }
  }

  getMarginSeverity(margin: number): string {
    if (margin < 5) return 'danger';
    if (margin < 10) return 'warning';
    return 'success';
  }

  getWrapRateSeverity(wrapRate: number): string {
    if (wrapRate < 1.5) return 'warning';
    if (wrapRate > 3.5) return 'danger';
    return 'success';
  }

  goBack() {
    this.router.navigate(['/contracts']);
  }

  exportRateAnalysis() {
    if (!this.rateAnalysis) return;

    const exportData = {
      contract: this.rateAnalysis.contract,
      summary: this.rateAnalysis.summary,
      rateAnalysis: this.rateAnalysis.rateAnalysis,
      exportDate: new Date().toISOString(),
      companyRates: this.rateAnalysis.companyRates,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `contract-${this.rateAnalysis.contract.number}-rate-analysis.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  getTotalAllocation(): number {
    if (!this.contractData) return 0;
    return this.contractData.employees.reduce(
      (sum, emp) => sum + emp.allocation,
      0
    );
  }

  hasOverAllocation(): boolean {
    return this.getTotalAllocation() > 100;
  }

  // Helper method to suggest bill rate based on employee's burdened cost
  suggestBillRate() {
    if (!this.assignment.employeeId || !this.rateAnalysis) return;

    const employee = this.availableEmployees.find(
      (e) => e.id === this.assignment.employeeId
    );
    if (!employee) return;

    // Calculate suggested bill rate based on employee's cost and contract type
    this.apiService
      .calculateRates({
        baseSalary: employee.baseSalary,
        fringeBenefits: employee.FringeBenefit || {},
        utilizationHours: employee.utilizationTarget,
        contractType: this.contractData?.contract.contractType,
      })
      .subscribe({
        next: (result) => {
          this.assignment.billRate = Math.round(result.targetBillRate);
          this.messageService.add({
            severity: 'info',
            summary: 'Suggested Rate',
            detail: `Suggested bill rate: $${this.assignment.billRate}/hr based on target profit margin`,
          });
        },
        error: (error) => {
          console.error('Error calculating suggested rate:', error);
        },
      });
  }
}
