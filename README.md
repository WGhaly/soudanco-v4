# Soudanco V4

A full-stack B2B e-commerce platform for beverage distribution, featuring an Admin Panel for business management and a User App for customers.

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS 3
- **Backend**: Express.js + Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT (access + refresh tokens)
- **UI Components**: Radix UI + Lucide Icons

## 📁 Project Structure

```
soudanco-v4/
├── admin-panel/          # Admin Panel (port 3000)
│   ├── client/           # React frontend
│   │   ├── components/   # UI components
│   │   ├── pages/        # Route pages
│   │   ├── hooks/        # React Query hooks
│   │   └── lib/          # Utilities & auth
│   ├── server/           # Express backend
│   │   ├── db/           # Drizzle schema & seed
│   │   ├── routes/       # API endpoints
│   │   └── middleware/   # Auth middleware
│   └── shared/           # Shared types
│
├── user-app/             # User App (port 3001)
│   ├── client/           # React frontend
│   │   ├── components/   # UI components
│   │   ├── pages/        # Route pages
│   │   ├── hooks/        # React Query hooks
│   │   └── lib/          # Utilities & auth
│   ├── server/           # Express backend
│   │   ├── db/           # Drizzle schema
│   │   ├── routes/       # API endpoints
│   │   └── middleware/   # Auth middleware
│   └── shared/           # Shared types
│
└── docker-compose.yml    # PostgreSQL database
```

## 🔧 Setup

### Prerequisites

- Node.js 18+
- Docker (for PostgreSQL)
- pnpm or npm

### 1. Start Database

```bash
docker-compose up -d
```

This starts PostgreSQL on port 5433 with:
- Database: `soudanco`
- User: `postgres`
- Password: `postgres123`

### 2. Install Dependencies

```bash
# Admin Panel
cd admin-panel
npm install

# User App
cd ../user-app
npm install
```

### 3. Seed Database

```bash
cd admin-panel
npx tsx server/db/seed.ts
```

### 4. Run Applications

```bash
# Admin Panel (port 3000)
cd admin-panel
npm run dev

# User App (port 3001)
cd user-app
npm run dev
```

## 🔐 Test Credentials

### Admin Panel
- **Email**: `admin@soudanco.com`
- **Password**: `admin123`

### User App
- **Email**: `aljawhra@example.com`
- **Password**: `customer123`

## 📊 Features

### Admin Panel

| Feature | Description |
|---------|-------------|
| Dashboard | Stats, charts, recent orders |
| Customers | Customer management, details, orders history |
| Products | Product catalog, categories, stock management |
| Orders | Order tracking, status updates |
| Payments | Payment tracking, status management |
| Price Lists | Custom pricing per customer |
| Discounts | Promotional discounts, coupons |
| Supervisors | Staff management, permissions |

### User App

| Feature | Description |
|---------|-------------|
| Home | Dashboard with stats, recent orders, products |
| Products | Product catalog with search, filters |
| Cart | Shopping cart management |
| Checkout | Order placement with address selection |
| Orders | Order history and tracking |
| Profile | Account settings, addresses, notifications |

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Admin Panel APIs
- `/api/customers` - Customer CRUD
- `/api/products` - Product CRUD
- `/api/orders` - Order management
- `/api/payments` - Payment management
- `/api/price-lists` - Price list CRUD
- `/api/discounts` - Discount CRUD
- `/api/supervisors` - Supervisor CRUD
- `/api/stats` - Dashboard statistics

### User App APIs
- `/api/products` - Product catalog
- `/api/cart` - Cart management
- `/api/orders` - Order placement & history
- `/api/profile/*` - Profile, addresses, notifications

## 🧪 Testing

```bash
# Run API tests
cd admin-panel
npm test

cd user-app
npm test
```

## 📦 Build

```bash
# Admin Panel
cd admin-panel
npm run build

# User App
cd user-app
npm run build
```

## 🚢 Deployment

Both apps are configured for deployment to:
- **Netlify** - See `netlify.toml`
- **Vercel** - See `vercel.json`

Environment variables needed:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT signing
- `JWT_REFRESH_SECRET` - Secret for refresh tokens

## 📄 License

MIT

## 👨‍💻 Author

Waseem Ghaly
