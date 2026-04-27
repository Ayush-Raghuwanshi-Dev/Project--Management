import express from 'express'
import {z} from "zod";
import { validateRequest } from 'zod-express-middleware';
import { registerSchema, loginSchema } from '../libs/validate-schema.js';
import { registerUser, loginUser, logoutUser, logoutAllDevices } from '../controllers/auth-controllers.js';
import { protect } from '../utils/auth-middleware.js';

const router = express.Router();

router.post("/register", validateRequest({
    body: registerSchema
}), registerUser);

router.post("/login", validateRequest({
    body: loginSchema
}), loginUser);

router.post("/logout", protect, logoutUser);
router.post("/logout-all", protect, logoutAllDevices);

export default router;
