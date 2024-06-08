import argon2 from "argon2";
import fs from "fs";
import path from "path";
import { Op } from "sequelize";
import Users from "../models/UserModel.js";

export const getUser = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const parsedLimit = parseInt(limit, 10);

    const whereClause = {};

    if (search) {
      whereClause.name = { [Op.like]: `%${search}%` };
    }

    const offset = (page - 1) * limit;

    const resp = await Users.findAndCountAll({
      attributes: [
        "uuid",
        "photo",
        "url",
        "name",
        "email",
        "nohp",
        "address",
        "location",
        "role",
      ],
      where: whereClause,
      limit: parsedLimit,
      offset,
    });

    const totalPages = Math.ceil(resp.count / limit);

    res.status(200).json({
      totalPages,
      totalUsers: resp.count,
      currentPage: parseInt(page),
      users: resp.rows,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await Users.findOne({
      where: {
        uuid: req.params.id,
      },
    });
    if (!user) return res.status(404).json({ msg: "User Tidak Ditemukan" });

    const resp = await Users.findOne({
      attributes: [
        "userId",
        "uuid",
        "url",
        "name",
        "email",
        "nohp",
        "address",
        "location",
        "role",
      ],
      where: {
        uuid: req.params.id,
      },
    });
    res.status(200).json(resp);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const createUser = async (req, res) => {
  const user = await Users.findOne({
    where: {
      email: req.body.email,
    },
  });

  if (user) return res.status(404).json({ msg: "Email sudah terdaftar" });

  const { name, email, nohp, address, location, password, confPassword, role } =
    req.body;

  if (email === "" || email === null)
    return res.status(400).json({ msg: "Email Tidak Boleh Kosong" });

  if (password !== confPassword)
    return res
      .status(400)
      .json({ msg: "Password dan Konfirmasi Password Tidak Cocok" });

  if (role === "") {
    return res.status(400).json({ msg: "Role Pengguna Tidak Boleh Kosong" });
  }

  if (req.files === null)
    return res.status(400).json({ msg: "Gambar Belum Ditambahkan" });
  const file = req.files.file;
  const fileSize = file.data.length;
  const ext = path.extname(file.name);
  const fileName = file.md5 + ext;
  const url = `${req.protocol}://${req.get("host")}/img/profile/${fileName}`;
  const allowedType = [".png", ".jpg", ".jpeg"];

  if (!allowedType.includes(ext.toLocaleLowerCase()))
    return res
      .status(422)
      .json({ msg: "Format Gamabar haru berupa PNG, JPG, dan JPEG" });

  if (fileSize > 5000000)
    return res.status(422).json({ msg: "Maksimal Ukuran Gambar 5 MB" });

  file.mv(`./public/img/profile/${fileName}`, async (err) => {
    if (err) return res.status(500).json({ msg: err.message });
    try {
      const hashPassword = await argon2.hash(password);
      await Users.create({
        photo: fileName,
        url: url,
        name: name,
        email: email,
        nohp: nohp,
        address: address,
        location: location,
        password: hashPassword,
        role: role,
      });
      res.status(201).json({ msg: "Pengguna Berhasil di Tambahkan" });
    } catch (error) {
      console.log(error.message);
      res.status(400).json({ msg: error.message });
    }
  });
};

export const updatePhotoUser = async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ msg: "Mohon login ke akun anda" });
  }

  try {
    const user = await Users.findOne({
      where: {
        uuid: req.params.id,
      },
    });

    if (!user) return res.status(404).json({ msg: "User Tidak Ditemukan" });

    let fileName = "";
    let url = "";
    if (req.files === null) {
      fileName = Users.photo;
      url = Users.url;
    } else {
      const file = req.files.file;
      const fileSize = file.data.length;
      const ext = path.extname(file.name);
      fileName = file.md5 + ext;
      const allowedType = [".png", ".jpg", ".jpeg"];

      if (!allowedType.includes(ext.toLocaleLowerCase()))
        return res
          .status(422)
          .json({ msg: "Format Gambar harus berupa PNG, JPG, dan JPEG" });
      if (fileSize > 5000000)
        return res.status(422).json({ msg: "Maksimal Ukuran Gambar 5 MB" });

      const filepath = `./public/img/profile/${user.photo}`;
      if (user.photo && fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }

      file.mv(`./public/img/profile/${fileName}`, (err) => {
        if (err) return res.status(500).json({ msg: err.message });
      });

      url = `${req.protocol}://${req.get("host")}/img/profile/${fileName}`;
    }

    await Users.update(
      {
        photo: fileName,
        url: url,
      },
      {
        where: {
          userId: user.userId,
        },
      }
    );
    res.status(200).json({ msg: "Foto User Berhasil di Edit" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const updateUser = async (req, res) => {
  const user = await Users.findOne({
    where: {
      uuid: req.params.id,
    },
  });

  if (!user) return res.status(404).json({ msg: "User Tidak Ditemukan" });

  const { name, nohp, address, location } = req.body;

  try {
    await Users.update(
      {
        name: name,
        nohp: nohp,
        address: address,
        location: location,
      },
      {
        where: {
          userId: user.userId,
        },
      }
    );
    res.status(200).json({ msg: "User Berhasil di Edit" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

export const deleteUser = async (req, res) => {
  const user = await Users.findOne({
    where: {
      uuid: req.params.id,
    },
  });

  if (!user) return res.status(404).json({ msg: "User Tidak Ditemukan" });

  if (user.photo !== null) {
    const filepath = `./public/img/profile/${user.photo}`;
    fs.unlinkSync(filepath);
  }

  try {
    await Users.destroy({
      where: {
        userId: user.userId,
      },
    });
    res.status(200).json({ msg: "User Berhasil di Hapus" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};
