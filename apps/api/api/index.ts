import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from '../lib/auth.ts';
import { requireAuth } from '../middleware/auth.middleware.ts';
import { rateLimit } from '../middleware/rate-limit.middleware.ts';
import {
  notFound,
  errorHandler,
} from '../middleware/error.middleware.ts';
import accountsRouter from '../routes/accounts.routes.ts';
import categoriesRouter from '../routes/categories.routes.ts';
import transactionsRouter from '../routes/transactions.routes.ts';
import invitationsRouter from '../routes/invitations.routes.ts';
import exportRouter from '../routes/export.routes.ts';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.ORIGIN_URL,
    credentials: true,
  })
);

// Better Auth must receive the raw request body, so it is mounted
// before express.json().
app.use((req, res, next) => {
  if (req.path.startsWith('/api/auth')) {
    return toNodeHandler(auth)(req, res);
  }
  next();
});

app.use(express.json());

app.get('/', (_req, res) => {
  res.send('API is Running! 🎉');
});

app.use(
  '/api/accounts',
  requireAuth,
  rateLimit,
  accountsRouter
);

app.use(
  '/api/categories',
  requireAuth,
  rateLimit,
  categoriesRouter
);

app.use(
  '/api/transactions',
  requireAuth,
  rateLimit,
  transactionsRouter
);

app.use(
  '/api/invitations',
  requireAuth,
  rateLimit,
  invitationsRouter
);

app.use(
  '/api/export',
  requireAuth,
  rateLimit,
  exportRouter
);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on PORT: ${PORT}`);
});
