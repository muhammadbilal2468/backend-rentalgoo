import express from "express";
import {
  createUser,
  deleteUser,
  getUser,
  getUserById,
  updatePhotoUser,
  updateUser,
} from "../controllers/Users.js";
import { adminOnly, verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();

router.get("/users", verifyUser, getUser);
router.get("/users/:id", verifyUser, getUserById);
router.post("/users", createUser);
router.patch("/photousers/:id", verifyUser, adminOnly, updatePhotoUser);
router.patch("/users/:id", verifyUser, adminOnly, updateUser);
router.delete("/users/:id", verifyUser, adminOnly, deleteUser);

export default router;
