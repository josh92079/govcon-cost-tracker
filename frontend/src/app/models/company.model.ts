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
  employees: any[];
}
