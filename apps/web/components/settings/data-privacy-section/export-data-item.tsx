import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchUserDataExport } from '@/features/user/user.tq.functions';
import { toast } from '@/lib/toast';
import { Download } from 'lucide-react';
import { useState } from 'react';

interface IExportDataItem {
  isSessionPending: boolean;
}

export default function ExportDataItem({
  isSessionPending,
}: IExportDataItem) {
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
    <div className="flex flex-row items-center justify-between">
      <div className="flex-1">
        <div className="text-md font-medium text-foreground">
          Export Data
        </div>
        <div className="text-sm text-muted-foreground">
          Download all of your accounts, categories, and
          transactions as a JSON file.
        </div>
      </div>
      <div className="ml-4 flex-shrink-0">
        {isSessionPending ? (
          <Skeleton className="h-9 w-32 bg-gray-300" />
        ) : (
          <Button
            onClick={handleExport}
            disabled={isExporting}
            variant="ghost"
            className="text-green-500 px-1 sm:px-4 mt-1"
          >
            <Download className="size-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
