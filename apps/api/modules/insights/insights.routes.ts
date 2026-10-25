import { Router } from 'express';
import { getInsights } from './insights.controller.ts';

const insightsRouter = Router();

// Get Insights
insightsRouter.get('/', getInsights);

export default insightsRouter;
