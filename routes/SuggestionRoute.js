import express from "express";
import {
  createSuggestion,
  deleteSuggestion,
  getSuggestionById,
  getSuggestions,
} from "../controllers/Suggestions.js";
import { adminOnly, verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();

router.get("/suggestions", adminOnly, getSuggestions);
router.get("/suggestions/:id", adminOnly, getSuggestionById);
router.post("/suggestions", verifyUser, createSuggestion);
router.delete("/suggestions/:id", adminOnly, deleteSuggestion);

export default router;
