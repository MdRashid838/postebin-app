import express from "express";
import {
  createPaste,
  getPaste,
} from "../controllers/pasteController.js";

const router = express.Router();

router.post("/pastes", createPaste);
router.get("/pastes/:id", getPaste);

export default router;