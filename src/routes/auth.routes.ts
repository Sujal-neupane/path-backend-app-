import { Router } from "express";
import { AuthController } from "../controller/auth_controller";


const authController = new AuthController();
const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);


router.post('/request-password-reset', authController.requestPasswordReset);
router.post('/reset-password', authController.resetPassword);

// router.get('/me',  authController.getUser);
export default router;