# E-Commerce Web Application

A full-stack e-commerce platform built with Node.js, Express, MongoDB, React, and Tailwind CSS.

## Features

### User Features
- User registration and login with JWT authentication
- User profile management
- Browse and search products
- Filter products by category, price range
- Add products to cart
- Manage wishlist
- Checkout and order placement
- Order history tracking

### Admin Features
- Product management (create, read, update, delete)
- User management
- Order management with status updates
- Inventory tracking

## Tech Stack

### Backend
- Node.js + Express
- MongoDB with Mongoose
- JWT authentication
- Bcrypt for password hashing
- Nodemailer for email services

### Frontend
- React with Vite
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls

## Project Structure

```
backend/
├── config/             # Database configuration
├── controllers/        # Request handlers
├── middlewares/        # Auth and admin middleware
├── models/             # Mongoose schemas
├── routes/             # API routes
├── services/           # Business logic
└── utils/              # Utility functions

frontend/
├── public/             # Static assets
└── src/
    ├── components/     # Reusable components
    ├── context/        # React context
    ├── pages/          # Page components
    └── services/       # API services
```

## API Endpoints

### Authentication
- `POST /user/register` - Register new user
- `POST /user/login` - Login user
- `GET /user/profile` - Get user profile
- `PUT /user/update` - Update user profile
- `POST /user/logout` - Logout user

### Products
- `GET /product/all` - Get all products with filters
- `GET /product/featured/all` - Get featured products
- `GET /product/category/:category` - Get products by category
- `GET /product/:id` - Get single product
- `POST /product/add` - Create product (admin)
- `PUT /product/:id` - Update product (admin)
- `DELETE /product/:id` - Delete product (admin)

### Cart
- `POST /cart/add` - Add item to cart
- `GET /cart/all` - Get cart items
- `PUT /cart/product/:id` - Update item quantity
- `DELETE /cart/product/:id` - Remove item from cart

### Orders
- `POST /order/add` - Create order
- `GET /order/all` - Get user orders
- `GET /order/:id` - Get single order
- `DELETE /order/:id` - Cancel order

### Wishlist
- `POST /wishlist/add` - Add to wishlist
- `GET /wishlist/all` - Get wishlist
- `DELETE /wishlist/remove` - Remove from wishlist

### Admin
- `GET /admin/all/user` - Get all users (admin)
- `DELETE /admin/user/:id` - Delete user (admin)
- `PUT /admin/user/:id/role` - Update user role (admin)

## Installation

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=5000
MONGO_URL=mongodb://127.0.0.1:27017/ecommerc_db
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3002
GEMINI_API_KEY=your-gemini-key
NODE_EMAIL=your-email@gmail.com
NODE_PASSWORD=your-app-password
```

4. Start MongoDB service

5. Start backend server:
```bash
node app.js
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
VITE_BASE_URL=http://localhost:5000
```

4. Start frontend dev server:
```bash
npm run dev
```

## Running the Application

1. Start MongoDB (ensure it's running on port 27017)
2. Start backend: `node app.js` (runs on port 5000)
3. Start frontend: `npm run dev` (runs on port 3002)

## Available Pages

- **Home** - Featured products, search, categories
- **Products** - Browse all products with filters
- **Product Detail** - View product details, add to cart
- **Cart** - Manage cart items, proceed to checkout
- **Checkout** - Shipping and payment information
- **Order Confirmation** - Order success page
- **Profile** - View and edit user profile
- **Wishlist** - Manage wishlist items
- **Admin** - Manage products and users
- **Support** - Contact support and FAQ

## Default Admin Account

You can create an admin account by registering and then updating the role in the database, or creating a seed script.

## Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 5000)
- `MONGO_URL` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `FRONTEND_URL` - Frontend URL for CORS
- `GEMINI_API_KEY` - Google Gemini API key (optional)
- `NODE_EMAIL` - Email for sending reset links
- `NODE_PASSWORD` - Email password

### Frontend (.env)
- `VITE_BASE_URL` - Backend API URL

## Scripts

### Backend
- `node app.js` - Start production server

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## License

ISC