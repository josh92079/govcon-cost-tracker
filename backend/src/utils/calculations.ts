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

interface FringeBenefitDetails {
  id?: number;
  employeeId?: number;
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
  ficaTax?: number;
  futaTax?: number;
  sutaTax?: number;
}

export class RateCalculator {
  // FAR unallowable cost categories (simplified list)
  private static readonly UNALLOWABLE_FRINGE_KEYS = [
    "entertainment",
    "alcoholicBeverages",
    "fines",
    "penalties",
  ];

  static calculateHourlyRate(
    annualSalary: number,
    utilizationHours: number
  ): number {
    if (utilizationHours <= 0) {
      throw new Error("Utilization hours must be greater than zero");
    }
    return annualSalary / utilizationHours;
  }

  static applyCompensationCap(
    baseSalary: number,
    compensationCap: number
  ): number {
    // FAR 31.205-6(p) - Executive compensation limitation
    return Math.min(baseSalary, compensationCap);
  }

  static calculatePayrollTaxes(baseSalary: number): FringeBenefitDetails {
    // 2024 rates - should be configurable
    const FICA_RATE = 0.0765; // 6.2% SS + 1.45% Medicare
    const FUTA_RATE = 0.006;
    const SUTA_RATE = 0.027; // Varies by state, using average

    const ficaWageBase = 168600; // 2024 Social Security wage base
    const futaWageBase = 7000;
    const sutaWageBase = 7000; // Varies by state

    return {
      ficaTax: Math.min(baseSalary, ficaWageBase) * FICA_RATE,
      futaTax: Math.min(baseSalary, futaWageBase) * FUTA_RATE,
      sutaTax: Math.min(baseSalary, sutaWageBase) * SUTA_RATE,
    };
  }

  static calculateFringeRate(
    fringeBenefits: FringeBenefitDetails,
    baseSalary: number,
    compensationCap: number
  ): number {
    // Apply compensation cap for indirect cost calculations
    const cappedSalary = this.applyCompensationCap(baseSalary, compensationCap);

    // Calculate payroll taxes if not provided
    if (
      !fringeBenefits.ficaTax ||
      !fringeBenefits.futaTax ||
      !fringeBenefits.sutaTax
    ) {
      const payrollTaxes = this.calculatePayrollTaxes(cappedSalary);
      fringeBenefits = { ...fringeBenefits, ...payrollTaxes };
    }

    // Sum allowable fringe benefits only
    const totalFringe = Object.entries(fringeBenefits)
      .filter(([key, value]) => {
        // Exclude metadata and unallowable costs
        return (
          key !== "id" &&
          key !== "employeeId" &&
          !this.UNALLOWABLE_FRINGE_KEYS.includes(key) &&
          value != null
        );
      })
      .reduce((sum, [_, value]) => sum + parseFloat(String(value || 0)), 0);

    return totalFringe / cappedSalary;
  }

  static calculateBurdenedCost(
    directLabor: number,
    fringeRate: number,
    overheadRate: number,
    gaRate: number
  ): BurdenedCostResult {
    // Validate rates
    if (fringeRate < 0 || overheadRate < 0 || gaRate < 0) {
      throw new Error("Rates cannot be negative");
    }

    // FAR-compliant cost buildup
    const directLaborWithFringe = directLabor * (1 + fringeRate);
    const directLaborWithFringeAndOverhead =
      directLaborWithFringe * (1 + overheadRate);
    const fullyBurdenedCost = directLaborWithFringeAndOverhead * (1 + gaRate);

    return {
      directLabor,
      fringeCost: directLabor * fringeRate,
      overheadCost: directLaborWithFringe * overheadRate,
      gaCost: directLaborWithFringeAndOverhead * gaRate,
      totalBurdenedCost: fullyBurdenedCost,
      wrapRate: fullyBurdenedCost / directLabor,
    };
  }

  static calculateProfitMargin(
    billRate: number,
    burdenedCost: number
  ): ProfitMarginResult {
    if (billRate <= 0 || burdenedCost <= 0) {
      throw new Error("Bill rate and burdened cost must be positive");
    }

    const profit = billRate - burdenedCost;
    const profitMargin = (profit / billRate) * 100;
    const markup = (profit / burdenedCost) * 100;

    return {
      profit,
      profitMargin,
      markup,
    };
  }

  static validateWrapRate(wrapRate: number): {
    isValid: boolean;
    warnings: string[];
  } {
    const warnings: string[] = [];

    // Typical government contractor wrap rates range from 1.8 to 3.5
    if (wrapRate < 1.5) {
      warnings.push(
        "Wrap rate is unusually low. Verify overhead and G&A rates."
      );
    }
    if (wrapRate > 4.0) {
      warnings.push("Wrap rate is unusually high. May impact competitiveness.");
    }

    return {
      isValid: wrapRate > 1.0 && wrapRate < 5.0,
      warnings,
    };
  }

  static calculateContractTypeProfit(
    contractType: "FFP" | "T&M" | "CPFF",
    burdenedCost: number,
    targetProfitMargin: number
  ): number {
    switch (contractType) {
      case "FFP":
        // Fixed price allows higher profit margins (risk premium)
        return burdenedCost * (1 + targetProfitMargin * 1.2);

      case "T&M":
        // Time & Materials - standard profit margin
        return burdenedCost * (1 + targetProfitMargin);

      case "CPFF":
        // Cost Plus Fixed Fee - typically lower margins
        // FAR 15.404-4(c)(4)(i) limits fee to 10% for cost contracts
        const maxFeeRate = 0.1;
        const appliedRate = Math.min(targetProfitMargin, maxFeeRate);
        return burdenedCost * (1 + appliedRate);

      default:
        return burdenedCost * (1 + targetProfitMargin);
    }
  }

  static buildRateStructure(
    employee: EmployeeData,
    fringeBenefits: FringeBenefitDetails,
    companyRates: CompanyRates,
    utilizationHours: number,
    contractType?: "FFP" | "T&M" | "CPFF"
  ): RateStructure & { validation?: { isValid: boolean; warnings: string[] } } {
    // Input validation
    if (!employee.baseSalary || employee.baseSalary <= 0) {
      throw new Error("Invalid base salary");
    }

    const compensationCap = parseFloat(String(companyRates.compensationCap));
    const cappedSalary = this.applyCompensationCap(
      employee.baseSalary,
      compensationCap
    );

    // Calculate hourly rate
    const hourlyRate = this.calculateHourlyRate(cappedSalary, utilizationHours);

    // Calculate fringe rate with compensation cap consideration
    const fringeRate = this.calculateFringeRate(
      fringeBenefits,
      employee.baseSalary,
      compensationCap
    );

    // Calculate burdened costs
    const breakdown = this.calculateBurdenedCost(
      hourlyRate,
      fringeRate,
      parseFloat(String(companyRates.overheadRate)),
      parseFloat(String(companyRates.gaRate))
    );

    // Calculate target bill rate based on contract type
    const targetProfitMargin = parseFloat(
      String(companyRates.targetProfitMargin)
    );
    const targetBillRate = contractType
      ? this.calculateContractTypeProfit(
          contractType,
          breakdown.totalBurdenedCost,
          targetProfitMargin
        )
      : breakdown.totalBurdenedCost * (1 + targetProfitMargin);

    // Validate wrap rate
    const validation = this.validateWrapRate(breakdown.wrapRate);

    const result: RateStructure & {
      validation?: { isValid: boolean; warnings: string[] };
    } = {
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
      targetProfitMargin: targetProfitMargin * 100,
    };

    // Add warnings if compensation was capped
    if (employee.baseSalary > compensationCap) {
      validation.warnings.push(
        `Salary exceeds FAR compensation cap of $${compensationCap.toLocaleString()}. ` +
          `Using capped amount for indirect cost calculations.`
      );
    }

    if (validation.warnings.length > 0) {
      result.validation = validation;
    }

    return result;
  }
}
