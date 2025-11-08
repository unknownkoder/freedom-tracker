import { sqliteTable, text, integer, numeric } from 'drizzle-orm/sqlite-core';
import { TransactionCategory, TransactionCounterParty } from '@/types/teller';

export const user = sqliteTable('user', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    nickname: text('nickname').notNull()
})

export const connections = sqliteTable('connections', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    accessToken: text('access_token').default(''),
    enrollmentId: text('enrollment_id').default(''),
    tellerUserId: text('teller_user_if').default(''),
    userId: integer('user_id').references(() => user.id)
})

export const accounts = sqliteTable('accounts', {
    id: text('id').primaryKey(),
    institution: text('institution').default(''),
    lastFour: text('last_four').default(''),
    name: text('name').default(''),
    isPrimary: integer('is_primary', { mode: 'boolean' }).default(false),
    status: text('status').default(''),
    subtype: text('subtype').default(''),
    type: text('type').default(''),
    currency: text('currency').default('USD'),
    balance: numeric('balance').default('0.0'),
    connectionId: integer('connection_id').references(() => connections.id)
})

export type GoalType = 'BUDGET' | 'DEBT' | 'SAVING';

export const goals = sqliteTable('goals', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name'),
    amount: numeric('amount').default('0.0'),
    duration: integer('duration').default(30),
    type: text('type').$type<GoalType>().notNull(),
    resetStartOfMonth: integer('reset_on_month', { mode: 'boolean' }).default(true),
    userId: integer('user_id').references(() => user.id)
});

type TransactionCounterPartyType = 'organization' | 'person' | null;

export const transactions = sqliteTable('transactions', {
    id: text('id').primaryKey(),
    amount: numeric('amount'),
    date: text('date').notNull(),
    category: text('category').$type<TransactionCategory>(),
    counterPartyName: text('counterparty_name'),
    counterPartyType: text('counterparty_type').$type<TransactionCounterPartyType>(),
    type: text('type'),
    tracked: integer('tracked', {mode: 'boolean'}).default(true),
    accountId: text('account_id').references(() => accounts.id)
})

export type User = typeof user.$inferSelect;
export type Goal = typeof goals.$inferSelect;
export type Connection = typeof connections.$inferSelect;
export type Account = typeof accounts.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
