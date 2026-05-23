'use client';
import { queryOptions } from '@tanstack/react-query';
import { fetchMembers } from '../tq-functions/members.tq.functions';

export function membersQueryOptions(accountID: string) {
  return queryOptions({
    queryKey: ['members', accountID],
    queryFn: () => {
      return fetchMembers(accountID);
    },
    enabled: !!accountID,
  });
}
