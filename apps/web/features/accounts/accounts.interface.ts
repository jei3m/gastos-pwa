import type { ReactNode } from 'react';
import type { User } from '../user/user.interface';

export interface Account {
  id: string;
  name: string;
  type: string;
  description: string;
  totalBalance: string;
  isDropdown: number;
  isOwner: number;
  isShared: 0 | 1;
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
  image: string;
  name: string;
  email: string;
  invitedBy: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  token: string;
  inviteLink: string;
  expiresAt: string;
  createdAt: string;
}

export interface AccountDetails extends Omit<
  Account,
  'isOwner'
> {
  members: AccountMember[];
  invitations: Invitation[];
  isOwner: boolean;
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

export interface AccountShare {
  account: Account;
  value: number;
  percent: number;
  color: string;
}

export interface AccountTypeSummary {
  type: string;
  count: number;
  total: number;
}

export interface AccountGroup extends AccountTypeSummary {
  accounts: Account[];
}

export interface MemberRowProps {
  name: string;
  email: string;
  image?: string | null;
  badge?: ReactNode;
  action?: ReactNode;
  lineThrough?: boolean;
  className?: string;
}

export interface AccountMembersFieldProps {
  membersToInvite: User[];
  onInvite: (user: User) => void;
  onRemoveInvite: (userID: string) => void;
  isDisabled?: boolean;
  canManage?: boolean;
  account?: AccountDetails | null;
  queuedRemovedMembers?: string[];
  queuedCancelledInvites?: string[];
  onRemoveMember?: (userID: string) => void;
  onUndoRemoveMember?: (userID: string) => void;
  onCancelInvitation?: (invitationID: string) => void;
  onUndoCancelInvitation?: (invitationID: string) => void;
}
