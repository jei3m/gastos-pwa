import { TypographyH4 } from '../../custom/typography';
import { Card, CardContent } from '../../ui/card';
import { Separator } from '../../ui/separator';
import ManageSessionsItem from './manage-sessions-item';
import ExportDataItem from './export-data-item';

interface IDataPrivacySection {
  isSessionPending: boolean;
}

export default function DataPrivacySection({
  isSessionPending,
}: IDataPrivacySection) {
  return (
    <section className="space-y-4">
      <TypographyH4 className="font-semibold">
        Data &amp; Privacy
      </TypographyH4>
      <Card>
        <CardContent className="flex flex-col gap-2 md:gap-3">
          <ExportDataItem
            isSessionPending={isSessionPending}
          />
          <Separator />
          <ManageSessionsItem
            isSessionPending={isSessionPending}
          />
        </CardContent>
      </Card>
    </section>
  );
}
