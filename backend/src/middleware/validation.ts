import { Request, Response, NextFunction } from "express";

export const validateEmployeeInput = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { name, title, baseSalary, hireDate, utilizationTarget } = req.body;

  const errors: string[] = [];

  if (!name || typeof name !== "string") {
    errors.push("Name is required and must be a string");
  }

  if (!title || typeof title !== "string") {
    errors.push("Title is required and must be a string");
  }

  if (!baseSalary || typeof baseSalary !== "number" || baseSalary <= 0) {
    errors.push("Base salary is required and must be a positive number");
  }

  if (!hireDate) {
    errors.push("Hire date is required");
  }

  if (utilizationTarget && ![1800, 1860].includes(utilizationTarget)) {
    errors.push("Utilization target must be either 1800 or 1860");
  }

  if (errors.length > 0) {
    res.status(400).json({ errors });
    return;
  }

  next();
};

export const validateContractInput = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const {
    contractNumber,
    contractName,
    customer,
    startDate,
    endDate,
    contractType,
  } = req.body;

  const errors: string[] = [];

  if (!contractNumber || typeof contractNumber !== "string") {
    errors.push("Contract number is required and must be a string");
  }

  if (!contractName || typeof contractName !== "string") {
    errors.push("Contract name is required and must be a string");
  }

  if (!customer || typeof customer !== "string") {
    errors.push("Customer is required and must be a string");
  }

  if (!startDate) {
    errors.push("Start date is required");
  }

  if (!endDate) {
    errors.push("End date is required");
  }

  if (!contractType || !["FFP", "T&M", "CPFF"].includes(contractType)) {
    errors.push("Contract type must be FFP, T&M, or CPFF");
  }

  if (errors.length > 0) {
    res.status(400).json({ errors });
    return;
  }

  next();
};

export const validateRatesInput = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { overheadRate, gaRate, targetProfitMargin } = req.body;

  const errors: string[] = [];

  if (overheadRate !== undefined) {
    if (
      typeof overheadRate !== "number" ||
      overheadRate < 0 ||
      overheadRate > 1
    ) {
      errors.push("Overhead rate must be a decimal between 0 and 1");
    }
  }

  if (gaRate !== undefined) {
    if (typeof gaRate !== "number" || gaRate < 0 || gaRate > 1) {
      errors.push("G&A rate must be a decimal between 0 and 1");
    }
  }

  if (targetProfitMargin !== undefined) {
    if (
      typeof targetProfitMargin !== "number" ||
      targetProfitMargin < 0 ||
      targetProfitMargin > 1
    ) {
      errors.push("Target profit margin must be a decimal between 0 and 1");
    }
  }

  if (errors.length > 0) {
    res.status(400).json({ errors });
    return;
  }

  next();
};
