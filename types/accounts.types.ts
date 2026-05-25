export interface Account {
  id: string;
  name: string;
  type: string;
  description: string;
  totalBalance: string;
  isDropdown: number;
  memberCount: number;
}

export interface AccountMember {
  userID: string;
  email: string;
  name: string;
  image: string | null;
  role: 'owner' | 'editor';
}

export interface Invitation {
  id: string;
  accountID: string;
  invitedEmail: string;
  invitedBy: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  token: string;
  inviteLink: string;
  expiresAt: string;
  createdAt: string;
}

export interface CreateAccount {
  name: string;
  type: string;
  description: string;
  isDropdown: number;
  emails?: string[];
}

export interface EditAccount {
  name: string;
  type: string;
  description: string;
  isDropdown: number;
  emails?: string[];
  cancelInvitationIds?: string[];
  removeMemberIds?: string[];
}
