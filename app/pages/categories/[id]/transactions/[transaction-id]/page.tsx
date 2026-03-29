import EditTransactionForm from '@/components/transactions/edit-transaction-form';
import { Suspense } from 'react';

function EditTransactionPage() {
  return (
    <Suspense fallback={<></>}>
      <EditTransactionForm />
    </Suspense>
  );
}

export default EditTransactionPage;
