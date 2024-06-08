import express from "express";
import {
  getAddress,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
} from "../controllers/Address.js";
import { verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();

router.get("/address", verifyUser, getAddress);
router.get("/address/:id", verifyUser, getAddressById);
router.post("/address", verifyUser, createAddress);
router.patch("/address/:id", verifyUser, updateAddress);
router.delete("/address/:id", verifyUser, deleteAddress);

export default router;
