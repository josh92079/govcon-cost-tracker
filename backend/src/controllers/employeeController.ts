import { Request, Response } from "express";
import { RateCalculator } from "../utils/calculations";
import { EmployeeInput } from "../types";
import CompanyRates from "../models/companyRates";
import Employee from "../models/employee";
import FringeBenefits from "../models/fringeBenefits";

export const employeeController = {
  async getAllEmployees(req: Request, res: Response): Promise<void> {
    try {
      const employees = await Employee.findAll({
        where: { active: true },
        include: [FringeBenefits],
      });
      res.json(employees);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  async getEmployeeById(req: Request, res: Response): Promise<void> {
    try {
      const employee = await Employee.findByPk(req.params.id, {
        include: [FringeBenefits],
      });

      if (!employee) {
        res.status(404).json({ error: "Employee not found" });
        return;
      }

      res.json(employee);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  async createEmployee(
    req: Request<{}, {}, EmployeeInput>,
    res: Response
  ): Promise<void> {
    try {
      const employee = await Employee.create(req.body);

      // Create default fringe benefits record
      await FringeBenefits.create({
        employeeId: employee.id,
        ...req.body.fringeBenefits,
      });

      const result = await Employee.findByPk(employee.id, {
        include: [FringeBenefits],
      });

      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  },

  async updateEmployee(
    req: Request<{ id: string }, {}, EmployeeInput>,
    res: Response
  ): Promise<void> {
    try {
      const employee = await Employee.findByPk(req.params.id);

      if (!employee) {
        res.status(404).json({ error: "Employee not found" });
        return;
      }

      await employee.update(req.body);

      if (req.body.fringeBenefits) {
        const fringeBenefits = await FringeBenefits.findOne({
          where: { employeeId: employee.id },
        });

        if (fringeBenefits) {
          await fringeBenefits.update(req.body.fringeBenefits);
        }
      }

      const result = await Employee.findByPk(employee.id, {
        include: [FringeBenefits],
      });

      res.json(result);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  },

  async deleteEmployee(
    req: Request<{ id: string }>,
    res: Response
  ): Promise<void> {
    try {
      const employee = await Employee.findByPk(req.params.id);

      if (!employee) {
        res.status(404).json({ error: "Employee not found" });
        return;
      }

      await employee.update({ active: false });
      res.json({ message: "Employee deactivated successfully" });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  async getEmployeeCosts(
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

      // Get current company rates
      const currentYear = new Date().getFullYear();
      const companyRates = await CompanyRates.findOne({
        where: { fiscalYear: currentYear, active: true },
      });

      if (!companyRates) {
        res
          .status(404)
          .json({ error: "Company rates not configured for current year" });
        return;
      }

      // Calculate for both utilization scenarios
      const calculations = {
        hours1800: RateCalculator.buildRateStructure(
          employee.toJSON(),
          (employee as any).FringeBenefit?.dataValues || {},
          companyRates,
          1800
        ),
        hours1860: RateCalculator.buildRateStructure(
          employee.toJSON(),
          (employee as any).FringeBenefit?.dataValues || {},
          companyRates,
          1860
        ),
      };

      res.json(calculations);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
};
