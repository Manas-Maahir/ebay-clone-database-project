import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  createdAt: text('created_at').notNull(),
});

export const sellers = sqliteTable('sellers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  rating: real('rating').default(0),
  itemsSold: integer('items_sold').default(0),
  joinedDate: text('joined_date').notNull(),
  avatarUrl: text('avatar_url'),
  createdAt: text('created_at').notNull(),
});

export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  categoryId: integer('category_id').references(() => categories.id),
  sellerId: integer('seller_id').references(() => sellers.id),
  title: text('title').notNull(),
  description: text('description'),
  price: real('price').notNull(),
  buyNowPrice: real('buy_now_price'),
  condition: text('condition').notNull(),
  shippingCost: real('shipping_cost').default(0),
  imageUrl: text('image_url').notNull(),
  status: text('status').notNull().default('active'),
  views: integer('views').default(0),
  createdAt: text('created_at').notNull(),
  endsAt: text('ends_at'),
});

export const bids = sqliteTable('bids', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productId: integer('product_id').references(() => products.id),
  bidderName: text('bidder_name').notNull(),
  amount: real('amount').notNull(),
  createdAt: text('created_at').notNull(),
});

export const watches = sqliteTable('watches', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productId: integer('product_id').references(() => products.id),
  watcherName: text('watcher_name').notNull(),
  createdAt: text('created_at').notNull(),
});