import { lazy, Suspense } from 'react';
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from 'react-router';
import Loader from '@/components/custom/loader';
import LegacyPagesRedirect from './routes/legacy-pages-redirect';
import AuthLayout from './routes/layouts/auth-layout';
import PagesLayout from './routes/layouts/pages-layout';
import ProtectedRoute from './routes/guards/protected-route';
import RootRedirect from './routes/root-redirect';
import RouteError from './routes/route-error';

const LoginPage = lazy(
  () => import('./routes/auth/login.page')
);
const RegisterPage = lazy(
  () => import('./routes/auth/register.page')
);
const AcceptInvitationPage = lazy(
  () => import('./routes/pages/accept-invitation.page')
);
const TransactionsPage = lazy(
  () => import('./routes/pages/transactions.page')
);
const AddTransactionPage = lazy(
  () => import('./routes/pages/add-transaction.page')
);
const TransactionDetailPage = lazy(
  () => import('./routes/pages/transaction-detail.page')
);
const AccountsPage = lazy(
  () => import('./routes/pages/accounts.page')
);
const AddAccountPage = lazy(
  () => import('./routes/pages/add-account.page')
);
const AccountDetailPage = lazy(
  () => import('./routes/pages/account-detail.page')
);
const InsightsPage = lazy(
  () => import('./routes/pages/insights.page')
);
const AddCategoryPage = lazy(
  () => import('./routes/pages/add-category.page')
);
const CategoryDetailPage = lazy(
  () => import('./routes/pages/category-detail.page')
);
const CategoryTransactionsPage = lazy(
  () => import('./routes/pages/category-transactions.page')
);
const SettingsPage = lazy(
  () => import('./routes/pages/settings.page')
);
const SettingsAccountsPage = lazy(
  () => import('./routes/pages/settings-accounts.page')
);
const SettingsCategoriesPage = lazy(
  () => import('./routes/pages/settings-categories.page')
);

const router = createBrowserRouter([
  {
    errorElement: <RouteError />,
    children: [
      { path: '/', element: <RootRedirect /> },
      {
        path: '/auth',
        element: <AuthLayout />,
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'register', element: <RegisterPage /> },
        ],
      },
      {
        element: <PagesLayout />,
        children: [
          {
            path: 'invitations/accept',
            element: <AcceptInvitationPage />,
          },
          {
            element: <ProtectedRoute />,
            children: [
              {
                path: 'transactions',
                element: <TransactionsPage />,
              },
              {
                path: 'transactions/add',
                element: <AddTransactionPage />,
              },
              {
                path: 'transactions/:id',
                element: <TransactionDetailPage />,
              },
              {
                path: 'accounts',
                element: <AccountsPage />,
              },
              {
                path: 'accounts/add',
                element: <AddAccountPage />,
              },
              {
                path: 'accounts/:id',
                element: <AccountDetailPage />,
              },
              {
                path: 'insights',
                element: <InsightsPage />,
              },
              {
                path: 'categories/add',
                element: <AddCategoryPage />,
              },
              {
                path: 'categories/:id',
                element: <CategoryDetailPage />,
              },
              {
                path: 'categories/:id/transactions',
                element: <CategoryTransactionsPage />,
              },
              {
                path: 'categories/:id/transactions/:transactionID',
                element: <TransactionDetailPage />,
              },
              {
                path: 'settings',
                element: <SettingsPage />,
              },
              {
                path: 'settings/accounts',
                element: <SettingsAccountsPage />,
              },
              {
                path: 'settings/categories',
                element: <SettingsCategoriesPage />,
              },
            ],
          },
        ],
      },
      {
        path: '/pages/*',
        element: <LegacyPagesRedirect />,
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

function Router() {
  return (
    <Suspense fallback={<Loader />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}

export default Router;
