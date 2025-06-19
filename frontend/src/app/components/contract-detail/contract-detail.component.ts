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

@Component({
  selector: 'app-contract-detail',
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
  ],
  templateUrl: './contract-detail.component.html',
  styleUrl: './contract-detail.component.scss',
})
export class ContractDetailComponent implements OnInit {
  contractData: ContractProfitability | null = null;
  rateAnalysis: any[] | null = null;
  availableEmployees: Employee[] = [];
  displayAssignDialog = false;
  assignment = {
    employeeId: null,
    allocationPercentage: 0,
    billRate: 0,
    startDate: new Date(),
    endDate: null,
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
      next: (data) => (this.contractData = data),
      error: (error) => console.error('Error loading contract:', error),
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
    if (!this.contractData) return;

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
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.error || 'Failed to assign employee',
          });
        },
      });
  }

  viewRateAnalysis() {
    if (!this.contractData) return;

    this.apiService.getContractRates(this.contractData.contract.id!).subscribe({
      next: (data) => (this.rateAnalysis = data.rateAnalysis),
      error: (error) => console.error('Error loading rate analysis:', error),
    });
  }

  goBack() {
    this.router.navigate(['/contracts']);
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
    if (margin >= 15) return 'success';
    if (margin >= 10) return 'info';
    if (margin >= 5) return 'warning';
    return 'danger';
  }
}
