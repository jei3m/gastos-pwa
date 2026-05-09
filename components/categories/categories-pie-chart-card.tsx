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

    // Tailwind 500 color palettes
    const expenseColors = [
      '#ef4444', // red-500
      '#f97316', // orange-500
      '#f59e0b', // amber-500
      '#eab308', // yellow-500
      '#ec4899', // pink-500
      '#f43f5e', // rose-500
    ];
    const incomeColors = [
      '#22c55e', // green-500
      '#10b981', // emerald-500
      '#84cc16', // lime-500
      '#14b8a6', // teal-500
      '#06b6d4', // cyan-500
    ];
    const colorPalette =
      categoryType.toLowerCase() === 'expense'
        ? expenseColors
        : incomeColors;

    // Generate chart data and config dynamically
    const data = filteredCategories.map((cat, index) => {
      const color =
        colorPalette[index % colorPalette.length];
      return {
        name: cat.name,
        value: cat.totalAmount,
        fill: color,
      };
    });

    // Build chart config for the legend
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

  // Format date range for description
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

  if (chartData.length === 0) return null;

  return (
    <Card className="flex flex-col border-2 mt-0">
      <CardHeader className="-mb-18 items-center">
        <CardTitle>{chartTitle}</CardTitle>
        <CardDescription>{dateRangeText}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 -mb-4">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              isAnimationActive={false}
            />
            <ChartLegend
              content={
                <ChartLegendContent nameKey="name" />
              }
              className="-mt-16 flex-wrap gap-2 *:basis-1/4 *:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
