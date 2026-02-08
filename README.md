# E-Commerce Platform

A full-stack e-commerce marketplace built with **Spring Boot** and **Next.js**, featuring multi-vendor shop management, real-time buyer-seller chat via WebSocket, integrated payment processing through Omise gateway, and a comprehensive admin dashboard. The system supports three distinct user roles (Customer, Seller, Admin) with granular access control, product variant management, order lifecycle tracking, and a review/rating system.

---

## Table of Contents

- [Features](#features)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Role-Based Access](#role-based-access)

---

## Features

### Customer-Facing

- **Product Browsing** &mdash; Search, filter by category, and view detailed product pages with variant selection
- **Product Variants** &mdash; Choose from multiple SKU variants (size, color, etc.) with independent pricing and stock
- **Shopping Cart** &mdash; Add/remove items with variant support, quantity management, and price snapshots
- **Checkout & Payment** &mdash; Complete orders via Omise gateway (credit card, PromptPay, bank transfer, TrueMoney, and more)
- **Order Tracking** &mdash; View order history with full status timeline from pending to delivered
- **Wishlist** &mdash; Save and toggle favorite products for later purchase
- **Reviews & Ratings** &mdash; Leave verified-purchase reviews with images and star ratings
- **Real-Time Chat** &mdash; Communicate directly with shop sellers via WebSocket-powered messaging
- **User Profile** &mdash; Manage personal information, multiple shipping addresses, and profile image
- **Become a Seller** &mdash; Apply to open a shop through the seller application workflow

### Seller / Staff

- **Shop Management** &mdash; Create and customize shop profile with logo, description, and slug
- **Product Management** &mdash; Add, edit, and delete products with images, variants, and inventory tracking
- **Variant Management** &mdash; Configure flexible product variants with per-variant pricing, stock, and images
- **Order Fulfillment** &mdash; View and manage orders placed to the shop, update order statuses
- **Review Management** &mdash; View customer reviews and post shop replies
- **Seller Chat** &mdash; Respond to buyer messages in real time
- **Low Stock Alerts** &mdash; Monitor variants running low on inventory

### Admin / Management

- **Dashboard & Statistics** &mdash; View system-wide metrics including users, orders, revenue, and shops
- **User Management** &mdash; List all users, ban/unban accounts, and manage roles
- **Seller Applications** &mdash; Review, approve, or reject seller applications
- **Shop Oversight** &mdash; View all shops, suspend/unsuspend, and revoke seller privileges
- **Category Management** &mdash; Create, update, and delete product categories (hierarchical)
- **Payment Administration** &mdash; View payment statistics, update statuses, process refunds, and clean up expired payments
- **Order Management** &mdash; Full visibility into all orders across the platform

---

## Screenshots

> **Note:** Add your application screenshots to the `doc/screenshots/` directory and update the paths below.

### Customer Pages

| Home & Products | Product Detail | Shopping Cart |
|:---:|:---:|:---:|
| ![Home](doc/screenshots/home.png) | ![Product](doc/screenshots/product-detail.png) | ![Cart](doc/screenshots/cart.png) |

| Checkout | Order History | Chat |
|:---:|:---:|:---:|
| ![Checkout](doc/screenshots/checkout.png) | ![Orders](doc/screenshots/orders.png) | ![Chat](doc/screenshots/chat.png) |

### Seller Pages

| Seller Dashboard | Product Management | Order Management |
|:---:|:---:|:---:|
| ![Seller Dashboard](doc/screenshots/seller-dashboard.png) | ![Products](doc/screenshots/seller-products.png) | ![Orders](doc/screenshots/seller-orders.png) |

### Admin Pages

| Admin Dashboard | User Management | Shop Management |
|:---:|:---:|:---:|
| ![Admin Dashboard](doc/screenshots/admin-dashboard.png) | ![Users](doc/screenshots/admin-users.png) | ![Shops](doc/screenshots/admin-shops.png) |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React 18, TypeScript 5 |
| Styling | Tailwind CSS 3, Radix UI, Lucide Icons |
| State Management | Zustand 4 |
| Forms | React Hook Form 7 |
| Charts | Recharts 3 |
| HTTP Client | Axios 1.6 |
| Real-Time | STOMP.js, SockJS |
| Backend | Spring Boot 3.3.2, Java 21 |
| Security | Spring Security, JWT (JJWT 0.11.5), BCrypt |
| ORM | Spring Data JPA, Hibernate |
| Database | PostgreSQL |
| WebSocket | Spring WebSocket, STOMP |
| Payment Gateway | Omise (credit card, PromptPay, bank transfer, TrueMoney) |
| Build Tools | Maven 3 (backend), npm (frontend) |
| Testing | JUnit 5, Spring Security Test, H2 (test DB) |

---

## Project Structure

```
ecommerce/
├── sourceCode/
│   ├── backend/                          # Spring Boot application
│   │   ├── src/main/java/com/ecommerce/EcommerceApplication/
│   │   │   ├── config/                   # Spring & CORS & WebSocket configuration
│   │   │   ├── controller/               # REST API endpoints
│   │   │   ├── dto/                      # Data Transfer Objects (request/response)
│   │   │   ├── entity/                   # JPA entities (Product, Order, Cart, etc.)
│   │   │   ├── exception/                # Custom exception handlers
│   │   │   ├── model/                    # Domain models (User, Address, etc.)
│   │   │   ├── repository/               # Spring Data JPA repositories
│   │   │   ├── security/                 # JWT filter, token provider, auth config
│   │   │   ├── service/                  # Business logic interfaces
│   │   │   │   └── impl/                 # Service implementations
│   │   │   └── util/                     # Utility classes
│   │   ├── uploads/                      # File storage (products, profiles, shops, chat)
│   │   ├── pom.xml                       # Maven dependencies
│   │   └── src/main/resources/
│   │       └── application.properties    # App configuration
│   │
│   └── frontend/                         # Next.js application
│       ├── src/
│       │   ├── app/                      # Page routes (App Router)
│       │   │   ├── admin/                # Admin dashboard pages
│       │   │   ├── seller/               # Seller dashboard pages
│       │   │   ├── products/             # Product listing & detail
│       │   │   ├── cart/                 # Shopping cart page
│       │   │   ├── checkout/             # Checkout flow
│       │   │   ├── orders/               # Order list & detail
│       │   │   ├── chat/                 # Real-time chat
│       │   │   ├── wishlist/             # Wishlist page
│       │   │   └── payment/              # Payment callback
│       │   ├── components/               # Reusable React components
│       │   │   ├── ui/                   # UI primitives (shadcn/ui)
│       │   │   ├── admin/                # Admin-specific components
│       │   │   ├── seller/               # Seller-specific components
│       │   │   └── payment/              # Payment components (Omise)
│       │   ├── lib/                      # API clients & utilities
│       │   │   └── api/                  # Domain-specific API modules
│       │   ├── types/                    # TypeScript type definitions
│       │   ├── store/                    # Zustand state stores
│       │   ├── hooks/                    # Custom React hooks
│       │   ├── contexts/                 # React context providers
│       │   └── config/                   # Frontend configuration
│       ├── public/                       # Static assets
│       ├── package.json
│       ├── tailwind.config.js
│       └── next.config.js
│
└── doc/                                  # Documentation & presentations
```

---

## Getting Started

### Prerequisites

- **Java** 21+
- **Maven** 3.x
- **Node.js** 18+ and npm
- **PostgreSQL** 14+
- **Omise account** (test keys for development)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd ecommerce
   ```

2. **Set up the database**

   ```bash
   # Create a PostgreSQL database
   createdb ecommerce_dev
   ```

3. **Configure the backend**

   Edit `sourceCode/backend/src/main/resources/application.properties`:

   ```properties
   # Database
   spring.datasource.url=jdbc:postgresql://localhost:5432/ecommerce_dev
   spring.datasource.username=postgres
   spring.datasource.password=your_password

   # JWT secret (change in production)
   app.jwt.secret=your_secret_key_here
   app.jwt.expiration-ms=86400000

   # Omise payment keys
   omise.public-key=pkey_test_your_public_key
   omise.secret-key=skey_test_your_secret_key

   # CORS
   app.cors.allowed-origins=http://localhost:3000
   app.frontend.url=http://localhost:3000
   ```

4. **Start the backend**

   ```bash
   cd sourceCode/backend
   mvn spring-boot:run
   ```

   The API server starts at `http://localhost:8080/api`.

5. **Configure the frontend**

   Create `sourceCode/frontend/.env.local`:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080/api
   NEXT_PUBLIC_OMISE_PUBLIC_KEY=pkey_test_your_public_key
   ```

6. **Start the frontend**

   ```bash
   cd sourceCode/frontend
   npm install
   npm run dev
   ```

   The app is available at `http://localhost:3000`.

7. **Create an admin user**

   ```bash
   curl -X POST http://localhost:8080/api/auth/create-admin
   ```

   Default credentials: `admin@ecommerce.com` / `admin123`

### Available Scripts

#### Frontend

| Script | Command | Description |
|---|---|---|
| dev | `npm run dev` | Start development server on port 3000 |
| build | `npm run build` | Build for production |
| start | `npm run start` | Start production server |
| lint | `npm run lint` | Run ESLint |

#### Backend

| Script | Command | Description |
|---|---|---|
| run | `mvn spring-boot:run` | Start Spring Boot server on port 8080 |
| build | `mvn clean install` | Compile and package as JAR |
| test | `mvn test` | Run test suite |

---

## Role-Based Access

| Role | Access Path | Description |
|---|---|---|
| ROLE_USER | `/cart`, `/orders`, `/wishlist`, `/chat`, `/addresses`, `/reviews`, `/users/me`, `/seller/apply` | Standard customer operations: browse, purchase, review, and chat |
| ROLE_SELLER | `/seller/*`, `/products` (CUD), `/orders/seller/*`, `/reviews/seller/*` | All USER permissions plus shop & product management, order fulfillment |
| ROLE_ADMIN | `/admin/*`, all endpoints | Full system access including user management, shop oversight, and payment admin |

### How Authentication Works

1. **Registration & Login** &mdash; Users register via `/auth/register` and authenticate via `/auth/login`, which returns a JWT access token and a refresh token.

2. **JWT Token** &mdash; The access token (valid for 24 hours) is sent as a `Bearer` token in the `Authorization` header. It contains the user ID, username, and roles as claims, signed with HS256.

3. **Request Filter** &mdash; `JwtAuthenticationFilter` intercepts every request (except public paths like `/auth/**`, `/health`, and public GET endpoints for products/shops/categories). It validates the token, checks if the user is banned, and sets the Spring Security context.

4. **Method-Level Authorization** &mdash; Controllers use `@PreAuthorize` annotations to enforce role requirements:
   - `hasRole('ADMIN')` &mdash; Admin-only endpoints
   - `hasRole('SELLER')` &mdash; Seller or higher
   - `hasAnyRole('SELLER', 'ADMIN')` &mdash; Seller and Admin
   - `hasAnyRole('USER', 'SELLER', 'ADMIN')` &mdash; Any authenticated user

5. **Resource Ownership** &mdash; Beyond role checks, service-layer logic ensures users can only access their own data (e.g., a seller can only manage products in their own shop, users can only view their own orders).

6. **Token Refresh** &mdash; When the access token expires, the client sends the refresh token to `/auth/refresh` to obtain a new access token without re-authenticating.
