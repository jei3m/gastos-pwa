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
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { Category } from '@/types/categories.types';
import { Inbox } from 'lucide-react';

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
  const { chartData, chartConfig } = useMemo(() => {
    // Filter categories by the selected type (income or expense)
    const filteredCategories = categories.filter(
      (cat) =>
        cat.type.toLowerCase() ===
        categoryType.toLowerCase()
    );
    const expenseColors = [
      '#ef4444',
      '#f97316',
      '#f59e0b',
      '#eab308',
      '#ec4899',
      '#f43f5e',
    ];
    const incomeColors = [
      '#22c55e',
      '#10b981',
      '#84cc16',
      '#14b8a6',
      '#06b6d4',
    ];
    const colorPalette =
      categoryType.toLowerCase() === 'expense'
        ? expenseColors
        : incomeColors;

    const data = filteredCategories.map((cat, index) => {
      const color =
        colorPalette[index % colorPalette.length];
      return {
        name: cat.name,
        value: cat.totalAmount,
        fill: color,
      };
    });

    const config: ChartConfig = {
      value: {
        label: 'Amount (PHP)',
      },
    };
    filteredCategories.forEach((cat, index) => {
      const color =
        colorPalette[index % colorPalette.length];
      config[cat.name] = {
        label: cat.name,
        color: color,
      };
    });

    return { chartData: data, chartConfig: config };
  }, [categories, categoryType]);

  const dateRangeText =
    dateStart && dateEnd
      ? `${dateStart} – ${dateEnd}`
      : dateStart
        ? `From ${dateStart}`
        : dateEnd
          ? `Until ${dateEnd}`
          : 'All time';

  const chartTitle =
    categoryType === 'expense' ? 'Expense' : 'Income';

  return (
    <Card className="flex flex-col border-2 mt-0">
      <CardHeader className="items-center pb-2">
        <CardTitle className="text-lg md:text-xl">
          {chartTitle}
        </CardTitle>
        <CardDescription className="text-sm md:text-md -mt-2">
          {dateRangeText}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center gap-2">
        {chartData.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="h-60 w-full -mt-2"
          >
            <PieChart className="flex flex-col md:flex-row">
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                outerRadius={80}
                isAnimationActive={false}
              />
              <ChartLegend
                content={
                  <ChartLegendContent nameKey="name" />
                }
                className="flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
              />
            </PieChart>
          </ChartContainer>
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
