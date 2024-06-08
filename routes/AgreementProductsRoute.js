import express from "express";
import {
  createAgreementProducts,
  deleteAgreementProducts,
  getAgreementProductsByAdmin,
  getAgreementProductsById,
  getOwnerAgreementProducts,
  getRenterAgreementProducts,
  updateAgreementProducts,
} from "../controllers/AgreementProducts.js";
import { adminOnly, verifyUser } from "../middleware/AuthUser.js";
import { extractAgreementProductOwnerId } from "../middleware/ProductAuthorization.js";

const router = express.Router();

router.get(
  "/agreementproductsbyadmin",
  verifyUser,
  adminOnly,
  getAgreementProductsByAdmin
);
router.get("/owneragreementproducts", verifyUser, getOwnerAgreementProducts);
router.get("/renteragreementproducts", verifyUser, getRenterAgreementProducts);
router.get("/agreementproducts/:id", verifyUser, getAgreementProductsById);
router.post("/agreementproducts", verifyUser, createAgreementProducts);
router.patch(
  "/agreementproducts/:id",
  verifyUser,
  extractAgreementProductOwnerId,
  updateAgreementProducts
);
router.delete("/agreementproducts/:id", verifyUser, deleteAgreementProducts);

export default router;
