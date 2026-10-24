import { TypographyH4 } from './typography';

interface NoSelectedAccountDivProps {
  data?: string;
}

export default function NoSelectedAccountDiv({
  data,
}: NoSelectedAccountDivProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10">
      <TypographyH4 className="text-center font-semibold text-gray-400">
        No Selected Account
      </TypographyH4>
      <p className="text-center text-sm text-gray-500">
        Please select an account first before fetching{' '}
        {data || 'data'}
      </p>
    </div>
  );
}
