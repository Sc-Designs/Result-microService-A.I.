import express from 'express';
import isUserLoggedIn from '../middlewares/isUserLoggedIn.js';
import {
  sendingId,
  limitResultsSend,
  defultResult,
  sendResult,
  getTestAnalytics,
  getResultReview
} from "../controllers/result.controller.js";
import isOrgLoggedIn from "../middlewares/isOrgLoggedIn.js";
import tryCatch from '../utils/tryCatch.js';
const router = express.Router();
router.get("/sending-result/:id", isUserLoggedIn, tryCatch(sendResult));
router.post("/send", isUserLoggedIn, tryCatch(sendingId))
router.get("/send-result", isUserLoggedIn, tryCatch(limitResultsSend));
router.get("/default-result", isUserLoggedIn, tryCatch(defultResult));
router.get("/test-analytics/:testId", isOrgLoggedIn, tryCatch(getTestAnalytics));
router.get("/review/:resultId", isOrgLoggedIn, tryCatch(getResultReview));

export default router;