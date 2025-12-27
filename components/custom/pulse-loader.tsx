import { cn } from "@/lib/utils";

interface PulseLoaderProps {
  dotCount?: number;
  size?: "sm" | "md" | "lg" | "xl";
  color?: "primary" | "secondary" | "destructive" | "muted";
  className?: string;
  text?: string;
  fullWidth?: boolean;
}

export default function PulseLoader({
  dotCount = 3,
  size = "md",
  color = "primary",
  className,
  text = "Loading...",
  fullWidth = false,
}: PulseLoaderProps) {
  const sizeClasses = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4",
    xl: "h-5 w-5"
  };

  const colorClasses = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    destructive: "bg-destructive",
    muted: "bg-muted-foreground"
  };

  const containerClasses = cn(
    "mt-4 flex flex-col items-center justify-center",
    fullWidth ? "w-full p-8" : "p-4",
    className
  );

  return (
    <div className={containerClasses}>
      <div className="flex items-center justify-center gap-2 mb-3">
        {Array.from({ length: dotCount }).map((_, index) => (
          <div
            key={index}
            className={cn(
              sizeClasses[size],
              colorClasses[color],
              "rounded-full animate-bounce"
            )}
            style={{
              animationDelay: `${index * 150}ms`,
              animationDuration: "0.6s"
            }}
          />
        ))}
      </div>
      {text && (
        <p className="text-sm text-muted-foreground font-medium animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}