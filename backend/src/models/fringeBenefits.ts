import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import Employee from "./employee";

interface FringeBenefitsAttributes {
  id: number;
  employeeId: number;
  healthInsurance: number;
  dentalInsurance: number;
  visionInsurance: number;
  ltdInsurance: number;
  stdInsurance: number;
  lifeInsurance: number;
  trainingBudget: number;
  match401k: number;
  ptoCost: number;
  cellAllowance: number;
  internetAllowance: number;
}

interface FringeBenefitsCreationAttributes
  extends Optional<
    FringeBenefitsAttributes,
    | "id"
    | "healthInsurance"
    | "dentalInsurance"
    | "visionInsurance"
    | "ltdInsurance"
    | "stdInsurance"
    | "lifeInsurance"
    | "trainingBudget"
    | "match401k"
    | "ptoCost"
    | "cellAllowance"
    | "internetAllowance"
  > {}

class FringeBenefits
  extends Model<FringeBenefitsAttributes, FringeBenefitsCreationAttributes>
  implements FringeBenefitsAttributes
{
  declare id: number;
  declare employeeId: number;
  declare healthInsurance: number;
  declare dentalInsurance: number;
  declare visionInsurance: number;
  declare ltdInsurance: number;
  declare stdInsurance: number;
  declare lifeInsurance: number;
  declare trainingBudget: number;
  declare match401k: number;
  declare ptoCost: number;
  declare cellAllowance: number;
  declare internetAllowance: number;
}

FringeBenefits.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    employeeId: {
      type: DataTypes.INTEGER,
      references: {
        model: Employee,
        key: "id",
      },
    },
    healthInsurance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    dentalInsurance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    visionInsurance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    ltdInsurance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    stdInsurance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    lifeInsurance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    trainingBudget: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    match401k: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    ptoCost: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    cellAllowance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    internetAllowance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: "FringeBenefits",
    tableName: "fringe_benefits",
  }
);

Employee.hasOne(FringeBenefits, { foreignKey: "employeeId" });
FringeBenefits.belongsTo(Employee, { foreignKey: "employeeId" });

export default FringeBenefits;
