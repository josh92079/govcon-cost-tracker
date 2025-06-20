// backend/src/utils/calculations-adapter.ts
// This adapter allows you to use either the original or enhanced calculator

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
    // FAR-compliant calculation: Always divide by 2080 for direct labor rate
    // Direct labor rate = Annual salary ÷ 2,080 hours (standard work year)
    const STANDARD_WORK_YEAR_HOURS = 2080;
    return annualSalary / STANDARD_WORK_YEAR_HOURS;
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
    contractType?: "FFP" | "T&M" | "CPFF" // Optional parameter for backward compatibility
  ): RateStructure {
    // Apply compensation cap if available (not applicable for T&M contracts)
    const compensationCap = companyRates.compensationCap
      ? parseFloat(String(companyRates.compensationCap))
      : Infinity; // No cap if not set

    // For T&M contracts, compensation cap doesn't apply per FAR 16.601
    // T&M hourly rates are fixed and include all elements
    const effectiveSalary =
      contractType === "T&M"
        ? employee.baseSalary
        : Math.min(employee.baseSalary, compensationCap);

    // Calculate hourly rate based on FAR standards (2080 hours)
    const hourlyRate = this.calculateHourlyRate(
      effectiveSalary,
      utilizationHours // This parameter is ignored in the calculation
    );

    // Use appropriate salary base for fringe rate calculation
    const fringeRate = this.calculateFringeRate(
      fringeBenefits,
      effectiveSalary
    );

    const breakdown = this.calculateBurdenedCost(
      hourlyRate,
      fringeRate,
      parseFloat(String(companyRates.overheadRate)),
      parseFloat(String(companyRates.gaRate))
    );

    // Calculate target bill rate based on contract type
    let targetBillRate: number;
    const targetProfitMargin = parseFloat(
      String(companyRates.targetProfitMargin)
    );

    if (contractType) {
      // Contract-specific profit calculations
      switch (contractType) {
        case "FFP":
          // Fixed price allows higher profit margins (risk premium)
          targetBillRate =
            breakdown.totalBurdenedCost * (1 + targetProfitMargin * 1.2);
          break;

        case "T&M":
          // Time & Materials - standard profit margin
          targetBillRate =
            breakdown.totalBurdenedCost * (1 + targetProfitMargin);
          break;

        case "CPFF":
          // Cost Plus Fixed Fee - typically lower margins
          // FAR 15.404-4(c)(4)(i) limits fee to 10% for cost contracts
          const maxFeeRate = 0.1;
          const appliedRate = Math.min(targetProfitMargin, maxFeeRate);
          targetBillRate = breakdown.totalBurdenedCost * (1 + appliedRate);
          break;

        default:
          targetBillRate =
            breakdown.totalBurdenedCost * (1 + targetProfitMargin);
      }
    } else {
      // Default calculation for backward compatibility
      targetBillRate = breakdown.totalBurdenedCost * (1 + targetProfitMargin);
    }

    const result: RateStructure = {
      employee: {
        name: employee.name,
        title: employee.title,
        baseSalary: employee.baseSalary,
        utilizationHours, // Used for annual cost projections, not rate calculation
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

    // Add validation warnings if wrap rate is unusual
    const validation = this.validateWrapRate(breakdown.wrapRate);
    if (validation.warnings.length > 0) {
      (result as any).validation = validation;
    }

    // Add warning if compensation was capped (not applicable for T&M)
    if (employee.baseSalary > compensationCap && contractType !== "T&M") {
      if (!(result as any).validation) {
        (result as any).validation = { isValid: true, warnings: [] };
      }
      (result as any).validation.warnings.push(
        `Salary exceeds FAR compensation cap of ${compensationCap.toLocaleString()}. ` +
          `Using capped amount for indirect cost calculations (not applicable for T&M contracts).`
      );
    }

    return result;
  }

  private static validateWrapRate(wrapRate: number): {
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
}
