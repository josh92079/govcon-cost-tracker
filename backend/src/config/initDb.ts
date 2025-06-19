import CompanyRates from "../models/companyRates";
import Contract from "../models/contract";
import Employee from "../models/employee";
import EmployeeContract from "../models/employeeContract";
import FringeBenefits from "../models/fringeBenefits";
import { sequelize } from "./database";

async function initializeDatabase(): Promise<void> {
  try {
    // Force sync to recreate all tables
    await sequelize.sync({ force: true });
    console.log("Database synchronized");

    // Create default company rates
    await CompanyRates.create({
      fiscalYear: new Date().getFullYear(),
      overheadRate: 0.035,
      gaRate: 0.015,
      targetProfitMargin: 0.1,
      compensationCap: 207000,
    });

    console.log("Default company rates created");

    // Create sample data (optional)
    const sampleEmployee = await Employee.create({
      name: "John Doe",
      title: "Senior Software Engineer",
      baseSalary: 150000,
      hireDate: new Date("2023-01-15"),
      utilizationTarget: 1800,
    });

    await FringeBenefits.create({
      employeeId: sampleEmployee.id,
      healthInsurance: 12000,
      dentalInsurance: 1200,
      visionInsurance: 600,
      ltdInsurance: 500,
      stdInsurance: 300,
      lifeInsurance: 400,
      trainingBudget: 2000,
      match401k: 6000,
      ptoCost: 11538, // ~15 days PTO
      cellAllowance: 1200,
      internetAllowance: 600,
    });

    const sampleContract = await Contract.create({
      contractNumber: "GS-35F-123ABC",
      contractName: "IT Modernization Support",
      customer: "Department of Defense",
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-12-31"),
      contractType: "T&M",
      totalValue: 5000000,
    });

    await EmployeeContract.create({
      employeeId: sampleEmployee.id,
      contractId: sampleContract.id,
      allocationPercentage: 100,
      billRate: 175,
      startDate: new Date("2024-01-01"),
    });

    console.log("Sample data created");
    console.log("Database initialization complete");

    process.exit(0);
  } catch (error) {
    console.error("Database initialization failed:", error);
    process.exit(1);
  }
}

initializeDatabase();
