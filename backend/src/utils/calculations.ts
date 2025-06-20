// backend/src/utils/calculations.ts
import CompanyRates from "../models/companyRates";

interface EmployeeData {
  name?: string;
  title?: string;
  baseSalary: number;
  utilizationTarget?: number;
}

interface BurdenedCostResult {
  directLabor: number;
  fringeCost: number;
  overheadCost: number;
  gaCost: number;
  totalBurdenedCost: number;
  wrapRate: number;
}

interface ProfitMarginResult {
  profit: number;
  profitMargin: number;
  markup: number;
}

interface RateStructure {
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
  costs: BurdenedCostResult;
  targetBillRate: number;
  targetProfitMargin: number;
}

export class RateCalculator {
  // FAR standard work year is 2080 hours
  private static readonly STANDARD_WORK_HOURS = 2080;

  static calculateHourlyRate(
    annualSalary: number,
    utilizationHours: number,
    contractType?: string,
    compensationCap?: number
  ): number {
    // For T&M contracts, do NOT apply the compensation cap
    // For other contract types, apply the cap if the salary exceeds it
    let effectiveSalary = annualSalary;

    if (
      contractType !== "T&M" &&
      compensationCap &&
      annualSalary > compensationCap
    ) {
      effectiveSalary = compensationCap;
    }

    // Always use standard 2080 hours for direct labor rate calculation per FAR
    return effectiveSalary / this.STANDARD_WORK_HOURS;
  }

  static calculateFringeRate(fringeBenefits: any, baseSalary: number): number {
    const totalFringe = Object.entries(fringeBenefits)
      .filter(([key]) => key !== "id" && key !== "employeeId")
      .reduce((sum, [_, value]) => sum + parseFloat(String(value || 0)), 0);

    return totalFringe / baseSalary;
  }

  static calculateBurdenedCost(
    directLabor: number,
    fringeRate: number,
    overheadRate: number,
    gaRate: number
  ): BurdenedCostResult {
    const withFringe = directLabor * (1 + fringeRate);
    const withOverhead = withFringe * (1 + overheadRate);
    const fullyBurdened = withOverhead * (1 + gaRate);

    return {
      directLabor,
      fringeCost: directLabor * fringeRate,
      overheadCost: withFringe * overheadRate,
      gaCost: withOverhead * gaRate,
      totalBurdenedCost: fullyBurdened,
      wrapRate: fullyBurdened / directLabor,
    };
  }

  static calculateProfitMargin(
    billRate: number,
    burdenedCost: number
  ): ProfitMarginResult {
    const profit = billRate - burdenedCost;
    const profitMargin = (profit / billRate) * 100;

    return {
      profit,
      profitMargin,
      markup: (profit / burdenedCost) * 100,
    };
  }

  static buildRateStructure(
    employee: EmployeeData,
    fringeBenefits: any,
    companyRates: CompanyRates,
    utilizationHours: number,
    contractType?: string
  ): RateStructure {
    const hourlyRate = this.calculateHourlyRate(
      employee.baseSalary,
      utilizationHours,
      contractType,
      parseFloat(String(companyRates.compensationCap))
    );

    const fringeRate = this.calculateFringeRate(
      fringeBenefits,
      employee.baseSalary
    );

    const breakdown = this.calculateBurdenedCost(
      hourlyRate,
      fringeRate,
      parseFloat(String(companyRates.overheadRate)),
      parseFloat(String(companyRates.gaRate))
    );

    const targetBillRate =
      breakdown.totalBurdenedCost *
      (1 + parseFloat(String(companyRates.targetProfitMargin)));

    return {
      employee: {
        name: employee.name,
        title: employee.title,
        baseSalary: employee.baseSalary,
        utilizationHours,
      },
      rates: {
        directLaborRate: hourlyRate,
        fringeRate: fringeRate * 100,
        overheadRate: parseFloat(String(companyRates.overheadRate)) * 100,
        gaRate: parseFloat(String(companyRates.gaRate)) * 100,
      },
      costs: breakdown,
      targetBillRate,
      targetProfitMargin:
        parseFloat(String(companyRates.targetProfitMargin)) * 100,
    };
  }
}
