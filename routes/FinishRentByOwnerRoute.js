import express from "express";
import {
  createFinishRentByOwner,
  deleteFinishRentByOwner,
  getFinishRentByOwner,
  getFinishRentByOwnerById,
} from "../controllers/FinishRentByOwner.js";
import { verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();

router.get("/finishrentbyowner", verifyUser, getFinishRentByOwner);
router.get("/finishrentbyowner/:id", verifyUser, getFinishRentByOwnerById);
router.post("/finishrentbyowner", verifyUser, createFinishRentByOwner);
router.delete("/finishrentbyowner/:id", verifyUser, deleteFinishRentByOwner);

export default router;
