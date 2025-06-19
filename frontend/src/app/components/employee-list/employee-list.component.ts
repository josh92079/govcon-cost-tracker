import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Employee } from '../../models/employee.model';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-employee-list',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    CalendarModule,
    DividerModule,
    TooltipModule,
  ],
  templateUrl: './employee-list.component.html',
  styleUrl: './employee-list.component.scss',
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  selectedEmployee: Employee = {} as Employee;
  fringeBenefits: any = {};
  displayDialog = false;
  dialogHeader = '';
  loading = true;
  isNew = false;

  utilizationOptions = [
    { label: '1800 hours', value: 1800 },
    { label: '1860 hours', value: 1860 },
  ];

  constructor(
    private apiService: ApiService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadEmployees();
  }

  loadEmployees() {
    this.loading = true;
    this.apiService.getEmployees().subscribe({
      next: (data) => {
        this.employees = data;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load employees',
        });
        this.loading = false;
      },
    });
  }

  showAddDialog() {
    this.selectedEmployee = {
      name: '',
      title: '',
      baseSalary: 0,
      utilizationTarget: 1800,
      hireDate: new Date(),
    } as Employee;
    this.fringeBenefits = {
      healthInsurance: 0,
      dentalInsurance: 0,
      visionInsurance: 0,
      ltdInsurance: 0,
      stdInsurance: 0,
      lifeInsurance: 0,
      trainingBudget: 0,
      match401k: 0,
      ptoCost: 0,
      cellAllowance: 0,
      internetAllowance: 0,
    };
    this.isNew = true;
    this.dialogHeader = 'Add Employee';
    this.displayDialog = true;
  }

  editEmployee(employee: Employee) {
    this.selectedEmployee = { ...employee };
    this.fringeBenefits = employee.FringeBenefit
      ? { ...employee.FringeBenefit }
      : {};
    this.isNew = false;
    this.dialogHeader = 'Edit Employee';
    this.displayDialog = true;
  }

  saveEmployee() {
    const employeeData = {
      ...this.selectedEmployee,
      fringeBenefits: this.fringeBenefits,
    };

    if (this.isNew) {
      this.apiService.createEmployee(employeeData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Employee created',
          });
          this.displayDialog = false;
          this.loadEmployees();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to create employee',
          });
        },
      });
    } else {
      this.apiService
        .updateEmployee(this.selectedEmployee.id!, employeeData)
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Employee updated',
            });
            this.displayDialog = false;
            this.loadEmployees();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to update employee',
            });
          },
        });
    }
  }

  viewEmployee(id: number) {
    this.router.navigate(['/employees', id]);
  }

  confirmDelete(employee: Employee) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${employee.name}?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteEmployee(employee.id!);
      },
    });
  }

  deleteEmployee(id: number) {
    this.apiService.deleteEmployee(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Employee deleted',
        });
        this.loadEmployees();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete employee',
        });
      },
    });
  }
}
