export interface Contract {
  id?: number;
  contractNumber: string;
  contractName: string;
  customer: string;
  startDate: Date;
  endDate: Date;
  contractType: 'FFP' | 'T&M' | 'CPFF';
  totalValue?: number;
  active?: boolean;
  Employees?: any[];
}

export interface ContractProfitability {
  contract: Contract;
  profitability: {
    revenue: number;
    cost: number;
    profit: number;
    margin: number;
  };
  employees: any[];
}

export interface ContractRateAnalysis {
  contract: {
    id: number;
    number: string;
    name: string;
    customer: string;
    type: string;
    startDate: Date;
    endDate: Date;
    totalValue?: number;
  };
  summary: {
    totalAllocatedRevenue: number;
    totalAllocatedCost: number;
    totalAllocatedProfit: number;
    overallMargin: number;
    employeeCount: number;
  };
  rateAnalysis: Array<{
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
  }>;
  companyRates: {
    fiscalYear: number;
    overheadRate: number;
    gaRate: number;
    targetProfitMargin: number;
    compensationCap: number;
  };
}
