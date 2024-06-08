import { Op, literal } from "sequelize";
import FinishRentByRenter from "../models/FinishRentByRenterModel.js";
import Products from "../models/ProductModel.js";
import Users from "../models/UserModel.js";

export const getFinishRentByRenter = async (req, res) => {
  if (req.role === "admin") {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const parsedLimit = parseInt(limit, 10);

      const whereClause = {};

      if (search) {
        whereClause[Op.or] = [
          { "$product.name$": { [Op.like]: `%${search}%` } },
          { "$owner.name$": { [Op.like]: `%${search}%` } },
          { "$renter.name$": { [Op.like]: `%${search}%` } },
        ];
      }

      const offset = (page - 1) * limit;

      const resp = await FinishRentByRenter.findAndCountAll({
        attributes: [
          "finishRentByRenterId",
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
        totalFinishRents: resp.count,
        finishRents: resp.rows,
      });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  } else {
    try {
      const resp = await FinishRentByRenter.findAll({
        attributes: [
          "finishRentByRenterId",
          "uuid",
          "amount",
          "total_price",
          "fine",
          "status",
          [
            literal("DATE_FORMAT(start_date, '%e %M %Y %H:%i:%s')"),
            "start_date",
          ],
          [literal("DATE_FORMAT(end_date, '%e %M %Y %H:%i:%s')"), "end_date"],
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
        where: {
          renterId: req.userId, // Hanya data yang dimiliki oleh owner
        },
      });
      if (resp.length === 0) {
        return res
          .status(404)
          .json({ msg: "Belum Ada Barang Yang Selesai Anda Sewa" });
      }

      res.status(200).json(resp);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  }
};

export const getFinishRentByRenterById = async (req, res) => {
  try {
    const resp = await FinishRentByRenter.findOne({
      where: {
        uuid: req.params.id,
      },
      attributes: [
        "finishRentByRenterId",
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
      return res.status(404).json({ msg: "Riwayat Menyewa Tidak Ditemukan" });
    }

    res.status(200).json(resp);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const createFinishRentByRenter = async (req, res) => {
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
    await FinishRentByRenter.create({
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

    res
      .status(201)
      .json({ msg: "Data Barang Masuk Ke Proses Selesai Menyewakan" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: error.message });
  }
};

export const deleteFinishRentByRenter = async (req, res) => {
  const finishRent = await FinishRentByRenter.findOne({
    where: {
      uuid: req.params.id,
    },
  });

  if (finishRent.renterId !== req.userId && req.role !== "admin") {
    return res.status(403).json({ msg: "Akses Terlarang" });
  }

  if (!finishRent) {
    return res.status(404).json({ msg: "Barang Selesai Sewa Tidak Ditemukan" });
  }

  try {
    await finishRent.destroy({
      where: { finishRentByRenterId: finishRent.finishRentByRenterId },
    });

    res.status(200).json({ msg: "Data Selesai Menyewa Berhasil Dihapus" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
