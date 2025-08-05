import express from 'express';
import isUserLoggedIn from '../middlewares/isUserLoggedIn.js';
import {
  sendResult,
  limitResultsSend,
  defultResult,
} from "../controllers/result.controller.js";
import tryCatch from '../utils/tryCatch.js';
const router = express.Router();

router.get("/send-result", isUserLoggedIn, tryCatch(limitResultsSend));
router.get("/default-result", isUserLoggedIn, tryCatch(defultResult));

export default router;