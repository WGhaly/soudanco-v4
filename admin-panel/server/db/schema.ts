import { pgTable, uuid, varchar, text, decimal, integer, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================
// ENUMS
// ============================================

export const userRoleEnum = pgEnum('user_role', ['admin', 'supervisor', 'customer']);
export const orderStatusEnum = pgEnum('order_status', ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'completed', 'failed', 'refunded']);
export const paymentMethodEnum = pgEnum('payment_method', ['cash', 'bank_transfer', 'credit']);
export const paymentTypeEnum = pgEnum('payment_type', ['user_topup', 'cash_payment', 'reward']);
export const discountTypeEnum = pgEnum('discount_type', ['percentage', 'fixed', 'buy_get', 'spend_bonus']);
export const rewardStatusEnum = pgEnum('reward_status', ['pending', 'processed', 'cancelled']);
export const stockStatusEnum = pgEnum('stock_status', ['in_stock', 'low_stock', 'out_of_stock']);
export const notificationTypeEnum = pgEnum('notification_type', ['order', 'payment', 'discount', 'system']);

// ============================================
// USERS TABLE (Admin, Supervisor, Customer)
// ============================================

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: userRoleEnum('role').notNull().default('customer'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================
// CUSTOMERS TABLE
// ============================================

export const customers = pgTable('customers', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  businessName: varchar('business_name', { length: 255 }).notNull(),
  businessNameAr: varchar('business_name_ar', { length: 255 }),
  contactName: varchar('contact_name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  email: varchar('email', { length: 255 }),
  area: varchar('area', { length: 100 }),
  priceListId: uuid('price_list_id').references(() => priceLists.id),
  supervisorId: uuid('supervisor_id').references(() => supervisors.id),
  creditLimit: decimal('credit_limit', { precision: 12, scale: 2 }).default('0'),
  currentBalance: decimal('current_balance', { precision: 12, scale: 2 }).default('0'),
  walletBalance: decimal('wallet_balance', { precision: 12, scale: 2 }).default('0'),
  totalOrders: integer('total_orders').notNull().default(0),
  totalSpent: decimal('total_spent', { precision: 12, scale: 2 }).default('0'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================
// CUSTOMER ADDRESSES TABLE
// ============================================

export const customerAddresses = pgTable('customer_addresses', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerId: uuid('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  label: varchar('label', { length: 100 }).notNull(),
  addressLine1: varchar('address_line_1', { length: 255 }).notNull(),
  addressLine2: varchar('address_line_2', { length: 255 }),
  city: varchar('city', { length: 100 }).notNull(),
  region: varchar('region', { length: 100 }),
  postalCode: varchar('postal_code', { length: 20 }),
  country: varchar('country', { length: 100 }).notNull().default('Saudi Arabia'),
  isDefault: boolean('is_default').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ============================================
// CUSTOMER PAYMENT METHODS TABLE
// ============================================

export const customerPaymentMethods = pgTable('customer_payment_methods', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerId: uuid('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  type: paymentMethodEnum('type').notNull(),
  label: varchar('label', { length: 100 }).notNull(),
  details: text('details'), // JSON string for bank details, etc.
  isDefault: boolean('is_default').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ============================================
// SUPERVISORS TABLE
// ============================================

export const supervisors = pgTable('supervisors', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  nameAr: varchar('name_ar', { length: 255 }),
  phone: varchar('phone', { length: 20 }).notNull(),
  region: varchar('region', { length: 100 }),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================
// CATEGORIES TABLE
// ============================================

export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  nameAr: varchar('name_ar', { length: 100 }),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  imageUrl: text('image_url'),
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ============================================
// PRODUCTS TABLE
// ============================================

export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  sku: varchar('sku', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  nameAr: varchar('name_ar', { length: 255 }),
  description: text('description'),
  descriptionAr: text('description_ar'),
  categoryId: uuid('category_id').references(() => categories.id),
  basePrice: decimal('base_price', { precision: 10, scale: 2 }).notNull(),
  unit: varchar('unit', { length: 50 }).notNull().default('case'),
  unitsPerCase: integer('units_per_case').notNull().default(1),
  stockQuantity: integer('stock_quantity').notNull().default(0),
  lowStockThreshold: integer('low_stock_threshold').notNull().default(10),
  stockStatus: stockStatusEnum('stock_status').notNull().default('in_stock'),
  imageUrl: text('image_url'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================
// PRICE LISTS TABLE
// ============================================

export const priceLists = pgTable('price_lists', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  nameAr: varchar('name_ar', { length: 100 }),
  description: text('description'),
  isDefault: boolean('is_default').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================
// PRICE LIST ITEMS TABLE
// ============================================

export const priceListItems = pgTable('price_list_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  priceListId: uuid('price_list_id').notNull().references(() => priceLists.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ============================================
// ORDERS TABLE
// ============================================

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderNumber: varchar('order_number', { length: 50 }).notNull().unique(),
  customerId: uuid('customer_id').notNull().references(() => customers.id),
  addressId: uuid('address_id').references(() => customerAddresses.id),
  status: orderStatusEnum('status').notNull().default('pending'),
  subtotal: decimal('subtotal', { precision: 12, scale: 2 }).notNull(),
  discountAmount: decimal('discount_amount', { precision: 12, scale: 2 }).default('0'),
  taxAmount: decimal('tax_amount', { precision: 12, scale: 2 }).default('0'),
  total: decimal('total', { precision: 12, scale: 2 }).notNull(),
  notes: text('notes'),
  paymentMethod: paymentMethodEnum('payment_method'),
  paidAmount: decimal('paid_amount', { precision: 12, scale: 2 }).default('0'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================
// ORDER ITEMS TABLE
// ============================================

export const orderItems = pgTable('order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').notNull().references(() => products.id),
  productName: varchar('product_name', { length: 255 }).notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal('total_price', { precision: 12, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ============================================
// PAYMENTS TABLE
// ============================================

export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  paymentNumber: varchar('payment_number', { length: 50 }).notNull().unique(),
  customerId: uuid('customer_id').notNull().references(() => customers.id),
  orderId: uuid('order_id').references(() => orders.id),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  method: paymentMethodEnum('method').notNull(),
  type: paymentTypeEnum('type').notNull().default('user_topup'),
  status: paymentStatusEnum('status').notNull().default('pending'),
  reference: varchar('reference', { length: 255 }),
  notes: text('notes'),
  processedAt: timestamp('processed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================
// DISCOUNTS TABLE
// ============================================

export const discounts = pgTable('discounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  nameAr: varchar('name_ar', { length: 255 }),
  description: text('description'),
  type: discountTypeEnum('type').notNull(),
  value: decimal('value', { precision: 10, scale: 2 }).notNull(), // percentage or fixed amount
  minOrderAmount: decimal('min_order_amount', { precision: 12, scale: 2 }),
  minQuantity: integer('min_quantity'),
  bonusQuantity: integer('bonus_quantity'), // for buy_get type
  bonusProductId: uuid('bonus_product_id').references(() => products.id),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================
// DISCOUNT PRODUCTS (Many-to-Many)
// ============================================

export const discountProducts = pgTable('discount_products', {
  id: uuid('id').defaultRandom().primaryKey(),
  discountId: uuid('discount_id').notNull().references(() => discounts.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
});

// ============================================
// REWARD TIERS TABLE
// ============================================

export const rewardTiers = pgTable('reward_tiers', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  nameAr: varchar('name_ar', { length: 255 }),
  quarter: integer('quarter').notNull(), // 1, 2, 3, or 4
  year: integer('year').notNull(), // e.g., 2024
  minCartons: integer('min_cartons').notNull(), // minimum cartons to qualify
  maxCartons: integer('max_cartons'), // optional max cartons for this tier
  cashbackPerCarton: decimal('cashback_per_carton', { precision: 10, scale: 2 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================
// CUSTOMER QUARTERLY REWARDS TABLE
// ============================================

export const customerQuarterlyRewards = pgTable('customer_quarterly_rewards', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerId: uuid('customer_id').notNull().references(() => customers.id),
  quarter: integer('quarter').notNull(), // 1, 2, 3, or 4
  year: integer('year').notNull(), // e.g., 2024
  totalCartonsPurchased: integer('total_cartons_purchased').notNull().default(0),
  eligibleTierId: uuid('eligible_tier_id').references(() => rewardTiers.id),
  calculatedReward: decimal('calculated_reward', { precision: 12, scale: 2 }).notNull().default('0'),
  manualAdjustment: decimal('manual_adjustment', { precision: 12, scale: 2 }).default('0'),
  finalReward: decimal('final_reward', { precision: 12, scale: 2 }).notNull().default('0'),
  status: rewardStatusEnum('status').notNull().default('pending'),
  paymentId: uuid('payment_id').references(() => payments.id), // created when processed
  processedAt: timestamp('processed_at'),
  processedBy: uuid('processed_by').references(() => users.id), // admin who triggered
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================
// NOTIFICATIONS TABLE
// ============================================

export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: notificationTypeEnum('type').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  titleAr: varchar('title_ar', { length: 255 }),
  message: text('message').notNull(),
  messageAr: text('message_ar'),
  referenceId: uuid('reference_id'), // order_id, payment_id, etc.
  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ============================================
// RELATIONS
// ============================================

export const usersRelations = relations(users, ({ one, many }) => ({
  customer: one(customers, {
    fields: [users.id],
    references: [customers.userId],
  }),
  supervisor: one(supervisors, {
    fields: [users.id],
    references: [supervisors.userId],
  }),
  notifications: many(notifications),
}));

export const customersRelations = relations(customers, ({ one, many }) => ({
  user: one(users, {
    fields: [customers.userId],
    references: [users.id],
  }),
  priceList: one(priceLists, {
    fields: [customers.priceListId],
    references: [priceLists.id],
  }),
  supervisor: one(supervisors, {
    fields: [customers.supervisorId],
    references: [supervisors.id],
  }),
  addresses: many(customerAddresses),
  paymentMethods: many(customerPaymentMethods),
  orders: many(orders),
  payments: many(payments),
  quarterlyRewards: many(customerQuarterlyRewards),
}));

export const customerAddressesRelations = relations(customerAddresses, ({ one }) => ({
  customer: one(customers, {
    fields: [customerAddresses.customerId],
    references: [customers.id],
  }),
}));

export const customerPaymentMethodsRelations = relations(customerPaymentMethods, ({ one }) => ({
  customer: one(customers, {
    fields: [customerPaymentMethods.customerId],
    references: [customers.id],
  }),
}));

export const supervisorsRelations = relations(supervisors, ({ one, many }) => ({
  user: one(users, {
    fields: [supervisors.userId],
    references: [users.id],
  }),
  customers: many(customers),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  priceListItems: many(priceListItems),
  orderItems: many(orderItems),
  discountProducts: many(discountProducts),
}));

export const priceListsRelations = relations(priceLists, ({ many }) => ({
  items: many(priceListItems),
  customers: many(customers),
}));

export const priceListItemsRelations = relations(priceListItems, ({ one }) => ({
  priceList: one(priceLists, {
    fields: [priceListItems.priceListId],
    references: [priceLists.id],
  }),
  product: one(products, {
    fields: [priceListItems.productId],
    references: [products.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  address: one(customerAddresses, {
    fields: [orders.addressId],
    references: [customerAddresses.id],
  }),
  items: many(orderItems),
  payments: many(payments),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  customer: one(customers, {
    fields: [payments.customerId],
    references: [customers.id],
  }),
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
}));

export const discountsRelations = relations(discounts, ({ one, many }) => ({
  bonusProduct: one(products, {
    fields: [discounts.bonusProductId],
    references: [products.id],
  }),
  discountProducts: many(discountProducts),
}));

export const discountProductsRelations = relations(discountProducts, ({ one }) => ({
  discount: one(discounts, {
    fields: [discountProducts.discountId],
    references: [discounts.id],
  }),
  product: one(products, {
    fields: [discountProducts.productId],
    references: [products.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const rewardTiersRelations = relations(rewardTiers, ({ many }) => ({
  customerQuarterlyRewards: many(customerQuarterlyRewards),
}));

export const customerQuarterlyRewardsRelations = relations(customerQuarterlyRewards, ({ one }) => ({
  customer: one(customers, {
    fields: [customerQuarterlyRewards.customerId],
    references: [customers.id],
  }),
  eligibleTier: one(rewardTiers, {
    fields: [customerQuarterlyRewards.eligibleTierId],
    references: [rewardTiers.id],
  }),
  payment: one(payments, {
    fields: [customerQuarterlyRewards.paymentId],
    references: [payments.id],
  }),
  processedByUser: one(users, {
    fields: [customerQuarterlyRewards.processedBy],
    references: [users.id],
  }),
}));
