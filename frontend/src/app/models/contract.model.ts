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
