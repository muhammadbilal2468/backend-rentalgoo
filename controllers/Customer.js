import { Op, literal } from "sequelize";
import Customers from "../models/CustomerModel.js";
import Products from "../models/ProductModel.js";
import Users from "../models/UserModel.js";

export const getCustomers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const parsedLimit = parseInt(limit, 10);

    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [{ "$renter.name$": { [Op.like]: `%${search}%` } }];
    }

    const offset = (page - 1) * limit;

    const resp = await Customers.findAndCountAll({
      attributes: [
        "customerId",
        "uuid",
        "amount",
        "total_price",
        "fine",
        "status",
        "start_date",
        "end_date",
      ],
      include: [
        {
          model: Products,
          attributes: ["productId", "uuid", "name", "url", "guarantee"],
        },
        {
          model: Users,
          as: "owner",
          attributes: ["userId", "uuid", "url", "name"],
        },
        {
          model: Users,
          as: "renter",
          attributes: ["userId", "uuid", "url", "name"],
        },
      ],
      where: whereClause,
      limit: parsedLimit,
      offset,
    });

    const totalPages = Math.ceil(resp.count / limit);

    res.status(200).json({
      totalPages,
      curentPage: parseInt(page),
      totalCustomers: resp.count,
      customers: resp.rows,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getCutomerById = async (req, res) => {
  try {
    const resp = await Customers.findOne({
      where: {
        uuid: req.params.id,
      },
      attributes: [
        "customerId",
        "uuid",
        "amount",
        "total_price",
        "fine",
        "status",
        "start_date",
        "end_date",
      ],
      include: [
        {
          model: Products,
          attributes: ["productId", "uuid", "name", "url", "guarantee"],
        },
        {
          model: Users,
          as: "owner",
          attributes: ["userId", "uuid", "url", "name", "nohp"],
        },
        {
          model: Users,
          as: "renter",
          attributes: ["userId", "uuid", "url", "name", "nohp"],
        },
      ],
    });

    if (!resp) {
      return res.status(404).json({ msg: "Data Pelanggan Tidak ditemukan" });
    }

    res.status(200).json(resp);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const createCustomer = async (req, res) => {
  const {
    amount,
    total_price,
    fine,
    status,
    start_date,
    end_date,
    productId,
    ownerId,
    renterId,
  } = req.body;

  try {
    await Customers.create({
      amount,
      total_price,
      fine,
      status,
      start_date,
      end_date,
      productId,
      ownerId,
      renterId,
    });

    res.status(201).json({ msg: "Data Pelanggan Berhasil Ditambahkan" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: error.message });
  }
};

export const deleteCustomer = async (req, res) => {
  const customer = await Customers.findOne({
    where: {
      uuid: req.params.id,
    },
  });

  if (!customer) {
    return res.status(404).json({ msg: "Data Pelanggan Tidak Ditemukan" });
  }

  try {
    await customer.destroy({
      where: { customerId: customer.customerId },
    });

    res.status(200).json({ msg: "Data Pelanggan Berhasil Dihapus" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
