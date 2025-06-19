import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import Contract from "./contract";
import Employee from "./employee";

interface EmployeeContractAttributes {
  id: number;
  employeeId: number;
  contractId: number;
  allocationPercentage: number;
  billRate: number;
  startDate: Date;
  endDate: Date | null;
}

interface EmployeeContractCreationAttributes
  extends Optional<EmployeeContractAttributes, "id" | "endDate"> {}

class EmployeeContract
  extends Model<EmployeeContractAttributes, EmployeeContractCreationAttributes>
  implements EmployeeContractAttributes
{
  declare id: number;
  declare employeeId: number;
  declare contractId: number;
  declare allocationPercentage: number;
  declare billRate: number;
  declare startDate: Date;
  declare endDate: Date | null;
}

EmployeeContract.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    employeeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    contractId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    allocationPercentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      validate: {
        min: 0,
        max: 100,
      },
    },
    billRate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "EmployeeContract",
    tableName: "employee_contracts",
  }
);

// Set up the many-to-many associations with explicit foreign keys
Employee.belongsToMany(Contract, {
  through: EmployeeContract,
  foreignKey: "employeeId",
  otherKey: "contractId",
});

Contract.belongsToMany(Employee, {
  through: EmployeeContract,
  foreignKey: "contractId",
  otherKey: "employeeId",
});

export default EmployeeContract;
