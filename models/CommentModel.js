import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Products from "./ProductModel.js";
import Users from "./UserModel.js";

const { DataTypes } = Sequelize;

const Comments = db.define(
  "comments",
  {
    commentId: {
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
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    targetType: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    targetId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
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

Users.hasMany(Comments);
Comments.belongsTo(Users, { foreignKey: "userId" });

Comments.belongsTo(Products, { foreignKey: "targetId", as: "target" });

export default Comments;
