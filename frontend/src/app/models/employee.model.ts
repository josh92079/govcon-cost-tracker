export interface Employee {
  id?: number;
  name: string;
  title: string;
  baseSalary: number;
  hireDate: Date;
  utilizationTarget: number;
  active?: boolean;
  FringeBenefit?: FringeBenefits;
  Contracts?: any[];
}

export interface FringeBenefits {
  id?: number;
  employeeId?: number;
  healthInsurance: number;
  dentalInsurance: number;
  visionInsurance: number;
  ltdInsurance: number;
  stdInsurance: number;
  lifeInsurance: number;
  trainingBudget: number;
  match401k: number;
  ptoCost: number;
  cellAllowance: number;
  internetAllowance: number;
  // Payroll taxes (calculated automatically if not provided)
  ficaTax?: number;
  futaTax?: number;
  sutaTax?: number;
}

export interface EmployeeCostAnalysis {
  hours1800: RateStructure;
  hours1860: RateStructure;
  hours1920?: RateStructure;
  hours2080?: RateStructure;
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
