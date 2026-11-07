import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authClient } from '@/lib/auth/auth-client';
import { userByEmailQueryOptions } from '@/features/user/user.tq.options';
import type { User } from '@/features/user/user.interface';
import type {
  AccountMembersFieldProps,
  MemberRowProps,
} from '@/features/accounts/accounts.interface';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import CustomAlertDialog from '@/components/custom/custom-alert-dialog';
import {
  Clock,
  Loader,
  Mail,
  Plus,
  RotateCcw,
  Search,
  Shield,
  Users,
  X,
} from 'lucide-react';

function MemberRow({
  name,
  email,
  image,
  badge,
  action,
  lineThrough,
  className,
}: MemberRowProps) {
  return (
    <Card
      className={cn('gap-0 rounded-lg py-0', className)}
    >
      <CardContent className="flex items-center justify-between gap-3 px-3 py-2">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage
              src={image ?? undefined}
              alt={name}
            />
            <AvatarFallback className="text-sm font-medium text-gray-500">
              {name?.charAt(0)?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'text-sm font-medium',
                  lineThrough && 'line-through'
                )}
              >
                {name}
              </span>
              {badge}
            </div>
            {email && (
              <div
                className={cn(
                  'text-xs text-muted-foreground',
                  lineThrough && 'line-through'
                )}
              >
                {email}
              </div>
            )}
          </div>
        </div>
        {action}
      </CardContent>
    </Card>
  );
}

export default function AccountMembersField({
  membersToInvite,
  onInvite,
  onRemoveInvite,
  isDisabled = false,
  canManage = true,
  account,
  queuedRemovedMembers = [],
  queuedCancelledInvites = [],
  onRemoveMember,
  onUndoRemoveMember,
  onCancelInvitation,
  onUndoCancelInvitation,
}: AccountMembersFieldProps) {
  const { data: session } = authClient.useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [searchedEmail, setSearchedEmail] = useState('');

  const { data: foundUser, isFetching: isSearching } =
    useQuery(userByEmailQueryOptions(searchedEmail));

  const owner = account?.members.find(
    (member) => member.role === 'owner'
  );
  const ownerName =
    owner?.name ?? session?.user?.name ?? '';
  const ownerEmail =
    owner?.email ?? session?.user?.email ?? '';
  const ownerImage = owner?.image ?? session?.user?.image;

  const members = (account?.members ?? []).filter(
    (member) =>
      member.role !== 'owner' &&
      !queuedRemovedMembers.includes(member.userID)
  );
  const removedMembers = (account?.members ?? []).filter(
    (member) =>
      member.role !== 'owner' &&
      queuedRemovedMembers.includes(member.userID)
  );
  const invitations = (account?.invitations ?? []).filter(
    (invitation) =>
      !queuedCancelledInvites.includes(invitation.id)
  );

  const cancelledInvitations = (
    account?.invitations ?? []
  ).filter((invitation) =>
    queuedCancelledInvites.includes(invitation.id)
  );

  const isAlreadyAdded = (user: User) =>
    user.email === ownerEmail ||
    membersToInvite.some(
      (member) => member.email === user.email
    ) ||
    (account?.members ?? []).some(
      (member) => member.email === user.email
    ) ||
    (account?.invitations ?? []).some(
      (invitation) => invitation.email === user.email
    );

  const handleInvite = (user: User) => {
    if (!isAlreadyAdded(user)) {
      onInvite(user);
    }
    setIsOpen(false);
    setQuery('');
    setSearchedEmail('');
  };

  return (
    <div className="grid gap-2">
      <MemberRow
        name={ownerName}
        email={ownerEmail}
        image={ownerImage}
        badge={
          <Badge variant="default" className="text-xs">
            <Shield className="h-3 w-3" />
            Owner
          </Badge>
        }
      />
      {members.map((member) => (
        <MemberRow
          key={member.userID}
          name={member.name}
          email={member.email}
          image={member.image}
          badge={
            <Badge variant="default" className="text-xs">
              <Users className="h-3 w-3" />
              Member
            </Badge>
          }
          action={
            canManage && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() =>
                  onRemoveMember?.(member.userID)
                }
                disabled={isDisabled}
              >
                <X size={18} />
              </Button>
            )
          }
        />
      ))}
      {removedMembers.map((member) => (
        <MemberRow
          key={member.userID}
          name={member.name}
          email={member.email}
          image={member.image}
          lineThrough
          className="opacity-60"
          action={
            canManage && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() =>
                  onUndoRemoveMember?.(member.userID)
                }
                disabled={isDisabled}
              >
                <RotateCcw size={18} />
              </Button>
            )
          }
        />
      ))}
      {invitations.map((invitation) => (
        <MemberRow
          key={invitation.id}
          name={invitation.name}
          email={invitation.email}
          image={invitation.image}
          badge={
            <Badge
              variant="default"
              className="bg-yellow-400 text-xs"
            >
              <Mail className="h-3 w-3" />
              Pending
            </Badge>
          }
          action={
            canManage && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() =>
                  onCancelInvitation?.(invitation.id)
                }
                disabled={isDisabled}
              >
                <X size={18} />
              </Button>
            )
          }
        />
      ))}
      {cancelledInvitations.map((invitation) => (
        <MemberRow
          key={invitation.id}
          name="Pending invite"
          email={invitation.email}
          badge={
            <Badge
              variant="default"
              className="bg-yellow-400 text-xs"
            >
              <Mail className="h-3 w-3" />
              Pending
            </Badge>
          }
          lineThrough
          className="opacity-60"
          action={
            canManage && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() =>
                  onUndoCancelInvitation?.(invitation.id)
                }
                disabled={isDisabled}
              >
                <RotateCcw size={18} />
              </Button>
            )
          }
        />
      ))}
      {membersToInvite.map((member) => (
        <MemberRow
          key={member.id}
          name={member.name}
          email={member.email}
          image={member.image}
          badge={
            <Badge
              variant="default"
              className="bg-yellow-400 text-xs"
            >
              <Clock className="h-3 w-3" />
              Pending
            </Badge>
          }
          action={
            canManage && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onRemoveInvite(member.id)}
                disabled={isDisabled}
              >
                <X size={18} />
              </Button>
            )
          }
        />
      ))}
      {canManage && (
        <Button
          type="button"
          variant="outline"
          className="h-auto w-full justify-start gap-2 border-dashed px-3 py-2"
          onClick={() => setIsOpen(true)}
          disabled={isDisabled}
        >
          <span className="flex size-7 items-center justify-center rounded-md bg-primary/15">
            <Plus className="size-4 text-primary" />
          </span>
          <span className="text-sm font-medium">
            Add Account Member
          </span>
        </Button>
      )}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="border-2 flex max-h-[85vh] flex-col p-4 sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Account Member</DialogTitle>
          </DialogHeader>
          <div className="flex min-h-0 flex-1 flex-col gap-4">
            <div className="flex gap-2">
              <div className="w-full relative">
                <Search
                  size={18}
                  className="hidden md:block pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="user@gmail.com"
                  className="pr-9 md:pl-9 border-0 bg-gray-200"
                />
                {query && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuery('')}
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 text-gray-600"
                  >
                    <X size={18} />
                  </Button>
                )}
              </div>
              <Button
                type="button"
                onClick={() =>
                  setSearchedEmail(query.trim())
                }
                disabled={!query.trim() || isSearching}
                className="h-9 md:h-10"
              >
                {isSearching ? (
                  <Loader className="size-5 animate-spin" />
                ) : (
                  <Search className="size-5" />
                )}
                <span className="hidden md:block">
                  Search
                </span>
              </Button>
            </div>
            {isSearching ? (
              <div className="flex justify-center py-6">
                <Loader className="animate-spin text-muted-foreground" />
              </div>
            ) : foundUser ? (
              <CustomAlertDialog
                isDisabled={isAlreadyAdded(foundUser)}
                trigger={
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-auto w-full justify-start gap-3 px-3 py-2"
                  >
                    <Avatar>
                      <AvatarImage
                        src={foundUser.image ?? undefined}
                        alt={foundUser.name}
                      />
                      <AvatarFallback className="text-sm font-medium text-gray-500">
                        {foundUser.name
                          ?.charAt(0)
                          ?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">
                        {foundUser.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {foundUser.email}
                      </span>
                    </div>
                    {isAlreadyAdded(foundUser) ? (
                      <Badge
                        variant="outline"
                        className="ml-auto text-xs"
                      >
                        Member
                      </Badge>
                    ) : (
                      <Plus className="ml-auto size-4 text-muted-foreground" />
                    )}
                  </Button>
                }
                title="Invite account member?"
                description={`Invite ${foundUser.name} (${foundUser.email}) to this account?`}
                confirmMessage="Invite"
                confirmVariant="default"
                onConfirm={() => handleInvite(foundUser)}
              />
            ) : searchedEmail ? (
              <p className="px-1 text-sm text-muted-foreground">
                No user found with that email.
              </p>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
