require("dotenv").config();
const mongoose = require("mongoose");
const connectToDb = require("./config/db");
const Category = require("./models/category.model");
const Product = require("./models/product.model");
const User = require("./models/user.model");
const slugify = require("./utils/slugify");

const categoryData = [
  {
    name: "Electronics",
    description: "Smart devices, laptops, audio and accessories.",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800",
  },
  {
    name: "Fashion",
    description: "Premium outfits and accessories for daily style.",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800",
  },
  {
    name: "Home Living",
    description: "Furniture and decor for modern interiors.",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800",
  },
];

const productData = (categories) => [
  {
    name: "AuraBook Pro 14",
    description: "High-performance laptop with sleek aluminum body, fast SSD storage and all-day battery life.",
    price: 1299,
    compareAtPrice: 1499,
    stock: 18,
    brand: "NovaTech",
    sku: "ELEC-LAP-001",
    images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200"],
    category: categories["Electronics"]._id,
    categoryName: "Electronics",
    featured: true,
  },
  {
    name: "Pulse Wireless Headphones",
    description: "Immersive over-ear headphones with deep bass, noise isolation and soft memory-foam cushions.",
    price: 199,
    compareAtPrice: 249,
    stock: 42,
    brand: "SoundPeak",
    sku: "ELEC-AUD-002",
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200"],
    category: categories["Electronics"]._id,
    categoryName: "Electronics",
    featured: true,
  },
  {
    name: "Essential Cotton Jacket",
    description: "Minimal street-style jacket crafted for comfort and year-round layering.",
    price: 89,
    compareAtPrice: 119,
    stock: 56,
    brand: "Urban Thread",
    sku: "FASH-JKT-003",
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200"],
    category: categories["Fashion"]._id,
    categoryName: "Fashion",
    featured: true,
  },
  {
    name: "Luma Accent Chair",
    description: "Modern accent chair with plush seating and a premium finish for living spaces.",
    price: 349,
    compareAtPrice: 399,
    stock: 12,
    brand: "Casa Form",
    sku: "HOME-CHR-004",
    images: ["https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200"],
    category: categories["Home Living"]._id,
    categoryName: "Home Living",
    featured: false,
  },
];

const seed = async () => {
  try {
    await connectToDb();

    await Promise.all([
      Category.deleteMany({}),
      Product.deleteMany({}),
      User.deleteMany({}),
    ]);

    const insertedCategories = await Category.insertMany(
      categoryData.map((category) => ({
        ...category,
        slug: slugify(category.name),
      }))
    );

    const categoriesByName = insertedCategories.reduce((acc, category) => {
      acc[category.name] = category;
      return acc;
    }, {});

    const products = productData(categoriesByName).map((product) => ({
      ...product,
      slug: slugify(product.name),
    }));
    await Product.insertMany(products);

    await User.create([
      {
        username: "adminuser",
        name: "Admin User",
        email: "admin@example.com",
        password: "admin123",
        phone: "9876543210",
        role: "admin",
      },
      {
        username: "demoshopper",
        name: "Demo Shopper",
        email: "user@example.com",
        password: "user12345",
        phone: "9876543211",
        role: "user",
      },
    ]);

    console.log("Database seeded successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
};

seed();
