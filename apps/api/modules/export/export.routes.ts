import { Router } from 'express';
import { exportData } from './export.controller.ts';

const exportRouter = Router();

// Export User Data
exportRouter.get('/', exportData);

export default exportRouter;
