import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import type { EventType, GroupName, PaymentMethod, ProfileRole } from '@/lib/types';

function generateId() {
  return crypto.randomUUID();
}

function generateShareCode() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase();
}

export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(generateId),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  created_at: text('created_at').notNull().default(sql`(datetime('now'))`),
});

export const weddings = sqliteTable('weddings', {
  id: text('id').primaryKey().$defaultFn(generateId),
  created_at: text('created_at').notNull().default(sql`(datetime('now'))`),
  updated_at: text('updated_at').notNull().default(sql`(datetime('now'))`),
  bride_name: text('bride_name'),
  groom_name: text('groom_name').notNull(),
  wedding_date: text('wedding_date'),
  venue: text('venue'),
  share_code: text('share_code').notNull().unique().$defaultFn(generateShareCode),
  owner_id: text('owner_id').notNull().references(() => users.id),
  event_type: text('event_type').$type<EventType>().notNull().default('wedding'),
});

export const profiles = sqliteTable('profiles', {
  id: text('id').primaryKey().$defaultFn(generateId),
  created_at: text('created_at').notNull().default(sql`(datetime('now'))`),
  user_id: text('user_id').notNull().references(() => users.id),
  wedding_id: text('wedding_id').notNull().references(() => weddings.id),
  name: text('name').notNull(),
  role: text('role').$type<ProfileRole>().notNull().default('groom'),
});

export const guests = sqliteTable('guests', {
  id: text('id').primaryKey().$defaultFn(generateId),
  created_at: text('created_at').notNull().default(sql`(datetime('now'))`),
  updated_at: text('updated_at').notNull().default(sql`(datetime('now'))`),
  wedding_id: text('wedding_id').notNull().references(() => weddings.id),
  name: text('name').notNull(),
  side: text('side').notNull(),
  group_name: text('group_name').$type<GroupName>().notNull().default('기타'),
  relationship: text('relationship'),
  phone: text('phone'),
  gift_amount: integer('gift_amount').notNull().default(0),
  meal_tickets: integer('meal_tickets').notNull().default(0),
  attended: integer('attended', { mode: 'boolean' }).notNull().default(false),
  thanked: integer('thanked', { mode: 'boolean' }).notNull().default(false),
  memo: text('memo'),
  payment_method: text('payment_method').$type<PaymentMethod>().notNull().default('cash'),
  envelope_number: integer('envelope_number'),
  gift_received: integer('gift_received', { mode: 'boolean' }).notNull().default(false),
  gift_returned: integer('gift_returned', { mode: 'boolean' }).notNull().default(false),
});

export const thankTemplates = sqliteTable('thank_templates', {
  id: text('id').primaryKey().$defaultFn(generateId),
  created_at: text('created_at').notNull().default(sql`(datetime('now'))`),
  wedding_id: text('wedding_id').notNull().references(() => weddings.id),
  title: text('title').notNull(),
  body: text('body').notNull(),
  is_default: integer('is_default', { mode: 'boolean' }).notNull().default(false),
});

export const weddingCosts = sqliteTable('wedding_costs', {
  id: text('id').primaryKey().$defaultFn(generateId),
  created_at: text('created_at').notNull().default(sql`(datetime('now'))`),
  wedding_id: text('wedding_id').notNull().references(() => weddings.id),
  category: text('category').notNull(),
  description: text('description').notNull().default(''),
  amount: real('amount').notNull().default(0),
  paid_by: text('paid_by').notNull(),
});

export const eventMembers = sqliteTable('event_members', {
  id: text('id').primaryKey().$defaultFn(generateId),
  created_at: text('created_at').notNull().default(sql`(datetime('now'))`),
  wedding_id: text('wedding_id').notNull().references(() => weddings.id),
  name: text('name').notNull(),
  display_name: text('display_name').notNull(),
  sort_order: integer('sort_order').notNull().default(0),
});
