import express from "express";
import { createComment, getComments } from "../controllers/Comments.js";
import { verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();

router.get("comments/:targetType/:targetId", verifyUser, getComments);
router.post("/comments", verifyUser, createComment);

export default router;
