import express from "express";
import {
  // getSaveProductById,
  createSaveProduct,
  deleteSaveProduct,
  getSaveProductById,
  getSaveProducts,
} from "../controllers/SaveProducts.js";
import { verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();

router.get("/saveproducts", verifyUser, getSaveProducts);
router.get("/saveproducts/:id", verifyUser, getSaveProductById);
router.post("/saveproducts", verifyUser, createSaveProduct);
router.delete("/saveproducts/:id", verifyUser, deleteSaveProduct);

export default router;
