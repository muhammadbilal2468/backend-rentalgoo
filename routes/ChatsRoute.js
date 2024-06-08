import express from "express";
import {
  createMessage,
  getChatPersonal,
  getListMyChat,
} from "../controllers/Chats.js";
import { verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();

router.get("/chats", verifyUser, getListMyChat);
router.get("/chats/:id", verifyUser, getChatPersonal);
router.post("/chats", verifyUser, createMessage);

export default router;
