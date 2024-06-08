import { Op } from "sequelize";
import AgreementProducts from "../models/AgreementProductsModel.js";
import Products from "../models/ProductModel.js";
import Users from "../models/UserModel.js";

export const getAgreementProductsByAdmin = async (req, res) => {
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

    const resp = await AgreementProducts.findAndCountAll({
      attributes: [
        "agreementProductId",
        "uuid",
        "amount",
        "time",
        "time_unit",
        "total_price",
        "fine",
        "status",
      ],
      include: [
        {
          model: Products,
          attributes: [
            "agreementProductId",
            "uuid",
            "name",
            "url",
            "category",
            "description",
            "guarantee",
          ],
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
      totalAgreementProducts: resp.count,
      agreementProducts: resp.rows,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getOwnerAgreementProducts = async (req, res) => {
  try {
    const resp = await AgreementProducts.findAll({
      attributes: [
        "agreementProductId",
        "uuid",
        "amount",
        "time",
        "time_unit",
        "total_price",
        "fine",
        "status",
      ],
      include: [
        {
          model: Products,
          attributes: [
            "productId",
            "uuid",
            "name",
            "url",
            "category",
            "description",
            "guarantee",
            "stock",
            "price",
            "time_unit",
          ],
        },
        {
          model: Users,
          as: "owner",
          attributes: [
            "userId",
            "uuid",
            "url",
            "name",
            "email",
            "nohp",
            "address",
            "location",
          ],
        },
        {
          model: Users,
          as: "renter",
          attributes: [
            "userId",
            "uuid",
            "url",
            "name",
            "email",
            "nohp",
            "address",
            "location",
          ],
        },
      ],
      where: {
        ownerId: req.userId, // Hanya data persetujuan jika pengguna adalah pemilik
      },
    });

    if (resp.length === 0) {
      return res
        .status(404)
        .json({ msg: "Data Persetujuan Menyewakan Belum Ada" });
    }

    res.status(200).json(resp);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getRenterAgreementProducts = async (req, res) => {
  try {
    const resp = await AgreementProducts.findAll({
      attributes: [
        "agreementProductId",
        "uuid",
        "amount",
        "time",
        "time_unit",
        "total_price",
        "fine",
        "status",
      ],
      include: [
        {
          model: Products,
          attributes: [
            "productId",
            "uuid",
            "name",
            "url",
            "category",
            "description",
            "guarantee",
            "stock",
            "price",
            "time_unit",
          ],
        },
        {
          model: Users,
          as: "owner",
          attributes: [
            "userId",
            "uuid",
            "url",
            "name",
            "email",
            "nohp",
            "address",
            "location",
          ],
        },
        {
          model: Users,
          as: "renter",
          attributes: [
            "userId",
            "uuid",
            "url",
            "name",
            "email",
            "nohp",
            "address",
            "location",
          ],
        },
      ],
      where: {
        renterId: req.userId, // Hanya data persetujuan jika pengguna adalah penyewa
      },
    });

    if (resp.length === 0) {
      return res
        .status(404)
        .json({ msg: "Data Persetujuan Menyewa Belum Ada" });
    }

    res.status(200).json(resp);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getAgreementProductsById = async (req, res) => {
  try {
    const agreementProduct = await AgreementProducts.findOne({
      where: {
        uuid: req.params.id,
      },
    });
    if (!agreementProduct)
      return res
        .status(404)
        .json({ msg: "Data Persetujuan Menyewa Tidak Ditemukan" });

    const resp = await AgreementProducts.findOne({
      attributes: [
        "agreementProductId",
        "uuid",
        "amount",
        "time",
        "time_unit",
        "total_price",
        "fine",
        "status",
      ],
      include: [
        {
          model: Products,
          attributes: [
            "productId",
            "uuid",
            "name",
            "url",
            "category",
            "description",
            "guarantee",
            "stock",
            "price",
            "time_unit",
          ],
        },
        {
          model: Users,
          as: "owner",
          attributes: [
            "userId",
            "uuid",
            "url",
            "name",
            "email",
            "nohp",
            "address",
            "location",
          ],
        },
        {
          model: Users,
          as: "renter",
          attributes: ["userId", "uuid", "url", "name", "email", "nohp"],
        },
      ],
      where: {
        [Op.or]: [
          { ownerId: agreementProduct.ownerId }, // Pemilik (owner)
          { renterId: agreementProduct.renterId }, // Penyewa (renter)
        ],
      },
      where: { agreementProductId: agreementProduct.agreementProductId },
    });

    if (!resp) {
      return res
        .status(404)
        .json({ msg: "Data Persetujuan Menyewa Tidak DItemukan" });
    }

    res.status(200).json(resp);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const createAgreementProducts = async (req, res) => {
  const {
    time,
    amount,
    time_unit,
    total_price,
    fine,
    status,
    productId,
    ownerId,
  } = req.body;
  try {
    await AgreementProducts.create({
      amount: amount,
      time: time,
      time_unit: time_unit,
      total_price: total_price,
      fine: fine,
      status: status,
      productId: productId,
      ownerId: ownerId,
      renterId: req.userId,
    });
    res
      .status(201)
      .json({ msg: "Persetujuan Menyewa Berhasil Dikirim Ke Pemilik Barang" });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ msg: error.message });
  }
};

export const updateAgreementProducts = async (req, res) => {
  const agreementProduct = await AgreementProducts.findOne({
    where: {
      uuid: req.params.id,
    },
  });

  const { status, total_price, amount, time, time_unit } = req.body;

  try {
    if (req.role === "admin") {
      await AgreementProducts.update(
        {
          status: status,
          total_price: total_price,
          amount: amount,
          time: time,
          time_unit: time_unit,
        },
        {
          where: {
            agreementProductId: agreementProduct.agreementProductId,
          },
        }
      );
    } else {
      await AgreementProducts.update(
        {
          status: status,
          total_price: total_price,
        },
        {
          where: {
            agreementProductId: agreementProduct.agreementProductId,
          },
        }
      );
    }

    res.status(200).json({ msg: "Persetujuan Menyewa Berhasil di Edit" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const deleteAgreementProducts = async (req, res) => {
  const agreementProduct = await AgreementProducts.findOne({
    where: {
      uuid: req.params.id,
    },
  });

  if (!agreementProduct) {
    return res.status(404).json({ msg: "Persetujuan Sewa Tidak Ditemukan" });
  }

  try {
    await AgreementProducts.destroy({
      where: { agreementProductId: agreementProduct.agreementProductId },
    });
    res.status(200).json({ msg: "Persetujuan Sewa Berhasil Dihapus" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: error.message });
  }
};
