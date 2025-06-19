// frontend/src/app/services/api.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CompanyRates, CompanySummary } from '../models/company.model';
import { Contract, ContractProfitability } from '../models/contract.model';
import { Employee, EmployeeCostAnalysis } from '../models/employee.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // Employee endpoints
  getEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.apiUrl}/employees`);
  }

  getEmployee(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.apiUrl}/employees/${id}`);
  }

  createEmployee(employee: Employee): Observable<Employee> {
    return this.http.post<Employee>(`${this.apiUrl}/employees`, employee);
  }

  updateEmployee(id: number, employee: Employee): Observable<Employee> {
    return this.http.put<Employee>(`${this.apiUrl}/employees/${id}`, employee);
  }

  deleteEmployee(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/employees/${id}`);
  }

  getEmployeeCosts(id: number): Observable<EmployeeCostAnalysis> {
    return this.http.get<EmployeeCostAnalysis>(
      `${this.apiUrl}/employees/${id}/costs`
    );
  }

  // Contract endpoints
  getContracts(): Observable<Contract[]> {
    return this.http.get<Contract[]>(`${this.apiUrl}/contracts`);
  }

  getContract(id: number): Observable<ContractProfitability> {
    return this.http.get<ContractProfitability>(
      `${this.apiUrl}/contracts/${id}`
    );
  }

  createContract(contract: Contract): Observable<Contract> {
    return this.http.post<Contract>(`${this.apiUrl}/contracts`, contract);
  }

  updateContract(id: number, contract: Contract): Observable<Contract> {
    return this.http.put<Contract>(`${this.apiUrl}/contracts/${id}`, contract);
  }

  deleteContract(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/contracts/${id}`);
  }

  assignEmployeeToContract(
    contractId: number,
    assignment: any
  ): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/contracts/${contractId}/assign-employee`,
      assignment
    );
  }

  // Company endpoints
  getCompanyRates(): Observable<CompanyRates> {
    return this.http.get<CompanyRates>(`${this.apiUrl}/company/rates`);
  }

  updateCompanyRates(rates: CompanyRates): Observable<any> {
    return this.http.put(`${this.apiUrl}/company/rates`, rates);
  }

  getCompanySummary(): Observable<CompanySummary> {
    return this.http.get<CompanySummary>(`${this.apiUrl}/company/summary`);
  }

  // Rate calculation endpoints - ENHANCED
  calculateRates(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/rates/calculate`, data);
  }

  getEmployeeRates(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/rates/employee/${id}`);
  }

  getContractRates(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/rates/contract/${id}`);
  }

  // NEW endpoints for enhanced functionality
  calculateBulkRates(employees: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/rates/calculate-bulk`, { employees });
  }

  compareRates(data: {
    baseSalary: number;
    fringeBenefits: any;
    scenarios: Array<{
      utilizationHours: number;
      contractType?: 'FFP' | 'T&M' | 'CPFF';
      billRate?: number;
    }>;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/rates/compare`, data);
  }
}
