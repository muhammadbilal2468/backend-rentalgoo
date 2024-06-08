import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Users from "./UserModel.js";

const { DataTypes } = Sequelize;

const Address = db.define(
  "address",
  {
    addressId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    uuid: {
      type: DataTypes.STRING,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    province: {
      type: DataTypes.STRING,
    },
    citydistrict: {
      type: DataTypes.STRING,
    },
    subdistrict: {
      type: DataTypes.STRING,
    },
    address: {
      type: DataTypes.STRING,
    },
    location: {
      type: DataTypes.STRING,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
  },
  {
    freezeTableName: true,
  }
);

Users.hasMany(Address);
Address.belongsTo(Users, { foreignKey: "userId" });

export default Address;
