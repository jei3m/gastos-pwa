'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchUserDataExport } from '@/lib/tq-functions/user.tq.functions';
import { cn } from '@/lib/utils';
import { TypographyH4 } from '../custom/typography';

interface DataSectionProps {
  isSessionPending: boolean;
}

export default function DataSection({
  isSessionPending,
}: DataSectionProps) {
  const [isExporting, setIsExporting] =
    useState<boolean>(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const data = await fetchUserDataExport();

      const blob = new Blob(
        [JSON.stringify(data, null, 2)],
        {
          type: 'application/json',
        }
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `gastos-backup-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Data exported successfully');
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to export data'
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <section className="pt-2 space-y-4 mb-2">
      <TypographyH4 className="font-semibold">
        Data &amp; Privacy
      </TypographyH4>
      <Card className={cn('border-2')}>
        <div className="flex items-center justify-between px-4">
          <div className="flex-1">
            <CardHeader className="p-0 -mb-1">
              <CardTitle className="text-md font-medium text-foreground">
                Export Data
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="text-sm text-muted-foreground">
                Download all of your accounts, categories,
                and transactions as a JSON file.
              </div>
            </CardContent>
          </div>

          <div className="ml-4 flex-shrink-0">
            {isSessionPending ? (
              <Skeleton className="h-9 w-32 bg-gray-300" />
            ) : (
              <Button
                onClick={handleExport}
                disabled={isExporting}
              >
                Export
              </Button>
            )}
          </div>
        </div>
      </Card>
    </section>
  );
}
