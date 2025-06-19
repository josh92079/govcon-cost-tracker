import { Request, Response } from "express";
import { Op } from "sequelize";
import { RateCalculator } from "../utils/calculations";
import CompanyRates from "../models/companyRates";
import Contract from "../models/contract";
import Employee from "../models/employee";
import FringeBenefits from "../models/fringeBenefits";
import { CompanyRatesInput } from "../types";

export const companyController = {
  async getCurrentRates(req: Request, res: Response): Promise<void> {
    try {
      const currentYear = new Date().getFullYear();
      let rates = await CompanyRates.findOne({
        where: { fiscalYear: currentYear, active: true },
      });

      // Create default rates if none exist
      if (!rates) {
        rates = await CompanyRates.create({
          fiscalYear: currentYear,
          overheadRate: 0.35,
          gaRate: 0.15,
          targetProfitMargin: 0.1,
          compensationCap: 207000,
        });
      }

      res.json(rates);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  async updateRates(
    req: Request<{}, {}, CompanyRatesInput>,
    res: Response
  ): Promise<void> {
    try {
      const currentYear = new Date().getFullYear();
      const rates = await CompanyRates.findOne({
        where: { fiscalYear: currentYear, active: true },
      });

      if (rates) {
        await rates.update(req.body);
      } else {
        await CompanyRates.create({
          fiscalYear: currentYear,
          overheadRate: req.body.overheadRate,
          gaRate: req.body.gaRate,
          targetProfitMargin: req.body.targetProfitMargin,
          compensationCap: req.body.compensationCap || 207000,
        });
      }

      res.json({ message: "Rates updated successfully" });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  },

  async getCompanySummary(req: Request, res: Response): Promise<void> {
    try {
      const currentYear = new Date().getFullYear();
      const companyRates = await CompanyRates.findOne({
        where: { fiscalYear: currentYear, active: true },
      });

      if (!companyRates) {
        res.status(404).json({ error: "Company rates not configured" });
        return;
      }

      // Get all active employees with their contracts
      const employees = await Employee.findAll({
        where: { active: true },
        include: [
          FringeBenefits,
          {
            model: Contract,
            through: {
              attributes: ["allocationPercentage", "billRate"],
              where: {
                endDate: {
                  [Op.or]: [null, { [Op.gte]: new Date() }],
                },
              },
            },
          },
        ],
      });

      let totalRevenue = 0;
      let totalCost = 0;
      const employeeDetails: any[] = [];

      for (const employee of employees) {
        const rateStructure = RateCalculator.buildRateStructure(
          employee.toJSON(),
          (employee as any).FringeBenefit?.dataValues || {},
          companyRates,
          employee.utilizationTarget
        );

        let employeeRevenue = 0;
        const employeeCost =
          rateStructure.costs.totalBurdenedCost * employee.utilizationTarget;

        // Calculate revenue from all contracts
        for (const contract of (employee as any).Contracts || []) {
          const allocation =
            (contract.EmployeeContract.allocationPercentage as number) / 100;
          const billRate = contract.EmployeeContract.billRate as number;
          const hoursAllocated = employee.utilizationTarget * allocation;

          employeeRevenue += billRate * hoursAllocated;
        }

        totalRevenue += employeeRevenue;
        totalCost += employeeCost;

        employeeDetails.push({
          name: employee.name,
          title: employee.title,
          revenue: employeeRevenue,
          cost: employeeCost,
          profit: employeeRevenue - employeeCost,
          margin:
            employeeRevenue > 0
              ? ((employeeRevenue - employeeCost) / employeeRevenue) * 100
              : 0,
        });
      }

      res.json({
        summary: {
          totalRevenue,
          totalCost,
          totalProfit: totalRevenue - totalCost,
          overallMargin:
            totalRevenue > 0
              ? ((totalRevenue - totalCost) / totalRevenue) * 100
              : 0,
          employeeCount: employees.length,
        },
        rates: {
          overhead: parseFloat(String(companyRates.overheadRate)) * 100,
          ga: parseFloat(String(companyRates.gaRate)) * 100,
          targetProfit:
            parseFloat(String(companyRates.targetProfitMargin)) * 100,
        },
        employees: employeeDetails,
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
};
