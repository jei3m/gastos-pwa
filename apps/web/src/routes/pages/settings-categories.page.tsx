import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAccount } from '@/context/account-context';
import { categoryQueryOptions } from '@/features/categories/categories.tq.options';
import type { Category } from '@/features/categories/categories.interface';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { categoryTypes } from '@/lib/data';
import {
  TypographyH4,
  TypographyH5,
} from '@/components/custom/typography';
import PulseLoader from '@/components/custom/pulse-loader';
import PageHeader from '@/components/custom/page-header';
import CategoryCard from '@/components/categories/category-card';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router';
import { Inbox, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function SettingsCategoriesPage() {
  const [activeTab, setActiveTab] =
    useState<string>('expense');
  const isMobile = useIsMobile();
  const { selectedAccountID } = useAccount();
  const {
    data: categories,
    isPending: isCategoriesLoading,
  } = useQuery(
    categoryQueryOptions(
      activeTab,
      selectedAccountID,
      !!activeTab,
      null,
      null,
      'list'
    )
  );

  return (
    <main
      className={cn(
        'flex flex-col space-y-4 md:space-y-6 overflow-y-auto overflow-x-hidden p-3',
        isMobile ? 'h-screen pb-32' : 'pb-4'
      )}
    >
      <PageHeader
        title="Categories"
        description="View and manage all your categories. Select a category to edit its name, description, type, and icon."
      />
      <section className="space-y-3 md:space-y-4">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="w-full border-2 border-black p-1 w-full h-10">
            {categoryTypes.map((type, index) => (
              <TabsTrigger
                value={type.toLowerCase()}
                key={index}
                className={cn(
                  'text-sm md:text-md',
                  type === 'Expense'
                    ? 'data-active:bg-red-400'
                    : 'data-active:bg-green-300'
                )}
              >
                {type}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        {isCategoriesLoading ? (
          <PulseLoader />
        ) : categories && categories.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 md:gap-4">
            <Link
              to="/categories/add"
              className="block min-w-0 h-full"
            >
              <Card className="p-[10px] h-full border-dashed hover:bg-gray-100 transition-colors">
                <CardContent className="flex flex-row items-center h-full -p-1">
                  <div className="flex flex-row space-x-2 md:space-x-3 items-center flex-1 min-w-0">
                    <div
                      className={cn(
                        'p-2 rounded-lg shrink-0',
                        activeTab === 'expense'
                          ? 'bg-red-500/15'
                          : 'bg-primary/15'
                      )}
                    >
                      <Plus
                        size={26}
                        className={cn(
                          activeTab === 'expense'
                            ? 'text-red-500'
                            : 'text-primary'
                        )}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <TypographyH5 className="font-semibold truncate">
                        New Category
                      </TypographyH5>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            {categories.map((category: Category) => (
              <CategoryCard
                key={category.id}
                category={category}
                hideAmount={true}
                showDescription={true}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <div className="rounded-full bg-muted p-4 text-muted-foreground">
              <Inbox size={40} strokeWidth={1.5} />
            </div>
            <div className="space-y-1">
              <TypographyH4 className="font-semibold">
                No {activeTab} categories yet
              </TypographyH4>
              <p className="text-sm text-muted-foreground">
                Create a category to start organizing your
                transactions.
              </p>
            </div>
            <Link to="/categories/add">
              <Button>
                <Plus /> New Category
              </Button>
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
