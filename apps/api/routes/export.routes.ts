import { Router } from 'express';
import { exportData } from '../controllers/export.controller.ts';

const exportRouter = Router();

// Export User Data
exportRouter.get('/', exportData);

export default exportRouter;
