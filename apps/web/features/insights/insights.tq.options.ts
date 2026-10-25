import { queryOptions } from '@tanstack/react-query';
import { fetchInsights } from './insights.tq.functions';

export function insightsQueryOptions(
  categoryType: 'income' | 'expense',
  selectedAccountID: string | null,
  isEnabled: boolean,
  dateStart?: string | null,
  dateEnd?: string | null
) {
  return queryOptions({
    queryKey: [
      'insights',
      categoryType,
      selectedAccountID,
      dateStart,
      dateEnd,
    ],
    queryFn: () => {
      return fetchInsights(
        categoryType,
        selectedAccountID,
        dateStart,
        dateEnd
      );
    },
    enabled: isEnabled,
    retry: false,
  });
}
