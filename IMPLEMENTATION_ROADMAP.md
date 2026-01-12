# Soudanco V4 - Implementation Roadmap

## Project Overview

This document outlines the complete implementation plan for transforming the Soudanco mockup applications into a fully functional production system with:
- **PostgreSQL Database** - Persistent data storage
- **Express Backend API** - RESTful API endpoints
- **React Frontend** - Dynamic, connected UI with authentication
- **Vercel Deployment** - Production hosting

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         VERCEL                                   │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐    ┌──────────────────┐                   │
│  │   Admin Panel    │    │    User App      │                   │
│  │   (React SPA)    │    │   (React SPA)    │                   │
│  └────────┬─────────┘    └────────┬─────────┘                   │
│           │                       │                              │
│           └───────────┬───────────┘                              │
│                       ▼                                          │
│  ┌──────────────────────────────────────────┐                   │
│  │           Express API Server              │                   │
│  │    (Vercel Serverless Functions)          │                   │
│  └────────────────────┬─────────────────────┘                   │
│                       │                                          │
└───────────────────────┼──────────────────────────────────────────┘
                        │
                        ▼
          ┌─────────────────────────┐
          │   PostgreSQL Database   │
          │   (Vercel Postgres /    │
          │    Neon / Supabase)     │
          └─────────────────────────┘
```

---

## Technology Stack

| Layer | Technology | Local Dev | Production |
|-------|------------|-----------|------------|
| Database | PostgreSQL | Docker container | Neon/Vercel Postgres |
| ORM | Drizzle ORM | Same | Same |
| Backend | Express.js | Local server (port 8080) | Vercel Functions |
| Auth | JWT + bcrypt | Same | Same |
| Frontend | React 18 + React Router 6 | Vite dev server | Static build |
| State | TanStack Query | Same | Same |
| Deployment | - | localhost | Vercel |

---

## Development Approach

### ⚠️ IMPORTANT: Local-First Development

**All development and testing happens locally FIRST. Deployment to Vercel only happens after full local testing is complete.**

```
PHASE 1-4: LOCAL DEVELOPMENT (Docker PostgreSQL)
         ↓
PHASE 5: FULL LOCAL TESTING (All checklists pass)
         ↓
    Bug Fixes & Re-testing
         ↓
    Final Local Verification
         ↓
PHASE 6: PRODUCTION DEPLOYMENT (Neon + Vercel)
         ↓
PHASE 7: POLISH & SECURITY
```

---

## Project Structure (Final)

```
Soudanco V4/
├── shared/                    # Shared between Admin & User App
│   ├── db/
│   │   ├── schema.ts         # Drizzle schema definitions
│   │   ├── index.ts          # Database connection
│   │   └── migrations/       # Database migrations
│   ├── types/
│   │   └── api.ts            # Shared API types
│   └── utils/
│       └── validation.ts     # Zod schemas
│
├── Admin Panel/
│   ├── client/               # React frontend
│   ├── server/               # Express API
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── index.ts
│   └── vercel.json
│
└── User App/
    ├── client/               # React frontend
    ├── server/               # Express API
    │   ├── routes/
    │   ├── middleware/
    │   └── index.ts
    └── vercel.json
```

---

# Prerequisites Checklist

Before starting development, ensure you have:

| Requirement | Version | Check Command |
|-------------|---------|---------------|
| Node.js | 18+ | `node --version` |
| pnpm | 8+ | `pnpm --version` |
| Docker Desktop | Latest | `docker --version` |
| Git | 2.30+ | `git --version` |
| VS Code | Latest | - |

**VS Code Extensions (Recommended):**
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Thunder Client (API testing)
- PostgreSQL (for database viewing)

---

# Complete Database Schema

## Entity Relationship Overview

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   users     │     │  customers  │────▶│  addresses  │
│ (admins)    │     │             │     └─────────────┘
└─────────────┘     │             │────▶┌─────────────┐
                    │             │     │payment_     │
                    │             │     │methods      │
                    └──────┬──────┘     └─────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   orders    │     │  payments   │     │notifications│
├─────────────┤     └─────────────┘     └─────────────┘
│order_items  │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  products   │◀────│price_list_  │────▶│ price_lists │
│             │     │items        │     │             │
└──────┬──────┘     └─────────────┘     └─────────────┘
       │
       ▼
┌─────────────┐
│ categories  │
└─────────────┘

┌─────────────┐     ┌─────────────┐
│  discounts  │────▶│discount_    │
│             │     │products     │
└─────────────┘     └─────────────┘
```

## Complete Schema Definition

**File:** `shared/db/schema.ts`

```typescript
import { pgTable, text, integer, boolean, timestamp, decimal, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============ ENUMS ============

export const userRoleEnum = pgEnum('user_role', ['admin', 'account_manager', 'staff']);
export const priceTierEnum = pgEnum('price_tier', ['gold', 'silver', 'bronze']);
export const orderStatusEnum = pgEnum('order_status', ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'paid', 'partial', 'failed', 'refunded']);
export const paymentTypeEnum = pgEnum('payment_type', ['advance', 'partial', 'deferred']);
export const discountTypeEnum = pgEnum('discount_type', ['buy_get', 'spend_bonus']);
export const stockStatusEnum = pgEnum('stock_status', ['in_stock', 'out_of_stock', 'low_stock']);

// ============ USERS (Admin Panel) ============

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  role: userRoleEnum('role').notNull().default('staff'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============ CUSTOMERS ============

export const customers = pgTable('customers', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),                    // Business name
  email: text('email').notNull().unique(),
  phone: text('phone').notNull(),
  passwordHash: text('password_hash').notNull(),
  region: text('region').notNull(),                // Cairo, Giza, Mansoura, etc.
  priceListId: text('price_list_id').references(() => priceLists.id),
  creditLimit: decimal('credit_limit', { precision: 10, scale: 2 }).notNull().default('0'),
  outstandingBalance: decimal('outstanding_balance', { precision: 10, scale: 2 }).notNull().default('0'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============ CUSTOMER ADDRESSES ============

export const customerAddresses = pgTable('customer_addresses', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  customerId: text('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  label: text('label').notNull(),                  // "Home", "Office", etc.
  street: text('street').notNull(),
  city: text('city').notNull(),
  region: text('region').notNull(),
  postalCode: text('postal_code'),
  isDefault: boolean('is_default').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ============ CUSTOMER PAYMENT METHODS ============

export const customerPaymentMethods = pgTable('customer_payment_methods', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  customerId: text('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),                    // 'card', 'bank_transfer', etc.
  lastFour: text('last_four'),                     // Last 4 digits for cards
  bankName: text('bank_name'),
  isDefault: boolean('is_default').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ============ CATEGORIES ============

export const categories = pgTable('categories', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  nameAr: text('name_ar').notNull(),               // Arabic name
  slug: text('slug').notNull().unique(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ============ PRODUCTS ============

export const products = pgTable('products', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  nameAr: text('name_ar'),                         // Arabic name
  code: text('code').notNull().unique(),           // Product code/SKU
  categoryId: text('category_id').references(() => categories.id),
  size: text('size'),                              // "1 liter", "250ml", etc.
  packSize: integer('pack_size').notNull().default(1), // Units per carton
  imageUrl: text('image_url'),
  stockStatus: stockStatusEnum('stock_status').notNull().default('in_stock'),
  basePrice: decimal('base_price', { precision: 10, scale: 2 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ============ PRICE LISTS ============

export const priceLists = pgTable('price_lists', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  tier: priceTierEnum('tier').notNull(),           // gold, silver, bronze
  description: text('description'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const priceListItems = pgTable('price_list_items', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  priceListId: text('price_list_id').notNull().references(() => priceLists.id, { onDelete: 'cascade' }),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
});

// ============ ORDERS ============

export const orders = pgTable('orders', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderNumber: text('order_number').notNull().unique(), // e.g., "ORD-2026-001234"
  customerId: text('customer_id').notNull().references(() => customers.id),
  addressId: text('address_id').references(() => customerAddresses.id),
  status: orderStatusEnum('status').notNull().default('pending'),
  paymentStatus: paymentStatusEnum('payment_status').notNull().default('pending'),
  paymentType: paymentTypeEnum('payment_type').notNull(),
  paymentMethodId: text('payment_method_id').references(() => customerPaymentMethods.id),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  discount: decimal('discount', { precision: 10, scale: 2 }).notNull().default('0'),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const orderItems = pgTable('order_items', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderId: text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: text('product_id').notNull().references(() => products.id),
  quantity: integer('quantity').notNull(),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
});

// ============ PAYMENTS ============

export const payments = pgTable('payments', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  customerId: text('customer_id').notNull().references(() => customers.id),
  orderId: text('order_id').references(() => orders.id),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  method: text('method').notNull(),                // 'card', 'bank_transfer', 'cash'
  status: paymentStatusEnum('status').notNull().default('pending'),
  reference: text('reference'),                    // Transaction reference
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ============ DISCOUNTS ============

export const discounts = pgTable('discounts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  nameAr: text('name_ar'),
  type: discountTypeEnum('type').notNull(),
  // For buy_get: Buy X, Get Y free
  buyQuantity: integer('buy_quantity'),
  getQuantity: integer('get_quantity'),
  // For spend_bonus: Spend X SAR, get Y bonus
  spendAmount: decimal('spend_amount', { precision: 10, scale: 2 }),
  bonusAmount: decimal('bonus_amount', { precision: 10, scale: 2 }),
  bonusType: text('bonus_type'),                   // 'cash', 'product', 'percentage'
  validFrom: timestamp('valid_from').notNull(),
  validTo: timestamp('valid_to').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const discountProducts = pgTable('discount_products', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  discountId: text('discount_id').notNull().references(() => discounts.id, { onDelete: 'cascade' }),
  productId: text('product_id').notNull().references(() => products.id),
  isBuyProduct: boolean('is_buy_product').notNull().default(true), // true = buy product, false = get product
});

// ============ NOTIFICATIONS ============

export const notifications = pgTable('notifications', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  customerId: text('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull(),                    // 'order', 'payment', 'promotion', 'system'
  isRead: boolean('is_read').notNull().default(false),
  relatedId: text('related_id'),                   // Related order/payment ID
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ============ RELATIONS ============

export const customersRelations = relations(customers, ({ one, many }) => ({
  priceList: one(priceLists, { fields: [customers.priceListId], references: [priceLists.id] }),
  addresses: many(customerAddresses),
  paymentMethods: many(customerPaymentMethods),
  orders: many(orders),
  payments: many(payments),
  notifications: many(notifications),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  priceListItems: many(priceListItems),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, { fields: [orders.customerId], references: [customers.id] }),
  address: one(customerAddresses, { fields: [orders.addressId], references: [customerAddresses.id] }),
  items: many(orderItems),
}));
```

---

# Shared TypeScript Types

**File:** `shared/types/index.ts`

```typescript
// ============ API RESPONSE TYPES ============

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============ AUTH TYPES ============

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'account_manager' | 'staff';
}

export interface AuthCustomer {
  id: string;
  email: string;
  name: string;
  phone: string;
  priceListId: string;
  priceTier: 'gold' | 'silver' | 'bronze';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUser | AuthCustomer;
  token: string;
  refreshToken: string;
}

// ============ CUSTOMER TYPES ============

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  region: string;
  priceListId: string | null;
  priceTier?: 'gold' | 'silver' | 'bronze';
  creditLimit: number;
  outstandingBalance: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateCustomerDto {
  name: string;
  email: string;
  phone: string;
  password: string;
  region: string;
  priceListId?: string;
  creditLimit?: number;
}

export interface UpdateCustomerDto {
  name?: string;
  email?: string;
  phone?: string;
  region?: string;
  priceListId?: string;
  creditLimit?: number;
  isActive?: boolean;
}

// ============ PRODUCT TYPES ============

export interface Product {
  id: string;
  name: string;
  nameAr?: string;
  code: string;
  categoryId: string | null;
  category?: Category;
  size: string | null;
  packSize: number;
  imageUrl: string | null;
  stockStatus: 'in_stock' | 'out_of_stock' | 'low_stock';
  basePrice: number;
  price?: number;  // Customer-specific price
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
}

// ============ ORDER TYPES ============

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customer?: Customer;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'partial' | 'failed' | 'refunded';
  paymentType: 'advance' | 'partial' | 'deferred';
  subtotal: number;
  discount: number;
  total: number;
  items: OrderItem[];
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  product?: Product;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface CreateOrderDto {
  items: { productId: string; quantity: number }[];
  addressId: string;
  paymentMethodId?: string;
  paymentType: 'advance' | 'partial' | 'deferred';
  notes?: string;
}

// ============ DISCOUNT TYPES ============

export interface Discount {
  id: string;
  name: string;
  nameAr?: string;
  type: 'buy_get' | 'spend_bonus';
  buyQuantity?: number;
  getQuantity?: number;
  spendAmount?: number;
  bonusAmount?: number;
  bonusType?: string;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  products?: Product[];
}

// ============ DASHBOARD TYPES ============

export interface DashboardStats {
  totalCustomers: number;
  activeCustomers: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  outstandingPayments: number;
}
```

---

# Zod Validation Schemas

**File:** `shared/validation/index.ts`

```typescript
import { z } from 'zod';

// ============ AUTH SCHEMAS ============

export const loginSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صالح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
});

export const signupSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  email: z.string().email('البريد الإلكتروني غير صالح'),
  phone: z.string().regex(/^[0-9+]{10,15}$/, 'رقم الهاتف غير صالح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  region: z.string().min(1, 'المنطقة مطلوبة'),
});

// ============ CUSTOMER SCHEMAS ============

export const createCustomerSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  email: z.string().email('البريد الإلكتروني غير صالح'),
  phone: z.string().regex(/^[0-9+]{10,15}$/, 'رقم الهاتف غير صالح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  region: z.string().min(1, 'المنطقة مطلوبة'),
  priceListId: z.string().optional(),
  creditLimit: z.number().min(0).optional(),
});

export const updateCustomerSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().regex(/^[0-9+]{10,15}$/).optional(),
  region: z.string().min(1).optional(),
  priceListId: z.string().optional(),
  creditLimit: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
});

// ============ PRODUCT SCHEMAS ============

export const createProductSchema = z.object({
  name: z.string().min(1, 'اسم المنتج مطلوب'),
  nameAr: z.string().optional(),
  code: z.string().min(1, 'كود المنتج مطلوب'),
  categoryId: z.string().optional(),
  size: z.string().optional(),
  packSize: z.number().int().min(1).default(1),
  basePrice: z.number().min(0, 'السعر يجب أن يكون 0 أو أكثر'),
  stockStatus: z.enum(['in_stock', 'out_of_stock', 'low_stock']).default('in_stock'),
});

// ============ ORDER SCHEMAS ============

export const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().min(1),
  })).min(1, 'يجب إضافة منتج واحد على الأقل'),
  addressId: z.string(),
  paymentMethodId: z.string().optional(),
  paymentType: z.enum(['advance', 'partial', 'deferred']),
  notes: z.string().optional(),
});

// ============ ADDRESS SCHEMAS ============

export const createAddressSchema = z.object({
  label: z.string().min(1, 'اسم العنوان مطلوب'),
  street: z.string().min(1, 'الشارع مطلوب'),
  city: z.string().min(1, 'المدينة مطلوبة'),
  region: z.string().min(1, 'المنطقة مطلوبة'),
  postalCode: z.string().optional(),
  isDefault: z.boolean().optional(),
});

// ============ DISCOUNT SCHEMAS ============

export const createDiscountSchema = z.object({
  name: z.string().min(1),
  nameAr: z.string().optional(),
  type: z.enum(['buy_get', 'spend_bonus']),
  buyQuantity: z.number().int().min(1).optional(),
  getQuantity: z.number().int().min(1).optional(),
  spendAmount: z.number().min(0).optional(),
  bonusAmount: z.number().min(0).optional(),
  bonusType: z.string().optional(),
  validFrom: z.string().datetime(),
  validTo: z.string().datetime(),
  productIds: z.array(z.string()).optional(),
}).refine(data => {
  if (data.type === 'buy_get') {
    return data.buyQuantity && data.getQuantity;
  }
  if (data.type === 'spend_bonus') {
    return data.spendAmount && data.bonusAmount;
  }
  return true;
}, { message: 'Invalid discount configuration' });
```

---

# API Error Handling Pattern

**File:** `shared/lib/errors.ts`

```typescript
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const ErrorCodes = {
  // Auth errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  
  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  
  // Business logic errors
  INSUFFICIENT_CREDIT: 'INSUFFICIENT_CREDIT',
  OUT_OF_STOCK: 'OUT_OF_STOCK',
  INVALID_STATUS_TRANSITION: 'INVALID_STATUS_TRANSITION',
  
  // Server errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
} as const;
```

**File:** `server/middleware/errorHandler.ts`

```typescript
import { ErrorRequestHandler } from 'express';
import { AppError, ErrorCodes } from '@shared/lib/errors';
import { ZodError } from 'zod';

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        code: ErrorCodes.VALIDATION_ERROR,
        message: 'Validation failed',
        details: err.flatten().fieldErrors,
      },
    });
  }

  // Custom app errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
  }

  // Unknown errors
  return res.status(500).json({
    success: false,
    error: {
      code: ErrorCodes.INTERNAL_ERROR,
      message: 'An unexpected error occurred',
    },
  });
};
```

---

# Seed Data Script

**File:** `shared/db/seed.ts`

```typescript
import { db } from './index';
import { users, customers, categories, products, priceLists, priceListItems } from './schema';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Seeding database...');

  // ============ ADMIN USER ============
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  await db.insert(users).values({
    id: 'admin-1',
    email: 'admin@soudanco.com',
    passwordHash: adminPasswordHash,
    name: 'مدير النظام',
    role: 'admin',
    isActive: true,
  });
  console.log('✅ Admin user created (admin@soudanco.com / admin123)');

  // ============ PRICE LISTS ============
  const priceListData = [
    { id: 'pl-gold', name: 'الذهبية', tier: 'gold' as const, description: 'أفضل الأسعار للعملاء المميزين' },
    { id: 'pl-silver', name: 'الفضية', tier: 'silver' as const, description: 'أسعار جيدة للعملاء المنتظمين' },
    { id: 'pl-bronze', name: 'البرونزية', tier: 'bronze' as const, description: 'الأسعار الأساسية' },
  ];
  await db.insert(priceLists).values(priceListData);
  console.log('✅ Price lists created');

  // ============ CATEGORIES ============
  const categoryData = [
    { id: 'cat-juices', name: 'Juices', nameAr: 'عصائر و مشروبات', slug: 'juices', sortOrder: 1 },
    { id: 'cat-energy', name: 'Energy Drinks', nameAr: 'مشروبات الطاقة', slug: 'energy-drinks', sortOrder: 2 },
    { id: 'cat-water', name: 'Water', nameAr: 'مياه معدنية', slug: 'water', sortOrder: 3 },
  ];
  await db.insert(categories).values(categoryData);
  console.log('✅ Categories created');

  // ============ PRODUCTS ============
  const productData = [
    { id: 'prod-1', name: 'Sun Top Orange', nameAr: 'سن توب برتقال', code: 'STO-001', categoryId: 'cat-juices', size: '1 liter', packSize: 12, basePrice: '25.00', stockStatus: 'in_stock' as const },
    { id: 'prod-2', name: 'Sun Top Mango', nameAr: 'سن توب مانجو', code: 'STM-002', categoryId: 'cat-juices', size: '1 liter', packSize: 12, basePrice: '25.00', stockStatus: 'in_stock' as const },
    { id: 'prod-3', name: 'Sun Top Apple', nameAr: 'سن توب تفاح', code: 'STA-003', categoryId: 'cat-juices', size: '250ml', packSize: 24, basePrice: '15.00', stockStatus: 'in_stock' as const },
    { id: 'prod-4', name: 'Red Bull', nameAr: 'ريد بول', code: 'RB-001', categoryId: 'cat-energy', size: '250ml', packSize: 24, basePrice: '45.00', stockStatus: 'in_stock' as const },
    { id: 'prod-5', name: 'Aquafina', nameAr: 'أكوافينا', code: 'AQ-001', categoryId: 'cat-water', size: '500ml', packSize: 24, basePrice: '12.00', stockStatus: 'low_stock' as const },
  ];
  await db.insert(products).values(productData);
  console.log('✅ Products created');

  // ============ PRICE LIST ITEMS ============
  // Gold tier: 15% discount, Silver: 10% discount, Bronze: base price
  const priceItems = productData.flatMap(product => [
    { priceListId: 'pl-gold', productId: product.id, price: (parseFloat(product.basePrice) * 0.85).toFixed(2) },
    { priceListId: 'pl-silver', productId: product.id, price: (parseFloat(product.basePrice) * 0.90).toFixed(2) },
    { priceListId: 'pl-bronze', productId: product.id, price: product.basePrice },
  ]);
  await db.insert(priceListItems).values(priceItems);
  console.log('✅ Price list items created');

  // ============ TEST CUSTOMER ============
  const customerPasswordHash = await bcrypt.hash('customer123', 10);
  await db.insert(customers).values({
    id: 'cust-1',
    name: 'محلات الجوهرة',
    email: 'aljawhra@example.com',
    phone: '+201234567890',
    passwordHash: customerPasswordHash,
    region: 'القاهرة',
    priceListId: 'pl-gold',
    creditLimit: '10000.00',
    outstandingBalance: '0.00',
    isActive: true,
  });
  console.log('✅ Test customer created (aljawhra@example.com / customer123)');

  console.log('');
  console.log('🎉 Database seeded successfully!');
  console.log('');
  console.log('Test Credentials:');
  console.log('  Admin: admin@soudanco.com / admin123');
  console.log('  Customer: aljawhra@example.com / customer123');
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  });
```

---

# PHASE 1: Database Foundation (LOCAL)

## Milestone 1.0: Local Development Environment Setup
**Estimated Time:** 1 hour

### Tasks

#### 1.0.1 Install Docker Desktop
- [ ] Download and install Docker Desktop
- [ ] Verify Docker is running: `docker --version`

#### 1.0.2 Create Docker Compose for Local PostgreSQL

**File:** `Soudanco V4/docker-compose.yml`

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    container_name: soudanco-db
    environment:
      POSTGRES_USER: soudanco
      POSTGRES_PASSWORD: localdev123
      POSTGRES_DB: soudanco_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

#### 1.0.3 Start Local Database
```bash
cd "Soudanco V4"
docker-compose up -d
```

#### 1.0.4 Create Local Environment Files

**File:** `Admin Panel/.env.local`
```env
DATABASE_URL=postgresql://soudanco:localdev123@localhost:5432/soudanco_dev
JWT_SECRET=local-dev-jwt-secret-123
JWT_REFRESH_SECRET=local-dev-refresh-secret-456
NODE_ENV=development
```

**File:** `User App/.env.local`
```env
DATABASE_URL=postgresql://soudanco:localdev123@localhost:5432/soudanco_dev
JWT_SECRET=local-dev-jwt-secret-123
JWT_REFRESH_SECRET=local-dev-refresh-secret-456
NODE_ENV=development
```

**🧑‍💻 HUMAN CHECK:**
```
- [ ] Docker Desktop running
- [ ] PostgreSQL container started: docker ps
- [ ] Can connect to database: psql postgresql://soudanco:localdev123@localhost:5432/soudanco_dev
- [ ] .env.local files created (NOT committed to git)
```

---

## Milestone 1.1: Database Setup & Schema Design
**Estimated Time:** 2-3 hours

### Tasks

#### 1.1.1 Install Database Dependencies
```bash
# In both Admin Panel and User App
pnpm add drizzle-orm postgres dotenv
pnpm add -D drizzle-kit @types/node
```

#### 1.1.2 Create Shared Database Schema

**File:** `shared/db/schema.ts`

**Tables to create:**
1. `users` - Admin panel users (supervisors)
2. `customers` - B2B customers
3. `customer_addresses` - Delivery addresses
4. `products` - Product catalog
5. `categories` - Product categories
6. `price_lists` - Pricing tiers
7. `price_list_items` - Product prices per tier
8. `orders` - Customer orders
9. `order_items` - Order line items
10. `payments` - Payment transactions
11. `discounts` - Promotional discounts
12. `discount_products` - Products in buy-get discounts
13. `notifications` - User notifications
14. `customer_payment_methods` - Saved payment methods

**🧑‍💻 HUMAN CHECK:**
```
- [ ] Review schema design for completeness
- [ ] Verify all relationships are correctly defined
- [ ] Check indexes for query optimization
```

#### 1.1.3 Create Database Connection Module

**File:** `shared/db/index.ts`

```typescript
// Connection setup with postgres driver for local dev
// Uses DATABASE_URL from .env.local
```

#### 1.1.4 Generate & Run Migrations (Local)
```bash
pnpm drizzle-kit generate
pnpm drizzle-kit push
```

**🧑‍💻 HUMAN CHECK:**
```
- [ ] Connect to local PostgreSQL and verify all tables created
- [ ] Check column types are correct
- [ ] Verify foreign key constraints
- [ ] Use pgAdmin or DBeaver to visually inspect schema
```

**🧑‍💻 HUMAN CHECK:**
```
- [ ] Verify all tables created in database
- [ ] Check column types are correct
- [ ] Verify foreign key constraints
```

---

## Milestone 1.2: Seed Data
**Estimated Time:** 1-2 hours

### Tasks

#### 1.2.1 Create Seed Script

**File:** `shared/db/seed.ts`

**Seed data to create:**
- 3 Price Lists (Gold, Silver, Bronze)
- 10+ Products with images
- 3 Categories (Juices, Beverages, Energy Drinks)
- 5 Sample Customers
- 3 Supervisor accounts (admin, manager, staff)
- Sample orders and payments
- Sample discounts

#### 1.2.2 Run Seed Script
```bash
pnpm tsx shared/db/seed.ts
```

**🧑‍💻 HUMAN CHECK:**
```
- [ ] Verify seed data in database
- [ ] Check all relationships are properly linked
- [ ] Verify sample images load correctly
```

---

# PHASE 2: Authentication System

## Milestone 2.1: Backend Authentication
**Estimated Time:** 3-4 hours

### Tasks

#### 2.1.1 Install Auth Dependencies
```bash
pnpm add jsonwebtoken bcryptjs cookie-parser
pnpm add -D @types/jsonwebtoken @types/bcryptjs @types/cookie-parser
```

#### 2.1.2 Create Auth Utilities

**Files to create:**
- `server/utils/auth.ts` - JWT sign/verify, password hashing
- `server/middleware/auth.ts` - Authentication middleware
- `server/middleware/roleGuard.ts` - Role-based access control

#### 2.1.3 Create Auth Routes (Admin Panel)

**File:** `Admin Panel/server/routes/auth.ts`

**Endpoints:**
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token

#### 2.1.4 Create Auth Routes (User App)

**File:** `User App/server/routes/auth.ts`

**Endpoints:**
- `POST /api/auth/login` - Customer login
- `POST /api/auth/signup` - Customer registration
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Password reset
- `POST /api/auth/refresh` - Refresh token

**🧑‍💻 HUMAN CHECK:**
```
- [ ] Test login with valid credentials
- [ ] Test login with invalid credentials
- [ ] Verify JWT token is returned
- [ ] Test protected routes without token (should fail)
- [ ] Test protected routes with valid token (should succeed)
- [ ] Test token refresh flow
```

---

## Milestone 2.2: Frontend Authentication
**Estimated Time:** 3-4 hours

### Tasks

#### 2.2.1 Create Auth Context & Hooks

**Files to create (both apps):**
- `client/contexts/AuthContext.tsx` - Auth state management
- `client/hooks/useAuth.ts` - Auth hook
- `client/lib/api.ts` - API client with auth headers

#### 2.2.2 Create Login Page (Admin Panel)

**File:** `Admin Panel/client/pages/Login.tsx`

**Features:**
- Email/password form
- Error handling
- Redirect to dashboard on success
- "Remember me" option

#### 2.2.3 Update Login Page (User App)

**File:** `User App/client/pages/Login.tsx`

**Features:**
- Phone/password form
- Error handling
- Redirect to home on success
- Link to signup

#### 2.2.4 Create Signup Page (User App)

**File:** `User App/client/pages/Signup.tsx`

**Features:**
- Business name
- Phone number
- Email
- Password
- Region selection
- Terms acceptance

#### 2.2.5 Implement Route Protection

**Files to create:**
- `client/components/ProtectedRoute.tsx` - Route guard component
- Update `App.tsx` - Wrap protected routes

**🧑‍💻 HUMAN CHECK:**
```
- [ ] Login as admin user - verify redirect to dashboard
- [ ] Login as customer - verify redirect to home
- [ ] Try accessing protected route without login - verify redirect to login
- [ ] Logout and verify token is cleared
- [ ] Refresh page while logged in - verify session persists
- [ ] Test signup flow end-to-end
```

---

# PHASE 3: Admin Panel API & Integration

## Frontend Integration Pattern (IMPORTANT - Read First)

Before connecting any component to the API, follow this pattern consistently:

### Step 1: Install TanStack Query (Do Once)

```bash
cd "Admin Panel"
pnpm add @tanstack/react-query
```

### Step 2: Set Up Query Provider (Do Once)

**File:** `client/main.tsx`
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
```

### Step 3: Create API Client (Do Once)

**File:** `client/lib/api.ts`
```typescript
const API_BASE = '/api';

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'API Error');
  }

  return response.json();
}

export const api = {
  get: (url: string) => fetchWithAuth(url),
  post: (url: string, data: unknown) => 
    fetchWithAuth(url, { method: 'POST', body: JSON.stringify(data) }),
  put: (url: string, data: unknown) => 
    fetchWithAuth(url, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (url: string) => 
    fetchWithAuth(url, { method: 'DELETE' }),
};
```

### Step 4: Create Hooks for Each Entity

**Pattern:** `client/hooks/use[Entity].ts`

```typescript
// Example: client/hooks/useCustomers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Fetch all customers
export function useCustomers(filters?: { search?: string; status?: string }) {
  const params = new URLSearchParams(filters as Record<string, string>);
  return useQuery({
    queryKey: ['customers', filters],
    queryFn: () => api.get(`/customers?${params}`),
  });
}

// Fetch single customer
export function useCustomer(id: string) {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: () => api.get(`/customers/${id}`),
    enabled: !!id,
  });
}

// Create customer
export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCustomerDto) => api.post('/customers', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

// Update customer
export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerDto }) => 
      api.put(`/customers/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

// Delete customer
export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/customers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}
```

### Step 5: Update Component (Replace Mock Data)

**BEFORE (with mock data):**
```typescript
// ❌ OLD - Remove this
const mockCustomers = [
  { id: '1', name: 'محلات الجوهرة', ... },
  { id: '2', name: 'سوبر ماركت السعادة', ... },
];

export default function Customers() {
  const [customers, setCustomers] = useState(mockCustomers);
  // ...
}
```

**AFTER (with API):**
```typescript
// ✅ NEW - Use API hook
import { useCustomers, useDeleteCustomer } from '@/hooks/useCustomers';

export default function Customers() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Fetch from API
  const { data: customers, isLoading, error } = useCustomers({ 
    search, 
    status: statusFilter 
  });
  
  // Mutations
  const deleteCustomer = useDeleteCustomer();

  // Handle loading state
  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
  }

  // Handle error state
  if (error) {
    return <div className="text-red-500 p-8">Error loading customers: {error.message}</div>;
  }

  // Handle delete
  const handleDelete = async (id: string) => {
    if (confirm('Are you sure?')) {
      await deleteCustomer.mutateAsync(id);
      toast.success('Customer deleted');
    }
  };

  return (
    // ... rest of component using `customers` from API
  );
}
```

### Step 6: Add Loading & Error States

**Reusable components to create:**

**File:** `client/components/LoadingSpinner.tsx`
```typescript
import { Loader2 } from 'lucide-react';

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
```

**File:** `client/components/ErrorMessage.tsx`
```typescript
export function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
      {message}
    </div>
  );
}
```

**File:** `client/components/EmptyState.tsx`
```typescript
export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="text-center p-8 text-gray-500">
      <h3 className="font-medium">{title}</h3>
      <p className="text-sm">{message}</p>
    </div>
  );
}
```

---

## Milestone 3.1: Customer Management API
**Estimated Time:** 2-3 hours

### Tasks

#### 3.1.1 Create Customer Routes

**File:** `Admin Panel/server/routes/customers.ts`

**Endpoints:**
- `GET /api/customers` - List customers (with filters)
- `GET /api/customers/:id` - Get customer details
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer
- `GET /api/customers/:id/orders` - Customer orders
- `GET /api/customers/:id/payments` - Customer payments

#### 3.1.2 Connect Frontend to API

**Step A: Create Customer Hooks**

**File:** `Admin Panel/client/hooks/useCustomers.ts`
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Customer } from '@shared/types';

export function useCustomers(filters?: { search?: string; status?: string; priceList?: string }) {
  const params = new URLSearchParams();
  if (filters?.search) params.set('search', filters.search);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.priceList) params.set('priceList', filters.priceList);
  
  return useQuery({
    queryKey: ['customers', filters],
    queryFn: () => api.get(`/customers?${params}`),
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: () => api.get(`/customers/${id}`),
    enabled: !!id,
  });
}

export function useCustomerOrders(id: string) {
  return useQuery({
    queryKey: ['customers', id, 'orders'],
    queryFn: () => api.get(`/customers/${id}/orders`),
    enabled: !!id,
  });
}

export function useCustomerPayments(id: string) {
  return useQuery({
    queryKey: ['customers', id, 'payments'],
    queryFn: () => api.get(`/customers/${id}/payments`),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Customer>) => api.post('/customers', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Customer> }) => 
      api.put(`/customers/${id}`, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customers', id] });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/customers/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  });
}
```

**Step B: Update Customers.tsx**

```typescript
// ❌ REMOVE all mock data like this:
const mockCustomers = [ /* ... */ ];

// ✅ ADD at top of file:
import { useCustomers, useDeleteCustomer } from '@/hooks/useCustomers';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorMessage } from '@/components/ErrorMessage';

// ✅ REPLACE inside component:
export default function Customers() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const { data: customers, isLoading, error } = useCustomers({ search, status: statusFilter });
  const deleteCustomer = useDeleteCustomer();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;

  // Rest of component now uses `customers` from API
}
```

**Step C: Update CustomerDetails.tsx**

```typescript
import { useParams } from 'react-router-dom';
import { useCustomer, useCustomerOrders, useCustomerPayments } from '@/hooks/useCustomers';

export default function CustomerDetails() {
  const { id } = useParams<{ id: string }>();
  
  const { data: customer, isLoading } = useCustomer(id!);
  const { data: orders } = useCustomerOrders(id!);
  const { data: payments } = useCustomerPayments(id!);

  if (isLoading) return <LoadingSpinner />;
  if (!customer) return <ErrorMessage message="Customer not found" />;

  // Rest of component uses customer, orders, payments from API
}
```

**Step D: Update NewCustomer.tsx**

```typescript
import { useNavigate } from 'react-router-dom';
import { useCreateCustomer } from '@/hooks/useCustomers';
import { useToast } from '@/hooks/use-toast';

export default function NewCustomer() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createCustomer = useCreateCustomer();

  const handleSubmit = async (formData: CustomerFormData) => {
    try {
      await createCustomer.mutateAsync(formData);
      toast({ title: 'تم إنشاء العميل بنجاح' });
      navigate('/customers');
    } catch (error) {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields... */}
      <button type="submit" disabled={createCustomer.isPending}>
        {createCustomer.isPending ? 'جاري الحفظ...' : 'حفظ العميل'}
      </button>
    </form>
  );
}
```

**🧑‍💻 HUMAN CHECK:**
```
- [ ] List customers loads from database
- [ ] Search and filters work correctly
- [ ] Create new customer - verify in database
- [ ] Edit customer - verify changes saved
- [ ] Delete customer - verify removed
- [ ] Customer details show correct orders/payments
```

---

## Milestone 3.2: Product Management API
**Estimated Time:** 2-3 hours

### Tasks

#### 3.2.1 Create Product Routes

**File:** `Admin Panel/server/routes/products.ts`

**Endpoints:**
- `GET /api/products` - List products (with filters)
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/categories` - List categories
- `POST /api/products/upload-image` - Upload product image

#### 3.2.2 Connect Frontend to API

**Step A: Create Product Hooks**

**File:** `Admin Panel/client/hooks/useProducts.ts`
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useProducts(filters?: { search?: string; category?: string; status?: string }) {
  const params = new URLSearchParams();
  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => api.get(`/products?${params}`),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => api.get(`/products/${id}`),
    enabled: !!id,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories'),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: FormData) => 
      fetch('/api/products', { 
        method: 'POST', 
        body: data,  // FormData for file upload
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      }).then(res => res.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) => 
      fetch(`/api/products/${id}`, { 
        method: 'PUT', 
        body: data,
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      }).then(res => res.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/products/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}
```

**Step B: Update Products.tsx**

```typescript
// ❌ REMOVE mock data arrays
// ✅ ADD:
import { useProducts, useCategories, useDeleteProduct } from '@/hooks/useProducts';

export default function Products() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  
  const { data: products, isLoading } = useProducts({ search, category });
  const { data: categories } = useCategories();
  const deleteProduct = useDeleteProduct();

  if (isLoading) return <LoadingSpinner />;

  // Use products and categories from API
}
```

**🧑‍💻 HUMAN CHECK:**
```
- [ ] List products loads from database
- [ ] Search and filters work correctly
- [ ] Create new product with image
- [ ] Edit product - verify changes saved
- [ ] Stock status updates correctly
- [ ] Categories load and filter correctly
```

---

## Milestone 3.3: Price List Management API
**Estimated Time:** 2 hours

### Tasks

#### 3.3.1 Create Price List Routes

**File:** `Admin Panel/server/routes/price-lists.ts`

**Endpoints:**
- `GET /api/price-lists` - List all price lists
- `GET /api/price-lists/:id` - Get price list with products
- `POST /api/price-lists` - Create price list
- `PUT /api/price-lists/:id` - Update price list
- `DELETE /api/price-lists/:id` - Delete price list
- `PUT /api/price-lists/:id/prices` - Bulk update prices

#### 3.3.2 Connect Frontend to API

**Step A: Create Price List Hooks**

**File:** `Admin Panel/client/hooks/usePriceLists.ts`
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function usePriceLists() {
  return useQuery({
    queryKey: ['price-lists'],
    queryFn: () => api.get('/price-lists'),
  });
}

export function usePriceList(id: string) {
  return useQuery({
    queryKey: ['price-lists', id],
    queryFn: () => api.get(`/price-lists/${id}`),
    enabled: !!id,
  });
}

export function useCreatePriceList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; tier: string }) => api.post('/price-lists', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['price-lists'] }),
  });
}

export function useUpdatePrices() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, prices }: { id: string; prices: { productId: string; price: number }[] }) => 
      api.put(`/price-lists/${id}/prices`, { prices }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['price-lists'] });
      queryClient.invalidateQueries({ queryKey: ['price-lists', id] });
    },
  });
}
```

**Step B: Update PriceLists.tsx**

```typescript
// ❌ REMOVE: const mockPriceLists = [...]
// ✅ ADD:
import { usePriceLists } from '@/hooks/usePriceLists';

export default function PriceLists() {
  const { data: priceLists, isLoading } = usePriceLists();
  
  if (isLoading) return <LoadingSpinner />;
  
  // Use priceLists from API
}
```

**🧑‍💻 HUMAN CHECK:**
```
- [ ] List price lists loads from database
- [ ] Create new price list
- [ ] Edit prices for products
- [ ] Customer count shows correctly
- [ ] Verify price changes reflect for assigned customers
```

---

## Milestone 3.4: Order Management API
**Estimated Time:** 3-4 hours

### Tasks

#### 3.4.1 Create Order Routes

**File:** `Admin Panel/server/routes/orders.ts`

**Endpoints:**
- `GET /api/orders` - List orders (with filters)
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update delivery status
- `PUT /api/orders/:id/payment-status` - Update payment status
- `GET /api/orders/stats` - Dashboard statistics

#### 3.4.2 Connect Frontend to API

**Step A: Create Order Hooks**

**File:** `Admin Panel/client/hooks/useOrders.ts`
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useOrders(filters?: { status?: string; customerId?: string; dateFrom?: string; dateTo?: string }) {
  const params = new URLSearchParams();
  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: () => api.get(`/orders?${params}`),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => api.get(`/orders/${id}`),
    enabled: !!id,
  });
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/orders/stats'),
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      api.put(`/orders/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });
}

export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, paymentStatus }: { id: string; paymentStatus: string }) => 
      api.put(`/orders/${id}/payment-status`, { paymentStatus }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });
}
```

**Step B: Update Dashboard Index.tsx**

```typescript
// ❌ REMOVE: const mockStats = {...}, const recentOrders = [...]
// ✅ ADD:
import { useDashboardStats, useOrders } from '@/hooks/useOrders';

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentOrders, isLoading: ordersLoading } = useOrders({ limit: 5 });
  
  if (statsLoading || ordersLoading) return <LoadingSpinner />;
  
  // Use stats and recentOrders from API
}
```

**Step C: Update Orders.tsx**

```typescript
import { useOrders, useUpdateOrderStatus } from '@/hooks/useOrders';

export default function Orders() {
  const [statusFilter, setStatusFilter] = useState('');
  const { data: orders, isLoading } = useOrders({ status: statusFilter });
  const updateStatus = useUpdateOrderStatus();

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    await updateStatus.mutateAsync({ id: orderId, status: newStatus });
    toast.success('تم تحديث حالة الطلب');
  };

  if (isLoading) return <LoadingSpinner />;
  
  // Use orders from API
}
```

**🧑‍💻 HUMAN CHECK:**
```
- [ ] List orders loads from database
- [ ] Filters work (date, status, customer)
- [ ] Order details show all items
- [ ] Status updates work correctly
- [ ] Dashboard stats are accurate
```

---

## Milestone 3.5: Payment Management API
**Estimated Time:** 2 hours

### Tasks

#### 3.5.1 Create Payment Routes

**File:** `Admin Panel/server/routes/payments.ts`

**Endpoints:**
- `GET /api/payments` - List payments (with filters)
- `GET /api/payments/:id` - Get payment details
- `POST /api/payments` - Record payment
- `PUT /api/payments/:id/status` - Update payment status

#### 3.5.2 Connect Frontend to API

**Step A: Create Payment Hooks**

**File:** `Admin Panel/client/hooks/usePayments.ts`
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function usePayments(filters?: { status?: string; customerId?: string }) {
  const params = new URLSearchParams();
  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  
  return useQuery({
    queryKey: ['payments', filters],
    queryFn: () => api.get(`/payments?${params}`),
  });
}

export function usePayment(id: string) {
  return useQuery({
    queryKey: ['payments', id],
    queryFn: () => api.get(`/payments/${id}`),
    enabled: !!id,
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { customerId: string; amount: number; method: string }) => 
      api.post('/payments', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] }); // Update balances
    },
  });
}
```

**Step B: Update Payments.tsx**

```typescript
// ❌ REMOVE: const mockPayments = [...]
// ✅ ADD:
import { usePayments } from '@/hooks/usePayments';

export default function Payments() {
  const { data: payments, isLoading } = usePayments();
  
  if (isLoading) return <LoadingSpinner />;
  
  // Use payments from API
}
```

**🧑‍💻 HUMAN CHECK:**
```
- [ ] List payments loads from database
- [ ] Filters work correctly
- [ ] Payment details show correctly
- [ ] Customer balance updates after payment
```

---

## Milestone 3.6: Discount Management API
**Estimated Time:** 2 hours

### Tasks

#### 3.6.1 Create Discount Routes

**File:** `Admin Panel/server/routes/discounts.ts`

**Endpoints:**
- `GET /api/discounts` - List discounts (with filters)
- `GET /api/discounts/:id` - Get discount details
- `POST /api/discounts` - Create discount
- `PUT /api/discounts/:id` - Update discount
- `DELETE /api/discounts/:id` - Delete discount
- `PUT /api/discounts/:id/toggle` - Activate/deactivate

#### 3.6.2 Connect Frontend to API

**Step A: Create Discount Hooks**

**File:** `Admin Panel/client/hooks/useDiscounts.ts`
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useDiscounts(filters?: { type?: 'buy_get' | 'spend_bonus'; active?: boolean }) {
  const params = new URLSearchParams();
  if (filters?.type) params.set('type', filters.type);
  if (filters?.active !== undefined) params.set('active', String(filters.active));
  
  return useQuery({
    queryKey: ['discounts', filters],
    queryFn: () => api.get(`/discounts?${params}`),
  });
}

export function useDiscount(id: string) {
  return useQuery({
    queryKey: ['discounts', id],
    queryFn: () => api.get(`/discounts/${id}`),
    enabled: !!id,
  });
}

export function useCreateDiscount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDiscountDto) => api.post('/discounts', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['discounts'] }),
  });
}

export function useToggleDiscount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.put(`/discounts/${id}/toggle`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['discounts'] }),
  });
}

export function useDeleteDiscount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/discounts/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['discounts'] }),
  });
}
```

**Step B: Update Discounts.tsx**

```typescript
// ❌ REMOVE: const mockBuyGetDiscounts = [...], const mockSpendBonusDiscounts = [...]
// ✅ ADD:
import { useDiscounts, useToggleDiscount, useDeleteDiscount } from '@/hooks/useDiscounts';

export default function Discounts() {
  const { data: discounts, isLoading } = useDiscounts();
  const toggleDiscount = useToggleDiscount();
  const deleteDiscount = useDeleteDiscount();

  const handleToggle = async (id: string) => {
    await toggleDiscount.mutateAsync(id);
    toast.success('تم تحديث حالة العرض');
  };

  if (isLoading) return <LoadingSpinner />;
  
  // Filter discounts by type for display
  const buyGetDiscounts = discounts?.filter(d => d.type === 'buy_get');
  const spendBonusDiscounts = discounts?.filter(d => d.type === 'spend_bonus');
}
```

**🧑‍💻 HUMAN CHECK:**
```
- [ ] List discounts loads from database
- [ ] Create both discount types
- [ ] Edit discount
- [ ] Toggle active status
- [ ] Verify validity dates work
```

---

## Milestone 3.7: Supervisor Management API
**Estimated Time:** 2 hours

### Tasks

#### 3.7.1 Create Supervisor Routes

**File:** `Admin Panel/server/routes/supervisors.ts`

**Endpoints:**
- `GET /api/supervisors` - List supervisors
- `GET /api/supervisors/:id` - Get supervisor details
- `POST /api/supervisors` - Create supervisor
- `PUT /api/supervisors/:id` - Update supervisor
- `DELETE /api/supervisors/:id` - Delete supervisor
- `PUT /api/supervisors/:id/permissions` - Update permissions

#### 3.7.2 Connect Frontend to API

**Step A: Create Supervisor Hooks**

**File:** `Admin Panel/client/hooks/useSupervisors.ts`
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useSupervisors(filters?: { role?: string; status?: string }) {
  const params = new URLSearchParams();
  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  
  return useQuery({
    queryKey: ['supervisors', filters],
    queryFn: () => api.get(`/supervisors?${params}`),
  });
}

export function useSupervisor(id: string) {
  return useQuery({
    queryKey: ['supervisors', id],
    queryFn: () => api.get(`/supervisors/${id}`),
    enabled: !!id,
  });
}

export function useCreateSupervisor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSupervisorDto) => api.post('/supervisors', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['supervisors'] }),
  });
}

export function useUpdateSupervisor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSupervisorDto }) => 
      api.put(`/supervisors/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['supervisors'] }),
  });
}

export function useUpdatePermissions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, permissions }: { id: string; permissions: string[] }) => 
      api.put(`/supervisors/${id}/permissions`, { permissions }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['supervisors'] }),
  });
}

export function useDeleteSupervisor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/supervisors/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['supervisors'] }),
  });
}
```

**Step B: Update Supervisors.tsx**

```typescript
// ❌ REMOVE: const mockSupervisors = [...]
// ✅ ADD:
import { useSupervisors, useDeleteSupervisor } from '@/hooks/useSupervisors';

export default function Supervisors() {
  const { data: supervisors, isLoading } = useSupervisors();
  const deleteSupervisor = useDeleteSupervisor();

  if (isLoading) return <LoadingSpinner />;
  
  // Use supervisors from API
}
```

**🧑‍💻 HUMAN CHECK:**
```
- [ ] List supervisors loads from database
- [ ] Create new supervisor with role
- [ ] Edit supervisor details
- [ ] Toggle active status
- [ ] Permissions update correctly
- [ ] Role-based access works (test with different roles)
```

---

# PHASE 4: User App API & Integration

## Milestone 4.1: Product Browsing API
**Estimated Time:** 2 hours

### Tasks

#### 4.1.1 Create Product Routes (User App)

**File:** `User App/server/routes/products.ts`

**Endpoints:**
- `GET /api/products` - List products (with customer's prices)
- `GET /api/products/:id` - Get product details
- `GET /api/products/categories` - List categories
- `GET /api/products/reorder` - Previously ordered products

#### 4.1.2 Connect Frontend to API

**Step A: Set Up TanStack Query (User App)**

Same setup as Admin Panel - install `@tanstack/react-query` and create `QueryClient` in `main.tsx`.

**Step B: Create Product Hooks (User App)**

**File:** `User App/client/hooks/useProducts.ts`
```typescript
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Products will automatically include customer's price tier
export function useProducts(filters?: { search?: string; category?: string }) {
  const params = new URLSearchParams();
  Object.entries(filters || {}).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => api.get(`/products?${params}`),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => api.get(`/products/${id}`),
    enabled: !!id,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/products/categories'),
  });
}

// Products the customer has ordered before
export function useReorderProducts() {
  return useQuery({
    queryKey: ['reorder-products'],
    queryFn: () => api.get('/products/reorder'),
  });
}
```

**Step C: Update Products.tsx (User App)**

```typescript
// ❌ REMOVE: const mockProducts = [...]
// ✅ ADD:
import { useProducts, useCategories } from '@/hooks/useProducts';

export default function Products() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  
  const { data: products, isLoading } = useProducts({ search, category });
  const { data: categories } = useCategories();

  if (isLoading) return <LoadingSpinner />;
  
  // Products include customer's personalized prices!
}
```

**Step D: Update Home.tsx (User App)**

```typescript
import { useProducts, useReorderProducts } from '@/hooks/useProducts';
import { useAccountStats } from '@/hooks/useAccount';

export default function Home() {
  const { data: stats } = useAccountStats();  // Balance, credit, etc.
  const { data: reorderProducts } = useReorderProducts();
  const { data: featuredProducts } = useProducts({ featured: true });

  // Connect each section to real data
}
```

**🧑‍💻 HUMAN CHECK:**
```
- [ ] Products show with customer's price tier
- [ ] Search and filters work
- [ ] Reorder section shows previous orders
- [ ] Categories load correctly
```

---

## Milestone 4.2: Cart & Checkout API
**Estimated Time:** 3-4 hours

### Tasks

#### 4.2.1 Create Cart System

**Options:**
- A) Server-side cart (database)
- B) Client-side cart (localStorage) ← Recommended for simplicity

**Files to create:**
- `client/contexts/CartContext.tsx` - Cart state management
- `client/hooks/useCart.ts` - Cart operations

#### 4.2.2 Create Order Routes (User App)

**File:** `User App/server/routes/orders.ts`

**Endpoints:**
- `POST /api/orders` - Create order (checkout)
- `GET /api/orders` - List customer's orders
- `GET /api/orders/:id` - Get order details

#### 4.2.3 Connect Frontend to API

**Step A: Create Cart Context**

**File:** `User App/client/contexts/CartContext.tsx`
```typescript
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

type CartContextType = {
  items: CartItem[];
  addItem: (product: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = (product: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === product.productId);
      if (existing) {
        return prev.map(i => 
          i.productId === product.productId 
            ? { ...i, quantity: i.quantity + product.quantity }
            : i
        );
      }
      return [...prev, product];
    });
  };

  const removeItem = (productId: string) => {
    setItems(prev => prev.filter(i => i.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems(prev => prev.map(i => 
      i.productId === productId ? { ...i, quantity } : i
    ));
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
```

**Step B: Wrap App with CartProvider**

**File:** `User App/client/main.tsx`
```typescript
import { CartProvider } from './contexts/CartContext';

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <App />
    </CartProvider>
  </QueryClientProvider>
);
```

**Step C: Create Order Hooks**

**File:** `User App/client/hooks/useOrders.ts`
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useCart } from '@/contexts/CartContext';

export function useOrders() {
  return useQuery({
    queryKey: ['my-orders'],
    queryFn: () => api.get('/orders'),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['my-orders', id],
    queryFn: () => api.get(`/orders/${id}`),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const { clearCart } = useCart();
  
  return useMutation({
    mutationFn: (data: CreateOrderDto) => api.post('/orders', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      clearCart(); // Clear cart after successful order
    },
  });
}
```

**Step D: Update Cart.tsx**

```typescript
// ❌ REMOVE: const [cartItems, setCartItems] = useState([...mockItems])
// ✅ ADD:
import { useCart } from '@/contexts/CartContext';

export default function Cart() {
  const { items, updateQuantity, removeItem, total, itemCount } = useCart();

  if (items.length === 0) {
    return <EmptyState title="السلة فارغة" message="أضف منتجات للبدء" />;
  }

  // Use items, total from cart context
}
```

**Step E: Update Checkout.tsx**

```typescript
import { useCart } from '@/contexts/CartContext';
import { useCreateOrder } from '@/hooks/useOrders';
import { useAddresses } from '@/hooks/useAddresses';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';

export default function Checkout() {
  const { items, total } = useCart();
  const { data: addresses } = useAddresses();
  const { data: paymentMethods } = usePaymentMethods();
  const createOrder = useCreateOrder();

  const handleSubmit = async () => {
    await createOrder.mutateAsync({
      items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
      addressId: selectedAddress,
      paymentMethodId: selectedPaymentMethod,
      paymentType: selectedPaymentType, // 'advance' | 'partial' | 'deferred'
    });
    navigate('/orders/success');
  };
}
```

**🧑‍💻 HUMAN CHECK:**
```
- [ ] Add products to cart
- [ ] Update quantities in cart
- [ ] Remove items from cart
- [ ] Cart persists on page refresh
- [ ] Checkout creates order in database
- [ ] Order confirmation shows
- [ ] Order appears in orders list
- [ ] Order details show correctly
```

---

## Milestone 4.3: Customer Account API
**Estimated Time:** 2-3 hours

### Tasks

#### 4.3.1 Create Account Routes

**File:** `User App/server/routes/account.ts`

**Endpoints:**
- `GET /api/account` - Get customer profile
- `PUT /api/account` - Update profile
- `GET /api/account/stats` - Balance, credit limit, etc.
- `PUT /api/account/password` - Change password

#### 4.3.2 Create Address Routes

**File:** `User App/server/routes/addresses.ts`

**Endpoints:**
- `GET /api/addresses` - List addresses
- `POST /api/addresses` - Add address
- `PUT /api/addresses/:id` - Update address
- `DELETE /api/addresses/:id` - Delete address
- `PUT /api/addresses/:id/default` - Set default

#### 4.3.3 Create Payment Methods Routes

**File:** `User App/server/routes/payment-methods.ts`

**Endpoints:**
- `GET /api/payment-methods` - List saved methods
- `POST /api/payment-methods` - Add payment method
- `DELETE /api/payment-methods/:id` - Remove method
- `PUT /api/payment-methods/:id/default` - Set default

#### 4.3.4 Connect Frontend to API

**Step A: Create Account Hooks**

**File:** `User App/client/hooks/useAccount.ts`
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useAccount() {
  return useQuery({
    queryKey: ['account'],
    queryFn: () => api.get('/account'),
  });
}

export function useAccountStats() {
  return useQuery({
    queryKey: ['account-stats'],
    queryFn: () => api.get('/account/stats'),
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateAccountDto) => api.put('/account', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['account'] }),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) => 
      api.put('/account/password', data),
  });
}
```

**Step B: Create Address Hooks**

**File:** `User App/client/hooks/useAddresses.ts`
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useAddresses() {
  return useQuery({
    queryKey: ['addresses'],
    queryFn: () => api.get('/addresses'),
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAddressDto) => api.post('/addresses', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addresses'] }),
  });
}

export function useUpdateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAddressDto }) => 
      api.put(`/addresses/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addresses'] }),
  });
}

export function useDeleteAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/addresses/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addresses'] }),
  });
}

export function useSetDefaultAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.put(`/addresses/${id}/default`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addresses'] }),
  });
}
```

**Step C: Create Payment Methods Hooks**

**File:** `User App/client/hooks/usePaymentMethods.ts`
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function usePaymentMethods() {
  return useQuery({
    queryKey: ['payment-methods'],
    queryFn: () => api.get('/payment-methods'),
  });
}

export function useCreatePaymentMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePaymentMethodDto) => api.post('/payment-methods', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payment-methods'] }),
  });
}

export function useDeletePaymentMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/payment-methods/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payment-methods'] }),
  });
}

export function useSetDefaultPaymentMethod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.put(`/payment-methods/${id}/default`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['payment-methods'] }),
  });
}
```

**Step D: Update Account.tsx**

```typescript
// ❌ REMOVE: const mockAccount = {...}
// ✅ ADD:
import { useAccount, useAccountStats } from '@/hooks/useAccount';

export default function Account() {
  const { data: account, isLoading } = useAccount();
  const { data: stats } = useAccountStats();

  if (isLoading) return <LoadingSpinner />;

  // Use account and stats from API
}
```

**Step E: Update Addresses.tsx**

```typescript
// ❌ REMOVE: const [addresses, setAddresses] = useState([...mockAddresses])
// ✅ ADD:
import { 
  useAddresses, 
  useCreateAddress, 
  useDeleteAddress, 
  useSetDefaultAddress 
} from '@/hooks/useAddresses';

export default function Addresses() {
  const { data: addresses, isLoading } = useAddresses();
  const createAddress = useCreateAddress();
  const deleteAddress = useDeleteAddress();
  const setDefault = useSetDefaultAddress();

  const handleAdd = async (data: AddressFormData) => {
    await createAddress.mutateAsync(data);
    toast.success('تمت إضافة العنوان');
  };

  if (isLoading) return <LoadingSpinner />;

  // Use addresses from API
}
```

**🧑‍💻 HUMAN CHECK:**
```
- [ ] Profile loads correctly
- [ ] Can update profile
- [ ] Addresses CRUD works
- [ ] Default address selection works
- [ ] Payment methods CRUD works
- [ ] Home page stats load correctly
- [ ] Settings page works
```

---

## Milestone 4.4: Notifications API
**Estimated Time:** 1-2 hours

### Tasks

#### 4.4.1 Create Notifications Routes

**File:** `User App/server/routes/notifications.ts`

**Endpoints:**
- `GET /api/notifications` - List notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all read
- `GET /api/notifications/unread-count` - Unread count

#### 4.4.2 Connect Frontend to API

**Step A: Create Notification Hooks**

**File:** `User App/client/hooks/useNotifications.ts`
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications'),
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => api.get('/notifications/unread-count'),
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.put(`/notifications/${id}/read`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.put('/notifications/read-all', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
```

**Step B: Update Header.tsx (Notification Badge)**

```typescript
import { useUnreadCount } from '@/hooks/useNotifications';

export function Header() {
  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.count || 0;

  return (
    <header>
      {/* ... */}
      <Link to="/notifications" className="relative">
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Link>
    </header>
  );
}
```

**Step C: Update Notifications.tsx**

```typescript
// ❌ REMOVE: const mockNotifications = [...]
// ✅ ADD:
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '@/hooks/useNotifications';

export default function Notifications() {
  const { data: notifications, isLoading } = useNotifications();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const handleMarkRead = async (id: string) => {
    await markAsRead.mutateAsync(id);
  };

  if (isLoading) return <LoadingSpinner />;

  // Use notifications from API
}
```

**🧑‍💻 HUMAN CHECK:**
```
- [ ] Notifications load from database
- [ ] Mark as read works
- [ ] Unread count shows in header
- [ ] New order creates notification
```

---

## Milestone 4.5: Discount Display
**Estimated Time:** 1-2 hours

### Tasks

#### 4.5.1 Create Discount Routes (User App)

**File:** `User App/server/routes/discounts.ts`

**Endpoints:**
- `GET /api/discounts/active` - Active discounts for customer
- `GET /api/discounts/progress` - Discount goal progress

#### 4.5.2 Connect Frontend to API

**Step A: Create Discount Hooks (User App)**

**File:** `User App/client/hooks/useDiscounts.ts`
```typescript
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Get active discounts available to this customer
export function useActiveDiscounts() {
  return useQuery({
    queryKey: ['active-discounts'],
    queryFn: () => api.get('/discounts/active'),
  });
}

// Get progress toward discount goals
export function useDiscountProgress() {
  return useQuery({
    queryKey: ['discount-progress'],
    queryFn: () => api.get('/discounts/progress'),
  });
}
```

**Step B: Update Home.tsx (Discount Section)**

```typescript
// ❌ REMOVE: const mockDiscountProgress = {...}
// ✅ ADD:
import { useDiscountProgress, useActiveDiscounts } from '@/hooks/useDiscounts';

export default function Home() {
  const { data: discountProgress } = useDiscountProgress();
  const { data: activeDiscounts } = useActiveDiscounts();

  return (
    <div>
      {/* Discount Goal Section */}
      {discountProgress && (
        <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg">
          <h3>{discountProgress.discountName}</h3>
          <p>اشترِ {discountProgress.remaining} أكثر للحصول على {discountProgress.reward}</p>
          <div className="bg-white/30 h-2 rounded-full">
            <div 
              className="bg-white h-2 rounded-full" 
              style={{ width: `${(discountProgress.current / discountProgress.target) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Active Discounts List */}
      {activeDiscounts?.length > 0 && (
        <div className="mt-4">
          <h3>العروض المتاحة</h3>
          {activeDiscounts.map(discount => (
            <DiscountCard key={discount.id} discount={discount} />
          ))}
        </div>
      )}
    </div>
  );
}
```

**🧑‍💻 HUMAN CHECK:**
```
- [ ] Active discounts display
- [ ] Progress bar shows correctly
- [ ] Discount calculations are accurate
```

---

# PHASE 5: Local Integration Testing (PRE-DEPLOYMENT)

## Milestone 5.0: Full Local System Testing
**Estimated Time:** 4-6 hours

### ⚠️ CRITICAL: Complete this BEFORE any deployment

### Tasks

#### 5.0.1 Start All Services Locally

**Terminal 1 - Database:**
```bash
cd "Soudanco V4"
docker-compose up -d
# Verify: docker ps (should show soudanco-db running)
```

**Terminal 2 - Admin Panel:**
```bash
cd "Admin Panel"
pnpm dev
# Running on http://localhost:8080
```

**Terminal 3 - User App:**
```bash
cd "User App"
pnpm dev
# Running on http://localhost:8081 (or different port)
```

#### 5.0.2 Admin Panel Complete Flow Test

**🧑‍💻 HUMAN CHECK - Admin Panel:**
```
AUTHENTICATION:
- [ ] Login page loads at /login
- [ ] Can login with seeded admin credentials
- [ ] Invalid credentials show error
- [ ] Logout works and redirects to login
- [ ] Protected routes redirect to login when not authenticated

DASHBOARD:
- [ ] Dashboard shows real statistics from database
- [ ] Quick action buttons navigate correctly
- [ ] Recent orders table loads real data

CUSTOMERS:
- [ ] Customer list loads from database
- [ ] Search filters work
- [ ] Create new customer - form submits and saves
- [ ] Edit customer - changes persist
- [ ] Customer details show correct tabs
- [ ] Balance/credit tab shows payment history
- [ ] Orders tab shows customer orders

PRODUCTS:
- [ ] Product list loads from database
- [ ] Search and category filters work
- [ ] Create new product with image
- [ ] Edit product - changes persist
- [ ] Stock status toggles work

PRICE LISTS:
- [ ] Price list table loads
- [ ] Create new price list
- [ ] Edit prices for products
- [ ] Customer count accurate

ORDERS:
- [ ] Orders list loads with filters
- [ ] Order details page works
- [ ] Status updates save correctly
- [ ] Order tracker visual works

PAYMENTS:
- [ ] Payments list loads
- [ ] Filters work correctly
- [ ] Payment details accessible

DISCOUNTS:
- [ ] Both discount types display
- [ ] Create buy-get discount
- [ ] Create spend-bonus discount
- [ ] Toggle active status works
- [ ] Edit/delete works

SUPERVISORS:
- [ ] Supervisor list loads
- [ ] Create new supervisor
- [ ] Edit supervisor
- [ ] Role-based access enforced
```

#### 5.0.3 User App Complete Flow Test

**🧑‍💻 HUMAN CHECK - User App:**
```
AUTHENTICATION:
- [ ] Splash screen shows and redirects
- [ ] Login page loads
- [ ] Can login with seeded customer credentials
- [ ] Signup creates new customer
- [ ] Logout works

HOME PAGE:
- [ ] Stats cards show real data (balance, credit, inventory)
- [ ] Discount goal section loads
- [ ] Reorder section shows previous orders
- [ ] Product sections load
- [ ] Promotional banners display

PRODUCTS:
- [ ] Products page loads all products
- [ ] Search works
- [ ] Category/status filters work
- [ ] Prices reflect customer's price tier
- [ ] Add to cart works with quantity selector

CART:
- [ ] Cart shows added items
- [ ] Quantity +/- works
- [ ] Remove item works
- [ ] Total calculates correctly
- [ ] Continue shopping navigates back
- [ ] Cart persists on page refresh

CHECKOUT:
- [ ] Order review shows all items
- [ ] Address selection works
- [ ] Payment method selection works
- [ ] Payment type selection works (advance/partial/deferred)
- [ ] Order summary calculates correctly
- [ ] Complete order creates order in database
- [ ] Success message/redirect works

ORDERS:
- [ ] Orders list shows customer's orders
- [ ] Status filter works
- [ ] Order detail page loads correctly
- [ ] Order status badge accurate

ACCOUNT:
- [ ] Profile displays correctly
- [ ] Credit limit shows
- [ ] All navigation links work

ADDRESSES:
- [ ] Address list loads
- [ ] Add new address
- [ ] Edit address
- [ ] Delete address
- [ ] Set default address

PAYMENT METHODS:
- [ ] Payment methods list loads
- [ ] Add new method
- [ ] Delete method
- [ ] Set default method

NOTIFICATIONS:
- [ ] Notifications load
- [ ] Mark as read works
- [ ] Unread badge in header updates

SETTINGS:
- [ ] Settings page loads
- [ ] Can update settings
```

#### 5.0.4 Cross-System Integration Test

**🧑‍💻 HUMAN CHECK - Integration:**
```
ORDER FLOW:
- [ ] Create order in User App
- [ ] Order appears in Admin Panel orders list
- [ ] Update order status in Admin Panel
- [ ] Status reflects in User App

PAYMENT FLOW:
- [ ] Customer pays (simulated) in User App
- [ ] Payment appears in Admin Panel
- [ ] Customer balance updates correctly

CUSTOMER MANAGEMENT:
- [ ] Create customer in Admin Panel
- [ ] Customer can login in User App
- [ ] Changes in Admin Panel reflect in User App

PRICING:
- [ ] Change price in Admin Panel price list
- [ ] Price updates for assigned customers in User App

DISCOUNTS:
- [ ] Create discount in Admin Panel
- [ ] Discount shows in User App for eligible customers
```

#### 5.0.5 Error Handling Test

**🧑‍💻 HUMAN CHECK - Error Scenarios:**
```
- [ ] Network error shows user-friendly message
- [ ] Invalid form input shows validation errors
- [ ] 404 page works for unknown routes
- [ ] Session expiry handles gracefully
- [ ] Empty states display correctly (no orders, no products, etc.)
```

#### 5.0.6 Fix Any Issues Found

- [ ] Document all bugs found during testing
- [ ] Fix critical bugs before proceeding
- [ ] Re-test fixed functionality
- [ ] Confirm all checks pass

---

# PHASE 6: Production Deployment

## Milestone 6.1: Set Up Production Database
**Estimated Time:** 1 hour

### Tasks

#### 6.1.1 Create Neon PostgreSQL Account
- [ ] Go to https://neon.tech
- [ ] Create free account
- [ ] Create new project "soudanco-production"
- [ ] Copy connection string

#### 6.1.2 Run Migrations on Production Database
```bash
# Set production DATABASE_URL temporarily
export DATABASE_URL="postgresql://..."
pnpm drizzle-kit push
```

#### 6.1.3 Seed Production Data (Minimal)
- [ ] Create admin user
- [ ] Create price lists
- [ ] Create categories
- [ ] (Optional) Sample products

**🧑‍💻 HUMAN CHECK:**
```
- [ ] Neon database accessible
- [ ] All tables created
- [ ] Admin user can login
```

---

## Milestone 6.2: Prepare for Vercel Deployment
**Estimated Time:** 2-3 hours

### Tasks

#### 6.2.1 Configure Environment Variables

**Required variables:**
```env
DATABASE_URL=
JWT_SECRET=
JWT_REFRESH_SECRET=
NODE_ENV=production
```

#### 6.2.2 Create Vercel Configuration

**File:** `Admin Panel/vercel.json`
```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "framework": "vite",
  "functions": {
    "api/**/*.ts": {
      "runtime": "@vercel/node@3.0.0"
    }
  },
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**File:** `User App/vercel.json`
```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "framework": "vite",
  "functions": {
    "api/**/*.ts": {
      "runtime": "@vercel/node@3.0.0"
    }
  },
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

#### 6.2.3 Adapt Express for Serverless

**File:** `server/api/index.ts` (serverless entry point)

```typescript
import { createServer } from '../index';
export default createServer();
```

#### 6.2.4 Update Build Scripts

**package.json:**
```json
{
  "scripts": {
    "build": "vite build && tsc -p tsconfig.server.json",
    "vercel-build": "pnpm build"
  }
}
```

**🧑‍💻 HUMAN CHECK:**
```
- [ ] Build completes without errors locally
- [ ] All environment variables documented
- [ ] No hardcoded secrets in code
```

---

## Milestone 6.3: Deploy to Vercel
**Estimated Time:** 1-2 hours

### Tasks

#### 6.3.1 Deploy Admin Panel

```bash
cd "Admin Panel"
vercel
```

1. Link to Vercel project
2. Configure environment variables
3. Deploy

#### 5.2.2 Deploy User App

```bash
cd "User App"
vercel
```

1. Link to Vercel project
2. Configure environment variables
3. Deploy

#### 6.3.3 Configure Custom Domains (Optional)

- Admin Panel: `admin.soudanco.com`
- User App: `app.soudanco.com`

**🧑‍💻 HUMAN CHECK:**
```
- [ ] Admin Panel accessible via Vercel URL
- [ ] User App accessible via Vercel URL
- [ ] API endpoints work in production
- [ ] Authentication works in production
- [ ] Database operations work
- [ ] No CORS issues
```

---

## Milestone 6.4: Production Smoke Testing
**Estimated Time:** 1 hour

### Tasks

#### 6.4.1 Quick Production Validation

**Admin Panel:**
- [ ] Login as admin
- [ ] Dashboard loads with data
- [ ] Create a test customer
- [ ] Create a test product
- [ ] Logout

**User App:**
- [ ] Login as test customer
- [ ] Browse products (prices correct for tier)
- [ ] Add to cart and checkout
- [ ] View orders
- [ ] Logout

---

# PHASE 7: Polish & Optimization

## Milestone 7.1: Error Handling & Loading States
**Estimated Time:** 2 hours

### Tasks

- [ ] Add loading spinners to all data fetches
- [ ] Add error boundaries
- [ ] Add toast notifications for actions
- [ ] Add form validation error messages
- [ ] Handle network errors gracefully

---

## Milestone 7.2: Performance Optimization
**Estimated Time:** 2 hours

### Tasks

- [ ] Implement React Query caching
- [ ] Add pagination to lists
- [ ] Lazy load images
- [ ] Code splitting for routes
- [ ] Optimize bundle size

---

## Milestone 7.3: Security Hardening
**Estimated Time:** 1-2 hours

### Tasks

- [ ] Input sanitization
- [ ] Rate limiting on API
- [ ] SQL injection prevention (via ORM)
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Secure HTTP headers

---

# Summary: Implementation Order

## Week 1: Foundation
| Day | Milestone | Time |
|-----|-----------|------|
| 1 | 1.0 Local Dev Environment (Docker) | 1h |
| 1 | 1.1 Database Setup & Schema | 3h |
| 1 | 1.2 Seed Data | 1h |
| 2 | 2.1 Backend Authentication | 4h |
| 3 | 2.2 Frontend Authentication | 4h |

## Week 2: Admin Panel APIs
| Day | Milestone | Time |
|-----|-----------|------|
| 4 | 3.1 Customer Management | 3h |
| 4 | 3.2 Product Management | 3h |
| 5 | 3.3 Price List Management | 2h |
| 5 | 3.4 Order Management | 4h |
| 6 | 3.5 Payment Management | 2h |
| 6 | 3.6 Discount Management | 2h |
| 7 | 3.7 Supervisor Management | 2h |

## Week 3: User App APIs
| Day | Milestone | Time |
|-----|-----------|------|
| 8 | 4.1 Product Browsing | 2h |
| 8 | 4.2 Cart & Checkout | 4h |
| 9 | 4.3 Customer Account | 3h |
| 9 | 4.4 Notifications | 2h |
| 9 | 4.5 Discount Display | 2h |

## Week 4: Local Testing
| Day | Milestone | Time |
|-----|-----------|------|
| 10 | 5.0 Full Local System Testing | 6h |
| 11 | Bug Fixes & Re-testing | 4h |

## Week 5: Deployment & Polish
| Day | Milestone | Time |
|-----|-----------|------|
| 12 | 6.1 Set Up Production Database | 1h |
| 12 | 6.2 Prepare for Deployment | 3h |
| 12 | 6.3 Deploy to Vercel | 2h |
| 13 | 6.4 Production Smoke Testing | 1h |
| 13 | 7.1 Error Handling | 2h |
| 13 | 7.2 Performance Optimization | 2h |
| 14 | 7.3 Security Hardening | 2h |

---

# Development Workflow Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    LOCAL DEVELOPMENT                        │
├─────────────────────────────────────────────────────────────┤
│  Phase 1: Foundation          (Local PostgreSQL + Docker)   │
│  Phase 2: Authentication      (Test locally)                │
│  Phase 3: Admin Panel APIs    (Test locally)                │
│  Phase 4: User App APIs       (Test locally)                │
│  Phase 5: FULL LOCAL TESTING  ◄── COMPLETE ALL CHECKS       │
├─────────────────────────────────────────────────────────────┤
│                    PRODUCTION DEPLOYMENT                    │
├─────────────────────────────────────────────────────────────┤
│  Phase 6: Vercel Deployment   (Neon DB + Vercel)            │
│  Phase 7: Polish & Security                                 │
└─────────────────────────────────────────────────────────────┘
```

---

# Prompt Templates for Claude

Use these prompts when implementing each milestone:

## Starting a Milestone
```
I'm working on Milestone [X.X] - [Name] from the Implementation Roadmap.

Current task: [Specific task]

Please help me implement this according to the specifications in the roadmap.
The project uses: React 18, React Router 6, Express, Drizzle ORM, PostgreSQL, TailwindCSS.
We're developing LOCALLY with Docker PostgreSQL.
```

## After Completing Tasks
```
I've completed the tasks in Milestone [X.X]. 
Can you help me with the human testing checklist?
What should I verify before moving to the next milestone?
```

## Debugging Issues
```
I'm stuck on Milestone [X.X] - [Name].

Error: [Error message]

Context: [What you were trying to do]

Please help me resolve this issue.
```

---

# Environment Variables Reference

## Local Development (.env.local)
```env
DATABASE_URL=postgresql://soudanco:localdev123@localhost:5432/soudanco_dev
JWT_SECRET=local-dev-jwt-secret-123
JWT_REFRESH_SECRET=local-dev-refresh-secret-456
NODE_ENV=development
```

## Production (Vercel Dashboard)
```env
DATABASE_URL=postgresql://user:pass@neon.tech:5432/dbname?sslmode=require
JWT_SECRET=<generate-secure-random-string>
JWT_REFRESH_SECRET=<generate-secure-random-string>
NODE_ENV=production
```

---

*Document Created: January 12, 2026*
*Version: 1.1 - Updated for Local-First Development*
