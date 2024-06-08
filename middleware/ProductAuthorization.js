import AgreementProducts from "../models/AgreementProductsModel.js";
import IsRentingProducts from "../models/IsRentingProductsModel.js";

export const extractAgreementProductOwnerId = async (req, res, next) => {
  try {
    const agreementProduct = await AgreementProducts.findOne({
      where: {
        uuid: req.params.id,
      },
    });

    if (!agreementProduct) {
      return res
        .status(404)
        .json({ msg: "Persetujuan Menyewa Tidak Ditemukan" });
    }

    if (req.role !== "admin" && agreementProduct.ownerId !== req.userId) {
      return res.status(403).json({ msg: "Akses Terlarang" });
    }

    req.ownerId = agreementProduct.ownerId;
    next();
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Terjadi kesalahan server" });
  }
};

export const extractIsRentingProductOwnerId = async (req, res, next) => {
  try {
    const isRentingProduct = await IsRentingProducts.findOne({
      where: {
        uuid: req.params.id,
      },
    });

    if (!isRentingProduct) {
      return res
        .status(404)
        .json({ msg: "Produk yang Sedang Disewa Tidak Ditemukan" });
    }

    if (req.role !== "admin" && isRentingProduct.ownerId !== req.userId) {
      return res.status(403).json({ msg: "Akses Terlarang" });
    }

    req.ownerId = isRentingProduct.ownerId;
    next();
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: "Terjadi kesalahan server" });
  }
};
