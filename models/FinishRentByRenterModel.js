import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Products from "./ProductModel.js";
import Users from "./UserModel.js";

const { DataTypes } = Sequelize;

const FinishRentByRenter = db.define(
  "finish_rent_byrenter",
  {
    finishRentByRenterId: {
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
    total_price: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    start_date: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    end_date: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    fine: {
      type: DataTypes.INTEGER,
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

FinishRentByRenter.belongsTo(Products, {
  foreignKey: "productId",
  onDelete: "CASCADE",
});
FinishRentByRenter.belongsTo(Users, {
  foreignKey: "ownerId",
  as: "owner",
  onDelete: "CASCADE",
});
FinishRentByRenter.belongsTo(Users, {
  foreignKey: "renterId",
  as: "renter",
  onDelete: "CASCADE",
});

export default FinishRentByRenter;
