# E-Commerce Web Application - Run Instructions

## Overview
This is a complete full-stack e-commerce application with authentication, product catalog, cart, orders, wishlist, and admin panel.

## Prerequisites
- Node.js (v18+)
- MongoDB (running on port 27017)

## Project Structure
```
ecommerce-web/
├── backend/          # Node.js + Express + MongoDB
│   ├── config/       # Database & environment config
│   ├── controllers/  # Request handlers
│   ├── middlewares/  # Auth & admin middleware
│   ├── models/       # Mongoose schemas
│   ├── routes/       # API routes
│   ├── services/     # Business logic
│   ├── seed.js       # Database seed script
│   └── app.js        # Main server file
└── frontend/         # React + Tailwind CSS
    ├── public/
    └── src/
        ├── components/  # Reusable components
        ├── context/     # React context
        ├── pages/       # Page components
        └── services/    # API services
```

## Getting Started

### 1. Start MongoDB
Ensure MongoDB is running on the default port (27017).

### 2. Backend Setup

#### Install dependencies
```bash
cd backend
npm install
```

#### Configure environment
Edit `backend/.env`:
```env
PORT=5000
MONGO_URL=mongodb://127.0.0.1:27017/ecommerc_db
JWT_SECRET=jeelgolakiya1234
FRONTEND_URL=http://localhost:3002
GEMINI_API_KEY=your-gemini-key-here
NODE_EMAIL=your-email@gmail.com
NODE_PASSWORD=your-app-password
```

#### Seed database (first time only)
```bash
node seed.js
```

#### Start backend server
```bash
node app.js
```
Backend will run on: http://localhost:5000

### 3. Frontend Setup

#### Install dependencies
```bash
cd frontend
npm install
```

#### Configure environment
Edit `frontend/.env`:
```env
VITE_BASE_URL=http://localhost:5000
```

#### Start frontend dev server
```bash
npm run dev
```
Frontend will run on: http://localhost:3002

## Default Users

### Regular User
- **Email:** test@example.com
- **Password:** password123

### Admin User
- **Email:** admin@example.com
- **Password:** admin123

## Features Implemented

### User Features
✅ User registration & login with JWT authentication  
✅ User profile management & update  
✅ Password reset via email  
✅ Browse all products with filters  
✅ Search products by name/description  
✅ Filter by category, price range  
✅ Sort by price, name, date  
✅ Product detail view with gallery  
✅ Add items to cart  
✅ Update cart item quantities  
✅ Remove items from cart  
✅ Cart persistence in database  
✅ Wishlist management  
✅ Checkout with order creation  
✅ Order history tracking  
✅ Order status updates  

### Admin Features
✅ Add new products  
✅ Edit existing products  
✅ Delete products  
✅ View all products  
✅ View all users  
✅ Delete users  
✅ Update user roles  
✅ View all orders  
✅ Update order status  
✅ Cancel orders with stock refund  

### Pages
1. **Home** - Featured products, search, categories
2. **Products** - Browse with filters & sort
3. **Product Detail** - View details, add to cart/wishlist
4. **Cart** - Manage items, proceed to checkout
5. **Checkout** - Shipping & payment info
6. **Order Confirmation** - Success page with order details
7. **Profile** - View/edit user info
8. **Wishlist** - Manage wishlist items
9. **Admin** - Product & user management
10. **Support** - Contact & FAQ

## API Endpoints

### Authentication
- `POST /user/register` - Register new user
- `POST /user/login` - Login user  
- `GET /user/profile` - Get user profile
- `PUT /user/update` - Update user profile
- `POST /user/logout` - Logout user

### Products (Public)
- `GET /product/all` - Get all products with filters
- `GET /product/featured/all` - Get featured products
- `GET /product/category/:category` - Get products by category
- `GET /product/:id` - Get single product

### Products (Admin Only)
- `POST /product/add` - Create product
- `PUT /product/:id` - Update product
- `DELETE /product/:id` - Delete product

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

## Database Models

### User
- username, email, password (hashed)
- role (user, admin, manager)
- resetToken, resetTokenExpiry

### Product
- name, description, brand
- price, discount, stock
- category, sku, images
- isNewproduct flag

### Cart
- userId (ref: User)
- items: [{productId (ref: Product), quantity}]

### Order
- userId (ref: User)
- items: [{productId, quantity, price, total}]
- totalbill, status (pending, confirmed, shipped, delivered, cancelled)

### Wishlist
- userId (ref: User)
- productIds: [{type: ObjectId, ref: Product}]

## Technology Stack

**Backend:**
- Node.js, Express
- MongoDB, Mongoose ODM
- JWT for authentication
- Bcrypt for password hashing
- Nodemailer for emails

**Frontend:**
- React, React Router
- Tailwind CSS
- Axios for API calls
- Vite build tool

## Testing the Application

1. **Test Authentication:**
   - Register a new user
   - Login with credentials
   - Access protected routes (cart, wishlist)

2. **Test Products:**
   - Browse all products
   - Use search, filter by category/price
   - Sort by different criteria

3. **Test Cart:**
   - Add items to cart
   - Update quantities
   - Remove items
   - Verify cart persistence after login

4. **Test Checkout:**
   - Proceed as logged-in user
   - Fill shipping info
   - Create order
   - Verify stock deduction

5. **Test Admin:**
   - Login as admin
   - Add/edit/delete products
   - View all users
   - Update order statuses

## Build for Production

```bash
# Backend
cd backend
npm install
node app.js

# Frontend
cd frontend
npm run build
# Output in frontend/dist/
```

## Security Features

- JWT authentication with secure secret
- Passwords hashed with bcrypt (10 rounds)
- Admin middleware for protected routes
- CORS configured for frontend origin only
- Input validation with express-validator
- CSRF protection via tokens

## Performance Optimizations

- Database indexing on frequently queried fields
- Eager loading with populate for related data
- Image URLs stored, not uploaded (for this demo)
- Responsive frontend with lazy loading

## Known Limitations & Future Enhancements

1. Payment gateway integration (Stripe, PayPal)
2. Email notifications for order status
3. Product reviews and ratings
4. Advanced search with full-text indexing
5. Real-time inventory updates
6. Shipping integration
7. Multiple currency support
8. Product variants (size, color)

## Troubleshooting

**MongoDB Connection Error:**
- Ensure MongoDB is running: `mongod`
- Check connection string in .env

**CORS Errors:**
- Verify FRONTEND_URL in backend .env
- Ensure frontend URL matches exactly

**JWT Token Expired:**
- Tokens expire in 7 days
- Re-login to get new token

**Build Failures:**
- Clear node_modules and reinstall
- Check Node.js version (v18+ required)
- Verify all dependencies installed

## License

ISC
