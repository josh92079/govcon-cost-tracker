// backend/src/controllers/rateController.ts
import { Request, Response } from "express";
import { RateCalculator } from "../utils/calculations";
import { RateCalculationInput } from "../types";
import CompanyRates from "../models/companyRates";
import Contract from "../models/contract";
import Employee from "../models/employee";
import FringeBenefits from "../models/fringeBenefits";

interface RateCalculationRequest extends RateCalculationInput {
  contractType?: "FFP" | "T&M" | "CPFF";
}

export const rateController = {
  async calculateRates(
    req: Request<{}, {}, RateCalculationRequest>,
    res: Response
  ): Promise<void> {
    try {
      const {
        baseSalary,
        fringeBenefits,
        utilizationHours = 1800,
        contractType,
      } = req.body;

      // Validate input
      if (!baseSalary || baseSalary <= 0) {
        res.status(400).json({ error: "Base salary must be positive" });
        return;
      }

      if (utilizationHours < 1000 || utilizationHours > 2080) {
        res.status(400).json({
          error: "Utilization hours must be between 1000 and 2080",
        });
        return;
      }

      const currentYear = new Date().getFullYear();
      const companyRates = await CompanyRates.findOne({
        where: { fiscalYear: currentYear, active: true },
      });

      if (!companyRates) {
        res.status(404).json({ error: "Company rates not configured" });
        return;
      }

      // Create temporary employee object for calculation
      const tempEmployee = { baseSalary };

      // For backward compatibility, check if the enhanced calculator is available
      // If not, use the original method
      const rateStructure = RateCalculator.buildRateStructure(
        tempEmployee,
        fringeBenefits,
        companyRates,
        utilizationHours,
        contractType // This parameter will be ignored by the original version
      );

      res.json(rateStructure);
    } catch (error) {
      console.error("Rate calculation error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  },

  async getEmployeeRates(
    req: Request<{ id: string }>,
    res: Response
  ): Promise<void> {
    try {
      const employee = await Employee.findByPk(req.params.id, {
        include: [FringeBenefits],
      });

      if (!employee) {
        res.status(404).json({ error: "Employee not found" });
        return;
      }

      const currentYear = new Date().getFullYear();
      const companyRates = await CompanyRates.findOne({
        where: { fiscalYear: currentYear, active: true },
      });

      if (!companyRates) {
        res.status(404).json({ error: "Company rates not configured" });
        return;
      }

      // Calculate rates for different utilization scenarios
      const utilizationScenarios = [1800, 1860, 1920, 2080];
      const rateScenarios: any = {};

      for (const hours of utilizationScenarios) {
        rateScenarios[`hours${hours}`] = RateCalculator.buildRateStructure(
          employee.toJSON(),
          (employee as any).FringeBenefit?.dataValues || {},
          companyRates,
          hours
        );
      }

      // Get employee's current contracts
      const contracts = await Contract.findAll({
        include: [
          {
            model: Employee,
            where: { id: req.params.id },
            through: { attributes: ["billRate", "allocationPercentage"] },
          },
        ],
      });

      res.json({
        employee: {
          id: employee.id,
          name: employee.name,
          title: employee.title,
          baseSalary: employee.baseSalary,
          utilizationTarget: employee.utilizationTarget,
        },
        rateScenarios,
        currentContracts: contracts.map((contract: any) => ({
          contractNumber: contract.contractNumber,
          contractName: contract.contractName,
          customer: contract.customer,
          contractType: contract.contractType,
          billRate: contract.Employees[0]?.EmployeeContract.billRate,
          allocationPercentage:
            contract.Employees[0]?.EmployeeContract.allocationPercentage,
        })),
        companyRates: {
          fiscalYear: companyRates.fiscalYear,
          overheadRate: parseFloat(String(companyRates.overheadRate)) * 100,
          gaRate: parseFloat(String(companyRates.gaRate)) * 100,
          targetProfitMargin:
            parseFloat(String(companyRates.targetProfitMargin)) * 100,
          compensationCap: parseFloat(String(companyRates.compensationCap)),
        },
      });
    } catch (error) {
      console.error("Employee rates error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  },

  async getContractRates(
    req: Request<{ id: string }>,
    res: Response
  ): Promise<void> {
    try {
      const contract = await Contract.findByPk(req.params.id, {
        include: [
          {
            model: Employee,
            include: [FringeBenefits],
            through: { attributes: ["billRate", "allocationPercentage"] },
          },
        ],
      });

      if (!contract) {
        res.status(404).json({ error: "Contract not found" });
        return;
      }

      const currentYear = new Date().getFullYear();
      const companyRates = await CompanyRates.findOne({
        where: { fiscalYear: currentYear, active: true },
      });

      if (!companyRates) {
        res.status(404).json({ error: "Company rates not configured" });
        return;
      }

      const rateAnalysis: any[] = [];
      let totalAllocatedRevenue = 0;
      let totalAllocatedCost = 0;

      for (const employee of (contract as any).Employees || []) {
        const rateStructure = RateCalculator.buildRateStructure(
          employee.toJSON(),
          employee.FringeBenefit?.dataValues || {},
          companyRates,
          employee.utilizationTarget,
          contract.contractType as "FFP" | "T&M" | "CPFF"
        );

        const billRate = parseFloat(String(employee.EmployeeContract.billRate));
        const allocationPercentage = parseFloat(
          String(employee.EmployeeContract.allocationPercentage)
        );
        const allocatedHours =
          employee.utilizationTarget * (allocationPercentage / 100);

        const allocatedRevenue = billRate * allocatedHours;
        const allocatedCost =
          rateStructure.costs.totalBurdenedCost * allocatedHours;

        totalAllocatedRevenue += allocatedRevenue;
        totalAllocatedCost += allocatedCost;

        const profitAnalysis = RateCalculator.calculateProfitMargin(
          billRate,
          rateStructure.costs.totalBurdenedCost
        );

        rateAnalysis.push({
          employee: {
            id: employee.id,
            name: employee.name,
            title: employee.title,
          },
          allocation: allocationPercentage,
          allocatedHours,
          rates: {
            directLaborRate: rateStructure.costs.directLabor,
            burdenedCost: rateStructure.costs.totalBurdenedCost,
            billRate,
            wrapRate: rateStructure.costs.wrapRate,
          },
          financial: {
            allocatedRevenue,
            allocatedCost,
            allocatedProfit: allocatedRevenue - allocatedCost,
            ...profitAnalysis,
          },
          // Include validation warnings if available
          validation: (rateStructure as any).validation,
        });
      }

      res.json({
        contract: {
          id: contract.id,
          number: contract.contractNumber,
          name: contract.contractName,
          customer: contract.customer,
          type: contract.contractType,
          startDate: contract.startDate,
          endDate: contract.endDate,
          totalValue: contract.totalValue,
        },
        summary: {
          totalAllocatedRevenue,
          totalAllocatedCost,
          totalAllocatedProfit: totalAllocatedRevenue - totalAllocatedCost,
          overallMargin:
            totalAllocatedRevenue > 0
              ? ((totalAllocatedRevenue - totalAllocatedCost) /
                  totalAllocatedRevenue) *
                100
              : 0,
          employeeCount: rateAnalysis.length,
        },
        rateAnalysis,
        companyRates: {
          fiscalYear: companyRates.fiscalYear,
          overheadRate: parseFloat(String(companyRates.overheadRate)) * 100,
          gaRate: parseFloat(String(companyRates.gaRate)) * 100,
          targetProfitMargin:
            parseFloat(String(companyRates.targetProfitMargin)) * 100,
          compensationCap: parseFloat(String(companyRates.compensationCap)),
        },
      });
    } catch (error) {
      console.error("Contract rates error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  },

  // New endpoint for bulk rate calculations
  async calculateBulkRates(
    req: Request<{}, {}, { employees: RateCalculationRequest[] }>,
    res: Response
  ): Promise<void> {
    try {
      const { employees } = req.body;

      if (!employees || !Array.isArray(employees) || employees.length === 0) {
        res.status(400).json({ error: "Employees array is required" });
        return;
      }

      const currentYear = new Date().getFullYear();
      const companyRates = await CompanyRates.findOne({
        where: { fiscalYear: currentYear, active: true },
      });

      if (!companyRates) {
        res.status(404).json({ error: "Company rates not configured" });
        return;
      }

      const results = employees.map((emp, index) => {
        try {
          const {
            baseSalary,
            fringeBenefits,
            utilizationHours = 1800,
            contractType,
          } = emp;

          if (!baseSalary || baseSalary <= 0) {
            return {
              index,
              error: "Base salary must be positive",
            };
          }

          const tempEmployee = { baseSalary };
          const rateStructure = RateCalculator.buildRateStructure(
            tempEmployee,
            fringeBenefits,
            companyRates,
            utilizationHours,
            contractType
          );

          return { index, ...rateStructure };
        } catch (error) {
          return {
            index,
            error: (error as Error).message,
          };
        }
      });

      res.json({
        results,
        companyRates: {
          fiscalYear: companyRates.fiscalYear,
          overheadRate: parseFloat(String(companyRates.overheadRate)) * 100,
          gaRate: parseFloat(String(companyRates.gaRate)) * 100,
          targetProfitMargin:
            parseFloat(String(companyRates.targetProfitMargin)) * 100,
          compensationCap: parseFloat(String(companyRates.compensationCap)),
        },
      });
    } catch (error) {
      console.error("Bulk rate calculation error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  },

  // New endpoint for rate comparison
  async compareRates(
    req: Request<
      {},
      {},
      {
        baseSalary: number;
        fringeBenefits: any;
        scenarios: Array<{
          utilizationHours: number;
          contractType?: "FFP" | "T&M" | "CPFF";
          billRate?: number;
        }>;
      }
    >,
    res: Response
  ): Promise<void> {
    try {
      const { baseSalary, fringeBenefits, scenarios } = req.body;

      if (!baseSalary || baseSalary <= 0) {
        res.status(400).json({ error: "Base salary must be positive" });
        return;
      }

      if (!scenarios || !Array.isArray(scenarios) || scenarios.length === 0) {
        res.status(400).json({ error: "Scenarios array is required" });
        return;
      }

      const currentYear = new Date().getFullYear();
      const companyRates = await CompanyRates.findOne({
        where: { fiscalYear: currentYear, active: true },
      });

      if (!companyRates) {
        res.status(404).json({ error: "Company rates not configured" });
        return;
      }

      const tempEmployee = { baseSalary };
      const comparisons = scenarios.map((scenario) => {
        const rateStructure = RateCalculator.buildRateStructure(
          tempEmployee,
          fringeBenefits,
          companyRates,
          scenario.utilizationHours,
          scenario.contractType
        );

        let profitAnalysis = null;
        if (scenario.billRate) {
          profitAnalysis = RateCalculator.calculateProfitMargin(
            scenario.billRate,
            rateStructure.costs.totalBurdenedCost
          );
        }

        return {
          scenario,
          rateStructure,
          profitAnalysis,
        };
      });

      res.json({
        baseSalary,
        comparisons,
        companyRates: {
          fiscalYear: companyRates.fiscalYear,
          overheadRate: parseFloat(String(companyRates.overheadRate)) * 100,
          gaRate: parseFloat(String(companyRates.gaRate)) * 100,
          targetProfitMargin:
            parseFloat(String(companyRates.targetProfitMargin)) * 100,
          compensationCap: parseFloat(String(companyRates.compensationCap)),
        },
      });
    } catch (error) {
      console.error("Rate comparison error:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  },
};
