import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Products from "./ProductModel.js";
import Users from "./UserModel.js";

const { DataTypes } = Sequelize;

const AgreementProducts = db.define(
  "agreement_products",
  {
    agreementProductId: {
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
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    time: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    time_unit: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    total_price: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    fine: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    status: {
      type: DataTypes.STRING,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    renterId: {
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

Products.hasMany(AgreementProducts);
AgreementProducts.belongsTo(Products, { foreignKey: "productId" });

AgreementProducts.belongsTo(Users, { foreignKey: "ownerId", as: "owner" });
AgreementProducts.belongsTo(Users, { foreignKey: "renterId", as: "renter" });

export default AgreementProducts;
