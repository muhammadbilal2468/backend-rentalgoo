import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Users from "./UserModel.js";

const { DataTypes } = Sequelize;

const Chats = db.define(
  "chats",
  {
    chatId: {
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
    message: {
      type: DataTypes.STRING,
    },
    message_time: {
      type: DataTypes.STRING,
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    receiverId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);

Chats.belongsTo(Users, { foreignKey: "senderId", as: "sender" });
Chats.belongsTo(Users, { foreignKey: "receiverId", as: "receiver" });

export default Chats;
