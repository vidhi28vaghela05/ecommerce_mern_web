// Seed script for e-commerce database
const mongoose = require('mongoose');
const Product = require('./models/product.model');
const User = require('./models/user.model');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/ecommerc_db';

mongoose.connect(MONGO_URL).then(async () => {
  console.log('Connected to MongoDB');

  // Clear existing data
  await Product.deleteMany({});
  await User.deleteMany({ role: { $ne: 'admin' } });

  // Create sample products
  const products = [
    {
      name: 'iPhone 15 Pro',
      description: 'Latest iPhone with A17 Pro chip, titanium design, and advanced camera system',
      price: 99999,
      stock: 50,
      discount: 5,
      category: 'Electronics',
      brand: 'Apple',
      sku: 'PHONE-IP15-001',
      images: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500', 'https://images.unsplash.com/photo-1511629087934-09f4f3e4c5a0?w=500'],
      isNewproduct: true,
    },
    {
      name: 'Samsung Galaxy S24',
      description: 'Next-gen smartphone with AI features and stunning display',
      price: 84999,
      stock: 35,
      discount: 8,
      category: 'Electronics',
      brand: 'Samsung',
      sku: 'PHONE-SGS24-002',
      images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500'],
      isNewproduct: true,
    },
    {
      name: 'MacBook Pro 14"',
      description: 'Professional laptop with M3 Pro chip for ultimate performance',
      price: 199999,
      stock: 20,
      discount: 10,
      category: 'Electronics',
      brand: 'Apple',
      sku: 'LAPTOP-MBP14-003',
      images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500'],
      isNewproduct: true,
    },
    {
      name: 'Sony WH-1000XM5',
      description: 'Industry-leading noise canceling wireless headphones',
      price: 29999,
      stock: 100,
      discount: 15,
      category: 'Electronics',
      brand: 'Sony',
      sku: 'AUDIO-SONYXM5-004',
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'],
      isNewproduct: false,
    },
    {
      name: 'iPad Air',
      description: 'Versatile tablet with powerful performance and stunning display',
      price: 52999,
      stock: 45,
      discount: 5,
      category: 'Electronics',
      brand: 'Apple',
      sku: 'TABLET-IPAIR-005',
      images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500'],
      isNewproduct: false,
    },
    {
      name: 'Casual Denim Jacket',
      description: 'Stylish denim jacket for everyday wear - comfortable and trendy',
      price: 4999,
      stock: 200,
      discount: 20,
      category: 'Fashion',
      brand: 'UrbanStyle',
      sku: 'FASH-JKT001',
      images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500'],
      isNewproduct: true,
    },
    {
      name: 'Premium Leather Sofa',
      description: 'Luxurious 3-seater sofa with genuine leather upholstery',
      price: 89999,
      stock: 15,
      discount: 12,
      category: 'Home',
      brand: 'LivingStyle',
      sku: 'HOME-SOF001',
      images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500'],
      isNewproduct: true,
    },
    {
      name: 'Python Programming Guide',
      description: 'Complete guide to mastering Python programming from beginner to advanced',
      price: 1299,
      stock: 500,
      discount: 25,
      category: 'Books',
      brand: 'TechBooks',
      sku: 'BOOK-PY001',
      images: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500'],
      isNewproduct: false,
    },
    {
      name: 'Smart Watch Pro',
      description: 'Advanced smartwatch with health monitoring and fitness tracking',
      price: 34999,
      stock: 80,
      discount: 10,
      category: 'Electronics',
      brand: 'TechFit',
      sku: 'WEAR-TSW001',
      images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'],
      isNewproduct: true,
    },
    {
      name: 'Wireless Mechanical Keyboard',
      description: 'Premium mechanical keyboard with RGB lighting and wireless connectivity',
      price: 12999,
      stock: 150,
      discount: 18,
      category: 'Electronics',
      brand: 'KeyMaster',
      sku: 'PERIPH-KM001',
      images: ['https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500'],
      isNewproduct: false,
    },
  ];

  await Product.insertMany(products);
  console.log(`Inserted ${products.length} products`);

  // Create a sample user
  const hashedPassword = await User.hashPassword('password123');
  await User.create({
    username: 'testuser',
    email: 'test@example.com',
    password: hashedPassword,
    role: 'user',
  });
  console.log('Created sample user: testuser (password: password123)');

  // Create an admin user
  const adminHashedPassword = await User.hashPassword('admin123');
  await User.create({
    username: 'admin',
    email: 'admin@example.com',
    password: adminHashedPassword,
    role: 'admin',
  });
  console.log('Created admin user: admin (password: admin123)');

  console.log('\n✅ Database seeded successfully!');
  mongoose.disconnect();
  process.exit(0);
}).catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
