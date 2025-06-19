import CompanyRates from "../models/companyRates";
import { RateStructure } from "../types";

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

export class RateCalculator {
  static calculateHourlyRate(
    annualSalary: number,
    utilizationHours: number
  ): number {
    return annualSalary / utilizationHours;
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
    utilizationHours: number
  ): RateStructure {
    const hourlyRate = this.calculateHourlyRate(
      employee.baseSalary,
      utilizationHours
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
