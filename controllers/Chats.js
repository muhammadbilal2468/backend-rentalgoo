import { Op } from "sequelize";
import Chats from "../models/ChatModel.js";
import Users from "../models/UserModel.js";

export const getListMyChat = async (req, res) => {
  const userId = req.userId;
  try {
    const chats = await Chats.findAll({
      where: {
        [Op.or]: [{ senderId: userId }, { receiverId: userId }],
      },
      include: [
        { model: Users, as: "receiver", attributes: ["uuid", "name", "url"] },
        { model: Users, as: "sender", attributes: ["uuid", "name", "url"] },
      ],
    });

    // Extract unique users from chats
    const usersMap = new Map();
    chats.forEach((chat) => {
      if (chat.senderId === userId) {
        usersMap.set(chat.receiver.uuid, chat.receiver);
      } else {
        usersMap.set(chat.sender.uuid, chat.sender);
      }
    });

    const users = Array.from(usersMap.values());

    // Menambahkan pesan terakhir dan waktu pesan terakhir ke setiap pengguna
    for (const user of users) {
      const userChats = chats.filter(
        (chat) =>
          chat.sender.uuid === user.uuid || chat.receiver.uuid === user.uuid
      );
      if (userChats.length > 0) {
        const lastChat = userChats[userChats.length - 1]; // Menggunakan pesan terakhir
        user.dataValues.last_message = lastChat.message;

        // Mengambil jam dan menit dari createdAt
        const lastMessageTime = new Date(lastChat.createdAt);
        user.dataValues.last_message_time = `${lastMessageTime.getHours()}:${lastMessageTime.getMinutes()}`;
      }
    }

    if (users.length === 0) {
      return res.status(200).json({ message: "Anda belum memiliki obrolan" });
    }

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getChatPersonal = async (req, res) => {
  const userId = req.userId;
  const uuid = req.params.id;

  try {
    // Cari pengguna dengan UUID dari parameter
    const otherUser = await Users.findOne({ where: { uuid } });

    if (!otherUser) {
      return res.status(404).json({ error: "Pengguna tidak ditemukan" });
    }

    const otherUserId = otherUser.userId;

    // Ambil pesan obrolan yang unik untuk percakapan
    const chats = await Chats.findAll({
      where: {
        [Op.or]: [
          {
            [Op.and]: [{ senderId: userId }, { receiverId: otherUserId }],
          },
          {
            [Op.and]: [{ senderId: otherUserId }, { receiverId: userId }],
          },
        ],
      },
      attributes: ["uuid", "senderId", "receiverId", "message", "message_time"], // Menambahkan message_time
      order: [["createdAt", "ASC"]],
      include: [
        { model: Users, as: "sender", attributes: ["uuid", "name", "url"] },
        { model: Users, as: "receiver", attributes: ["uuid", "name", "url"] },
      ],
    });

    if (chats.length === 0) {
      return res.status(200).json({ message: "Belum ada percakapan" });
    }

    res.status(200).json(chats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const createMessage = async (req, res) => {
  const senderId = req.userId;
  const { receiverId, message } = req.body;

  try {
    // Cek apakah pengguna penerima ada
    const receiver = await Users.findOne({ where: { userId: receiverId } });

    if (!receiver) {
      return res.status(404).json({ error: "Penerima tidak ditemukan" });
    }

    // Simpan pesan ke penerima beserta message_time
    const currentTime = new Date();
    const hours = currentTime.getHours().toString().padStart(2, "0"); // Padding jam dengan 0 jika perlu
    const minutes = currentTime.getMinutes().toString().padStart(2, "0"); // Padding menit dengan 0 jika perlu
    const messageTime = `${hours}:${minutes}`;

    const newChat = await Chats.create({
      senderId: senderId,
      receiverId: receiverId,
      message,
      message_time: messageTime, // Menyimpan message_time
    });

    res.status(201).json(newChat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteExpiredMessages = async () => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    await Chats.destroy({
      where: {
        createdAt: {
          [Op.lt]: oneWeekAgo,
        },
      },
    });

    console.log("Expired messages have been deleted.");
  } catch (error) {
    console.error("Error deleting expired messages:", error);
  }
};
