'use client';
import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { membersQueryOptions } from '@/lib/tq-options/members.tq.options';
import {
  removeMember,
  cancelInvitation,
} from '@/lib/tq-functions/members.tq.functions';
import InviteMemberDialog from './invite-member-dialog';
import { toast } from 'sonner';
import {
  UserMinus,
  X,
  Shield,
  Mail,
  Check,
  Link,
} from 'lucide-react';
import {
  AccountMember,
  Invitation,
} from '@/types/accounts.types';
import Image from 'next/image';

interface AccountSharingSectionProps {
  accountID: string;
}

export default function AccountSharingSection({
  accountID,
}: AccountSharingSectionProps) {
  const [copiedId, setCopiedId] = useState<string | null>(
    null
  );
  const queryClient = useQueryClient();

  const { data, isPending } = useQuery(
    membersQueryOptions(accountID)
  );

  const {
    mutate: removeMemberMutation,
    isPending: isRemoving,
  } = useMutation({
    mutationFn: (userID: string) =>
      removeMember(accountID, userID),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: membersQueryOptions(accountID).queryKey,
      });
      toast.success('Member removed');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const {
    mutate: cancelInvitationMutation,
    isPending: isCancelling,
  } = useMutation({
    mutationFn: (inviteId: string) =>
      cancelInvitation(accountID, inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: membersQueryOptions(accountID).queryKey,
      });
      toast.success('Invitation cancelled');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <section className="px-3">
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-lg">Sharing</CardTitle>
        </CardHeader>
        <Separator className="-mt-2 mb-2" />
        <CardContent className="space-y-4">
          {isPending ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full bg-gray-300" />
              <Skeleton className="h-10 w-full bg-gray-300" />
            </div>
          ) : (
            <>
              {/* Members List */}
              {data?.members && data.members.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Members ({data.members.length})
                  </h4>
                  <div className="space-y-2">
                    {data.members.map(
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
                            data.isOwner && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 h-8 w-8"
                                onClick={() =>
                                  removeMemberMutation(
                                    member.userID
                                  )
                                }
                                disabled={isRemoving}
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

              {/* Pending Invitations */}
              {data?.invitations &&
                data.invitations.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Pending Invitations
                    </h4>
                    <div className="space-y-2">
                      {data.invitations.map(
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
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    invitation.inviteLink
                                  );
                                  setCopiedId(
                                    invitation.id
                                  );
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
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500"
                                onClick={() =>
                                  cancelInvitationMutation(
                                    invitation.id
                                  )
                                }
                                disabled={isCancelling}
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

              {/* Invite Button */}
              {data?.isOwner && (
                <InviteMemberDialog accountID={accountID} />
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
