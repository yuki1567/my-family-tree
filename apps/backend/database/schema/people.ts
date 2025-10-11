import { pgTable, uuid, varchar, smallint, date, timestamp } from 'drizzle-orm/pg-core'

export const people = pgTable('people', {
  id: uuid('id').primaryKey().defaultRandom(),

  name: varchar('name', { length: 100 }),

  gender: smallint('gender').notNull().default(0),

  birthDate: date('birth_date'),

  deathDate: date('death_date'),

  birthPlace: varchar('birth_place', { length: 200 }),

  createdAt: timestamp('created_at', { precision: 3, mode: 'date' }).notNull().defaultNow(),

  updatedAt: timestamp('updated_at', { precision: 3, mode: 'date' })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})

export type Person = typeof people.$inferSelect
export type NewPerson = typeof people.$inferInsert
