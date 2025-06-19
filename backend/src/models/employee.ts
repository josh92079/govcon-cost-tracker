import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

interface EmployeeAttributes {
  id: number;
  name: string;
  title: string;
  baseSalary: number;
  hireDate: Date;
  utilizationTarget: number;
  active: boolean;
}

interface EmployeeCreationAttributes
  extends Optional<EmployeeAttributes, "id" | "active"> {}

class Employee
  extends Model<EmployeeAttributes, EmployeeCreationAttributes>
  implements EmployeeAttributes
{
  declare id: number;
  declare name: string;
  declare title: string;
  declare baseSalary: number;
  declare hireDate: Date;
  declare utilizationTarget: number;
  declare active: boolean;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Employee.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    baseSalary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    hireDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    utilizationTarget: {
      type: DataTypes.INTEGER,
      defaultValue: 1800,
      validate: {
        isIn: [[1800, 1860]],
      },
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "Employee",
    tableName: "employees",
  }
);

export default Employee;
