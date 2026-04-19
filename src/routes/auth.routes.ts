import { Router } from "express";
import { AuthController } from "../controller/auth_controller";
import { authenticate } from "../middlewares/auth.middleware";


const authController = new AuthController();
const router = Router();

router.post('/register', (req, res) => authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res));


router.post('/request-password-reset', (req, res) => authController.requestPasswordReset(req, res));
router.post('/reset-password', (req, res) => authController.resetPassword(req, res));

router.get('/me', authenticate, (req, res) => authController.me(req, res));
router.patch('/me', authenticate, (req, res) => authController.updateMe(req, res));

export default router;