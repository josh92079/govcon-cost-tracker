import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/company-summary',
    pathMatch: 'full',
  },
  {
    path: 'company-summary',
    loadComponent: () =>
      import('./components/company-summary/company-summary.component').then(
        (m) => m.CompanySummaryComponent
      ),
  },
  {
    path: 'employees',
    loadComponent: () =>
      import('./components/employee-list/employee-list.component').then(
        (m) => m.EmployeeListComponent
      ),
  },
  {
    path: 'employees/:id',
    loadComponent: () =>
      import('./components/employee-detail/employee-detail.component').then(
        (m) => m.EmployeeDetailComponent
      ),
  },
  {
    path: 'contracts',
    loadComponent: () =>
      import('./components/contract-list/contract-list.component').then(
        (m) => m.ContractListComponent
      ),
  },
  {
    path: 'contracts/:id',
    loadComponent: () =>
      import('./components/contract-detail/contract-detail.component').then(
        (m) => m.ContractDetailComponent
      ),
  },
  {
    path: 'rate-calculator',
    loadComponent: () =>
      import('./components/rate-calculator/rate-calculator.component').then(
        (m) => m.RateCalculatorComponent
      ),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./components/company-settings/company-settings.component').then(
        (m) => m.CompanySettingsComponent
      ),
  },
];
