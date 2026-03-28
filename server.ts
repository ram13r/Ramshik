console.log("Server script started...");
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import Razorpay from "razorpay";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { products as seedProducts } from "./src/data/products";
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  try {
    const app = express();
    const PORT = 3000;
    console.log(`Starting server in ${process.env.NODE_ENV || 'development'} mode`);

    // Serve public directory
    app.use(express.static(path.join(__dirname, "public")));

    console.log("Connecting to database...");
    const db = new Database("ramshika.db");
    console.log("Database connected.");

    const JWT_SECRET = process.env.JWT_SECRET || 'ramshika-super-secret-key';

    // Initialize Database
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT,
        name TEXT,
        role TEXT DEFAULT 'user'
      );

      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        image_url TEXT,
        parent_id INTEGER,
        FOREIGN KEY(parent_id) REFERENCES categories(id)
      );

      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        description TEXT,
        price REAL,
        discount_price REAL,
        image_url TEXT,
        additional_images TEXT,
        videos TEXT,
        category_id INTEGER,
        stock INTEGER DEFAULT 0,
        is_featured BOOLEAN DEFAULT 0,
        features TEXT,
        tags TEXT,
        image_prompt TEXT,
        FOREIGN KEY(category_id) REFERENCES categories(id)
      );

      -- Add columns if they don't exist (for existing databases)
      PRAGMA table_info(products);
      PRAGMA table_info(orders);

      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        total REAL,
        payment_method TEXT,
        status TEXT DEFAULT 'Pending',
        razorpay_order_id TEXT,
        razorpay_payment_id TEXT,
        razorpay_signature TEXT,
        customer_name TEXT,
        customer_email TEXT,
        customer_phone TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER,
        product_id INTEGER,
        quantity INTEGER,
        price REAL,
        FOREIGN KEY(order_id) REFERENCES orders(id),
        FOREIGN KEY(product_id) REFERENCES products(id)
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );

      CREATE TABLE IF NOT EXISTS wishlists (
        user_id INTEGER,
        product_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, product_id),
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(product_id) REFERENCES products(id)
      );

      CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER,
        user_id INTEGER,
        rating INTEGER,
        comment TEXT,
        is_approved BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(product_id) REFERENCES products(id),
        FOREIGN KEY(user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS blogs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        slug TEXT UNIQUE,
        content TEXT,
        image_url TEXT,
        author TEXT,
        is_published BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure role column exists for older users table
    try {
      db.exec("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'");
      // If the column was just added, existing users will have role 'user'
    } catch (e) {}

    // Seed Admin User
    try {
      const adminCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get() as { count: number };
      if (adminCount.count === 0) {
        db.prepare("INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)").run(
          'admin@ramshika.com',
          'admin123',
          'Ramshika Admin',
          'admin'
        );
        console.log("Admin user seeded successfully.");
      }
    } catch (e) {
      console.error("Failed to seed admin user:", e);
    }

    // Seed Categories
    const catCount = db.prepare("SELECT COUNT(*) as count FROM categories").get() as { count: number };
    
    try { db.exec("ALTER TABLE categories ADD COLUMN image_url TEXT"); } catch (e) {}

    if (catCount.count === 0) {
      const insertCat = db.prepare("INSERT INTO categories (name, parent_id, image_url) VALUES (?, ?, ?)");
      insertCat.run("Sarees", null, "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80");
      insertCat.run("Artificial Jewellery", null, "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80");
    } else {
      // Remove orphan sub-categories that have a parent_id (keep only top-level)
      try { db.prepare("DELETE FROM categories WHERE parent_id IS NOT NULL").run(); } catch (e) {}
    }

    // Seed Products
    const prodCount = db.prepare("SELECT COUNT(*) as count FROM products").get() as { count: number };
    
    // Ensure columns exist for existing DB
    try {
      db.exec("ALTER TABLE products ADD COLUMN additional_images TEXT");
    } catch (e) {}
    try {
      db.exec("ALTER TABLE products ADD COLUMN videos TEXT");
    } catch (e) {}
    try {
      db.exec("ALTER TABLE orders ADD COLUMN tracking_id TEXT");
    } catch (e) {}

    if (prodCount.count < 50) {
      db.prepare("DELETE FROM products").run();
      
      const insertProd = db.prepare(`
        INSERT INTO products (name, description, price, discount_price, image_url, category_id, is_featured, stock, features, tags, image_prompt) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const categories = db.prepare("SELECT id, name FROM categories").all() as any[];
      
      seedProducts.forEach((p, index) => {
        let catId = 1;
        const isJewellery = ['Earrings', 'Necklace Sets', 'Bangles', 'Bridal Jewellery'].includes(p.category) || p.category.includes('Jewellery');
        
        if (isJewellery) {
          const jewCat = categories.find((c: any) => c.name === 'Artificial Jewellery');
          if (jewCat) catId = jewCat.id;
        } else {
          const sareeCat = categories.find((c: any) => c.name === 'Sarees');
          if (sareeCat) catId = sareeCat.id;
        }
        
        const imageUrl = `https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80`;
        // Jewellery images - rings, necklaces, bangles
        const jewelleryImages = [
          'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1611085583191-a3b181a88401?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=800&q=80'
        ];
        // Saree images - Indian women in colourful sarees
        const sareeImages = [
          'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1610030469668-935142b96fe4?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1594938298603-c8148c4b7a5b?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1602910344008-22f323cc1817?auto=format&fit=crop&w=800&q=80'
        ];

        const isJewelleryProduct = ['Earrings', 'Necklace Sets', 'Bangles', 'Bridal Jewellery'].includes(p.category) || p.category.includes('Jewellery');
        const productImageUrl = isJewelleryProduct
          ? jewelleryImages[index % jewelleryImages.length]
          : sareeImages[index % sareeImages.length];

        insertProd.run(
          p.name,
          p.description,
          p.price,
          p.discountPrice,
          productImageUrl,
          catId,
          index < 8 ? 1 : 0,
          50,
          JSON.stringify(p.features),
          JSON.stringify(p.tags),
          p.imagePrompt
        );
      });
    }

    // Seed Settings
    const settingsCount = db.prepare("SELECT COUNT(*) as count FROM settings").get() as { count: number };
    if (settingsCount.count === 0) {
      const defaultSettings = [
        { key: 'payment_upi', value: 'true' },
        { key: 'payment_cod', value: 'true' },
        { key: 'payment_card', value: 'true' },
        { key: 'site_name', value: 'Ramshika' },
        { key: 'site_tagline', value: 'Grace in Every Saree' },
        { key: 'site_logo', value: 'https://ui-avatars.com/api/?name=Ramshika&background=EAB308&color=fff&size=512' },
        { key: 'logo_size', value: 'medium' },
        { key: 'hero_title', value: 'Timeless Elegance Redefined.' },
        { key: 'hero_subtitle', value: 'Discover our curated collection of hand-woven sarees and exquisite artificial jewellery designed for the modern Indian woman.' },
        { key: 'hero_slides', value: JSON.stringify([
          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1920&q=80',
          'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1920&q=80',
          'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1920&q=80'
        ]) },
        { key: 'site_stats', value: JSON.stringify([
          { label: 'Happy Customers', value: '10,000+', icon: 'Users' },
          { label: 'Sarees Sold', value: '25,000+', icon: 'ShoppingBag' },
          { label: 'Cities Covered', value: '150+', icon: 'MapPin' },
          { label: 'Customer Satisfaction', value: '99%', icon: 'Star' }
        ]) },
        { key: 'site_testimonials', value: JSON.stringify([
          { name: 'Anjali Sharma', role: 'Fashion Blogger', content: 'The quality of the Banarasi silk saree I bought is exceptional. The colors are even more vibrant in person!', rating: 5, avatar: 'https://i.pravatar.cc/150?u=anjali' },
          { name: 'Priya Patel', role: 'Loyal Customer', content: 'Ramshika has become my go-to for artificial jewellery. Their Kundan sets look so real and elegant.', rating: 5, avatar: 'https://i.pravatar.cc/150?u=priya' },
          { name: 'Meera Reddy', role: 'Bride-to-be', content: 'Found my dream wedding reception saree here. The customer service was so helpful in choosing the right fabric.', rating: 4, avatar: 'https://i.pravatar.cc/150?u=meera' }
        ]) },
        { key: 'product_offers', value: JSON.stringify([
          "Free Shipping Above ₹599",
          "Get ₹100 off on shopping above ₹1499"
        ]) },
        { key: 'support_phone', value: '+91 98765 43210' },
        { key: 'support_timing', value: 'Mon-Sat: 10:00 AM - 7:00 PM' },
        { key: 'support_email', value: 'support@ramshika.com' },
        { key: 'support_email_desc', value: 'We usually reply within 24 hours' },
        { key: 'support_address', value: '123, Fashion Street, Jaipur' },
        { key: 'support_address_desc', value: 'Rajasthan, India - 302001' }
      ];

      const insertSetting = db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)");
      defaultSettings.forEach(s => insertSetting.run(s.key, s.value));
    } else {
      // Ensure new keys are added even if settings already exist
      const newKeys = [
        { key: 'site_stats', value: JSON.stringify([
          { label: 'Happy Customers', value: '10,000+', icon: 'Users' },
          { label: 'Sarees Sold', value: '25,000+', icon: 'ShoppingBag' },
          { label: 'Cities Covered', value: '150+', icon: 'MapPin' },
          { label: 'Customer Satisfaction', value: '99%', icon: 'Star' }
        ]) },
        { key: 'site_testimonials', value: JSON.stringify([
          { name: 'Anjali Sharma', role: 'Fashion Blogger', content: 'The quality of the Banarasi silk saree I bought is exceptional. The colors are even more vibrant in person!', rating: 5, avatar: 'https://i.pravatar.cc/150?u=anjali' },
          { name: 'Priya Patel', role: 'Loyal Customer', content: 'Ramshika has become my go-to for artificial jewellery. Their Kundan sets look so real and elegant.', rating: 5, avatar: 'https://i.pravatar.cc/150?u=priya' },
          { name: 'Meera Reddy', role: 'Bride-to-be', content: 'Found my dream wedding reception saree here. The customer service was so helpful in choosing the right fabric.', rating: 4, avatar: 'https://i.pravatar.cc/150?u=meera' }
        ]) },
        { key: 'product_offers', value: JSON.stringify([
          "Free Shipping Above ₹599",
          "Get ₹100 off on shopping above ₹1499"
        ]) },
        { key: 'support_phone', value: '+91 98765 43210' },
        { key: 'support_timing', value: 'Mon-Sat: 10:00 AM - 7:00 PM' },
        { key: 'support_email', value: 'support@ramshika.com' },
        { key: 'support_email_desc', value: 'We usually reply within 24 hours' },
        { key: 'support_address', value: '123, Fashion Street, Jaipur' },
        { key: 'support_address_desc', value: 'Rajasthan, India - 302001' }
      ];
      const insertSetting = db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)");
      newKeys.forEach(s => insertSetting.run(s.key, s.value));
    }

    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ limit: '50mb', extended: true }));

    // Razorpay Initialization
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret',
    });

    // Auth Middleware
    const authenticateToken = (req: any, res: any, next: any) => {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];
      if (token == null) return res.status(401).json({ error: 'No token provided' });

      jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token' });
        req.user = user;
        next();
      });
    };

    // API Routes
    app.get("/sitemap.xml", (req, res) => {
      try {
        const domain = "https://www.ramshika.com";
        const today = new Date().toISOString().split('T')[0];
        
        // Fetch all categories
        const categories = db.prepare("SELECT name FROM categories").all() as any[];
        // Fetch all products
        const products = db.prepare("SELECT id FROM products").all() as any[];
        // Fetch published blogs
        const blogs = db.prepare("SELECT slug FROM blogs WHERE is_published = 1").all() as any[];
        
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
        
        // Static Pages
        const staticPages = [
          "/",
          "/about",
          "/contact",
          "/policy/shipping",
          "/policy/returns",
          "/policy/privacy",
          "/policy/terms"
        ];
        
        for (const page of staticPages) {
          xml += `  <url>\n    <loc>${domain}${page}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${page === '/' ? '1.0' : '0.8'}</priority>\n  </url>\n`;
        }
        
        // Categories
        for (const cat of categories) {
          if (cat.name) {
             xml += `  <url>\n    <loc>${domain}/category-${encodeURIComponent(cat.name)}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
          }
        }
        
        // Products
        for (const prod of products) {
          xml += `  <url>\n    <loc>${domain}/product/${prod.id}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
        }
        
        // Blogs
        for (const blog of blogs) {
          if (blog.slug) {
            xml += `  <url>\n    <loc>${domain}/blog/${blog.slug}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
          }
        }
        
        xml += `</urlset>`;
        
        res.header('Content-Type', 'application/xml');
        res.send(xml);
      } catch (e) {
        console.error("Sitemap generation error:", e);
        res.status(500).end();
      }
    });

    app.get("/api/health", (req, res) => {
      res.json({ status: "ok", timestamp: new Date().toISOString() });
    });

    app.post("/api/chat", async (req, res) => {
      try {
        const { messages, systemInstruction } = req.body;
        
        if (!messages || messages.length === 0) {
          return res.status(400).json({ error: "No messages provided." });
        }

        const userMessage = messages[messages.length - 1].text;
        const history = messages.slice(0, -1).map((m: any) => ({
          role: m.role,
          parts: [{ text: m.text }]
        }));

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
           const msg = userMessage.toLowerCase();
           let reply = "Namaste! For detailed queries, please contact support@ramshika.com.";
           if (msg.includes("return") || msg.includes("exchange")) reply = "We have a 7-day easy exchange/return policy if the product is in original condition.";
           else if (msg.includes("shipping") || msg.includes("delivery") || msg.includes("track") || msg.includes("reach")) reply = "We offer free delivery on orders over ₹2000! Standard shipping takes 3-5 business days.";
           else if (msg.includes("location") || msg.includes("where") || msg.includes("address")) reply = "We are based in Jaipur, Rajasthan. Let us know if you plan to visit!";
           else if (msg.includes("saree") || msg.includes("silks") || msg.includes("banarasi")) reply = "We specialize in authentic hand-woven Banarasi silk and bridal wear sarees. Please check out our latest collection in the Sarees category!";
           else if (msg.includes("jewel") || msg.includes("kundan") || msg.includes("ring") || msg.includes("bangle")) reply = "Our exquisite artificial jewellery, including fine Kundan sets, are carefully crafted. Have a specific design in mind?";
           else if (msg.includes("price") || msg.includes("cost") || msg.includes("offer") || msg.includes("discount")) reply = "Our prices reflect our authentic craftsmanship, and we offer free shipping above ₹599! Check the product pages for exact pricing.";
           else if (msg.includes("hi") || msg.includes("hello") || msg.includes("hey") || msg.includes("namaste")) reply = "Namaste! Welcome to Ramshika Customer Support. How can I assist you with our beautiful collection today?";
           else reply = "Thank you for reaching out! I'm a basic assistant for now. To assist you better, please email us directly at support@ramshika.com or browse our collections.";

           return res.json({ text: reply });
        }

        const ai = new GoogleGenAI({ apiKey });
        const chat = ai.chats.create({
          model: "gemini-3.0-flash",
          config: {
            systemInstruction: systemInstruction,
          },
          history: history
        });
        
        const result = await chat.sendMessage({ message: userMessage });
        res.json({ text: result.text });
      } catch (error) {
        console.error("Chat API Error:", error);
        res.status(500).json({ error: "Failed to communicate with AI model." });
      }
    });

    // Blog API
    app.get("/api/blogs", (req, res) => {
      const blogs = db.prepare("SELECT * FROM blogs WHERE is_published = 1 ORDER BY created_at DESC").all();
      res.json(blogs);
    });

    app.get("/api/blogs/:slug", (req, res) => {
      const blog = db.prepare("SELECT * FROM blogs WHERE slug = ?").get(req.params.slug);
      if (blog) res.json(blog);
      else res.status(404).json({ error: "Blog post not found" });
    });

    app.post("/api/blogs", authenticateToken, (req: any, res) => {
      if (req.user.role !== 'admin') return res.status(403).json({ error: "Unauthorized" });
      const { title, slug, content, image_url, author, is_published } = req.body;
      const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      try {
        const result = db.prepare(
          "INSERT INTO blogs (title, slug, content, image_url, author, is_published) VALUES (?, ?, ?, ?, ?, ?)"
        ).run(title, finalSlug, content, image_url, author, is_published ? 1 : 0);
        res.json({ success: true, id: result.lastInsertRowid });
      } catch (err) {
        res.status(400).json({ error: "Slug already taken or invalid data" });
      }
    });

    app.put("/api/blogs/:id", authenticateToken, (req: any, res) => {
      if (req.user.role !== 'admin') return res.status(403).json({ error: "Unauthorized" });
      const { title, slug, content, image_url, author, is_published } = req.body;
      const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      try {
        db.prepare(
          "UPDATE blogs SET title = ?, slug = ?, content = ?, image_url = ?, author = ?, is_published = ? WHERE id = ?"
        ).run(title, finalSlug, content, image_url, author, is_published ? 1 : 0, req.params.id);
        res.json({ success: true });
      } catch (err) {
        res.status(400).json({ error: "Failed to update blog" });
      }
    });

    app.delete("/api/blogs/:id", authenticateToken, (req: any, res) => {
      if (req.user.role !== 'admin') return res.status(403).json({ error: "Unauthorized" });
      db.prepare("DELETE FROM blogs WHERE id = ?").run(req.params.id);
      res.json({ success: true });
    });

    // Reviews API
    app.get("/api/products/:id/reviews", (req, res) => {
      const reviews = db.prepare(`
        SELECT r.*, u.name as user_name 
        FROM reviews r 
        JOIN users u ON r.user_id = u.id 
        WHERE r.product_id = ? AND r.is_approved = 1 
        ORDER BY r.created_at DESC
      `).all(req.params.id);
      res.json(reviews);
    });

    app.post("/api/products/:id/reviews", authenticateToken, (req: any, res) => {
      const { rating, comment } = req.body;
      try {
        db.prepare("INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)").run(
          req.params.id, req.user.id, rating, comment
        );
        res.json({ success: true, message: "Review submitted and pending approval" });
      } catch (err) {
        res.status(500).json({ error: "Failed to submit review" });
      }
    });

    app.get("/api/admin/reviews", authenticateToken, (req: any, res) => {
      if (req.user.role !== 'admin') return res.status(403).json({ error: "Unauthorized" });
      const reviews = db.prepare(`
        SELECT r.*, p.name as product_name, u.name as user_name, u.email as user_email 
        FROM reviews r 
        JOIN products p ON r.product_id = p.id 
        JOIN users u ON r.user_id = u.id 
        ORDER BY r.created_at DESC
      `).all();
      res.json(reviews);
    });

    app.put("/api/admin/reviews/:id/approve", authenticateToken, (req: any, res) => {
      if (req.user.role !== 'admin') return res.status(403).json({ error: "Unauthorized" });
      const { is_approved } = req.body;
      try {
        db.prepare("UPDATE reviews SET is_approved = ? WHERE id = ?").run(is_approved ? 1 : 0, req.params.id);
        res.json({ success: true });
      } catch (err) {
        res.status(500).json({ error: "Failed to update review status" });
      }
    });

    app.delete("/api/admin/reviews/:id", authenticateToken, (req: any, res) => {
      if (req.user.role !== 'admin') return res.status(403).json({ error: "Unauthorized" });
      try {
        db.prepare("DELETE FROM reviews WHERE id = ?").run(req.params.id);
        res.json({ success: true });
      } catch (err) {
        res.status(500).json({ error: "Failed to delete review" });
      }
    });

    app.get("/api/products", (req, res) => {
      const category = req.query.category;
      let products: any[];
      if (category) {
        products = db.prepare(`
          SELECT p.*, c.name as category_name 
          FROM products p 
          JOIN categories c ON p.category_id = c.id 
          WHERE c.name = ? OR c.parent_id = (SELECT id FROM categories WHERE name = ?)
        `).all(category, category) as any[];
      } else {
        products = db.prepare("SELECT * FROM products").all() as any[];
      }
      
      const parsedProducts = products.map(p => ({
        ...p,
        additional_images: p.additional_images ? JSON.parse(p.additional_images) : [],
        videos: p.videos ? JSON.parse(p.videos) : [],
        features: p.features ? JSON.parse(p.features) : [],
        tags: p.tags ? JSON.parse(p.tags) : []
      }));
      
      res.json(parsedProducts);
    });

    app.get("/api/products/featured", (req, res) => {
      const products = db.prepare("SELECT * FROM products WHERE is_featured = 1 LIMIT 4").all() as any[];
      const parsedProducts = products.map(p => ({
        ...p,
        additional_images: p.additional_images ? JSON.parse(p.additional_images) : [],
        videos: p.videos ? JSON.parse(p.videos) : [],
        features: p.features ? JSON.parse(p.features) : [],
        tags: p.tags ? JSON.parse(p.tags) : []
      }));
      res.json(parsedProducts);
    });

    app.get("/api/products/:id", (req, res) => {
      const product = db.prepare(`
        SELECT p.*, c.name as category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        WHERE p.id = ?
      `).get(req.params.id) as any;
      if (product) {
        const parsedProduct = {
          ...product,
          additional_images: product.additional_images ? JSON.parse(product.additional_images) : [],
          videos: product.videos ? JSON.parse(product.videos) : [],
          features: product.features ? JSON.parse(product.features) : [],
          tags: product.tags ? JSON.parse(product.tags) : []
        };
        res.json(parsedProduct);
      }
      else res.status(404).json({ error: "Product not found" });
    });

    app.get("/api/categories", (req, res) => {
      const categories = db.prepare("SELECT * FROM categories").all();
      res.json(categories);
    });

    app.post("/api/categories", (req, res) => {
      const { name, parent_id, image_url } = req.body;
      const result = db.prepare("INSERT INTO categories (name, parent_id, image_url) VALUES (?, ?, ?)").run(name, parent_id || null, image_url || null);
      res.json({ id: result.lastInsertRowid });
    });

    app.put("/api/categories/:id", (req, res) => {
      const { name, parent_id, image_url } = req.body;
      db.prepare("UPDATE categories SET name = ?, parent_id = ?, image_url = ? WHERE id = ?").run(name, parent_id || null, image_url || null, req.params.id);
      res.json({ success: true });
    });

    app.delete("/api/categories/:id", (req, res) => {
      db.prepare("UPDATE categories SET parent_id = NULL WHERE parent_id = ?").run(req.params.id);
      db.prepare("DELETE FROM categories WHERE id = ?").run(req.params.id);
      res.json({ success: true });
    });

    app.post("/api/auth/login", (req, res) => {
      const { email, password } = req.body;
      const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
      if (!user) return res.status(400).json({ error: "Invalid credentials" });

      if (bcrypt.compareSync(password, user.password) || password === user.password) {
        // Fallback for non-hashed legacy passwords just in case, though we only have mock users.
        const token = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
      } else {
        res.status(400).json({ error: "Invalid credentials" });
      }
    });

    app.post("/api/auth/register", (req, res) => {
      const { email, password, name } = req.body;
      if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });

      try {
        const hashedPassword = bcrypt.hashSync(password, 10);
        const result = db.prepare("INSERT INTO users (email, password, name) VALUES (?, ?, ?)").run(email, hashedPassword, name);
        const token = jwt.sign({ id: result.lastInsertRowid, email, name, role: 'user' }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: result.lastInsertRowid, name, email, role: 'user' } });
      } catch (e) {
        res.status(400).json({ error: "Email already exists" });
      }
    });

    app.get("/api/auth/me", authenticateToken, (req: any, res) => {
      const user = db.prepare("SELECT id, name, email, role FROM users WHERE id = ?").get(req.user.id) as any;
      if (user) {
        res.json(user);
      } else {
        res.status(404).json({ error: "User not found" });
      }
    });

    app.post("/api/orders", (req, res) => {
      const { userId, items, total, paymentMethod, customerName, customerEmail, customerPhone } = req.body;
      const info = db.prepare(`
        INSERT INTO orders (user_id, total, payment_method, customer_name, customer_email, customer_phone) 
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(userId, total, paymentMethod, customerName, customerEmail, customerPhone);
      const orderId = info.lastInsertRowid;

      const insertItem = db.prepare("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)");
      for (const item of items) {
        insertItem.run(orderId, item.id, item.quantity, item.price);
      }

      res.json({ success: true, orderId });
    });

    app.put("/api/admin/orders/:id", authenticateToken, (req: any, res) => {
      if (req.user.role !== 'admin') return res.status(403).json({ error: "Unauthorized" });
      const { status, tracking_id } = req.body;
      
      try {
        if (status && tracking_id !== undefined) {
          db.prepare("UPDATE orders SET status = ?, tracking_id = ? WHERE id = ?").run(status, tracking_id, req.params.id);
        } else if (status) {
          db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, req.params.id);
        } else if (tracking_id !== undefined) {
          db.prepare("UPDATE orders SET tracking_id = ? WHERE id = ?").run(tracking_id, req.params.id);
        }
        res.json({ success: true });
      } catch (err) {
        res.status(500).json({ error: "Failed to update order" });
      }
    });

    // Wishlist API
    app.get("/api/wishlist", authenticateToken, (req: any, res) => {
      try {
        const wishlists = db.prepare(`
          SELECT w.product_id, p.name, p.price, p.discount_price, p.image_url 
          FROM wishlists w 
          JOIN products p ON w.product_id = p.id 
          WHERE w.user_id = ?
        `).all(req.user.id);
        res.json(wishlists);
      } catch (err) {
        res.status(500).json({ error: "Failed to fetch wishlist" });
      }
    });

    app.post("/api/wishlist", authenticateToken, (req: any, res) => {
      try {
        const { productId } = req.body;
        db.prepare("INSERT OR IGNORE INTO wishlists (user_id, product_id) VALUES (?, ?)").run(req.user.id, productId);
        res.json({ success: true });
      } catch (err) {
        res.status(500).json({ error: "Failed to add to wishlist" });
      }
    });

    app.delete("/api/wishlist/:productId", authenticateToken, (req: any, res) => {
      try {
        db.prepare("DELETE FROM wishlists WHERE user_id = ? AND product_id = ?").run(req.user.id, req.params.productId);
        res.json({ success: true });
      } catch (err) {
        res.status(500).json({ error: "Failed to remove from wishlist" });
      }
    });

    app.get("/api/orders/user/:userId", authenticateToken, (req: any, res) => {
      // Security: ensure users only fetch their own orders (or are admin)
      if (req.user.id !== parseInt(req.params.userId) && req.user.role !== 'admin') {
        return res.status(403).json({ error: "Unauthorized" });
      }
      
      try {
        const orders = db.prepare(`SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`).all(req.params.userId) as any[];
        // Fetch items for each order
        const getItems = db.prepare(`
          SELECT oi.*, p.name as product_name, p.image_url 
          FROM order_items oi 
          JOIN products p ON oi.product_id = p.id 
          WHERE oi.order_id = ?
        `);
        
        const ordersWithItems = orders.map(order => ({
          ...order,
          items: getItems.all(order.id)
        }));
        
        res.json(ordersWithItems);
      } catch (err: any) {
        // Fallback if schema doesn't match perfectly yet
        res.json([]);
      }
    });

    // Razorpay: Create Order
    app.post("/api/payments/create-order", async (req, res) => {
      try {
        const { amount, currency = "INR", receipt } = req.body;
        const options = {
          amount: Math.round(amount * 100), // amount in the smallest currency unit
          currency,
          receipt,
        };

        const order = await razorpay.orders.create(options);
        res.json(order);
      } catch (error) {
        console.error("Razorpay Order Error:", error);
        res.status(500).json({ error: "Failed to create Razorpay order" });
      }
    });

    // Razorpay: Verify Payment
    app.post("/api/payments/verify", async (req, res) => {
      try {
        const { 
          razorpay_order_id, 
          razorpay_payment_id, 
          razorpay_signature,
          orderId, // Internal DB order ID
          userId,
          items,
          total,
          customerName,
          customerEmail,
          customerPhone
        } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
          .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret')
          .update(body.toString())
          .digest("hex");

        if (expectedSignature === razorpay_signature) {
          // Payment verified
          // If orderId was already created (e.g. for COD or pre-payment record)
          if (orderId) {
            db.prepare(`
              UPDATE orders SET 
                status = 'Paid', 
                razorpay_order_id = ?, 
                razorpay_payment_id = ?, 
                razorpay_signature = ? 
              WHERE id = ?
            `).run(razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId);
          } else {
            // Create order now if not already created
            const info = db.prepare(`
              INSERT INTO orders (
                user_id, total, payment_method, status, 
                razorpay_order_id, razorpay_payment_id, razorpay_signature,
                customer_name, customer_email, customer_phone
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
              userId, total, 'Razorpay', 'Paid', 
              razorpay_order_id, razorpay_payment_id, razorpay_signature,
              customerName, customerEmail, customerPhone
            );
            const newOrderId = info.lastInsertRowid;
            
            const insertItem = db.prepare("INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)");
            for (const item of items) {
              insertItem.run(newOrderId, item.id, item.quantity, item.price);
            }
          }
          res.json({ success: true });
        } else {
          res.status(400).json({ error: "Invalid signature" });
        }
      } catch (error) {
        console.error("Verification Error:", error);
        res.status(500).json({ error: "Payment verification failed" });
      }
    });

    app.get("/api/orders/user/:userId", (req, res) => {
      const orders = db.prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC").all(req.params.userId);
      res.json(orders);
    });

    app.get("/api/settings", (req, res) => {
      const settings = db.prepare("SELECT * FROM settings").all();
      const settingsObj = settings.reduce((acc: any, s: any) => {
        acc[s.key] = s.value === 'true' ? true : s.value === 'false' ? false : s.value;
        return acc;
      }, {});
      res.json({ 
        ...settingsObj,
        razorpay_key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder'
      });
    });

    app.put("/api/settings", (req, res) => {
      const settings = req.body;
      const updateSetting = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");
      Object.entries(settings).forEach(([key, value]) => {
        updateSetting.run(key, String(value));
      });
      res.json({ success: true });
    });

    app.get("/api/admin/stats", (req, res) => {
      const totalSales = db.prepare("SELECT SUM(total) as total FROM orders").get() as any;
      const totalOrders = db.prepare("SELECT COUNT(*) as count FROM orders").get() as any;
      const totalProducts = db.prepare("SELECT COUNT(*) as count FROM products").get() as any;
      const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'user'").get() as any;
      res.json({
        sales: totalSales.total || 0,
        orders: totalOrders.count,
        products: totalProducts.count,
        users: totalUsers.count
      });
    });

    app.get("/api/admin/orders", (req, res) => {
      const orders = db.prepare(`
        SELECT o.*, u.name as user_name, u.email as user_email 
        FROM orders o 
        JOIN users u ON o.user_id = u.id 
        ORDER BY o.created_at DESC
      `).all();
      res.json(orders);
    });

    app.put("/api/admin/orders/:id", (req, res) => {
      const { status } = req.body;
      db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, req.params.id);
      res.json({ success: true });
    });

    app.get("/api/admin/users", (req, res) => {
      const users = db.prepare("SELECT id, name, email, role FROM users").all();
      res.json(users);
    });

    app.post("/api/products", (req, res) => {
      const { name, description, price, discount_price, image_url, additional_images, videos, category_id, stock, is_featured, features, tags, image_prompt } = req.body;
      const result = db.prepare(`
        INSERT INTO products (name, description, price, discount_price, image_url, additional_images, videos, category_id, stock, is_featured, features, tags, image_prompt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        name, 
        description, 
        price, 
        discount_price, 
        image_url, 
        JSON.stringify(additional_images || []), 
        JSON.stringify(videos || []), 
        category_id, 
        stock, 
        is_featured ? 1 : 0, 
        JSON.stringify(features || []), 
        JSON.stringify(tags || []), 
        image_prompt
      );
      res.json({ id: result.lastInsertRowid });
    });

    app.put("/api/products/:id", (req, res) => {
      const { name, description, price, discount_price, image_url, additional_images, videos, category_id, stock, is_featured, features, tags, image_prompt } = req.body;
      db.prepare(`
        UPDATE products SET 
          name = ?, description = ?, price = ?, discount_price = ?, image_url = ?, 
          additional_images = ?, videos = ?,
          category_id = ?, stock = ?, is_featured = ?, features = ?, tags = ?, image_prompt = ?
        WHERE id = ?
      `).run(
        name, 
        description, 
        price, 
        discount_price, 
        image_url, 
        JSON.stringify(additional_images || []), 
        JSON.stringify(videos || []), 
        category_id, 
        stock, 
        is_featured ? 1 : 0, 
        JSON.stringify(features || []), 
        JSON.stringify(tags || []), 
        image_prompt, 
        req.params.id
      );
      res.json({ success: true });
    });

    app.delete("/api/products/:id", (req, res) => {
      db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
      res.json({ success: true });
    });

    app.get("/robots.txt", (req, res) => {
      res.type('text/plain');
      res.send("User-agent: *\nAllow: /\nSitemap: https://ramshika.com/sitemap.xml");
    });

    app.get("/sitemap.xml", (req, res) => {
      const products = db.prepare("SELECT id FROM products").all() as any[];
      const categories = db.prepare("SELECT name FROM categories").all() as any[];
      
      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://ramshika.com/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>
  <url><loc>https://ramshika.com/shop</loc><changefreq>daily</changefreq><priority>0.9</priority></url>`;

      categories.forEach(cat => {
        xml += `\n  <url><loc>https://ramshika.com/category/${encodeURIComponent(cat.name)}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`;
      });

      products.forEach(p => {
        xml += `\n  <url><loc>https://ramshika.com/product/${p.id}</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>`;
      });

      xml += `\n</urlset>`;
      res.type('application/xml');
      res.send(xml);
    });

    if (process.env.NODE_ENV !== "production") {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      app.use(express.static(path.join(__dirname, "dist")));
      app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "dist", "index.html"));
      });
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    }).on('error', (err) => {
      console.error("Server failed to start:", err);
    });
  } catch (error) {
    console.error("CRITICAL: Failed to start server:", error);
  }
}

startServer();
