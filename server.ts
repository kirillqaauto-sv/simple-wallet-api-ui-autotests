import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from './src/db/index.ts';
import { users, transactions, savingsAccounts } from './src/db/schema.ts';
import { eq, or, sql, and, like, desc } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-wallet-key';

async function startServer() {
  const app = express();

  // Logging middleware
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

  app.use(express.json());

  // Health check for DB
  app.get('/api/health', async (req, res) => {
    try {
      await db.execute(sql`SELECT 1`);
      res.json({ status: 'ok', db: 'connected' });
    } catch (e: any) {
      console.error('Health check failed:', e);
      res.status(500).json({ status: 'error', db: 'disconnected', error: e.message });
    }
  });

  const swaggerDocument = YAML.load('./swagger.yaml');
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  // Auth Middleware
  const authenticateToken = (req: any, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Token missing' });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: 'Invalid token' });
      req.user = user;
      next();
    });
  };

  // Auth Routes
  app.post('/api/auth/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Missing username or password' });

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.insert(users).values({ username, password: hashedPassword });
      res.status(201).json({ message: 'User created' });
    } catch (e: any) {
      res.status(400).json({ error: 'Username already exists or invalid data' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    console.log(`Login attempt for: ${username}`);

    try {
      // Admin backdoor
      const ADMIN_USER = 'SuperUser';
      const ADMIN_PASS = '111111';

      if (username === ADMIN_USER && password === ADMIN_PASS) {
        console.log('Admin login detected');
        let user = await db.query.users.findFirst({
          where: eq(users.username, username),
        });

        if (!user) {
          console.log('Creating admin user...');
          const hashedPassword = await bcrypt.hash(password, 10);
          const [newUser] = await db.insert(users).values({
            username,
            password: hashedPassword,
            balance: '10000.00'
          }).returning();
          user = newUser;
        }

        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
        return res.json({ token });
      }

      console.log('Querying DB for user...');
      const user = await db.query.users.findFirst({
        where: eq(users.username, username),
      });

      if (user && await bcrypt.compare(password, user.password)) {
        console.log('Login successful');
        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token });
      } else {
        console.log('Invalid credentials');
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } catch (error: any) {
      console.error('CRITICAL LOGIN ERROR:', error);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  });

  // User Routes
  app.get('/api/user/me', authenticateToken, async (req: any, res) => {
    const user = await db.query.users.findFirst({
      where: eq(users.id, req.user.id),
    });
    if (user) {
      const { password, ...userData } = user;
      res.json(userData);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  });

  app.patch('/api/user/profile', authenticateToken, async (req: any, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: 'Username is required' });

    try {
      await db.update(users)
        .set({ username })
        .where(eq(users.id, req.user.id));
      res.json({ message: 'Profile updated' });
    } catch (e: any) {
      res.status(400).json({ error: 'Username already taken' });
    }
  });

  app.post('/api/user/topup', authenticateToken, async (req: any, res) => {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

    try {
      await db.update(users)
        .set({ balance: sql`${users.balance} + ${amount.toString()}` })
        .where(eq(users.id, req.user.id));

      res.json({ message: 'Balance updated' });
    } catch (e: any) {
      res.status(500).json({ error: 'Failed to update balance' });
    }
  });

  // User Management
  app.get('/api/users', authenticateToken, async (req: any, res) => {
    try {
      const allUsers = await db.query.users.findMany({
        columns: {
          password: false
        }
      });
      res.json(allUsers);
    } catch (e: any) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  app.delete('/api/users/:id', authenticateToken, async (req: any, res) => {
    const { id } = req.params;
    try {
      await db.delete(users).where(eq(users.id, parseInt(id)));
      res.json({ message: 'User deleted successfully' });
    } catch (e: any) {
      res.status(500).json({ error: 'Failed to delete user' });
    }
  });

  // Savings Accounts Routes
  app.get('/api/savings', authenticateToken, async (req: any, res) => {
    const accounts = await db.query.savingsAccounts.findMany({
      where: eq(savingsAccounts.userId, req.user.id),
    });
    res.json(accounts);
  });

  app.post('/api/savings', authenticateToken, async (req: any, res) => {
    const { name, target } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    try {
      const [newAccount] = await db.insert(savingsAccounts).values({
        userId: req.user.id,
        name,
        target: target?.toString() || null,
      }).returning();
      res.status(201).json(newAccount);
    } catch (e: any) {
      res.status(500).json({ error: 'Failed to create savings account' });
    }
  });

  app.post('/api/savings/:id/deposit', authenticateToken, async (req: any, res) => {
    const { amount } = req.body;
    const accountId = parseInt(req.params.id);
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

    try {
      await db.transaction(async (tx) => {
        const user = await tx.query.users.findFirst({ where: eq(users.id, req.user.id) });
        if (!user || Number(user.balance) < amount) throw new Error('Insufficient main balance');

        await tx.update(users)
          .set({ balance: sql`${users.balance} - ${amount.toString()}` })
          .where(eq(users.id, req.user.id));

        await tx.update(savingsAccounts)
          .set({ balance: sql`${savingsAccounts.balance} + ${amount.toString()}` })
          .where(and(eq(savingsAccounts.id, accountId), eq(savingsAccounts.userId, req.user.id)));
      });
      res.json({ message: 'Deposit successful' });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Transactions Routes
  app.get('/api/transactions', authenticateToken, async (req: any, res) => {
    const { search, category, type } = req.query;

    try {
      const conditions = [
        or(
          eq(transactions.senderId, req.user.id),
          eq(transactions.receiverId, req.user.id)
        )
      ];

      if (search) {
        conditions.push(like(transactions.description, `%${search}%`));
      }
      if (category) {
        conditions.push(eq(transactions.category, category));
      }
      if (type === 'sent') {
        conditions.push(eq(transactions.senderId, req.user.id));
      } else if (type === 'received') {
        conditions.push(eq(transactions.receiverId, req.user.id));
      }

      const history = await db.query.transactions.findMany({
        where: and(...conditions),
        orderBy: [desc(transactions.createdAt)],
      });
      res.json(history);
    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  });

  app.post('/api/transactions/transfer', authenticateToken, async (req: any, res) => {
    const { receiverUsername, amount, description, category } = req.body;
    const senderId = req.user.id;

    if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

    try {
      await db.transaction(async (tx) => {
        const sender = await tx.query.users.findFirst({ where: eq(users.id, senderId) });
        const receiver = await tx.query.users.findFirst({ where: eq(users.username, receiverUsername) });

        if (!sender) throw new Error('Sender not found');
        if (!receiver) throw new Error('Receiver not found');
        if (Number(sender.balance) < amount) throw new Error('Insufficient funds');
        if (sender.id === receiver.id) throw new Error('Cannot transfer to yourself');

        await tx.update(users)
          .set({ balance: sql`${users.balance} - ${amount.toString()}` })
          .where(eq(users.id, senderId));

        await tx.update(users)
          .set({ balance: sql`${users.balance} + ${amount.toString()}` })
          .where(eq(users.id, receiver.id));

        await tx.insert(transactions).values({
          senderId,
          receiverId: receiver.id,
          amount: amount.toString(),
          category: category || 'general',
          description,
        });
      });
      res.json({ message: 'Transfer successful' });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Vite Integration
  if (process.env.NODE_ENV !== 'production') {
    console.log('Starting Vite in middleware mode...');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false, // Completely disable HMR to avoid 426 Upgrade Required errors in this environment
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite middleware is ready');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  // Global Error Handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('SERVER ERROR:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  });

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
  });
}

startServer();
