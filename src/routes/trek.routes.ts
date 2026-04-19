import { Router } from 'express';
import { TrekController } from '../controller/trek_controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
const trekController = new TrekController();

router.use(authenticate);

router.post('/', (req, res) => trekController.create(req, res));
router.get('/', (req, res) => trekController.list(req, res));
router.get('/:trekId', (req, res) => trekController.getById(req, res));
router.patch('/:trekId/status', (req, res) => trekController.updateStatus(req, res));
router.post('/:trekId/checkpoints', (req, res) => trekController.addCheckpoint(req, res));
router.patch('/:trekId/checkpoints/:checkpointId', (req, res) => trekController.updateCheckpoint(req, res));
router.get('/:trekId/summary', (req, res) => trekController.summary(req, res));

export default router;
