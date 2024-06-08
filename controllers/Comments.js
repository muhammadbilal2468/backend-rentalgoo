import Comments from "../models/CommentModel.js";
import Products from "../models/ProductModel.js";
import Users from "../models/UserModel.js";

export const getComments = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;

    const comments = await Comments.findAll({
      where: { targetType, targetId },
      attributes: ["uuid", "text", "userId", "createdAt"],
      include: [
        {
          model: Users,
          attributes: ["id", "uuid", "name"],
        },
      ],
    });

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const createComment = async (req, res) => {
  const { text, targetType, targetId, userId } = req.body;

  try {
    let targetEntity;

    if (targetType === "products") {
      targetEntity = await Products.findOne({ where: { id: targetId } });
    }

    if (!targetEntity) {
      return res.status(400).json({ msg: "Entitas target tidak ditemukan" });
    }

    const comment = await Comments.create({
      text,
      targetType,
      targetId,
      userId,
    });

    res.status(201).json({ msg: "Komentar berhasil dibuat", comment });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const comment = await Comments.findOne({
      where: {
        uuid: req.params.id,
      },
    });

    if (!comment)
      return res.status(404).json({ msg: "Komentar Tidak Ditemukan" });

    await Comments.destroy({
      where: {
        id: comment.id,
      },
    });
    res.status(200).json({ msg: "Komentar Berhasil di Hapus" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
