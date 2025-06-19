import { RateStructure } from './employee.model';

export interface CompanyRates {
  id?: number;
  fiscalYear: number;
  overheadRate: number;
  gaRate: number;
  targetProfitMargin: number;
  compensationCap: number;
  active?: boolean;
}

export interface CompanySummary {
  summary: {
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
    overallMargin: number;
    employeeCount: number;
  };
  rates: {
    overhead: number;
    ga: number;
    targetProfit: number;
  };
  employees: Array<{
    name: string;
    title: string;
    revenue: number;
    cost: number;
    profit: number;
    margin: number;
  }>;
}

export interface RateCalculationRequest {
  baseSalary: number;
  fringeBenefits: any;
  utilizationHours?: number;
  contractType?: 'FFP' | 'T&M' | 'CPFF';
}

export interface RateComparisonRequest {
  baseSalary: number;
  fringeBenefits: any;
  scenarios: Array<{
    utilizationHours: number;
    contractType?: 'FFP' | 'T&M' | 'CPFF';
    billRate?: number;
  }>;
}

export interface BulkRateCalculationRequest {
  employees: RateCalculationRequest[];
}

export interface EmployeeRateDetails {
  employee: {
    id: number;
    name: string;
    title: string;
    baseSalary: number;
    utilizationTarget: number;
  };
  rateScenarios: {
    [key: string]: RateStructure;
  };
  currentContracts: Array<{
    contractNumber: string;
    contractName: string;
    customer: string;
    contractType: string;
    billRate: number;
    allocationPercentage: number;
  }>;
  companyRates: {
    fiscalYear: number;
    overheadRate: number;
    gaRate: number;
    targetProfitMargin: number;
    compensationCap: number;
  };
}
