import express from "express";
import {
  createCustomer,
  deleteCustomer,
  getCustomers,
  getCutomerById,
} from "../controllers/customer.js";
import { adminOnly, verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();

router.get("/customers", verifyUser, adminOnly, getCustomers);
router.get("/customers/:id", verifyUser, adminOnly, getCutomerById);
router.post("/customers", verifyUser, createCustomer);
router.delete("/customers/:id", verifyUser, adminOnly, deleteCustomer);

export default router;
