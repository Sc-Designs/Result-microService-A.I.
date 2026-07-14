import axios from "axios";
import { env } from "../config/Zod.cheker.js";

const isUserLoggedIn = async (req, res, next) => {
  try {
    let token = req.cookies?.UserToken;

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const response = await axios.get(`${env.USER_API_URL}/api/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-gateway-secret": env.GATEWAY_SECRET,
      },
    });
    if (!response.data || !response.data.user) {
      return res.status(403).json({ error: "Access denied" });
    }
    req.user = response.data.user;
    return next();
  } catch (error) {
    console.log(error);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};
export default isUserLoggedIn;
