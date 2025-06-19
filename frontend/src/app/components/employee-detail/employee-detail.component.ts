import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Employee, EmployeeCostAnalysis } from '../../models/employee.model';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TabViewModule } from 'primeng/tabview';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-employee-detail',
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TabViewModule,
    DividerModule,
  ],
  templateUrl: './employee-detail.component.html',
  styleUrl: './employee-detail.component.scss',
})
export class EmployeeDetailComponent implements OnInit {
  employee: Employee | null = null;
  costAnalysis: EmployeeCostAnalysis | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.loadEmployee(id);
    this.loadCostAnalysis(id);
  }

  loadEmployee(id: number) {
    this.apiService.getEmployee(id).subscribe({
      next: (data) => (this.employee = data),
      error: (error) => console.error('Error loading employee:', error),
    });
  }

  loadCostAnalysis(id: number) {
    this.apiService.getEmployeeCosts(id).subscribe({
      next: (data) => (this.costAnalysis = data),
      error: (error) => console.error('Error loading cost analysis:', error),
    });
  }

  getTotalFringe(): number {
    if (!this.employee?.FringeBenefit) return 0;

    const fb = this.employee.FringeBenefit;
    return (
      (fb.healthInsurance || 0) +
      (fb.dentalInsurance || 0) +
      (fb.visionInsurance || 0) +
      (fb.ltdInsurance || 0) +
      (fb.stdInsurance || 0) +
      (fb.lifeInsurance || 0) +
      (fb.trainingBudget || 0) +
      (fb.match401k || 0) +
      (fb.ptoCost || 0) +
      (fb.cellAllowance || 0) +
      (fb.internetAllowance || 0)
    );
  }

  goBack() {
    this.router.navigate(['/employees']);
  }
}
