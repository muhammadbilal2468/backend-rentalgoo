import express from "express";
import {
  createProduct,
  deleteProduct,
  getHisProduct,
  getMyProduct,
  getProduct,
  getProductById,
  getProductClosest,
  updateLeasedProduct,
  updateStockProduct,
  updateProduct,
} from "../controllers/Products.js";
import { verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();

router.get("/myproducts", verifyUser, getMyProduct);
router.get("/hisproducts/:id", verifyUser, getHisProduct);

router.get("/products", verifyUser, getProduct);
router.get("/products/:id", verifyUser, getProductById);
router.post("/products", verifyUser, createProduct);
router.patch("/products/:id", verifyUser, updateProduct);
router.patch("/leasedproduct/:id", verifyUser, updateLeasedProduct);
router.patch("/stockproduct/:id", verifyUser, updateStockProduct);
router.delete("/products/:id", verifyUser, deleteProduct);
router.get("/closestproducts", verifyUser, getProductClosest);

export default router;
