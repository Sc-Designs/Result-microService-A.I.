import express from 'express';
import isUserLoggedIn from '../middlewares/isUserLoggedIn.js';
import {
  sendingId,
  limitResultsSend,
  defultResult,
  sendResult,
} from "../controllers/result.controller.js";
import tryCatch from '../utils/tryCatch.js';
const router = express.Router();
router.get("/sending-result/:id", isUserLoggedIn, tryCatch(sendResult));
router.post("/send", isUserLoggedIn, tryCatch(sendingId))
router.get("/send-result", isUserLoggedIn, tryCatch(limitResultsSend));
router.get("/default-result", isUserLoggedIn, tryCatch(defultResult));

export default router;