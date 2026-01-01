import { ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";

interface AlertDialogProps {
  isDisabled: boolean;
  trigger: ReactNode;
  title: string;
  description: ReactNode;
  body?: ReactNode;
  confirmMessage: string;
  type?: "button" | "submit";
  onConfirm: () => void;
};

export default function CustomAlertDialog({
  isDisabled,
  trigger,
  title,
  description,
  body,
  confirmMessage,
  type,
  onConfirm
}: AlertDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild
        disabled={isDisabled}
      >
        {trigger}
      </AlertDialogTrigger>
      <AlertDialogContent
        className="border-2 bg-primary [&>button]:hidden"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <AlertDialogHeader className="text-left">
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-gray-800 text-sm">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {body && (
          <div className="text-sm">
            {body}
          </div>
        )}
        <AlertDialogFooter className="flex flex-row justify-between">
          <AlertDialogCancel asChild>
            <Button variant="outline" className="border-2">
              Cancel
            </Button>
          </AlertDialogCancel>
          <Button 
            variant="destructive" 
            className="border-2"
            type={type || "button"}
            onClick={onConfirm}
          >
            {confirmMessage}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
