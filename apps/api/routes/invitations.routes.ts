import { Router } from 'express';
import {
  getInvitation,
  respondToInvitation,
} from '../controllers/invitations.controller.ts';

const invitationsRouter = Router();

// Fetch invitation details
invitationsRouter.get('/accept', getInvitation);

// Accept or decline an invitation
invitationsRouter.post('/accept', respondToInvitation);

export default invitationsRouter;
