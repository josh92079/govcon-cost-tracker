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
  public id!: number;
  public contractNumber!: string;
  public contractName!: string;
  public customer!: string;
  public startDate!: Date;
  public endDate!: Date;
  public contractType!: "FFP" | "T&M" | "CPFF";
  public totalValue!: number | null;
  public active!: boolean;
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
