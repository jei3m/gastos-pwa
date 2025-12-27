"use client"
import { 
  CircleCheckIcon, 
  InfoIcon, 
  Loader2Icon, 
  OctagonXIcon, 
  TriangleAlertIcon 
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        style: {
          background: "var(--normal-bg)",
          color: "white",
          border: "2px solid black",
        },
        classNames: {
          toast: "bg-popover text-popover-foreground",
          success: "!bg-[oklch(79.76%_0.2044_153.08)]",
          error: "!bg-[oklch(62.82%_0.204_26.71)]",
          warning: "!bg-[oklch(62.82%_0.204_26.71)]",
          info: "!bg-[oklch(62.82%_0.132_231.6)]",
        }
      }}
      className="toaster group"
      {...props}
    />
  )
}

export { Toaster }
