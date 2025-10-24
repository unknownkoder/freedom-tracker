import {sqliteTable, text, integer, numeric} from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
    id: integer('id').primaryKey({autoIncrement: true}),
    nickname: text('nickname').notNull()
})

export type GoalType = 'BUDGET' | 'DEBT' | 'SAVING';

export const goals = sqliteTable('goals', {
    id: integer('id').primaryKey({autoIncrement: true}),
    name: text('name'),
    amount: numeric('amount').default('0.0'),
    duration: integer('duration').default(30),
    type: text('type').$type<GoalType>().notNull(),
    resetStartOfMonth: integer('reset_on_month', {mode: 'boolean'}).default(true),
    userId: integer('user_id').references(() => user.id)
})

export type User = typeof user.$inferSelect;
export type Goal = typeof goals.$inferSelect;
