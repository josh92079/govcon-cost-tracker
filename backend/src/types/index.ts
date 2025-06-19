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
  // Payroll taxes (calculated automatically if not provided)
  ficaTax?: number;
  futaTax?: number;
  sutaTax?: number;
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
  contractType?: "FFP" | "T&M" | "CPFF";
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
  validation?: {
    isValid: boolean;
    warnings: string[];
  };
}

// New interfaces for enhanced features
export interface RateScenario {
  utilizationHours: number;
  contractType?: "FFP" | "T&M" | "CPFF";
  billRate?: number;
}

export interface RateComparison {
  scenario: RateScenario;
  rateStructure: RateStructure;
  profitAnalysis?: {
    profit: number;
    profitMargin: number;
    markup: number;
  };
}

export interface BulkRateCalculationResult {
  index: number;
  error?: string;
  employee?: RateStructure["employee"];
  rates?: RateStructure["rates"];
  costs?: RateStructure["costs"];
  targetBillRate?: number;
  targetProfitMargin?: number;
  validation?: RateStructure["validation"];
}

export interface ContractRateAnalysis {
  employee: {
    id: number;
    name: string;
    title: string;
  };
  allocation: number;
  allocatedHours: number;
  rates: {
    directLaborRate: number;
    burdenedCost: number;
    billRate: number;
    wrapRate: number;
  };
  financial: {
    allocatedRevenue: number;
    allocatedCost: number;
    allocatedProfit: number;
    profit: number;
    profitMargin: number;
    markup: number;
  };
  validation?: {
    isValid: boolean;
    warnings: string[];
  };
}
