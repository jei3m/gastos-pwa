import { Link } from 'react-router';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TypographyH4 } from '@/components/custom/typography';
import { ChevronRight } from 'lucide-react';

export default function SetupPreferencesSection() {
  return (
    <section className="space-y-4">
      <TypographyH4 className="font-semibold">
        Setup &amp; Preferences
      </TypographyH4>
      <Card>
        <CardContent className="flex flex-col gap-2 md:gap-3">
          <Link
            to="/settings/accounts"
            className="flex flex-row items-center justify-between"
          >
            <div>
              <div className="text-md font-medium text-foreground">
                Accounts
              </div>
              <div className="text-sm text-muted-foreground">
                Create, edit, and remove your accounts.
              </div>
            </div>
            <ChevronRight className="size-5 text-muted-foreground" />
          </Link>
          <Separator />
          <Link
            to="/settings/categories"
            className="flex flex-row items-center justify-between"
          >
            <div>
              <div className="text-md font-medium text-foreground">
                Categories
              </div>
              <div className="text-sm text-muted-foreground">
                Manage your income and expense categories.
              </div>
            </div>
            <ChevronRight className="size-5 text-muted-foreground" />
          </Link>
        </CardContent>
      </Card>
    </section>
  );
}
