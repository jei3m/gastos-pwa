export interface InvitationDetails {
  id: string;
  accountID: string;
  accountName: string;
  invitedEmail: string;
  inviterName: string;
  inviterEmail: string;
  status: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

export interface InvitationResponse {
  responseMessage: string;
  accountID: string;
}
