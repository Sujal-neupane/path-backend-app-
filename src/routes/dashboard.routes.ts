import { Router } from 'express';
import { DashboardController } from '../controller/dashboard_controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const dashboardController = new DashboardController();

router.get('/overview', authenticate, (req, res) => {
	return dashboardController.getOverview(req, res);
});

export default router;
