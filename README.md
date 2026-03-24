# Smart Farmer Marketplace & Management System

A production-ready full-stack platform for Indian agriculture — connecting Farmers and Buyers directly, with a Farming Store, Market Price Analysis, AI Price Prediction, Weather Integration, Razorpay Payments, and an Admin Panel.

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS |
| Backend | Node.js + Express + TypeScript + Prisma |
| Database | PostgreSQL 15 |
| Cache/Queue | Redis 7 + BullMQ |
| Auth | JWT (httpOnly cookies) + bcrypt + RBAC |
| Payments | Razorpay |
| Charts | Recharts |
| Maps | Leaflet |
| Storage | AWS S3 (local disk fallback) |

## 📁 Project Structure

```
smart-farmer/
├── client/          # React + Vite frontend (port 5173)
├── server/          # Node.js + Express backend (port 4000)
├── docker-compose.yml
├── .env.example
└── README.md
```

## ⚡ Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for DB + Redis)
- Node.js 18+
- npm 9+

### 1. Clone & Configure

```bash
git clone <repo-url>
cd smart-farmer
cp .env.example .env
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Fill in your API keys in `server/.env` (see Environment Variables section below).

### 2. Start Database & Redis

```bash
docker compose up -d db redis
```

### 3. Setup Backend

```bash
cd server
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

Backend runs at: `http://localhost:4000`

### 4. Setup Frontend

```bash
cd client
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

### 5. Or Run Everything with Docker

```bash
docker compose up -d
```

## 🔑 Environment Variables

### `server/.env`

```env
DATABASE_URL=postgresql://smartfarmer:smartfarmer123@localhost:5432/smartfarmerdb
JWT_SECRET=your-super-secret-jwt-key-change-in-production
REDIS_URL=redis://localhost:6379
NODE_ENV=development

# Razorpay (get from https://razorpay.com/docs/payments/dashboard/account-settings/api-keys/)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx

# AWS S3 (optional; falls back to local disk if not set)
AWS_S3_BUCKET=your-s3-bucket
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# OpenWeatherMap (get from https://openweathermap.org/api)
OPENWEATHER_API_KEY=your-openweather-key

# Email (optional)
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=your-resend-api-key
FROM_EMAIL=noreply@smartfarmer.in
```

### `client/.env`

```env
VITE_API_URL=http://localhost:4000
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
VITE_MAPBOX_TOKEN=      # leave empty for Leaflet/OSM (no key required)
```

## 👤 Default Admin Account

After seeding:
- **Email**: `admin@smartfarmer.in`
- **Password**: `Admin@123`

## 🧪 Testing

```bash
# Backend tests
cd server
npm run test

# Backend tests with coverage
npm run test:coverage
```

## 📦 Useful Commands

```bash
# Reset database and re-seed
cd server && npx prisma migrate reset

# Open Prisma Studio (visual DB browser)
cd server && npx prisma studio

# Build for production
cd server && npm run build
cd client && npm run build

# Trigger market price ingest manually
curl -X POST http://localhost:4000/api/market/ingest \
  -H "Cookie: token=<admin-jwt-token>"
```

## 🗺️ API Reference

Base URL: `http://localhost:4000/api`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /auth/register | Public | Register user |
| POST | /auth/login | Public | Login |
| GET | /auth/me | Any | Current user |
| GET | /crops | Public | Browse crops (filters) |
| POST | /crops | Farmer | Create crop listing |
| GET | /orders | Auth | List orders |
| POST | /orders | Buyer | Create order |
| POST | /payments/razorpay/order | Auth | Create Razorpay order |
| POST | /payments/razorpay/verify | Auth | Verify payment |
| GET | /store/products | Public | Browse store |
| GET | /market/summary | Public | Market price summary |
| POST | /ai/price-predict | Public | AI price prediction |
| GET | /weather | Auth | Weather by location |
| GET | /admin/users | Admin | Manage users |
| GET | /admin/metrics | Admin | Platform metrics |

## 🚢 Deployment (AWS)

1. Provision **RDS PostgreSQL** + **ElastiCache Redis** + **S3 Bucket**
2. Set secrets in **AWS SSM Parameter Store** or GitHub Secrets
3. Build Docker images: `docker build -t smartfarmer-api ./server`
4. Push to **ECR**, deploy to **ECS Fargate** or **Elastic Beanstalk**
5. Set `DATABASE_URL` and other env vars in ECS task definition
6. Run `npx prisma migrate deploy` on container start
7. Serve frontend via **S3 + CloudFront**

## 📄 License

MIT
