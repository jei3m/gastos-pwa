import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';
import ProtectedRoute from '@/components/custom/protected-route';
import AuthLayout from './routes/auth-layout';
import PagesLayout from './routes/pages-layout';
import RootRedirect from './routes/root';
import Login from './routes/auth/login';
import Register from './routes/auth/register';
import AcceptInvitation from './routes/pages/invitations-accept';
import TransactionsPage from './routes/pages/transactions';
import TransactionsAddPage from './routes/pages/transactions-add';
import TransactionDetailPage from './routes/pages/transaction-detail';
import AccountsPage from './routes/pages/accounts';
import AccountsAddPage from './routes/pages/accounts-add';
import AccountDetailPage from './routes/pages/account-detail';
import CategoriesPage from './routes/pages/categories';
import CategoriesAddPage from './routes/pages/categories-add';
import CategoryDetailPage from './routes/pages/category-detail';
import CategoryTransactionsPage from './routes/pages/category-transactions';
import CategoryTransactionDetailPage from './routes/pages/category-transaction-detail';
import SettingsPage from './routes/pages/settings';

function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />

        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        <Route path="/pages" element={<PagesLayout />}>
          <Route
            path="invitations/accept"
            element={<AcceptInvitation />}
          />

          <Route element={<ProtectedRoute />}>
            <Route
              path="transactions"
              element={<TransactionsPage />}
            />
            <Route
              path="transactions/add"
              element={<TransactionsAddPage />}
            />
            <Route
              path="transactions/:id"
              element={<TransactionDetailPage />}
            />
            <Route
              path="accounts"
              element={<AccountsPage />}
            />
            <Route
              path="accounts/add"
              element={<AccountsAddPage />}
            />
            <Route
              path="accounts/:id"
              element={<AccountDetailPage />}
            />
            <Route
              path="categories"
              element={<CategoriesPage />}
            />
            <Route
              path="categories/add"
              element={<CategoriesAddPage />}
            />
            <Route
              path="categories/:id"
              element={<CategoryDetailPage />}
            />
            <Route
              path="categories/:id/transactions"
              element={<CategoryTransactionsPage />}
            />
            <Route
              path="categories/:id/transactions/:transaction-id"
              element={<CategoryTransactionDetailPage />}
            />
            <Route
              path="settings"
              element={<SettingsPage />}
            />
          </Route>
        </Route>

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
