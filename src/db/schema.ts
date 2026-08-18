import { pgTable, serial, text, timestamp, decimal, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  balance: decimal('balance', { precision: 12, scale: 2 }).notNull().default('1000.00'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  senderId: integer('sender_id').references(() => users.id),
  receiverId: integer('receiver_id').references(() => users.id),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  category: text('category').default('general'),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const savingsAccounts = pgTable('savings_accounts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  name: text('name').notNull(),
  balance: decimal('balance', { precision: 12, scale: 2 }).notNull().default('0.00'),
  target: decimal('target', { precision: 12, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  sentTransactions: many(transactions, { relationName: 'sender' }),
  receivedTransactions: many(transactions, { relationName: 'receiver' }),
  savingsAccounts: many(savingsAccounts),
}));

export const savingsAccountsRelations = relations(savingsAccounts, ({ one }) => ({
  user: one(users, {
    fields: [savingsAccounts.userId],
    references: [users.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  sender: one(users, {
    fields: [transactions.senderId],
    references: [users.id],
    relationName: 'sender',
  }),
  receiver: one(users, {
    fields: [transactions.receiverId],
    references: [users.id],
    relationName: 'receiver',
  }),
}));
