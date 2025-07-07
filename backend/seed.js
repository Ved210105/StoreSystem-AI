import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';
import Chat from './models/Chat.js';
import KidsWishlist from './models/KidsWishlist.js';
import ARAsset from './models/ARAsset.js';
import Notification from './models/Notification.js';

dotenv.config();

const data = {
  users: [
    {
      _id: '665f1b1f1c9d440001a1f001',
      name: 'Alice Smith',
      email: 'alice@example.com',
      passwordHash: '$2a$10$e1..',
      role: 'user',
      location: 'New York, USA',
      preferences: { size: 'M', brand: 'EcoWear', ecoFriendly: true },
      cart: [{ productId: '665f1b1f1c9d440001b2f001', qty: 2 }],
      wishlist: ['665f1b1f1c9d440001b2f002'],
      createdAt: new Date('2025-06-28T10:00:00Z'),
    },
    {
      _id: '665f1b1f1c9d440001a1f002',
      name: 'John Retailer',
      email: 'john@store.com',
      passwordHash: '$2a$10$e2..',
      role: 'store',
      storeName: 'SmartMart',
      location: 'San Francisco, USA',
      createdAt: new Date('2025-06-20T08:30:00Z'),
    },
    {
      _id: '665f1b1f1c9d440001a1f003',
      name: 'Admin Bob',
      email: 'admin@platform.com',
      passwordHash: '$2a$10$e3..',
      role: 'admin',
      location: 'Headquarters',
      createdAt: new Date('2025-06-01T09:00:00Z'),
    },
  ],
  products: [
    {
      _id: '665f1b1f1c9d440001b2f001',
      storeId: '665f1b1f1c9d440001a1f002',
      name: 'Organic Cotton T-Shirt',
      brand: 'EcoWear',
      category: 'fashion',
      description: '100% organic cotton, sustainably made.',
      price: 25.99,
      inventory: 150,
      images: [
        'https://cdn.shop.com/products/organic-tshirt/front.jpg',
        'https://cdn.shop.com/products/organic-tshirt/back.jpg',
      ],
      arModelUrl: 'https://cdn.shop.com/models/tshirt.glb',
      tags: ['cotton', 'eco', 'fashion'],
      rating: 4.6,
      isEcoFriendly: true,
      hotspots: [
        { label: 'Material', description: 'Made with certified organic cotton.' },
        { label: 'Fit', description: 'Unisex regular fit.' },
      ],
      createdAt: new Date('2025-06-25T12:00:00Z'),
    },
    {
      _id: '665f1b1f1c9d440001b2f002',
      storeId: '665f1b1f1c9d440001a1f002',
      name: 'Ergo Study Chair',
      brand: 'ComfortLine',
      category: 'furniture',
      description: 'Ergonomic design with adjustable height and lumbar support.',
      price: 89.99,
      inventory: 75,
      images: [
        'https://cdn.shop.com/products/study-chair/front.jpg',
        'https://cdn.shop.com/products/study-chair/side.jpg',
        'https://cdn.shop.com/products/study-chair/zoom.jpg',
      ],
      arModelUrl: 'https://cdn.shop.com/models/chair.glb',
      tags: ['furniture', 'ergonomic', 'chair'],
      rating: 4.4,
      isEcoFriendly: false,
      hotspots: [
        { label: 'Adjustable Arms', description: 'Height adjustable armrests for better posture.' },
      ],
      createdAt: new Date('2025-06-26T10:00:00Z'),
    },
  ],
  orders: [
    {
      _id: '665f1b1f1c9d440001c3f001',
      userId: '665f1b1f1c9d440001a1f001',
      items: [
        { productId: '665f1b1f1c9d440001b2f001', qty: 2, priceAtPurchase: 25.99 },
      ],
      total: 51.98,
      paymentMode: 'One-Tap',
      status: 'Pending',
      address: '123 Maple Street, New York, USA',
      orderedAt: new Date('2025-06-28T12:30:00Z'),
    },
  ],
  chats: [
    {
      _id: '665f1b1f1c9d440001d4f001',
      userId: '665f1b1f1c9d440001a1f001',
      query: 'Show me eco-friendly t-shirts under $30',
      response: 'Here are some top-rated eco-friendly t-shirts under $30.',
      timestamp: new Date('2025-06-28T12:40:00Z'),
    },
  ],
  kids_wishlist: [
    {
      _id: '665f1b1f1c9d440001e5f001',
      userId: '665f1b1f1c9d440001a1f001',
      occasion: 'Birthday',
      items: [
        '665f1b1f1c9d440001b2f001',
        '665f1b1f1c9d440001b2f002',
      ],
      notes: 'I want colorful and soft t-shirts!',
    },
  ],
  ar_assets: [
    {
      _id: '665f1b1f1c9d440001f6f001',
      productId: '665f1b1f1c9d440001b2f002',
      url: 'https://cdn.shop.com/models/chair.glb',
      type: 'furniture',
      hotspots: [
        { label: 'Lumbar Support', description: 'Supports lower back during long sessions.' },
        { label: 'Wheels', description: '360-degree swivel wheels for mobility.' },
      ],
    },
  ],
  notifications: [
    {
      userId: '665f1b1f1c9d440001a1f001',
      title: 'Welcome Alice!',
      message: 'Thanks for joining our platform, Alice.',
      type: 'info',
      read: false,
      createdAt: new Date('2025-06-28T13:00:00Z'),
    },
    {
      userId: null,
      title: 'Platform Update',
      message: 'We have launched new eco-friendly products!',
      type: 'info',
      read: false,
      createdAt: new Date('2025-06-28T14:00:00Z'),
    },
  ],
};

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear collections
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Chat.deleteMany({});
    await KidsWishlist.deleteMany({});
    await ARAsset.deleteMany({});
    await Notification.deleteMany({});

    // Insert data
    await User.insertMany(data.users);
    await Product.insertMany(data.products);
    await Order.insertMany(data.orders);
    await Chat.insertMany(data.chats);
    await KidsWishlist.insertMany(data.kids_wishlist);
    await ARAsset.insertMany(data.ar_assets);
    await Notification.insertMany(data.notifications);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed(); 