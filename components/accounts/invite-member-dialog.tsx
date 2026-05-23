'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { inviteMember } from '@/lib/tq-functions/members.tq.functions';
import { membersQueryOptions } from '@/lib/tq-options/members.tq.options';
import { toast } from 'sonner';
import { Loader2, Copy, Check } from 'lucide-react';

interface InviteMemberDialogProps {
  accountID: string;
}

export default function InviteMemberDialog({
  accountID,
}: InviteMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [inviteLink, setInviteLink] = useState<
    string | null
  >(null);
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () => inviteMember(accountID, email),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: membersQueryOptions(accountID).queryKey,
      });
      setInviteLink(data.inviteLink);
      setEmail('');
      toast.success('Invitation created successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleCopyLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEmail('');
    setInviteLink(null);
    setCopied(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-2 w-full bg-primary text-white"
        >
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md border-2">
        <DialogHeader>
          <DialogTitle>Invite a Member</DialogTitle>
          <DialogDescription className="text-left">
            Enter the email address of the user you want to
            invite. They must have an account in this app.
          </DialogDescription>
        </DialogHeader>

        {inviteLink ? (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Share this link with the user to join this
              account:
            </div>
            <div className="flex items-center gap-2">
              <Input
                value={inviteLink}
                readOnly
                className="font-mono text-xs border-2"
              />
              <Button
                size="icon"
                variant="outline"
                className="shrink-0 border-2"
                onClick={handleCopyLink}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <DialogFooter>
              <Button
                onClick={handleClose}
                className="w-full"
              >
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <Input
              placeholder="user@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isPending}
              className="border-2 bg-white border-black"
            />
            <DialogFooter className="flex flex-row justify-between">
              <Button
                onClick={handleClose}
                disabled={isPending}
                className="bg-red-500 border-2 hover:none"
              >
                Cancel
              </Button>
              <Button
                onClick={() => mutate()}
                disabled={isPending || !email.trim()}
                className="space-x-2"
              >
                {isPending && (
                  <Loader2 className="animate-spin" />
                )}
                Send Invitation
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
