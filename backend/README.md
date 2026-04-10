# Pretzel Shop Backend API

Backend API for the Pretzel Shop e-commerce application built with Node.js, Express, PostgreSQL, and Redis.

## Features

- **Products API**: Get all products or a single product by ID
- **Cart API**: Session-based cart management using Redis
- **Orders API**: Create orders from checkout with customer information

## Tech Stack

- Node.js
- Express.js
- PostgreSQL (for persistent data: products, orders, customers)
- Redis (for session-based cart storage)
- Docker Compose (for PostgreSQL and Redis)

## Prerequisites

- Node.js (v14 or higher)
- Docker and Docker Compose
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# PostgreSQL Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pretzel_shop
DB_USER=pretzel_user
DB_PASSWORD=pretzel_password

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# CORS Configuration
CORS_ORIGIN=http://localhost:5173
```

### 3. Start PostgreSQL and Redis with Docker Compose

```bash
docker-compose up -d
```

This will start:
- PostgreSQL on port 5432
- Redis on port 6379

### 4. Run Database Migrations

```bash
npm run migrate
```

This will create the necessary tables and populate initial products.

### 5. Start the Server

For development (with auto-reload):
```bash
npm run dev
```

For production:
```bash
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

### Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get a single product by ID

### Cart

- `GET /api/cart` - Get cart items (requires `X-Session-Id` header or returns new session ID)
- `POST /api/cart` - Add item to cart
  ```json
  {
    "productId": 1,
    "quantity": 1
  }
  ```
- `PUT /api/cart/:productId` - Update cart item quantity
  ```json
  {
    "quantity": 2
  }
  ```
- `DELETE /api/cart/:productId` - Remove item from cart
- `DELETE /api/cart` - Clear entire cart

**Note**: The cart API uses session-based storage. Include the `X-Session-Id` header in requests to maintain cart state, or let the server generate a new session ID on first request.

### Orders

- `POST /api/orders` - Create a new order
  ```json
  {
    "fullName": "John Doe",
    "email": "john@example.com",
    "address": "123 Main St",
    "city": "New York",
    "zip": "10001",
    "cartItems": [
      { "id": 1, "quantity": 2 },
      { "id": 2, "quantity": 1 }
    ],
    "sessionId": "optional-session-id"
  }
  ```
- `GET /api/orders/:id` - Get order details by ID

### Health Check

- `GET /health` - Check if server is running

## Project Structure

```
pretzel-shop-nodejs-be/
├── config/
│   ├── database.js      # PostgreSQL connection pool
│   └── redis.js         # Redis client
├── routes/
│   ├── products.js      # Product routes
│   ├── cart.js          # Cart routes
│   └── orders.js        # Order routes
├── scripts/
│   └── migrate.js       # Database migration script
├── docker-compose.yml    # Docker Compose configuration
├── server.js            # Express server entry point
├── package.json
└── README.md
```

## Database Schema

### Products
- id (SERIAL PRIMARY KEY)
- name (VARCHAR)
- price (DECIMAL)
- image, image_large, image_thumb (VARCHAR)
- description, full_description (TEXT)
- created_at, updated_at (TIMESTAMP)

### Customers
- id (SERIAL PRIMARY KEY)
- full_name, email (VARCHAR)
- address (TEXT)
- city, zip (VARCHAR)
- created_at (TIMESTAMP)

### Orders
- id (SERIAL PRIMARY KEY)
- customer_id (INTEGER, FK to customers)
- total_amount, shipping_cost (DECIMAL)
- status (VARCHAR)
- created_at (TIMESTAMP)

### Order Items
- id (SERIAL PRIMARY KEY)
- order_id (INTEGER, FK to orders)
- product_id (INTEGER, FK to products)
- quantity (INTEGER)
- price (DECIMAL)
- created_at (TIMESTAMP)

## Redis Cart Storage

Cart data is stored in Redis with the key pattern `cart:{sessionId}`. Each cart session expires after 24 hours of inactivity.

## Development

- Use `npm run dev` for development (requires `nodemon` installed globally or as dev dependency)
- The server will automatically reload on file changes

## Stopping Services

To stop PostgreSQL and Redis:

```bash
docker-compose down
```

To stop and remove volumes (clears all data):

```bash
docker-compose down -v
```

## Integration with Frontend

The frontend should:
1. Include `X-Session-Id` header in cart API requests to maintain session
2. Store the session ID returned in response headers
3. Send cart items and session ID when creating orders

