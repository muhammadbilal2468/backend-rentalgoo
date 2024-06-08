import express from "express";
import {
  createSearch,
  deleteSearch,
  getSearchs,
} from "../controllers/Searchs.js";
import { verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();

router.get("/searchs", verifyUser, getSearchs);
router.post("/searchs", verifyUser, createSearch);
router.delete("/searchs/:id", verifyUser, deleteSearch);

export default router;
