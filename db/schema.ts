import {sqliteTable, text, integer} from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
    id: integer('id').primaryKey({autoIncrement: true}),
    nickname: text('nickname').notNull()
})

export type User = typeof user.$inferSelect;
