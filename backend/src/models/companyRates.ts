import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

interface CompanyRatesAttributes {
  id: number;
  fiscalYear: number;
  overheadRate: number;
  gaRate: number;
  targetProfitMargin: number;
  compensationCap: number;
  active: boolean;
}

interface CompanyRatesCreationAttributes
  extends Optional<
    CompanyRatesAttributes,
    "id" | "active" | "compensationCap"
  > {}

class CompanyRates
  extends Model<CompanyRatesAttributes, CompanyRatesCreationAttributes>
  implements CompanyRatesAttributes
{
  declare id: number;
  declare fiscalYear: number;
  declare overheadRate: number;
  declare gaRate: number;
  declare targetProfitMargin: number;
  declare compensationCap: number;
  declare active: boolean;
}

CompanyRates.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fiscalYear: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    overheadRate: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: false,
      comment: "Overhead rate as decimal (e.g., 0.35 for 35%)",
    },
    gaRate: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: false,
      comment: "G&A rate as decimal (e.g., 0.15 for 15%)",
    },
    targetProfitMargin: {
      type: DataTypes.DECIMAL(5, 4),
      allowNull: false,
      comment: "Target profit margin as decimal (e.g., 0.10 for 10%)",
    },
    compensationCap: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 207000,
      comment: "FAR compensation cap for the year",
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "CompanyRates",
    tableName: "company_rates",
  }
);

export default CompanyRates;
