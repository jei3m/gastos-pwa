import type { ReactElement, ReactNode } from 'react';
import { Loader } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface AlertDialogProps {
  isDisabled: boolean;
  trigger: ReactNode;
  title: string;
  description: ReactNode;
  body?: ReactNode;
  confirmMessage: ReactNode;
  type?: 'button' | 'submit';
  onConfirm: () => void;
}

export default function CustomAlertDialog({
  isDisabled,
  trigger,
  title,
  description,
  body,
  confirmMessage,
  type,
  onConfirm,
}: AlertDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger
        disabled={isDisabled}
        render={trigger as ReactElement}
      />
      <AlertDialogContent className="border-2 [&>button]:hidden">
        <AlertDialogHeader className="place-items-start text-left">
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-gray-800">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {body && <div className="text-sm">{body}</div>}
        <AlertDialogFooter className="flex flex-row justify-between">
          <AlertDialogCancel
            variant="ghost"
            disabled={isDisabled}
          >
            Cancel
          </AlertDialogCancel>
          <Button
            variant="destructive"
            className="space-x-2"
            type={type || 'button'}
            onClick={onConfirm}
            disabled={isDisabled}
          >
            {isDisabled && (
              <Loader className="animate-spin" />
            )}
            {confirmMessage}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
