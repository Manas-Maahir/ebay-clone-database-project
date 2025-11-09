import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

export const userAccount = sqliteTable('user_account', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  ssn: text('ssn'),
  name: text('name').notNull(),
  age: integer('age'),
  email: text('email').notNull(),
  phone: text('phone'),
  address: text('address'),
  nationality: text('nationality'),
  birthdate: text('birthdate'),
});

export const account = sqliteTable('account', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  type: text('type').notNull(),
  userId: integer('user_id').references(() => userAccount.id),
});

export const buyer = sqliteTable('buyer', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => userAccount.id),
});

export const seller = sqliteTable('seller', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => userAccount.id),
});

export const productOffer = sqliteTable('product_offer', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productName: text('product_name').notNull(),
  description: text('description'),
  keyword: text('keyword'),
  shippingType: text('shipping_type'),
  dateExpiration: text('date_expiration'),
  quantity: integer('quantity').notNull(),
  price: real('price').notNull(),
  sellerId: integer('seller_id').references(() => seller.id),
});

export const directBuy = sqliteTable('direct_buy', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productId: integer('product_id').references(() => productOffer.id),
  buyerId: integer('buyer_id').references(() => buyer.id),
});

export const bid = sqliteTable('bid', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  amount: real('amount').notNull(),
  bidDate: text('bid_date').notNull(),
  buyerId: integer('buyer_id').references(() => buyer.id),
  productId: integer('product_id').references(() => productOffer.id),
});

export const auctionOffer = sqliteTable('auction_offer', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  minPrice: real('min_price').notNull(),
  winnerName: text('winner_name'),
  bidId: integer('bid_id').references(() => bid.id),
});

export const payment = sqliteTable('payment', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  amount: real('amount').notNull(),
  type: text('type').notNull(),
  executedBy: text('executed_by').notNull(),
  buyerId: integer('buyer_id').references(() => buyer.id),
});