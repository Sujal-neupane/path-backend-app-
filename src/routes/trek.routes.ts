import { Router } from 'express';
import { TrekController } from '../controller/trek_controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const trekController = new TrekController();

// Public read endpoints for shared trek catalog (admin-published/user-created).
router.get('/', (req, res) => trekController.list(req, res));
router.get('/:trekId', (req, res) => trekController.getById(req, res));
router.get('/:trekId/summary', (req, res) => trekController.summary(req, res));

// Authenticated write endpoints (ownership and user data mutations).
router.post('/', authenticate, (req, res) => trekController.create(req, res));
router.patch('/:trekId/status', authenticate, (req, res) => trekController.updateStatus(req, res));
router.post('/:trekId/checkpoints', authenticate, (req, res) => trekController.addCheckpoint(req, res));
router.patch('/:trekId/checkpoints/:checkpointId', authenticate, (req, res) =>
	trekController.updateCheckpoint(req, res),
);

export default router;
