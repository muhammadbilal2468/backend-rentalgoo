import fs from "fs";
import path from "path";
import { Op } from "sequelize";
import sharp from "sharp";
import Products from "../models/ProductModel.js";
import Users from "../models/UserModel.js";

const compressImage = async (inputPath, outputPath) => {
  await sharp(inputPath)
    .resize(800) // Atur ukuran gambar yang diinginkan
    .jpeg({ quality: 80 }) // Atur kualitas gambar (0-100)
    .toFile(outputPath);
};

export const getMyProduct = async (req, res) => {
  try {
    const resp = await Products.findAll({
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
        "fine",
        "leased",
      ],
      include: [
        {
          model: Users,
          attributes: ["name", "address"],
        },
      ],
      where: {
        userId: req.userId,
      },
    });

    if (resp.length === 0)
      return res.status(404).json({ msg: "Barang Anda Belum Ada" });

    res.status(200).json(resp);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getHisProduct = async (req, res) => {
  const user = await Users.findOne({
    where: {
      uuid: req.params.id,
    },
  });
  if (!user) return res.status(404).json({ msg: "User Tidak Ditemukan" });

  try {
    const resp = await Products.findAll({
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
        "fine",
        "leased",
      ],
      include: [
        {
          model: Users,
          attributes: ["userId", "uuid", "name", "address"],
        },
      ],
      where: {
        userId: user.userId,
      },
    });

    if (resp.length === 0)
      return res.status(404).json({ msg: `Barang ${user.name} Belum Ada` });

    res.status(200).json(resp);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getProduct = async (req, res) => {
  try {
    const { category, page = 1, limit = 6, search, citydistrict } = req.query;
    const parsedLimit = parseInt(limit, 10);

    const whereClause = {};

    if (category) {
      whereClause.category = category;
    }

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { "$User.name$": { [Op.like]: `%${search}%` } },
        { "$User.address$": { [Op.like]: `%${search}%` } },
      ];
    }

    if (citydistrict) {
      whereClause["$User.citydistrict$"] = {
        [Op.like]: `%${citydistrict}%`,
      };
    }

    const offset = (page - 1) * limit;

    const resp = await Products.findAndCountAll({
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
        "fine",
        "leased",
      ],
      include: [
        {
          model: Users,
          attributes: ["userId", "uuid", "name", "address"],
        },
      ],
      where: whereClause,
      limit: parsedLimit,
      offset,
      // order: Sequelize.literal("RAND()"),
    });

    const totalPages = Math.ceil(resp.count / limit);

    res.status(200).json({
      totalPages,
      curentPage: parseInt(page),
      totalProducts: resp.count,
      products: resp.rows,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Products.findOne({
      where: {
        uuid: req.params.id,
      },
    });
    if (!product)
      return res.status(404).json({ msg: "Produk Tidak Ditemukan" });

    const resp = await Products.findOne({
      attributes: [
        "productId",
        "uuid",
        "name",
        "image",
        "url",
        "category",
        "description",
        "guarantee",
        "stock",
        "price",
        "time_unit",
        "fine",
        "leased",
      ],
      // where: {
      //   [Op.and]: [{ id: product.id }, { userId: req.userId }],
      // },
      where: {
        uuid: req.params.id,
      },
      include: [
        {
          model: Users,
          attributes: ["userId", "uuid", "url", "name", "address"],
        },
      ],
    });
    res.status(200).json(resp);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const createProduct = async (req, res) => {
  const {
    name,
    category,
    description,
    guarantee,
    stock,
    price,
    time_unit,
    fine,
  } = req.body;
  if (req.files === null)
    return res.status(400).json({ msg: "Gambar Belum Ditambahkan" });

  const file = req.files.file;
  const fileSize = file.data.length;
  const ext = path.extname(file.name);
  const fileName = file.md5 + ext;
  const allowedType = [".png", ".jpg", ".jpeg"];

  if (!allowedType.includes(ext.toLocaleLowerCase()))
    return res
      .status(422)
      .json({ msg: "Format Gambar harus berupa PNG, JPG, dan JPEG" });

  if (fileSize > 5000000)
    return res.status(422).json({ msg: "Maksimal Ukuran Gambar 5 MB" });

  file.mv(`./public/img/product/${fileName}`, async (err) => {
    if (err) return res.status(500).json({ msg: err.message });

    // Menghasilkan angka acak 4 digit (antara 1000 hingga 9999)
    const randomNumber = Math.floor(Math.random() * 9000) + 1000;

    // Kompresi gambar sebelum menyimpannya
    const compressedFileName = "comp_" + file.md5 + "_" + randomNumber + ext;
    const compressedFilePath = `./public/img/product/${compressedFileName}`;
    await compressImage(`./public/img/product/${fileName}`, compressedFilePath);

    const url = `${req.protocol}://${req.get(
      "host"
    )}/img/product/${compressedFileName}`;

    const filepath = `./public/img/product/${fileName}`;
    fs.unlinkSync(filepath);

    try {
      await Products.create({
        name: name,
        image: compressedFileName, // Menggunakan nama file yang telah dikompresi
        url: url,
        category: category,
        description: description,
        guarantee: guarantee,
        stock: stock,
        price: price,
        time_unit: time_unit,
        fine: fine,
        leased: 0,
        userId: req.userId,
      });

      res.status(201).json({ msg: "Barang Berhasil di Tambahkan" });
    } catch (error) {
      console.log(error.message);
      res.status(400).json({ msg: error.message });
    }
  });
};

export const updateProduct = async (req, res) => {
  try {
    const product = await Products.findOne({
      where: {
        uuid: req.params.id,
      },
    });

    if (!product)
      return res.status(404).json({ msg: "Produk Tidak Ditemukan" });

    let fileName = "";
    let compressedFileName = "";
    let url = "";
    if (req.files === null) {
      compressedFileName = product.image;
      url = product.url;
    } else {
      const file = req.files.file;
      if (!file) {
        // Jika tidak ada file yang diunggah, lewati pengolahan file
        compressedFileName = product.image;
        url = product.url;
      } else {
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

        if (product.image) {
          const oldfilepath = `./public/img/product/${product.image}`;
          if (fs.existsSync(oldfilepath)) {
            fs.unlinkSync(oldfilepath);
          }
        }

        await new Promise((resolve, reject) => {
          file.mv(`./public/img/product/${fileName}`, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });

        // Menghasilkan angka acak 4 digit (antara 1000 hingga 9999)
        const randomNumber = Math.floor(Math.random() * 9000) + 1000;

        // Kompresi gambar sebelum menyimpannya
        compressedFileName = "comp_" + file.md5 + "_" + randomNumber + ext;
        const compressedFilePath = `./public/img/product/${compressedFileName}`;
        await compressImage(
          `./public/img/product/${fileName}`,
          compressedFilePath
        );

        const filepath = `./public/img/product/${fileName}`;
        fs.unlinkSync(filepath);

        url = `${req.protocol}://${req.get(
          "host"
        )}/img/product/${compressedFileName}`;
      }
    }

    const {
      name,
      category,
      description,
      guarantee,
      stock,
      price,
      time_unit,
      fine,
    } = req.body;

    await Products.update(
      {
        name: name,
        image: compressedFileName,
        url: url,
        category: category,
        description: description,
        guarantee: guarantee,
        stock: stock,
        price: price,
        time_unit: time_unit,
        fine: fine,
      },
      {
        where: {
          productId: product.productId,
        },
      }
    );

    res.status(200).json({ msg: "Produk Berhasil di Edit" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: error.message });
  }
};

export const updateLeasedProduct = async (req, res) => {
  try {
    const product = await Products.findOne({
      where: {
        uuid: req.params.id,
      },
    });

    if (!product)
      return res.status(404).json({ msg: "Produk Tidak Ditemukan" });

    await Products.update(
      {
        leased: product.leased + 1,
      },
      {
        where: {
          productId: product.productId,
        },
      }
    );

    res.status(200).json({ msg: "Berhasil Menambah Jumlah Kali Sewa" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: error.message });
  }
};

export const updateStockProduct = async (req, res) => {
  try {
    const { stock } = req.body;

    const product = await Products.findOne({
      where: {
        uuid: req.params.id,
      },
    });

    if (!product)
      return res.status(404).json({ msg: "Produk Tidak Ditemukan" });

    await Products.update(
      {
        stock: stock,
      },
      {
        where: {
          productId: product.productId,
        },
      }
    );

    res.status(200).json({ msg: "Berhasil Memperbaharui Stok Barang" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Products.findOne({
      where: {
        uuid: req.params.id,
      },
    });
    if (!product)
      return res.status(404).json({ msg: "Produk Tidak Ditemukan" });

    if (req.role === "admin") {
      const filepath = `./public/img/product/${product.image}`;
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      await Products.destroy({
        where: {
          productId: product.productId,
        },
      });
    } else {
      if (req.userId !== product.userId)
        return res.status(403).json({ msg: "Akses Terlarang" });
      const filepath = `./public/img/product/${product.image}`;
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      await Products.destroy({
        where: {
          [Op.and]: [{ productId: product.productId }, { userId: req.userId }],
        },
      });
    }
    res.status(200).json({ msg: "Produk Berhasil di Hapus" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// --------------------------------------------------- //
// --------- Algoritma Haversine Formula ------------- //
// --------------------------------------------------- //

// Fungsi ini mengonversi sudut dari derajat ke radian
function degToRad(deg) {
  return deg * (Math.PI / 180);
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius bumi dalam kilometer

  // Konversi perbedaan koordinat latitude dan longitude ke radian
  const dLat = degToRad(lat2 - lat1);
  const dLon = degToRad(lon2 - lon1);

  // Rumus Haversine
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degToRad(lat1)) *
      Math.cos(degToRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Jarak Haversine dalam kilometer
  const distance = R * c;

  return distance;
}

export async function getProductClosest(req, res) {
  try {
    const userId = req.userId;
    const user = await Users.findOne({
      where: { userId: userId },
    });

    const { limit } = req.query;

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userLocation = user.location.split(",").map(Number); // Mengambil koordinat lokasi pengguna

    const products = await Products.findAll({
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
      include: [
        {
          model: Users,
          attributes: ["userId", "uuid", "name", "address", "location"],
        },
      ],
    });

    const MAX_DISTANCE = 5; // Batas jarak maksimum dalam kilometer

    const productsWithinDistance = [];

    // Iterasi melalui semua produk
    // Pastikan produk tidak dimiliki oleh pengguna yang membuat permintaan
    // Mendapatkan koordinat lokasi produk
    // Menghitung jarak Haversine antara pengguna dan produk
    for (const product of products) {
      if (product.user.userId !== userId) {
        const productLocation = product.user.location.split(",").map(Number);
        const distance = haversineDistance(
          userLocation[0],
          userLocation[1],
          productLocation[0],
          productLocation[1]
        );

        // Jika jarak kurang dari atau sama dengan batas jarak maksimum, tambahkan produk ke dalam array
        if (distance <= MAX_DISTANCE) {
          productsWithinDistance.push({
            ...product.toJSON(),
            distance: `${distance.toFixed(2)} Km`,
            distanceKoor: distance,
          });
        }
      }
    }

    if (productsWithinDistance.length === 0) {
      return res.status(404).json({
        message: `Tidak ada barang terdekat dalam jarak ${MAX_DISTANCE} KM`,
      });
    }

    const sortedProducts = productsWithinDistance.sort(
      () => Math.random() - 0.5
    );

    // Mengambil sejumlah produk sesuai dengan batas yang diminta
    const slicedProducts = sortedProducts.slice(0, limit);

    return res.json(slicedProducts);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred" });
  }
}
