import AddTransactionForm from '@/components/transactions/add-transaction-form';
import { useSearchParams } from 'react-router';

function AddTransactionPage() {
  const [searchParams] = useSearchParams();
  return (
    <AddTransactionForm
      transactionTypeParam={searchParams.get('type')}
    />
  );
}

export default AddTransactionPage;
