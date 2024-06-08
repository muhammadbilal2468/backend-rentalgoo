import { Op } from "sequelize";
import Address from "../models/AddressModel.js";
import Users from "../models/UserModel.js";

export const getAddress = async (req, res) => {
  if (req.role === "admin") {
    try {
      const resp = await Address.findAll({
        attributes: [
          "addressId",
          "uuid",
          "province",
          "citydistrict",
          "subdistrict",
          "address",
          "location",
          "userId",
        ],
        include: [
          {
            model: Users,
            attributes: ["name"],
          },
        ],
      });

      if (resp.length === 0)
        return res.status(404).json({ msg: "Belum ada data alamat" });

      res.status(200).json(resp);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  } else {
    try {
      const resp = await Address.findAll({
        attributes: [
          "addressId",
          "uuid",
          "province",
          "citydistrict",
          "subdistrict",
          "address",
          "location",
          "userId",
        ],
        include: [
          {
            model: Users,
            attributes: ["userId", "uuid", "url", "name"],
          },
        ],
        where: {
          userId: req.userId,
        },
      });

      if (resp.length === 0)
        return res.status(404).json({ msg: "Anda Belum Punya Alamat" });

      res.status(200).json(resp);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  }
};

export const getAddressById = async (req, res) => {
  try {
    const address = await Address.findOne({
      where: {
        uuid: req.params.id,
      },
    });
    if (!address)
      return res.status(404).json({ msg: "Produk Tidak Ditemukan" });

    const resp = await Address.findOne({
      attributes: [
        "addressId",
        "uuid",
        "province",
        "citydistrict",
        "subdistrict",
        "address",
        "location",
        "userId",
      ],
      where: {
        uuid: req.params.id,
      },
      include: [
        {
          model: Users,
          attributes: ["userId", "uuid", "url", "name"],
        },
      ],
    });
    res.status(200).json(resp);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const createAddress = async (req, res) => {
  try {
    const { province, citydistrict, subdistrict, address, location } = req.body;

    await Address.create({
      province,
      citydistrict,
      subdistrict,
      address,
      location,
      userId: req.userId,
    });

    res.status(201).json({ msg: "Alamat Berhasil di Tambahkan" });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ msg: error.message });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const resp = await Address.findOne({
      where: {
        uuid: req.params.id,
      },
    });

    if (!resp) return res.status(404).json({ msg: "Alamat Tidak Ditemukan" });

    const { province, citydistrict, subdistrict, address, location } = req.body;

    await Address.update(
      {
        province,
        citydistrict,
        subdistrict,
        address,
        location,
        userId: req.userId,
      },
      {
        where: {
          addressId: resp.addressId,
        },
      }
    );

    res.status(200).json({ msg: "Alamat Berhasil di Ubah" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: error.message });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOne({
      where: {
        uuid: req.params.id,
      },
    });
    if (!address)
      return res.status(404).json({ msg: "Alamat Tidak Ditemukan" });

    await Address.destroy({
      where: {
        addressId: address.addressId,
      },
    });
    res.status(200).json({ msg: "Alamat Berhasil di Hapus" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
