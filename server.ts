console.log("Server script started...");
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import Razorpay from "razorpay";
import crypto from "crypto";
import { products as seedProducts } from "./src/data/products";

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
    `);

    // Seed Admin User
    const adminCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get() as { count: number };
    if (adminCount.count === 0) {
      db.prepare("INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)").run(
        'admin@ramshika.com',
        'admin123',
        'Ramshika Admin',
        'admin'
      );
    }

    // Seed Categories
    const catCount = db.prepare("SELECT COUNT(*) as count FROM categories").get() as { count: number };
    
    try { db.exec("ALTER TABLE categories ADD COLUMN image_url TEXT"); } catch (e) {}

    if (catCount.count === 0) {
      const insertCat = db.prepare("INSERT INTO categories (name, parent_id, image_url) VALUES (?, ?, ?)");
      insertCat.run("Sarees", null, "https://images.unsplash.com/photo-1610030469668-935142b96fe4?auto=format&fit=crop&w=400&q=80");
      insertCat.run("Artificial Jewellery", null, "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=400&q=80");
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
        if (p.category.includes('Jewellery')) {
          const jewelleryImages = [
            'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'
          ];
          const jewelleryUrl = jewelleryImages[index % jewelleryImages.length];
          insertProd.run(
            p.name,
            p.description,
            p.price,
            p.discountPrice,
            jewelleryUrl,
            catId,
            index < 8 ? 1 : 0,
            50,
            JSON.stringify(p.features),
            JSON.stringify(p.tags),
            p.imagePrompt
          );
        } else {
          const sareeImages = [
            'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1610030469668-935142b96fe4?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80'
          ];
          const sareeUrl = sareeImages[index % sareeImages.length];
          insertProd.run(
            p.name,
            p.description,
            p.price,
            p.discountPrice,
            sareeUrl,
            catId,
            index < 8 ? 1 : 0,
            50,
            JSON.stringify(p.features),
            JSON.stringify(p.tags),
            p.imagePrompt
          );
        }
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
        ]) }
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
        ]) }
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

    // API Routes
    app.get("/api/health", (req, res) => {
      res.json({ status: "ok", timestamp: new Date().toISOString() });
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
      const product = db.prepare("SELECT * FROM products WHERE id = ?").get(req.params.id) as any;
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
      const user = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password) as any;
      if (user) {
        res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    });

    app.post("/api/auth/register", (req, res) => {
      const { email, password, name } = req.body;
      try {
        const result = db.prepare("INSERT INTO users (email, password, name) VALUES (?, ?, ?)").run(email, password, name);
        res.json({ id: result.lastInsertRowid, name, email, role: 'user' });
      } catch (e) {
        res.status(400).json({ error: "Email already exists" });
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
