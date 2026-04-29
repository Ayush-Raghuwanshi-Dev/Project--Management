import jwt from "jsonwebtoken";
import User from "../models/user.js";

const parseCookies = (cookieHeader = "") =>
  cookieHeader.split(";").reduce((cookies, cookie) => {
    const [rawName, ...rawValue] = cookie.trim().split("=");
    if (!rawName) return cookies;
    cookies[rawName] = decodeURIComponent(rawValue.join("="));
    return cookies;
  }, {});

const getTokenFromRequest = (req) => {
  const cookies = parseCookies(req.headers.cookie);
  if (cookies.authToken) return cookies.authToken;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) return authHeader.split(" ")[1];

  return null;
};

const authMiddleware = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return res.status(401).json({ message: "Please sign in to continue" });
    if (!process.env.JWT_SECRET) return res.status(500).json({ message: "JWT secret is not configured" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || decoded.tokenVersion !== user.tokenVersion) {
      return res.status(401).json({ message: "Session expired. Please sign in again." });
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Session expired. Please sign in again." });
  }
};

export default authMiddleware;
export { authMiddleware };
