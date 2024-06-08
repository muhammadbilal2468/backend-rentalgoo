import Suggestions from "../models/SuggestionModel.js";
import Users from "../models/UserModel.js";

export const getSuggestions = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const parsedLimit = parseInt(limit, 10);

    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [{ message: { [Op.like]: `%${search}%` } }];
    }
    const offset = (page - 1) * limit;

    const resp = await Suggestions.findAndCountAll({
      attributes: ["uuid", "message"],
      include: [
        {
          model: Users,
          attributes: ["userId", "uuid", "name", "url"],
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
      totalSuggestions: resp.count,
      suggestions: resp.rows,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getSuggestionById = async (req, res) => {
  try {
    const suggestion = await Suggestions.findOne({
      where: {
        uuid: req.params.id,
      },
    });

    if (!suggestion)
      return res.status(404).json({ msg: "Saran Tidak Ditemukan" });

    const resp = await Suggestions.findOne({
      attributes: ["uuid", "message"],
      include: [
        {
          model: Users,
          attributes: ["userId", "uuid", "name", "url"],
        },
      ],
    });
    res.status(200).json(resp);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const createSuggestion = async (req, res) => {
  const { message } = req.body;
  if (message === null)
    return res.status(400).json({ msg: "Saran Tidak Boleh Kosong" });
  try {
    await Suggestions.create({
      message: message,
      userId: req.userId,
    });
    res.status(201).json({ msg: "Saran Berhasil di Kirim" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const deleteSuggestion = async (req, res) => {
  try {
    const suggestion = await Suggestions.findOne({
      where: {
        uuid: req.params.id,
      },
    });

    if (!suggestion)
      return res.status(404).json({ msg: "Saran Tidak Ditemukan" });

    await Suggestions.destroy({
      where: {
        suggestionId: suggestion.suggestionId,
      },
    });
    res.status(200).json({ msg: "Saran Berhasil di Hapus" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
