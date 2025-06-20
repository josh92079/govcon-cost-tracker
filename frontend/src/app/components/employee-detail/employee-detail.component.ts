// frontend/src/app/components/employee-detail/employee-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Employee, EmployeeCostAnalysis } from '../../models/employee.model';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MessageModule } from 'primeng/message';
import { TabViewModule } from 'primeng/tabview';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TableModule,
    TagModule,
    TooltipModule,
    MessageModule,
    TabViewModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './employee-detail.component.html',
  styleUrl: './employee-detail.component.scss',
})
export class EmployeeDetailComponent implements OnInit {
  employee: Employee | null = null;
  costAnalysis: EmployeeCostAnalysis | null = null;
  companyRates: any = null;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.loadEmployee(id);
    this.loadCostAnalysis(id);
    this.loadCompanyRates();
  }

  loadEmployee(id: number) {
    this.loading = true;
    this.apiService.getEmployee(id).subscribe({
      next: (data) => {
        this.employee = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading employee:', error);
        this.loading = false;
      },
    });
  }

  loadCostAnalysis(id: number) {
    this.apiService.getEmployeeCosts(id).subscribe({
      next: (data) => (this.costAnalysis = data),
      error: (error) => console.error('Error loading cost analysis:', error),
    });
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

  goBack() {
    this.router.navigate(['/employees']);
  }

  editEmployee() {
    if (this.employee?.id) {
      this.router.navigate(['/employees', this.employee.id, 'edit']);
    }
  }

  viewContract(contractId: number) {
    this.router.navigate(['/contracts', contractId]);
  }

  getTotalFringeBenefits(): number {
    if (!this.employee?.FringeBenefit) return 0;

    return Object.entries(this.employee.FringeBenefit)
      .filter(([key]) => key !== 'id' && key !== 'employeeId')
      .reduce((sum, [_, value]) => sum + (Number(value) || 0), 0);
  }

  getFringePercentage(): number {
    if (!this.employee?.baseSalary) return 0;
    return (this.getTotalFringeBenefits() / this.employee.baseSalary) * 100;
  }

  exceedsCompensationCap(): boolean {
    if (!this.employee || !this.companyRates) return false;
    return this.employee.baseSalary > this.companyRates.compensationCap;
  }

  getContractTypeImpact(contractType: string): string {
    if (!this.exceedsCompensationCap()) return 'No impact';

    switch (contractType) {
      case 'T&M':
        return 'No cap applied - full salary used';
      case 'CPFF':
      case 'FFP':
        return `Capped at ${this.companyRates?.compensationCap || 0}`;
      default:
        return 'Depends on contract type';
    }
  }

  getWrapRateSeverity(wrapRate: number): string {
    if (wrapRate < 1.5) return 'warning';
    if (wrapRate > 3.5) return 'danger';
    return 'success';
  }

  exportCostAnalysis() {
    if (!this.employee || !this.costAnalysis) return;

    const exportData = {
      employee: this.employee,
      costAnalysis: this.costAnalysis,
      companyRates: this.companyRates,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `employee-${this.employee.id}-cost-analysis.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
