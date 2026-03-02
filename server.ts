import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
// @ts-ignore
import { db } from "@vercel/postgres";
// @ts-ignore
import { v2 as cloudinary } from "cloudinary";
// @ts-ignore
import multer from "multer";
import { createServer } from "http";
import { Server } from "socket.io";
import session from "express-session";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database setup
const usePostgres = !!process.env.POSTGRES_URL || !!process.env.DATABASE_URL;
if (usePostgres && !process.env.POSTGRES_URL) {
  process.env.POSTGRES_URL = process.env.DATABASE_URL;
}

let sqliteDb: any = null;
const getSqliteDb = async () => {
  if (usePostgres) return null;
  if (sqliteDb) return sqliteDb;
  const Database = (await import("better-sqlite3")).default;
  sqliteDb = new Database("lit_store.db");
  return sqliteDb;
};

// Cloudinary setup
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloudinary_url: process.env.CLOUDINARY_URL
  });
}

const upload = multer({ storage: multer.memoryStorage() });

// DB Wrapper for compatibility
const query = async (text: string, params: any[] = []) => {
  if (usePostgres) {
    // Convert SQLite ? to Postgres $1, $2...
    let i = 1;
    const pgText = text.replace(/\?/g, () => `$${i++}`);
    const result = await db.query(pgText, params);
    return result.rows;
  } else {
    const db = await getSqliteDb();
    const stmt = db.prepare(text);
    if (text.trim().toUpperCase().startsWith("SELECT")) {
      return stmt.all(...params);
    } else {
      const info = stmt.run(...params);
      return info;
    }
  }
};

const getOne = async (text: string, params: any[] = []) => {
  const rows = await query(text, params);
  return rows[0] || null;
};

const getProducts = async () => {
  const products = await query("SELECT * FROM products") as any[];
  return products.map((p: any) => ({ ...p, benefits: JSON.parse(p.benefits) }));
};

const exec = async (text: string) => {
  if (usePostgres) {
    // Split by semicolon and run each (Postgres doesn't like multiple statements in one query usually)
    const statements = text.split(';').filter(s => s.trim());
    for (const s of statements) {
      await db.query(s);
    }
  } else {
    const db = await getSqliteDb();
    db.exec(text);
  }
};

const initDb = async () => {
  const schema = `
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      date TEXT,
      customer_name TEXT,
      customer_phone TEXT,
      customer_email TEXT,
      delivery_method TEXT,
      address TEXT,
      items TEXT,
      subtotal REAL,
      shipping REAL,
      total REAL,
      status TEXT DEFAULT 'Nuevo',
      notes TEXT
    );
    
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS users (
      id ${usePostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${usePostgres ? '' : 'AUTOINCREMENT'},
      email TEXT UNIQUE,
      password TEXT,
      name TEXT,
      role TEXT DEFAULT 'sales',
      status TEXT DEFAULT 'pending'
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT,
      format TEXT,
      specs TEXT,
      category TEXT,
      price REAL,
      image TEXT,
      badge TEXT,
      focus TEXT,
      benefits TEXT,
      usage TEXT,
      ingredients TEXT
    );

    CREATE TABLE IF NOT EXISTS promos (
      id ${usePostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${usePostgres ? '' : 'AUTOINCREMENT'},
      title TEXT,
      description TEXT,
      code TEXT,
      discount TEXT,
      active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      created_at TEXT,
      name TEXT,
      phone TEXT,
      email TEXT,
      source TEXT,
      interest TEXT,
      status TEXT DEFAULT 'Nuevo',
      assigned_to INTEGER
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id ${usePostgres ? 'SERIAL' : 'INTEGER'} PRIMARY KEY ${usePostgres ? '' : 'AUTOINCREMENT'},
      lead_id TEXT,
      order_id TEXT,
      created_at TEXT,
      type TEXT,
      outcome TEXT,
      notes TEXT,
      next_follow_up TEXT,
      user_id INTEGER
    );
  `;
  
  await exec(schema);

  // Migration: Ensure users table has role and status columns
  try {
    if (usePostgres) {
      await query("ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'sales'");
      await query("ALTER TABLE users ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending'");
    } else {
      // SQLite doesn't support ADD COLUMN IF NOT EXISTS easily, but we can try and catch
      try { await query("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'sales'"); } catch (e) {}
      try { await query("ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'pending'"); } catch (e) {}
    }
  } catch (err) {
    console.log("Migration notice (users table):", err);
  }

  // Seed Products if empty
  const countRes = await getOne("SELECT COUNT(*) as count FROM products");
  if (Number(countRes.count) === 0) {
    const initialProducts = [
      {
        id: "aliviah-fem",
        name: "ALIVIAH FEM",
        format: "Cápsulas",
        specs: "60 cápsulas, 550 mg",
        category: "Bienestar femenino",
        price: 35.00,
        image: "https://picsum.photos/seed/aliviah/800/800",
        badge: "Recomendado",
        focus: "Bienestar femenino y balance del ciclo",
        benefits: JSON.stringify(["Relajación", "Equilibrio", "Apoyo mental/emocional", "Descanso reparador", "Reducir tensión", "Calma/armonía"]),
        usage: "Tomar 2 cápsulas al día, preferiblemente con alimentos.",
        ingredients: "Extractos naturales, Vitaminas del complejo B, Magnesio."
      },
      {
        id: "harmonia",
        name: "HARMONIA",
        format: "Polvo",
        specs: "200 g, 20 servicios",
        category: "Relajación y equilibrio",
        price: 42.00,
        image: "https://picsum.photos/seed/harmonia/800/800",
        badge: "Best Seller",
        focus: "Equilibrio emocional, calma, claridad mental, ánimo estable",
        benefits: JSON.stringify(["Relajación", "Bienestar mental/emocional", "Descanso reparador", "Reducir tensión", "Calma/armonía"]),
        usage: "Mezclar una medida (10g) en 200ml de agua o tu bebida favorita.",
        ingredients: "L-Teanina, Ashwagandha, Magnesio, GABA."
      },
      {
        id: "osteofort",
        name: "OSTEOFORT",
        format: "Polvo",
        specs: "350 g, 18 servicios",
        category: "Salud ósea y articulaciones",
        price: 38.00,
        image: "https://picsum.photos/seed/osteofort/800/800",
        badge: "Nuevo",
        focus: "Fortalecer huesos y articulaciones, movilidad",
        benefits: JSON.stringify(["Fortalece huesos/dientes", "Salud ósea largo plazo", "Movilidad", "Resistencia", "Bienestar físico diario"]),
        usage: "Mezclar una medida en agua una vez al día.",
        ingredients: "Calcio, Vitamina D3, Colágeno Hidrolizado, Magnesio."
      },
      {
        id: "resver-plus",
        name: "RESVER PLUS",
        format: "Gotero",
        specs: "50 ml, 25 servicios",
        category: "Antioxidantes y longevidad",
        price: 29.00,
        image: "https://picsum.photos/seed/resver/800/800",
        badge: "Premium",
        focus: "Antioxidantes, resveratrol, salud cardiovascular, longevidad",
        benefits: JSON.stringify(["Antioxidantes", "Combate daño oxidativo", "Rejuvenecimiento celular", "Protección", "Cuidado integral"]),
        usage: "2ml (aprox. 40 gotas) directamente en la boca o en agua.",
        ingredients: "Resveratrol puro, Vitamina E, Extracto de semilla de uva."
      },
      {
        id: "concentra-pro",
        name: "CONCENTRA PRO",
        format: "Polvo",
        specs: "200 g, 20 servicios",
        category: "Mente y enfoque",
        price: 45.00,
        image: "https://picsum.photos/seed/concentra/800/800",
        badge: "Performance",
        focus: "Concentración, enfoque mental, rendimiento físico/mental",
        benefits: JSON.stringify(["Enfoque", "Rendimiento", "Reduce fatiga", "Aporta energía", "Ideal jornadas exigentes"]),
        usage: "Mezclar una medida en agua 30 minutos antes de actividad mental intensa.",
        ingredients: "Cafeína anhidra, L-Tirosina, Bacopa Monnieri, Vitaminas B6/B12."
      },
      {
        id: "aura-verde-detox",
        name: "AURA VERDE DETOX",
        format: "Polvo",
        specs: "350 g, 12 servicios",
        category: "Detox y digestión",
        price: 32.00,
        image: "https://picsum.photos/seed/detox/800/800",
        badge: "Natural",
        focus: "Depuración, digestión, tránsito intestinal, ligereza",
        benefits: JSON.stringify(["Eliminar toxinas", "Digestión/tránsito", "Ligereza/energía", "Hábitos saludables", "Bienestar general"]),
        usage: "Mezclar una medida en ayunas con agua tibia.",
        ingredients: "Espirulina, Chlorella, Fibra de manzana, Probióticos."
      },
      {
        id: "calibrum",
        name: "CALIBRUM",
        format: "Cápsulas",
        specs: "60 cápsulas, 550 mg",
        category: "Definición",
        price: 48.00,
        image: "https://picsum.photos/seed/calibrum/800/800",
        badge: "Control",
        focus: "Definición, control de peso, termogénesis natural, glucosa",
        benefits: JSON.stringify(["Control de peso saludable", "Figura equilibrada", "Complementa alimentación", "Termogénesis", "Regula glucosa"]),
        usage: "Tomar 1 cápsula antes del desayuno y 1 antes de la comida.",
        ingredients: "Extracto de té verde, Garcinia Cambogia, Picolinato de Cromo."
      }
    ];

    for (const p of initialProducts) {
      await query(`
        INSERT INTO products (id, name, format, specs, category, price, image, badge, focus, benefits, usage, ingredients)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [p.id, p.name, p.format, p.specs, p.category, p.price, p.image, p.badge, p.focus, p.benefits, p.usage, p.ingredients]);
    }
  }

  // Seed Promos if empty
  const promoCountRes = await getOne("SELECT COUNT(*) as count FROM promos");
  if (Number(promoCountRes.count) === 0) {
    await query("INSERT INTO promos (title, description, code, discount) VALUES (?, ?, ?, ?)", [
      "Bienvenida LIT",
      "10% de descuento en tu primera compra",
      "LIT10",
      "10%"
    ]);
  }

  // Initial settings
  await query("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO NOTHING", ["whatsapp_number", process.env.NEXT_PUBLIC_WHATSAPP_SALES || process.env.WHATSAPP_SALES || "+59178299604"]);
  // Migration: Update if it's the old default
  await query("UPDATE settings SET value = ? WHERE key = 'whatsapp_number' AND value = '+15557089007'", ["+59178299604"]);
  await query("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO NOTHING", ["currency", process.env.NEXT_PUBLIC_CURRENCY || process.env.CURRENCY || "USD"]);
  await query("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO NOTHING", ["shipping_fee", process.env.NEXT_PUBLIC_SHIPPING_FLAT || process.env.SHIPPING_FLAT || "10"]);
  await query("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT (key) DO NOTHING", ["hero_image", "https://picsum.photos/seed/wellness/1920/1080?grayscale"]);

  // Create default admin if not exists
  const adminEmail = process.env.ADMIN_USER || "admin@lit.com";
  const adminPass = process.env.ADMIN_PASS || "admin123";
  const existingAdmin = await getOne("SELECT * FROM users WHERE email = ?", [adminEmail]);
  if (!existingAdmin) {
    const hashedPassword = bcrypt.hashSync(adminPass, 10);
    await query("INSERT INTO users (email, password, name, role, status) VALUES (?, ?, ?, ?, ?)", [
      adminEmail,
      hashedPassword,
      "Administrador LIT",
      "admin",
      "approved"
    ]);
  }
};

declare module "express-session" {
  interface SessionData {
    userId: number;
    userRole: string;
    userName: string;
  }
}

const app = express();
app.set('trust proxy', 1); // Trust first proxy (Vercel, Nginx, etc.)
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  }
});

// Health check
app.get("/api/health", async (req, res) => {
  let dbStatus = "unknown";
  try {
    await query("SELECT 1");
    dbStatus = "connected";
  } catch (err: any) {
    dbStatus = `error: ${err.message}`;
  }
  
  res.json({ 
    status: "ok", 
    database: usePostgres ? "postgres" : "sqlite",
    dbStatus,
    env: process.env.NODE_ENV,
    vercel: !!process.env.VERCEL
  });
});

// Middleware
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || "lit-secret-key",
  resave: false,
  saveUninitialized: false,
  proxy: true, // Required for secure cookies behind proxy
  cookie: { 
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// DB Initialization Middleware
let dbInitialized = false;
app.use(async (req, res, next) => {
  try {
    if (!dbInitialized) {
      console.log("Initializing database... Mode:", usePostgres ? "Postgres" : "SQLite");
      await initDb();
      dbInitialized = true;
      console.log("Database initialized successfully.");
    }
    next();
  } catch (error: any) {
    console.error("Database initialization error:", error);
    res.status(500).json({ 
      error: "Error de conexión con la base de datos", 
      details: error.message 
    });
  }
});

const PORT = Number(process.env.PORT) || 3000;

// Auth Middleware
const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "No autorizado" });
    }
    next();
  };

  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.session.userId || req.session.userRole !== 'admin') {
      return res.status(403).json({ error: "Prohibido: Se requiere rol de administrador" });
    }
    next();
  };

  // Socket.io connection
  io.on("connection", (socket) => {
    console.log("Client connected to real-time updates");
    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  // Auth Routes
  app.post("/api/auth/signup", async (req, res) => {
    const { email, password, name } = req.body;
    try {
      if (!email || !password || !name) {
        return res.status(400).json({ error: "Todos los campos son obligatorios" });
      }
      const hashedPassword = bcrypt.hashSync(password, 10);
      
      // Check if this is the first user
      const userCountRes = await getOne("SELECT COUNT(*) as count FROM users");
      const isFirstUser = Number(userCountRes.count) === 0;
      
      await query("INSERT INTO users (email, password, name, role, status) VALUES (?, ?, ?, ?, ?)", [
        email, 
        hashedPassword, 
        name, 
        isFirstUser ? 'admin' : 'sales',
        isFirstUser ? 'approved' : 'pending'
      ]);
      
      res.json({ 
        success: true, 
        message: isFirstUser 
          ? "Registro exitoso como administrador. Ya puedes iniciar sesión." 
          : "Registro exitoso. Espera la aprobación del administrador." 
      });
    } catch (error: any) {
      console.error("Signup error:", error);
      if (error.message?.includes("unique constraint") || error.message?.includes("UNIQUE constraint")) {
        return res.status(400).json({ error: "El email ya está registrado" });
      }
      res.status(500).json({ 
        error: "Error interno en el registro", 
        details: error.message 
      });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email y contraseña son requeridos" });
      }
      
      const user: any = await getOne("SELECT * FROM users WHERE email = ?", [email]);
      
      if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ error: "Credenciales inválidas" });
      }

      if (user.status !== 'approved') {
        return res.status(403).json({ error: "Tu cuenta está pendiente de aprobación" });
      }

      if (!req.session) {
        throw new Error("La sesión no está inicializada correctamente");
      }

      req.session.userId = user.id;
      req.session.userRole = user.role;
      req.session.userName = user.name;
      res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Error interno del servidor", details: error.message });
    }
  });

  app.get("/api/auth/me", (req: any, res) => {
    if (!req.session.userId) return res.status(401).json({ error: "No logueado" });
    res.json({ id: req.session.userId, name: req.session.userName, role: req.session.userRole });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  // User Management (Admin only)
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    const users = await query("SELECT id, email, name, role, status FROM users");
    res.json(users);
  });

  app.patch("/api/admin/users/:id/status", requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    await query("UPDATE users SET status = ? WHERE id = ?", [status, id]);
    res.json({ success: true });
  });

  app.patch("/api/admin/users/:id/role", requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    await query("UPDATE users SET role = ? WHERE id = ?", [role, id]);
    res.json({ success: true });
  });

  // Upload API
  app.post("/api/admin/upload", requireAdmin, upload.single("image"), async (req: any, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: "No se subió ninguna imagen" });
      
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: "lit_store"
      });
      
      res.json({ url: result.secure_url });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al subir la imagen" });
    }
  });

  // API routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await getProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Error al obtener productos" });
    }
  });

  app.post("/api/admin/products", requireAdmin, async (req, res) => {
    const p = req.body;
    try {
      await query(`
        INSERT INTO products (id, name, format, specs, category, price, image, badge, focus, benefits, usage, ingredients)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          format = EXCLUDED.format,
          specs = EXCLUDED.specs,
          category = EXCLUDED.category,
          price = EXCLUDED.price,
          image = EXCLUDED.image,
          badge = EXCLUDED.badge,
          focus = EXCLUDED.focus,
          benefits = EXCLUDED.benefits,
          usage = EXCLUDED.usage,
          ingredients = EXCLUDED.ingredients
      `, [p.id, p.name, p.format, p.specs, p.category, p.price, p.image, p.badge, p.focus, JSON.stringify(p.benefits), p.usage, p.ingredients]);
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving product:", error);
      res.status(500).json({ error: "Error al guardar el producto" });
    }
  });

  app.delete("/api/admin/products/:id", requireAdmin, async (req, res) => {
    try {
      await query("DELETE FROM products WHERE id = ?", [req.params.id]);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: "Error al eliminar producto" });
    }
  });

  app.get("/api/promos", async (req, res) => {
    try {
      const promos = await query("SELECT * FROM promos WHERE active = 1");
      res.json(promos);
    } catch (error) {
      console.error("Error fetching promos:", error);
      res.status(500).json({ error: "Error al obtener promociones" });
    }
  });

  app.get("/api/admin/promos", requireAdmin, async (req, res) => {
    try {
      const promos = await query("SELECT * FROM promos");
      res.json(promos);
    } catch (error) {
      console.error("Error fetching admin promos:", error);
      res.status(500).json({ error: "Error al obtener promociones" });
    }
  });

  app.post("/api/admin/promos", requireAdmin, async (req, res) => {
    const { id, title, description, code, discount, active } = req.body;
    try {
      if (id) {
        await query("UPDATE promos SET title = ?, description = ?, code = ?, discount = ?, active = ? WHERE id = ?", 
          [title, description, code, discount, active ? 1 : 0, id]);
      } else {
        await query("INSERT INTO promos (title, description, code, discount, active) VALUES (?, ?, ?, ?, ?)", 
          [title, description, code, discount, active ? 1 : 0]);
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving promo:", error);
      res.status(500).json({ error: "Error al guardar promoción" });
    }
  });

  app.delete("/api/admin/promos/:id", requireAdmin, async (req, res) => {
    try {
      await query("DELETE FROM promos WHERE id = ?", [req.params.id]);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting promo:", error);
      res.status(500).json({ error: "Error al eliminar promoción" });
    }
  });

  app.get("/api/packs", (req, res) => {
    // For now, packs are still hardcoded or could be derived from products
    res.json([
      {
        id: "pack-enfoque",
        name: "Pack Enfoque & Productividad",
        products: ["concentra-pro", "harmonia"],
        price: 75.00,
        image: "https://picsum.photos/seed/pack1/800/800",
        description: "La combinación perfecta para mantener la mente clara y el cuerpo en calma durante tus días más productivos."
      },
      {
        id: "pack-detox",
        name: "Pack Detox & Definición",
        products: ["aura-verde-detox", "calibrum"],
        price: 70.00,
        image: "https://picsum.photos/seed/pack2/800/800",
        description: "Depura tu organismo y potencia tu metabolismo para alcanzar tus objetivos de bienestar físico."
      },
      {
        id: "pack-integral",
        name: "Pack Bienestar Integral",
        products: ["osteofort", "resver-plus"],
        price: 60.00,
        image: "https://picsum.photos/seed/pack3/800/800",
        description: "Protección antioxidante y soporte estructural para una vida activa y longeva."
      }
    ]);
  });

  // Orders API
  app.post("/api/orders", async (req, res) => {
    try {
      const order = req.body;
      
      // Generate Order ID if not provided: LIT-YYYYMMDD-XXXX
      if (!order.id) {
        const now = new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
        const random = Math.floor(1000 + Math.random() * 9000);
        order.id = `LIT-${dateStr}-${random}`;
      }

      await query(`
        INSERT INTO orders (id, date, customer_name, customer_phone, customer_email, delivery_method, address, items, subtotal, shipping, total, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        order.id,
        order.date,
        order.customer_name,
        order.customer_phone,
        order.customer_email || "N/A",
        order.delivery_method,
        order.address || "Retiro en tienda",
        JSON.stringify(order.items),
        order.subtotal,
        order.shipping,
        order.total,
        order.notes || "—"
      ]);
      
      // Emit real-time update
      io.emit("new_order", order);
      
      res.json({ success: true, id: order.id });
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ error: "Error al guardar el pedido" });
    }
  });

  app.get("/api/orders", requireAuth, async (req, res) => {
    try {
      const orders = await query("SELECT * FROM orders ORDER BY date DESC") as any[];
      res.json(orders.map(o => ({ ...o, items: JSON.parse(o.items) })));
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ error: "Error al obtener pedidos" });
    }
  });

  app.get("/api/orders/:id", requireAuth, async (req, res) => {
    try {
      const order: any = await getOne("SELECT * FROM orders WHERE id = ?", [req.params.id]);
      if (!order) return res.status(404).json({ error: "Pedido no encontrado" });
      res.json({ ...order, items: JSON.parse(order.items) });
    } catch (error) {
      console.error("Error fetching order detail:", error);
      res.status(500).json({ error: "Error al obtener detalle del pedido" });
    }
  });

  app.patch("/api/orders/:id/status", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      await query("UPDATE orders SET status = ? WHERE id = ?", [status, id]);
      
      // Log status change
      const created_at = new Date().toISOString();
      await query(`
        INSERT INTO activity_logs (order_id, created_at, type, notes, user_id)
        VALUES (?, ?, ?, ?, ?)
      `, [id, created_at, 'status_change', `Estado cambiado a ${status}`, req.session.userId]);

      // Notify about status change
      io.emit("order_status_updated", { id, status });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ error: "Error al actualizar estado del pedido" });
    }
  });

  app.get("/api/orders/:id/logs", requireAuth, async (req, res) => {
    try {
      const logs = await query("SELECT * FROM activity_logs WHERE order_id = ? ORDER BY created_at DESC", [req.params.id]);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching order logs:", error);
      res.status(500).json({ error: "Error al obtener logs del pedido" });
    }
  });

  app.post("/api/orders/:id/logs", requireAuth, async (req, res) => {
    try {
      const { type, outcome, notes, next_follow_up } = req.body;
      const created_at = new Date().toISOString();
      const user_id = req.session.userId;
      
      await query(`
        INSERT INTO activity_logs (order_id, created_at, type, outcome, notes, next_follow_up, user_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [req.params.id, created_at, type, outcome, notes, next_follow_up, user_id]);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error creating order log:", error);
      res.status(500).json({ error: "Error al crear log del pedido" });
    }
  });

  // Leads API
  app.get("/api/leads", requireAuth, async (req, res) => {
    try {
      const leads = await query("SELECT * FROM leads ORDER BY created_at DESC");
      res.json(leads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ error: "Error al obtener leads" });
    }
  });

  app.post("/api/leads", async (req, res) => {
    try {
      const { name, phone, email, source, interest } = req.body;
      const id = `LEAD-${Date.now()}`;
      const created_at = new Date().toISOString();
      
      await query(`
        INSERT INTO leads (id, created_at, name, phone, email, source, interest)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [id, created_at, name, phone, email, source, interest]);
      
      res.json({ id, success: true });
    } catch (error) {
      console.error("Error creating lead:", error);
      res.status(500).json({ error: "Error al crear lead" });
    }
  });

  app.get("/api/leads/:id", requireAuth, async (req, res) => {
    try {
      const lead = await getOne("SELECT * FROM leads WHERE id = ?", [req.params.id]);
      if (!lead) return res.status(404).json({ error: "Lead no encontrado" });
      res.json(lead);
    } catch (error) {
      console.error("Error fetching lead detail:", error);
      res.status(500).json({ error: "Error al obtener detalle del lead" });
    }
  });

  app.patch("/api/leads/:id", requireAuth, async (req, res) => {
    try {
      const { status, assigned_to } = req.body;
      if (status !== undefined) {
        await query("UPDATE leads SET status = ? WHERE id = ?", [status, req.params.id]);
      }
      if (assigned_to !== undefined) {
        await query("UPDATE leads SET assigned_to = ? WHERE id = ?", [assigned_to, req.params.id]);
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating lead:", error);
      res.status(500).json({ error: "Error al actualizar lead" });
    }
  });

  app.get("/api/leads/:id/logs", requireAuth, async (req, res) => {
    try {
      const logs = await query("SELECT * FROM activity_logs WHERE lead_id = ? ORDER BY created_at DESC", [req.params.id]);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching lead logs:", error);
      res.status(500).json({ error: "Error al obtener logs del lead" });
    }
  });

  app.post("/api/leads/:id/logs", requireAuth, async (req, res) => {
    try {
      const { type, outcome, notes, next_follow_up } = req.body;
      const created_at = new Date().toISOString();
      const user_id = req.session.userId;
      
      await query(`
        INSERT INTO activity_logs (lead_id, created_at, type, outcome, notes, next_follow_up, user_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [req.params.id, created_at, type, outcome, notes, next_follow_up, user_id]);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error creating lead log:", error);
      res.status(500).json({ error: "Error al crear log del lead" });
    }
  });

  // Settings API
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await query("SELECT * FROM settings") as any[];
      const config: any = {};
      settings.forEach((s: any) => config[s.key] = s.value);
      res.json(config);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ error: "Error al obtener configuración" });
    }
  });

  app.post("/api/settings", requireAdmin, async (req, res) => {
    try {
      const { whatsapp_number, shipping_fee, hero_image } = req.body;
      if (whatsapp_number) await query("UPDATE settings SET value = ? WHERE key = 'whatsapp_number'", [whatsapp_number]);
      if (shipping_fee) await query("UPDATE settings SET value = ? WHERE key = 'shipping_fee'", [shipping_fee]);
      if (hero_image) await query("UPDATE settings SET value = ? WHERE key = 'hero_image'", [hero_image]);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(500).json({ error: "Error al actualizar configuración" });
    }
  });

  if (!process.env.VERCEL) {
    (async () => {
      // Vite middleware for development
      if (process.env.NODE_ENV !== "production") {
        const vite = await createViteServer({
          server: { middlewareMode: true },
          appType: "spa",
        });
        app.use(vite.middlewares);
      } else {
        // Only serve static files manually if NOT on Vercel
        app.use(express.static(path.join(__dirname, "dist")));
        app.get("*", (req, res) => {
          res.sendFile(path.join(__dirname, "dist", "index.html"));
        });
      }

      httpServer.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });
    })();
  }

export default app;
