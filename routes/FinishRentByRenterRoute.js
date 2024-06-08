import express from "express";
import {
  createFinishRentByRenter,
  deleteFinishRentByRenter,
  getFinishRentByRenter,
  getFinishRentByRenterById,
} from "../controllers/FinishRentByRenter.js";
import { verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();

router.get("/finishrentbyrenter", verifyUser, getFinishRentByRenter);
router.get("/finishrentbyrenter/:id", verifyUser, getFinishRentByRenterById);
router.post("/finishrentbyrenter", verifyUser, createFinishRentByRenter);
router.delete("/finishrentbyrenter/:id", verifyUser, deleteFinishRentByRenter);

export default router;
