import { Router } from 'express';
import { getUserByEmail } from './users.controller.ts';

const usersRouter = Router();

// Get Specific User by Email
usersRouter.get('/:email', getUserByEmail);

export default usersRouter;
