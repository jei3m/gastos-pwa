import EditTransactionForm from '@/components/transactions/edit-transaction-form';
import { Suspense } from 'react';

function TransactionDetailPage() {
  return (
    <Suspense fallback={<></>}>
      <EditTransactionForm />
    </Suspense>
  );
}

export default TransactionDetailPage;
