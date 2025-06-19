import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

interface ContractAttributes {
  id: number;
  contractNumber: string;
  contractName: string;
  customer: string;
  startDate: Date;
  endDate: Date;
  contractType: "FFP" | "T&M" | "CPFF";
  totalValue: number | null;
  active: boolean;
}

interface ContractCreationAttributes
  extends Optional<ContractAttributes, "id" | "totalValue" | "active"> {}

class Contract
  extends Model<ContractAttributes, ContractCreationAttributes>
  implements ContractAttributes
{
  declare id: number;
  declare contractNumber: string;
  declare contractName: string;
  declare customer: string;
  declare startDate: Date;
  declare endDate: Date;
  declare contractType: "FFP" | "T&M" | "CPFF";
  declare totalValue: number | null;
  declare active: boolean;
}

Contract.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    contractNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    contractName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    customer: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    contractType: {
      type: DataTypes.ENUM("FFP", "T&M", "CPFF"),
      allowNull: false,
    },
    totalValue: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "Contract",
    tableName: "contracts",
  }
);

export default Contract;
