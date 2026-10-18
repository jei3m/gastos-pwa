import { apiFetch } from '@/lib/api';
import type {
  InvitationDetails,
  InvitationResponse,
} from './members.interface';

export const fetchInvitationByToken = async (
  token: string
) => {
  const res = await apiFetch<{ data: InvitationDetails }>(
    `/api/invitations/accept?token=${token}`
  );
  return res.data;
};

export const respondToInvitation = async (
  token: string,
  action: 'accept' | 'decline'
) => {
  const res = await apiFetch<{ data: InvitationResponse }>(
    '/api/invitations/accept',
    {
      method: 'POST',
      body: JSON.stringify({ token, action }),
    }
  );
  return res.data;
};
