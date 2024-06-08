import { Op } from "sequelize";
import Products from "../models/ProductModel.js";
import SaveProducts from "../models/SaveProductModel.js";
import Users from "../models/UserModel.js";

export const getSaveProducts = async (req, res) => {
  if (req.role === "admin") {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const parsedLimit = parseInt(limit, 10);

      const whereClause = {};

      if (search) {
        whereClause[Op.or] = [
          { "$product.name$": { [Op.like]: `%${search}%` } },
          { "$owner.name$": { [Op.like]: `%${search}%` } },
          { "$user.name$": { [Op.like]: `%${search}%` } },
        ];
      }

      const offset = (page - 1) * limit;

      const resp = await SaveProducts.findAndCountAll({
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
              "leased",
            ],
          },
          {
            model: Users,
            as: "owner",
            attributes: ["userId", "uuid", "name"],
          },
          {
            model: Users,
            as: "user",
            attributes: ["userId", "uuid", "name"],
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
        totalSaveProducts: resp.count,
        saveProducts: resp.rows,
      });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  } else {
    try {
      const resp = await SaveProducts.findAll({
        where: {
          userId: req.userId,
        },
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
              "leased",
            ],
          },
          {
            model: Users,
            as: "owner",
            attributes: ["name", "address"],
          },
        ],
      });

      if (resp.length === 0) {
        return res.status(404).json({ msg: "Tidak Ada Barang Yang Disimpan" });
      }

      res.status(200).json(resp);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  }
};

export const getSaveProductById = async (req, res) => {
  try {
    const savedProduct = await SaveProducts.findOne({
      where: {
        uuid: req.params.id,
      },
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
          attributes: ["userId", "uuid", "name", "url"],
        },
        {
          model: Users,
          as: "user",
          attributes: ["userId", "uuid", "name", "url"],
        },
      ],
    });

    if (!savedProduct) {
      return res.status(404).json({ msg: "Produk Tidak Ditemukan" });
    }

    res.status(200).json(savedProduct);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const createSaveProduct = async (req, res) => {
  try {
    const { productId, ownerId } = req.body;

    // Cek apakah produk sudah tersimpan sebelumnya
    const existingSaveProduct = await SaveProducts.findOne({
      where: {
        productId: productId,
        userId: req.userId,
      },
    });

    if (existingSaveProduct) {
      return res.status(400).json({ msg: "Produk Telah Tersimpan" });
    }

    await SaveProducts.create({
      productId: productId,
      ownerId: ownerId,
      userId: req.userId,
    });

    res.status(201).json({ msg: "Produk Berhasil Disimpan" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const deleteSaveProduct = async (req, res) => {
  try {
    const savedProduct = await SaveProducts.findOne({
      where: {
        uuid: req.params.id,
      },
    });

    if (!savedProduct) {
      return res.status(404).json({ msg: "Barang Tersimpan Tidak Ditemukan" });
    }

    if (req.role === "admin") {
      await SaveProducts.destroy({
        where: {
          saveProductId: savedProduct.saveProductId,
        },
      });
    } else {
      if (savedProduct.userId !== req.userId) {
        return res.status(403).json({ msg: "Akses Terlarang" });
      }

      await SaveProducts.destroy({
        where: {
          saveProductId: savedProduct.saveProductId,
          userId: req.userId,
        },
      });
    }

    res.status(200).json({ msg: "Produk Berhasil Dihapus Dari Daftar Simpan" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
