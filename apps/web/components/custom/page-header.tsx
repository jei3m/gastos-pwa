import type { ReactNode } from 'react';
import { TypographyH3 } from '@/components/custom/typography';
import { cn } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  onBack?: () => void;
  className?: string;
}

export default function PageHeader({
  title,
  description,
  action,
  className,
}: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className={cn(className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-1">
          <div className="min-w-0 space-y-1">
            <div
              onClick={() => navigate(-1)}
              className="flex items-center cursor-pointer"
            >
              <ChevronLeft className="mr-2" size={22} />
              <TypographyH3>{title}</TypographyH3>
            </div>
            {description && (
              <div className="text-sm md:text-md text-muted-foreground text-balance">
                {description}
              </div>
            )}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </header>
  );
}
