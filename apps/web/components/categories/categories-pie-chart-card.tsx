import { useMemo } from 'react';
import { Pie, PieChart } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  type ChartConfig,
} from '@/components/ui/chart';
import type { Category } from '@/features/categories/categories.interface';
import { CalendarDays, Inbox } from 'lucide-react';
import { format } from 'date-fns';
import { breakdownColorPalette } from '@/lib/data';

interface CategoryPieChartProps {
  categories: Category[];
  categoryType: string;
  dateStart?: string;
  dateEnd?: string;
}

export function CategoryPieChart({
  categories,
  categoryType,
  dateStart,
  dateEnd,
}: CategoryPieChartProps) {
  const { chartData, chartConfig, total } = useMemo(() => {
    const filteredCategories = categories.filter(
      (cat) =>
        cat.type.toLowerCase() ===
        categoryType.toLowerCase()
    );

    const data = filteredCategories
      .map((cat, index) => {
        const color =
          breakdownColorPalette[
            index % breakdownColorPalette.length
          ];
        return {
          name: cat.name,
          value: cat.totalAmount,
          fill: color,
        };
      })
      .sort((a, b) => Number(b.value) - Number(a.value));

    const total = data.reduce(
      (sum, item) => sum + Number(item.value),
      0
    );

    const config: ChartConfig = {
      value: {
        label: 'Amount (PHP)',
      },
    };
    filteredCategories.forEach((cat, index) => {
      const color =
        breakdownColorPalette[
          index % breakdownColorPalette.length
        ];
      config[cat.name] = {
        label: cat.name,
        color: color,
      };
    });

    return { chartData: data, chartConfig: config, total };
  }, [categories, categoryType]);

  const dateRangeText =
    dateStart && dateEnd
      ? `${format(dateStart, 'MMM dd, yyyy')} to ${format(dateEnd, 'MMM dd, yyyy')}`
      : dateStart
        ? `From ${format(dateStart, 'MMM dd, yyyy')}`
        : dateEnd
          ? `Until ${format(dateEnd, 'MMM dd, yyyy')}`
          : 'All time';

  const chartTitle =
    categoryType.toLowerCase() === 'expense'
      ? 'Expense Breakdown'
      : 'Income Breakdown';

  return (
    <Card className="flex flex-col border-2 border-black">
      <CardHeader>
        <div className="flex flex-col gap-0">
          <CardTitle className="text-lg md:text-xl">
            {chartTitle}
          </CardTitle>
          <CardDescription className="flex items-center gap-1.5 text-sm">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" />
            {dateRangeText}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="-mb-1 flex-1 flex flex-col items-center">
        {chartData.length > 0 ? (
          <>
            <div className="relative h-60 w-full -mt-10">
              <ChartContainer
                config={chartConfig}
                className="h-full w-full p-0"
              >
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={80}
                    stroke="none"
                    strokeWidth={0}
                    isAnimationActive={false}
                  />
                </PieChart>
              </ChartContainer>
              <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2 h-[160px] w-[160px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-black"
              />
            </div>
            <ul className="-mt-4 w-full grid grid-cols-1 gap-1 md:grid-cols-2 md:gap-x-4">
              {chartData.map((item) => {
                const percent =
                  total > 0
                    ? Math.round(
                        (Number(item.value) / total) * 100
                      )
                    : 0;
                return (
                  <li
                    key={item.name}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="flex items-center gap-2 font-medium">
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{
                          backgroundColor: item.fill,
                        }}
                      />
                      {item.name}
                    </span>
                    <span className="flex items-center gap-3 tabular-nums text-muted-foreground">
                      <span>
                        PHP{' '}
                        {Number(item.value).toLocaleString(
                          'en-PH',
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </span>
                      <span className="w-10 text-right font-semibold">
                        {percent}%
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <div className="-my-10 flex flex-col items-center justify-center gap-4 py-12 text-muted-foreground">
            <div className="rounded-full bg-muted p-4">
              <Inbox size={80} strokeWidth={1.5} />
            </div>
            <p className="text-sm text-center">
              No {categoryType} breakdown for this period
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
