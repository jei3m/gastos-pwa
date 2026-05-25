'use client';
import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { accountByIDQueryOptions } from '@/lib/tq-options/accounts.tq.options';
import { authClient } from '@/lib/auth/auth-client';
import {
  UserMinus,
  X,
  Shield,
  Mail,
  Check,
  Link,
  RotateCcw,
} from 'lucide-react';
import {
  AccountMember,
  Invitation,
} from '@/types/accounts.types';
import Image from 'next/image';

interface AccountSharingSectionProps {
  accountID?: string;
  isNewAccount?: boolean;
  queuedEmails?: string[];
  onAddEmail?: (email: string) => void;
  onRemoveEmail?: (email: string) => void;
  queuedCancelledInvites?: string[];
  onQueueCancelInvitation?: (invitationId: string) => void;
  onUnqueueCancelInvitation?: (
    invitationId: string
  ) => void;
  queuedRemovedMembers?: string[];
  onQueueRemoveMember?: (userId: string) => void;
  onUnqueueRemoveMember?: (userId: string) => void;
}

export default function AccountSharingSection({
  accountID,
  isNewAccount,
  queuedEmails = [],
  onAddEmail,
  onRemoveEmail,
  queuedCancelledInvites = [],
  onQueueCancelInvitation,
  onUnqueueCancelInvitation,
  queuedRemovedMembers = [],
  onQueueRemoveMember,
  onUnqueueRemoveMember,
}: AccountSharingSectionProps) {
  const [copiedId, setCopiedId] = useState<string | null>(
    null
  );
  const [inviteInput, setInviteInput] = useState('');
  const { data: session } = authClient.useSession();

  const { data, isPending } = useQuery({
    ...accountByIDQueryOptions(accountID ?? ''),
    enabled: !isNewAccount && !!accountID,
  });

  const members = (data?.members ?? []).filter(
    (m: AccountMember) =>
      !queuedRemovedMembers.includes(m.userID)
  );
  const removedMembers = (data?.members ?? []).filter(
    (m: AccountMember) =>
      queuedRemovedMembers.includes(m.userID)
  );

  const invitations = (data?.invitations ?? []).filter(
    (inv: Invitation) =>
      !queuedCancelledInvites.includes(inv.id)
  );
  const cancelledInvitations = (
    data?.invitations ?? []
  ).filter((inv: Invitation) =>
    queuedCancelledInvites.includes(inv.id)
  );

  useEffect(() => {
    return () => {
      setCopiedId(null);
      setInviteInput('');
    };
  }, []);

  return (
    <section>
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-lg">Sharing</CardTitle>
        </CardHeader>
        <Separator className="-mt-2 mb-2" />
        <CardContent className="space-y-4">
          {isNewAccount ? (
            <>
              {/* New Account: owner */}
              <div className="flex items-center justify-between p-2 rounded-lg border-2">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200">
                    {session?.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name ?? ''}
                        width={32}
                        height={32}
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-sm font-medium text-gray-500">
                        {session?.user?.name
                          ?.charAt(0)
                          ?.toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {session?.user?.name}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-xs border-primary text-primary"
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        Owner
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {session?.user?.email}
                    </div>
                  </div>
                </div>
              </div>

              {/* Invite by Email */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Invite by Email
                </h4>
                <div className="flex gap-2">
                  <Input
                    placeholder="user@example.com"
                    type="email"
                    value={inviteInput}
                    onChange={(e) =>
                      setInviteInput(e.target.value)
                    }
                    className="border-2 bg-white border-black h-9"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="border-2 shrink-0 bg-primary text-white md:h-10"
                    disabled={!inviteInput.trim()}
                    onClick={() => {
                      onAddEmail?.(inviteInput.trim());
                      setInviteInput('');
                    }}
                  >
                    Add
                  </Button>
                </div>
                {queuedEmails.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {queuedEmails.map((email) => (
                      <span
                        key={email}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-blue-50 border-2 border-blue-200"
                      >
                        {email}
                        <button
                          type="button"
                          onClick={() =>
                            onRemoveEmail?.(email)
                          }
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : isPending ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full bg-gray-300" />
              <Skeleton className="h-10 w-full bg-gray-300" />
            </div>
          ) : (
            <>
              {/* Members List */}
              {members.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Members ({members.length})
                  </h4>
                  <div className="space-y-2">
                    {members.map(
                      (member: AccountMember) => (
                        <div
                          key={member.userID}
                          className="flex items-center justify-between p-2 rounded-lg border-2"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200">
                              {member.image ? (
                                <Image
                                  src={member.image}
                                  alt={member.name}
                                  width={32}
                                  height={32}
                                  className="object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-sm font-medium text-gray-500">
                                  {member.name
                                    ?.charAt(0)
                                    ?.toUpperCase() || '?'}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">
                                  {member.name}
                                </span>
                                {member.role ===
                                  'owner' && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs border-primary text-primary"
                                  >
                                    <Shield className="h-3 w-3 mr-1" />
                                    Owner
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {member.email}
                              </div>
                            </div>
                          </div>
                          {member.role !== 'owner' &&
                            data?.isOwner && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="text-red-500 h-8 w-8"
                                onClick={() =>
                                  onQueueRemoveMember?.(
                                    member.userID
                                  )
                                }
                              >
                                <UserMinus className="h-4 w-4" />
                              </Button>
                            )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Members Queued for Removal */}
              {removedMembers.length > 0 && (
                <div className="space-y-2">
                  <div className="space-y-2">
                    {removedMembers.map(
                      (member: AccountMember) => (
                        <div
                          key={member.userID}
                          className="flex items-center justify-between p-2 rounded-lg border-2 border-red-300 bg-red-50 opacity-60"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200">
                              {member.image ? (
                                <Image
                                  src={member.image}
                                  alt={member.name}
                                  width={32}
                                  height={32}
                                  className="object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-sm font-medium text-gray-500">
                                  {member.name
                                    ?.charAt(0)
                                    ?.toUpperCase() || '?'}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium line-through">
                                  {member.name}
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {member.email}
                              </div>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              onUnqueueRemoveMember?.(
                                member.userID
                              )
                            }
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Pending Invitations */}
              {invitations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Pending Invitations
                  </h4>
                  <div className="space-y-2">
                    {invitations.map(
                      (invitation: Invitation) => (
                        <div
                          key={invitation.id}
                          className="flex items-center justify-between p-2 rounded-lg border-2 border-yellow-300 bg-yellow-50"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Mail className="h-4 w-4 shrink-0 text-yellow-600" />
                            <div className="min-w-0">
                              <span className="text-sm block truncate">
                                {invitation.invitedEmail}
                              </span>
                              {invitation.inviteLink && (
                                <span className="text-xs text-muted-foreground block truncate max-w-[200px]">
                                  {invitation.inviteLink}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  invitation.inviteLink
                                );
                                setCopiedId(invitation.id);
                                setTimeout(
                                  () => setCopiedId(null),
                                  2000
                                );
                              }}
                            >
                              {copiedId ===
                              invitation.id ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Link className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500"
                              onClick={() =>
                                onQueueCancelInvitation?.(
                                  invitation.id
                                )
                              }
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Invitations Queued for Cancellation */}
              {cancelledInvitations.length > 0 && (
                <div className="space-y-2">
                  <div className="space-y-2">
                    {cancelledInvitations.map(
                      (invitation: Invitation) => (
                        <div
                          key={invitation.id}
                          className="flex items-center justify-between p-2 rounded-lg border-2 border-red-300 bg-red-50 opacity-60"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Mail className="h-4 w-4 shrink-0 text-red-600" />
                            <div className="min-w-0">
                              <span className="text-sm block truncate line-through">
                                {invitation.invitedEmail}
                              </span>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              onUnqueueCancelInvitation?.(
                                invitation.id
                              )
                            }
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Email Invite Queue */}
              {data?.isOwner && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Invite by Email
                  </h4>
                  <div className="flex gap-2">
                    <Input
                      placeholder="user@example.com"
                      type="email"
                      value={inviteInput}
                      onChange={(e) =>
                        setInviteInput(e.target.value)
                      }
                      className="border-2 bg-white border-black h-9"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="border-2 shrink-0 bg-primary text-white md:h-10"
                      disabled={!inviteInput.trim()}
                      onClick={() => {
                        onAddEmail?.(inviteInput.trim());
                        setInviteInput('');
                      }}
                    >
                      Add
                    </Button>
                  </div>
                  {queuedEmails.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {queuedEmails.map((email) => (
                        <span
                          key={email}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-blue-50 border-2 border-blue-200"
                        >
                          {email}
                          <button
                            type="button"
                            onClick={() =>
                              onRemoveEmail?.(email)
                            }
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {data?.members.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No members yet
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
