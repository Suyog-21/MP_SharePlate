require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const session = require('express-session');
const connectMongoModule = require('connect-mongo');
const MongoStore = connectMongoModule.default || connectMongoModule;
const bcrypt = require('bcryptjs');

const connectMongoDB = require('./db/mongodb');
const User = require('./models/User');

const authRoutes = require('./routes/authRoutes');
const ngoRoutes = require('./routes/ngoRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// CORS configuration for credentials / session cookies
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Session Store
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shareplate_db';

app.use(
  session({
    name: 'shareplate.sid',
    secret: process.env.SESSION_SECRET || 'shareplate_super_secure_session_secret_2026',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: mongoUri,
      collectionName: 'sessions',
      ttl: 14 * 24 * 60 * 60, // 14 days
      autoRemove: 'native',
    }),
    cookie: {
      httpOnly: true,
      secure: false, // set to true if running over HTTPS in production
      sameSite: 'lax',
      maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
    },
  })
);

// MySQL Pool for Food Posts / Donations
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ecorescue_db',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
});

// Seed default Admin and initial accounts
const seedDefaultAccounts = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const hashedAdminPassword = await bcrypt.hash('Admin@12345', 10);
      await User.create({
        name: 'Platform Administrator',
        email: 'admin@shareplate.org',
        password: hashedAdminPassword,
        role: 'admin',
        phone: '+91 9876543210',
        city: 'Mumbai',
        pincode: '400001',
      });
      console.log('✅ Seeded default admin account: admin@shareplate.org / Admin@12345');
    }

    const donorExists = await User.findOne({ email: 'donor@test.com' });
    if (!donorExists) {
      const hashedDonorPassword = await bcrypt.hash('Donor@12345', 10);
      await User.create({
        name: 'The Green Fork Restaurant',
        email: 'donor@test.com',
        password: hashedDonorPassword,
        role: 'donor',
        phone: '+91 9123456780',
        address: '42 Marine Drive, Nariman Point',
        city: 'Mumbai',
        pincode: '400020',
      });
      console.log('✅ Seeded default food donor account: donor@test.com / Donor@12345');
    }
  } catch (error) {
    console.error('Error seeding default accounts:', error.message);
  }
};

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/ngo', ngoRoutes);
app.use('/api/admin', adminRoutes);

// --- MYSQL POSTS ENDPOINTS (Food Donation Feed) ---

app.get('/api/posts', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM posts ORDER BY createdAt DESC`);
    const posts = rows.map((r) => ({
      ...r,
      pickupDeadline: new Date(r.pickupDeadline).toISOString(),
      createdAt: new Date(r.createdAt).toISOString(),
      updatedAt: new Date(r.updatedAt).toISOString(),
    }));
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/posts', async (req, res) => {
  try {
    const { restaurantId, restaurantName, foodType, quantity, pickupDeadline, instructions, location } = req.body;
    const id = Math.random().toString(36).substring(2, 15);
    const deadlineDate = new Date(pickupDeadline).toISOString().slice(0, 19).replace('T', ' ');

    await pool.query(
      `INSERT INTO posts (id, restaurantId, restaurantName, foodType, quantity, pickupDeadline, instructions, lat, lng)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        restaurantId || req.session.userId,
        restaurantName,
        foodType,
        quantity,
        deadlineDate,
        instructions,
        location ? location.lat : 19.076,
        location ? location.lng : 72.877,
      ]
    );

    const [rows] = await pool.query(`SELECT * FROM posts WHERE id = ?`, [id]);
    res.json(rows[0]);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/posts/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, claimedByNgoId } = req.body;

    let query = `UPDATE posts SET status = ?`;
    let params = [status];

    if (claimedByNgoId !== undefined) {
      query += `, claimedByNgoId = ?`;
      params.push(claimedByNgoId);
    }

    query += ` WHERE id = ?`;
    params.push(id);

    await pool.query(query, params);

    // If completed, update statistics in MongoDB for NGO and Donor
    if (status === 'Completed') {
      const [postRow] = await pool.query(
        `SELECT restaurantId, claimedByNgoId, quantity FROM posts WHERE id = ?`,
        [id]
      );
      if (postRow.length > 0) {
        const p = postRow[0];
        if (p.claimedByNgoId) {
          await User.findByIdAndUpdate(p.claimedByNgoId, {
            $inc: { 'stats.pickupsCompleted': 1 },
          });
        }
        if (p.restaurantId) {
          await User.findByIdAndUpdate(p.restaurantId, {
            $inc: { 'stats.totalDonations': p.quantity },
          });
        }
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating post status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Start Server
const PORT = parseInt(process.env.PORT, 10) || 5000;

const startServer = async () => {
  try {
    await connectMongoDB();
    await seedDefaultAccounts();

    app.listen(PORT, () => {
      console.log(`🚀 SharePlate Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer();
