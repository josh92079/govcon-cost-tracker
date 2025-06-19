// backend/src/types/index.ts
export interface EmployeeInput {
  name: string;
  title: string;
  baseSalary: number;
  hireDate: Date;
  utilizationTarget: number;
  fringeBenefits?: FringeBenefitsInput;
}

export interface FringeBenefitsInput {
  healthInsurance?: number;
  dentalInsurance?: number;
  visionInsurance?: number;
  ltdInsurance?: number;
  stdInsurance?: number;
  lifeInsurance?: number;
  trainingBudget?: number;
  match401k?: number;
  ptoCost?: number;
  cellAllowance?: number;
  internetAllowance?: number;
}

export interface ContractInput {
  contractNumber: string;
  contractName: string;
  customer: string;
  startDate: Date;
  endDate: Date;
  contractType: "FFP" | "T&M" | "CPFF";
  totalValue?: number;
}

export interface EmployeeContractInput {
  employeeId: number;
  allocationPercentage: number;
  billRate: number;
  startDate: Date;
  endDate?: Date | null;
}

export interface CompanyRatesInput {
  overheadRate: number;
  gaRate: number;
  targetProfitMargin: number;
  compensationCap?: number;
}

export interface RateCalculationInput {
  baseSalary: number;
  fringeBenefits: FringeBenefitsInput;
  utilizationHours?: number;
}

export interface RateStructure {
  employee: {
    name?: string;
    title?: string;
    baseSalary: number;
    utilizationHours: number;
  };
  rates: {
    directLaborRate: number;
    fringeRate: number;
    overheadRate: number;
    gaRate: number;
  };
  costs: {
    directLabor: number;
    fringeCost: number;
    overheadCost: number;
    gaCost: number;
    totalBurdenedCost: number;
    wrapRate: number;
  };
  targetBillRate: number;
  targetProfitMargin: number;
}
