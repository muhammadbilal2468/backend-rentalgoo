import moment from "moment";
import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Products from "./ProductModel.js";
import Users from "./UserModel.js";

const { DataTypes } = Sequelize;

const IsRentingProducts = db.define(
  "is_renting_products",
  {
    isRentingProductId: {
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

    // remaining_time: {
    //   type: DataTypes.VIRTUAL,
    //   get() {
    //     const currentMoment = moment();
    //     const endMoment = moment(
    //       this.getDataValue("end_date"),
    //       "dddd DD MMMM YYYY HH:mm:ss"
    //     );

    //     if (currentMoment.isAfter(endMoment)) {
    //       return "Waktu Telah Habis";
    //     }

    //     const duration = moment.duration(endMoment.diff(currentMoment));
    //     const days = duration.days();
    //     const hours = duration.hours();
    //     const minutes = duration.minutes();
    //     const seconds = duration.seconds();
    //     return `${days} Hari ${hours} Jam ${minutes} Menit ${seconds} Detik`;
    //   },
    // },

    remaining_time: {
      type: DataTypes.VIRTUAL,
      get() {
        const currentMoment = moment();
        const endMoment = moment(
          this.getDataValue("end_date"),
          "dddd DD MMMM YYYY HH:mm:ss"
        );

        if (currentMoment.isAfter(endMoment)) {
          // Waktu telah lewat
          const duration = moment.duration(currentMoment.diff(endMoment));
          const days = duration.days();
          const hours = duration.hours();
          const minutes = duration.minutes();
          const seconds = duration.seconds();
          return `${days} Hari ${hours} Jam ${minutes} Menit ${seconds} Detik Terlewat`;
        }

        const duration = moment.duration(endMoment.diff(currentMoment));
        const days = duration.days();
        const hours = duration.hours();
        const minutes = duration.minutes();
        const seconds = duration.seconds();
        return `${days} Hari ${hours} Jam ${minutes} Menit ${seconds} Detik`;
      },
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

IsRentingProducts.belongsTo(Products, {
  foreignKey: "productId",
  onDelete: "CASCADE",
});

IsRentingProducts.belongsTo(Users, {
  foreignKey: "ownerId",
  as: "owner",
  onDelete: "CASCADE",
});
IsRentingProducts.belongsTo(Users, {
  foreignKey: "renterId",
  as: "renter",
  onDelete: "CASCADE",
});

export default IsRentingProducts;
