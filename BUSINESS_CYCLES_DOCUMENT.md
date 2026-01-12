# سودانكو (Soudanco) - Business Cycles Document

## Executive Summary

Soudanco is a **B2B beverage distribution platform** consisting of two applications:
1. **Admin Panel** - Back-office management system for company staff
2. **User App** - Mobile-first customer portal for B2B retailers (markets, supermarkets)

The platform enables wholesale beverage distribution with tiered pricing, credit management, order processing, and promotional campaigns.

---

## Application Overview

### Admin Panel (لوحة التحكم)
**Purpose:** Comprehensive back-office system for managing all business operations

**Users:** Company staff including:
- General Administrators (المسؤول العام)
- Account Managers (مدير الحسابات)
- Staff (موظف)

### User App (تطبيق العميل)
**Purpose:** Self-service ordering platform for B2B customers

**Users:** Registered business customers (retailers, markets, supermarkets)

---

## Business Cycles

---

## 1. Customer Management Cycle (إدارة العملاء)

### Overview
Manages the complete lifecycle of B2B customer accounts from registration to ongoing account management.

### Admin Panel Flows

#### 1.1 Customer Registration
**Route:** `/customers/new`

**Process:**
1. Admin creates new customer account
2. Enter customer details:
   - Business name (الاسم)
   - Region/Zone (المنطقة) - e.g., Cairo, Giza, Mansoura
   - Email (البريد الالكتروني)
   - Phone number (رقم الهاتف)
3. Assign price list tier (قائمة الاسعار) - Gold/Silver/Bronze
4. Activate/Deactivate account (تفعيل الحساب)
5. Save customer record

#### 1.2 Customer List Management
**Route:** `/customers`

**Features:**
- Search by name or region
- Filter by:
  - Account status (Active/Inactive)
  - Price list tier
  - Region
- View customer summary table with:
  - Name
  - Region
  - Price list
  - Outstanding balance (الرصيد المستحق)
  - Credit limit (الحد الائتماني)
  - Active status

#### 1.3 Customer Details Management
**Route:** `/customers/:id`

**Tabs:**
1. **Profile Tab (الملف الشخصي)**
   - View/Edit customer information
   - Contact details
   - Assigned price list
   - Account activation toggle

2. **Balance & Credit Tab (الرصيد والائتمان)**
   - Outstanding balance
   - Credit limit
   - Payment history with status badges:
     - Paid (تم الدفع)
     - Partial (الدفع جزئيًا)
     - Failed (فشل)
     - Refunded (تم الاسترداد)

3. **Orders Tab (الطلبات)**
   - Customer order history
   - Order details and status

### User App Flows

#### 1.4 Account Management
**Route:** `/account`

**Features:**
- View user profile
- Credit limit display (الحد الاتماني)
- Navigation to:
  - Addresses (العنوان)
  - Payment methods (وسائل الدفع)
  - Orders (الطلبات)
  - Account settings (اعدادات الحساب)
  - Customer service (خدمة العملاء)
  - Logout

### Data Model

```typescript
interface Customer {
  id: string;
  name: string;               // Business name
  region: string;             // Geographic zone
  email: string;
  phone: string;
  priceList: 'gold' | 'silver' | 'bronze';
  outstandingBalance: number;
  creditLimit: number;
  isActive: boolean;
  createdAt: Date;
}
```

---

## 2. Product Catalog Management Cycle (إدارة المنتجات)

### Overview
Manages the product catalog including creation, inventory status, and categorization.

### Admin Panel Flows

#### 2.1 Product List Management
**Route:** `/products`

**Features:**
- Search by name or product code
- Filter by:
  - Product status (In Stock/Out of Stock)
  - Category (الصنف) - e.g., Juices, Beverages
- Product table displaying:
  - Product image
  - Name
  - Product code
  - Size (e.g., 1 liter, 250ml)
  - Stock status badge

#### 2.2 Add New Product
**Route:** `/products/new`

**Process:**
1. Upload product image
2. Enter product details:
   - Name (اسم المنتج)
   - Product code (كود المنتج)
   - Size/Volume (حجم العبوة)
   - Category (الصنف)
3. Set initial stock status
4. Save product

#### 2.3 Product Details
**Route:** `/products/:id`

**Features:**
- View/Edit product information
- Update stock status
- View product in different price lists

### User App Flows

#### 2.4 Product Browsing
**Routes:** `/home`, `/products`

**Features:**
- Search products
- Filter by:
  - Product status (متوفر/غير متوفر)
  - Category (عصائر و مشروبات, مشروبات الطاقة)
- Product cards showing:
  - Product image
  - Name
  - Package size (حجم الكرتونة: 25 عبوة)
  - Price (per carton)
  - Add to cart with quantity selector

**Special Sections on Home:**
- Reorder section (إعادة الطلب) - Previously ordered products
- Product categories (منتجات سن توب)
- Promotional banners

### Data Model

```typescript
interface Product {
  id: string;
  name: string;
  code: string;
  size: string;              // e.g., "1 لتر", "250 ملي لتر"
  category: string;
  status: 'in-stock' | 'out-of-stock';
  image: string;
}
```

---

## 3. Pricing Management Cycle (إدارة قوائم الأسعار)

### Overview
Manages tiered pricing strategies for different customer segments.

### Admin Panel Flows

#### 3.1 Price List Management
**Route:** `/price-lists`

**Features:**
- View all price lists (الذهبي, الفضي, البرونزي)
- Display:
  - List name
  - Customer count per list
  - Last update date
- Search functionality

#### 3.2 Create/Edit Price List
**Route:** `/price-lists/add`, `/price-lists/:id/edit`

**Process:**
1. Enter list name (اسم القائمة)
2. For each product in catalog:
   - View product details (image, name, code, size)
   - Set specific price for this tier
3. Save price list

**Price List Table Fields:**
- Product image
- Product name
- Product code
- Package size
- Current price (editable)

### Business Logic
- Each customer is assigned one price list
- Prices displayed in User App reflect assigned price list
- Supports multiple pricing tiers:
  - **Gold (الذهبي)** - Premium pricing (likely lowest prices)
  - **Silver (الفضي)** - Standard pricing
  - **Bronze (البرونزي)** - Basic pricing

### Data Model

```typescript
interface PriceList {
  id: string;
  name: string;
  customerCount: number;
  lastUpdate: Date;
  products: ProductPrice[];
}

interface ProductPrice {
  productId: string;
  price: number;
}
```

---

## 4. Order Lifecycle Cycle (دورة حياة الطلب)

### Overview
Complete order management from placement to delivery.

### Order States

```
تم الإعداد (Placed/Prepared) → تم الشحن (Shipped) → تم الدفع (Paid) → تم التوصيل (Delivered)
```

### User App Flows

#### 4.1 Shopping Cart
**Route:** `/cart`

**Features:**
- View cart items with:
  - Product image
  - Product name
  - Category
  - Quantity controls (+/-)
  - Unit price
  - Line total
- Remove items
- Total calculation
- Continue shopping button
- Proceed to checkout

#### 4.2 Checkout Process
**Route:** `/checkout`

**Steps:**
1. **Order Review (مراجعة الطلبية)**
   - List of all items with prices
   
2. **Delivery Address (عنوان التوصيل)**
   - Select from saved addresses
   - View address details

3. **Payment Method (وسيلة الدفع)**
   - Select saved payment method
   - Credit card display (masked number)

4. **Payment Type (نوع الدفع)**
   - Advance payment (الدفع المسبق) - Pay now
   - Partial payment (الدفع الجزئي) - Pay partially
   - Deferred payment (الدفع الآجل) - Pay later (credit)

5. **Order Summary**
   - Subtotal
   - Total
   - Complete order button

#### 4.3 Order Tracking
**Route:** `/orders`, `/order-detail`

**Features:**
- Filter by order status
- Order cards showing:
  - Order number
  - Expected delivery date
  - Status badge
  - Product preview
  - Delivery address
  - Total amount

### Admin Panel Flows

#### 4.4 Order Management
**Route:** `/orders`

**Features:**
- Search by order code or customer name
- Filter by:
  - Date range
  - Order status (Prepared/Shipped/Delivered)
  - Payment status (Paid/Partial/Unpaid)
  - Customer
- Orders table with:
  - Order code
  - Customer name
  - Item count
  - Total amount
  - Delivery status
  - Payment status badge
  - Date

#### 4.5 Order Details
**Route:** `/orders/:id`

**Features:**
- Visual order tracker (progress bar)
- Order information:
  - Order code
  - Date
  - Customer name
  - Payment type
- Order items table:
  - Product image
  - Product name
  - Product code
  - Quantity
  - Unit price
  - Line total
- Edit order capability

### Data Model

```typescript
interface Order {
  id: string;
  code: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  totalAmount: number;
  deliveryStatus: 'placed' | 'shipped' | 'delivered';
  paymentStatus: 'paid' | 'partial' | 'unpaid' | 'failed' | 'refunded';
  paymentType: 'advance' | 'partial' | 'deferred';
  deliveryAddress: Address;
  createdAt: Date;
  deliveryDate: Date;
}

interface OrderItem {
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}
```

---

## 5. Payment Management Cycle (إدارة المدفوعات)

### Overview
Tracks and manages all payment transactions.

### Admin Panel Flows

#### 5.1 Payment List
**Route:** `/payments`

**Features:**
- Search by customer name or reference
- Filter by:
  - Date range
  - Payment status
  - Customer
  - Payment method
- Payments table showing:
  - Date
  - Reference number
  - Payment method (Fawry, Cash, Card)
  - Amount
  - Customer name

#### 5.2 Payment Details
**Route:** `/payments/:id`

**Features:**
- Payment transaction details
- Associated order information
- Payment method details
- Status management

### User App Flows

#### 5.3 Payment Methods Management
**Route:** `/payment`

**Features:**
- View saved payment methods
- Add new payment method
- Set default payment method
- Remove payment method

### Payment Statuses
- **Paid (مدفوع بالكامل)** - Full payment received
- **Partial (الدفع جزئيًا)** - Partial payment made
- **Unpaid (غير مدفوع)** - No payment received
- **Failed (فشل)** - Payment failed
- **Refunded (تم الاسترداد)** - Payment refunded

### Supported Payment Methods
- Fawry
- Cash (نقداً)
- Credit Card (بطاقة ائتمان)
- Mastercard

### Data Model

```typescript
interface Payment {
  id: string;
  date: Date;
  reference: string;
  paymentMethod: 'fawry' | 'cash' | 'card';
  amount: number;
  customerId: string;
  customerName: string;
  orderId: string;
  status: 'paid' | 'partial' | 'failed' | 'refunded';
}
```

---

## 6. Discount & Promotion Management Cycle (إدارة الخصومات والعروض)

### Overview
Manages promotional campaigns and discount programs.

### Discount Types

#### Type 1: Buy X Get Y Free (اشترِ X → احصل على Y)
- Purchase quantity-based promotion
- Example: "Buy 5 Suntop Orange, Get 1 Free"

#### Type 2: Spend X Get Y% Bonus (أنفق X → بونس Y%)
- Spending threshold promotion
- Example: "Spend 10,000 EGP, Get 3% Bonus"

### Admin Panel Flows

#### 6.1 Discount List
**Route:** `/discounts`

**Features:**
- Filter by discount type
- Toggle view between types
- Discounts table showing:
  - Discount name/description
  - Type
  - Valid until date
  - Active status

#### 6.2 Create Discount
**Route:** `/discounts/add`

**Step 1: Select Discount Type**
- Choose between "Buy X Get Y" or "Spend X Get Y%"

**Step 2: Configure Discount**
- Name (اسم العرض)
- For "Buy X Get Y":
  - Buy quantity (X)
  - Free quantity (Y)
  - Product selection
- For "Spend X Get Y%":
  - Spending threshold amount (X)
  - Bonus percentage (Y)
- Validity period:
  - Valid from
  - Valid until
- Active/Inactive toggle

#### 6.3 Edit Discount
**Route:** `/discounts/:id/edit`

- Modify existing discount parameters
- Enable/Disable discount

### User App Flows

#### 6.4 Discount Goals Display
**Route:** `/home`

**Features:**
- Discount goal cards showing:
  - Target discount value
  - Progress description
  - Visual progress bar
  - Validity date
- Example: "Get 6000 EGP discount when you achieve your purchase goal"

### Data Model

```typescript
interface Discount {
  id: string;
  name: string;
  type: 'buy-get' | 'spend-bonus';
  // For buy-get
  buyQuantity?: number;
  getQuantity?: number;
  productId?: string;
  // For spend-bonus
  spendAmount?: number;
  bonusPercent?: number;
  // Common
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
}
```

---

## 7. User/Supervisor Management Cycle (إدارة المستخدمين)

### Overview
Manages internal staff accounts and permissions.

### Admin Panel Flows

#### 7.1 Supervisor List
**Route:** `/supervisors`

**Features:**
- Search by name or email
- Filter by:
  - Role
  - Account status (Active/Inactive)
- Supervisors table showing:
  - Name
  - Role
  - Email
  - Active status
  - Created date

#### 7.2 Create Supervisor
**Route:** `/supervisors/new`

**Fields:**
- Name
- Email
- Role selection
- Account activation toggle

#### 7.3 Supervisor Details
**Route:** `/supervisors/:id`

**Features:**
- View supervisor information
- Edit account details
- View activity/permissions

#### 7.4 Role Permissions
**Route:** `/supervisors/:id/permissions`

**Features:**
- Configure role-based access control
- Enable/Disable specific permissions

### Roles
- **المسؤول العام** (General Administrator) - Full access
- **مدير الحسابات** (Account Manager) - Customer and order management
- **موظف** (Staff) - Limited operational access

### Data Model

```typescript
interface Supervisor {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
  isActive: boolean;
  createdAt: Date;
  permissions: Permission[];
}
```

---

## 8. Credit Management Cycle (إدارة الائتمان)

### Overview
Manages B2B credit facilities for customers.

### Key Metrics

#### Customer Level (Admin Panel)
- **Credit Limit (الحد الائتماني)** - Maximum credit allowed
- **Outstanding Balance (الرصيد المستحق)** - Current amount owed

#### Customer View (User App)
- **Credit Limit (الحد الاتماني)** - Available credit
- **Outstanding Balance (الرصيد المستحق)** - Current dues
- **Current Inventory (المخزون الحالي)** - Stock reference

### Business Rules
1. Customers can place orders using:
   - Advance payment (pay now)
   - Partial payment (pay some now)
   - Deferred payment (pay later - uses credit)

2. Deferred payments consume credit limit
3. Payments reduce outstanding balance
4. Orders may be blocked if credit limit exceeded

### User App Displays
**Home Page Stats:**
- Outstanding balance (الرصيد المستحق)
- Credit limit (الحد الاتماني)
- Current inventory (المخزون الحالي)

---

## 9. Address Management Cycle (إدارة العناوين)

### User App Flows

#### 9.1 Address List
**Route:** `/address`

**Features:**
- View saved delivery addresses
- Set default address
- Add new address
- Edit existing address
- Delete address

#### 9.2 Address Selection at Checkout
**Route:** `/checkout`

- Select delivery address for order
- Quick navigation to add new address

### Data Model

```typescript
interface Address {
  id: string;
  label: string;           // e.g., "الوحدة العلية"
  contactName: string;     // Contact person
  street: string;
  area: string;
  city: string;
  country: string;
  isDefault: boolean;
}
```

---

## 10. Notification Management Cycle (إدارة الإشعارات)

### User App Flows

#### 10.1 Notifications
**Route:** `/notifications`

**Features:**
- View all notifications
- Notification types:
  - Order status updates
  - Payment confirmations
  - Promotional alerts
  - System notifications

---

## 11. Authentication Cycle (دورة المصادقة)

### User App Flows

#### 11.1 Splash Screen
**Route:** `/`

- App branding
- Auto-redirect to login or home

#### 11.2 Login
**Route:** `/login`

- Phone/Email login
- Password authentication

#### 11.3 Signup
**Route:** `/signup`

- New customer registration
- Business details collection

---

## Summary of Key Business Entities

| Entity | Arabic | Admin Panel | User App |
|--------|--------|-------------|----------|
| Customer | العميل | Full CRUD | View own |
| Product | المنتج | Full CRUD | Browse only |
| Order | الطلب | Full CRUD | Create & View |
| Payment | المدفوعات | Full CRUD | View & Pay |
| Price List | قائمة الأسعار | Full CRUD | N/A (assigned) |
| Discount | الخصم | Full CRUD | View applicable |
| Supervisor | المستخدم | Full CRUD | N/A |
| Address | العنوان | View | Full CRUD |

---

## Integration Points (Future Considerations)

1. **Payment Gateway Integration**
   - Fawry
   - Credit card processors

2. **Logistics/Delivery Integration**
   - Real-time tracking
   - Delivery management system

3. **Inventory Management System**
   - Stock level synchronization
   - Low stock alerts

4. **Accounting System**
   - Invoice generation
   - Financial reporting

5. **CRM Integration**
   - Customer communication
   - Support ticketing

---

## Technical Notes

- **Language:** Arabic (RTL layout)
- **Currency:** Egyptian Pound (جم / EGP)
- **Date Format:** DD-MM-YYYY
- **Architecture:** SPA with React Router 6
- **Styling:** TailwindCSS 3
- **State Management:** React Query (TanStack)

---

*Document Generated: January 12, 2026*
*Version: 1.0*
