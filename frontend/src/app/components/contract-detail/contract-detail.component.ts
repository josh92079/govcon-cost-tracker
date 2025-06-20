// frontend/src/app/components/contract-detail/contract-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ContractProfitability } from '../../models/contract.model';
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
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

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
    MessageModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './contract-detail.component.html',
  styleUrl: './contract-detail.component.scss',
})
export class ContractDetailComponent implements OnInit {
  contractData: ContractProfitability | null = null;
  rateAnalysis: any[] = [];
  availableEmployees: Employee[] = [];
  displayAssignDialog = false;
  showRateAnalysis = false;

  assignment = {
    employeeId: null as number | null,
    allocationPercentage: 0,
    billRate: 0,
    startDate: new Date(),
    endDate: null as Date | null,
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
    this.loadEmployees();
  }

  loadContract(id: number) {
    this.apiService.getContract(id).subscribe({
      next: (data) => {
        this.contractData = data;
        // Load rate analysis after contract is loaded
        this.loadRateAnalysis(id);
      },
      error: (error) => {
        console.error('Error loading contract:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load contract',
        });
      },
    });
  }

  loadRateAnalysis(contractId: number) {
    this.apiService.getContractRates(contractId).subscribe({
      next: (data) => {
        // The API returns an object with rateAnalysis array
        this.rateAnalysis = data.rateAnalysis || [];
      },
      error: (error) => {
        console.error('Error loading rate analysis:', error);
        this.rateAnalysis = [];
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
          // Reload both contract and rate analysis
          this.loadContract(this.contractData!.contract.id!);
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

  // Method that was missing but referenced in template
  viewRateAnalysis() {
    this.showRateAnalysis = !this.showRateAnalysis;
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

  goBack() {
    this.router.navigate(['/contracts']);
  }

  // Helper method to suggest bill rate based on employee's burdened cost
  suggestBillRate() {
    if (!this.assignment.employeeId) return;

    const employee = this.availableEmployees.find(
      (e) => e.id === this.assignment.employeeId
    );
    if (!employee) return;

    // Calculate suggested bill rate
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

  // Calculate total allocation percentage
  getTotalAllocation(): number {
    if (!this.contractData) return 0;
    return this.contractData.employees.reduce(
      (sum, emp) => sum + (emp.allocation || 0),
      0
    );
  }

  // Check if total allocation exceeds 100%
  hasOverAllocation(): boolean {
    return this.getTotalAllocation() > 100;
  }
}
