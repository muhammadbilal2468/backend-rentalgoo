import Searchs from "../models/Search.js";

export const getSearchs = async (req, res) => {
  try {
    const resp = await Searchs.findAll({
      where: {
        userId: req.userId,
      },
      attributes: ["uuid", "text"],
    });

    if (resp.length === 0) {
      return res.status(404).json({ msg: "Riwayat Pencarian Belum Ada" });
    }
    res.status(200).json(resp);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const createSearch = async (req, res) => {
  try {
    const { text } = req.body;

    // Cek apakah produk sudah tersimpan sebelumnya
    const search = await Searchs.findOne({
      where: {
        text: text,
        userId: req.userId,
      },
    });

    if (search) {
      return res.status(400).json({ msg: "Riwayat Pencarian Belum Ada" });
    }

    await Searchs.create({
      text: text,
      userId: req.userId,
    });

    res.status(201).json({ msg: "Pencarian Berhasil Disimpan" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const deleteSearch = async (req, res) => {
  try {
    const search = await Searchs.findOne({
      where: {
        uuid: req.params.id,
      },
    });

    if (!search) {
      return res.status(404).json({ msg: "Riwayat Pencarian Tidak Ditemukan" });
    }

    if (search.userId !== req.userId) {
      return res.status(403).json({ msg: "Akses Terlarang" });
    }

    await Searchs.destroy({
      where: {
        searchId: search.searchId,
        userId: req.userId,
      },
    });

    res.status(200).json({ msg: "Riwayat Pencarian Berhasil Dihapus" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
