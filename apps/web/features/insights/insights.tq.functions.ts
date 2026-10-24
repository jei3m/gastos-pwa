import { apiFetch, toSearchParams } from '@/lib/api';
import type { InsightsData } from './insights.interface';

export const fetchInsights = async (
  type: string | null,
  accountID: string | null,
  dateStart?: string | null,
  dateEnd?: string | null
) => {
  const query = toSearchParams({
    type,
    accountID,
    dateStart,
    dateEnd,
  });

  const res = await apiFetch<{ data: InsightsData[] }>(
    `/api/insights${query}`
  );
  return res.data;
};
