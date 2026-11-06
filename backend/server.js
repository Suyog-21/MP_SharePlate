```javascript
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

const isProduction = process.env.NODE_ENV === 'production';

// --------------------------------------------------
// 1. SERVER CONFIGURATION
// --------------------------------------------------

const PORT = parseInt(process.env.PORT, 10) || 5000;

// Required production configuration
if (isProduction) {
  const requiredVariables = [
    'MONGODB_URI',
    'DB_HOST',
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    'SESSION_SECRET',
    'FRONTEND_URL',
  ];

  const missingVariables = requiredVariables.filter(
    (key) => !process.env[key]
  );

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing production environment variables: ${missingVariables.join(', ')}`
    );
  }
}

const sessionSecret = process.env.SESSION_SECRET ||
  'local_development_secret_change_before_deployment';

// Trust Render's reverse proxy for secure cookies.
if (isProduction) {
  app.set('trust proxy', 1);
}

// --------------------------------------------------
// 2. CORS CONFIGURATION
// --------------------------------------------------

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',

  process.env.FRONTEND_URL,

  ...(process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header (Postman, server-to-server).
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Origin not allowed by CORS'));
    },
    credentials: true,
  })
);

// --------------------------------------------------
// 3. MIDDLEWARE
// --------------------------------------------------

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --------------------------------------------------
// 4. MONGODB SESSION STORE
// --------------------------------------------------

const mongoUri =
  process.env.MONGODB_URI ||
  'mongodb://127.0.0.1:27017/shareplate_db';

app.use(
  session({
    name: 'shareplate.sid',

    secret: sessionSecret,

    resave: false,
    saveUninitialized: false,

    store: MongoStore.create({
      mongoUrl: mongoUri,
      collectionName: 'sessions',
      ttl: 14 * 24 * 60 * 60,
      autoRemove: 'native',
    }),

    cookie: {
      httpOnly: true,

      secure: isProduction,

      sameSite: isProduction ? 'none' : 'lax',

      maxAge: 14 * 24 * 60 * 60 * 1000,
    },
  })
);

// --------------------------------------------------
// 5. MYSQL DATABASE CONNECTION
// --------------------------------------------------

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',

  user: process.env.DB_USER || 'root',

  password: process.env.DB_PASSWORD || '',

  database: process.env.DB_NAME || 'ecorescue_db',

  port: parseInt(process.env.DB_PORT, 10) || 3306,

  waitForConnections: true,

  connectionLimit: 10,

  queueLimit: 0,
});

// --------------------------------------------------
// 6. OPTIONAL ADMIN ACCOUNT SEEDING
// --------------------------------------------------

const seedDefaultAccounts = async () => {
  try {
    // Create an admin only when explicitly configured.
    const adminEmail = process.env.SEED_ADMIN_EMAIL;
    const adminPassword = process.env.SEED_ADMIN_PASSWORD;

    if (adminEmail && adminPassword) {
      const adminExists = await User.findOne({
        role: 'admin',
      });

      if (!adminExists) {
        const hashedAdminPassword = await bcrypt.hash(
          adminPassword,
          12
        );

        await User.create({
          name: 'Platform Administrator',
          email: adminEmail,
          password: hashedAdminPassword,
          role: 'admin',
          phone: process.env.SEED_ADMIN_PHONE || '',
          city: 'Mumbai',
          pincode: '400001',
        });

        console.log('Admin account created successfully.');
      }
    }

    // Default test donor account is intentionally not
    // created automatically in production.

  } catch (error) {
    console.error('Error seeding accounts:', error.message);
    throw error;
  }
};

// --------------------------------------------------
// 7. HEALTH CHECK
// --------------------------------------------------

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SharePlate backend is running',
    environment: process.env.NODE_ENV || 'development',
  });
});

// --------------------------------------------------
// 8. API ROUTES
// --------------------------------------------------

app.use('/api/auth', authRoutes);

app.use('/api/ngo', ngoRoutes);

app.use('/api/admin', adminRoutes);

// --------------------------------------------------
// 9. MYSQL POSTS ENDPOINTS (FOOD DONATION FEED)
// --------------------------------------------------

// Get all food donation posts
app.get('/api/posts', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM posts ORDER BY createdAt DESC'
    );

    const posts = rows.map((r) => ({
      ...r,

      pickupDeadline: r.pickupDeadline
        ? new Date(r.pickupDeadline).toISOString()
        : null,

      createdAt: r.createdAt
        ? new Date(r.createdAt).toISOString()
        : null,

      updatedAt: r.updatedAt
        ? new Date(r.updatedAt).toISOString()
        : null,
    }));

    res.json(posts);

  } catch (error) {
    console.error('Error fetching posts:', error);

    res.status(500).json({
      error: 'Failed to fetch donation posts',
    });
  }
});

// Create a food donation post
app.post('/api/posts', async (req, res) => {
  try {
    const {
      restaurantId,
      restaurantName,
      foodType,
      quantity,
      pickupDeadline,
      instructions,
      location,
    } = req.body;

    if (!restaurantName || !foodType || !quantity || !pickupDeadline) {
      return res.status(400).json({
        error: 'Missing required post fields',
      });
    }

    const id = Math.random().toString(36).substring(2, 15);

    const deadlineDate = new Date(pickupDeadline);

    if (isNaN(deadlineDate.getTime())) {
      return res.status(400).json({
        error: 'Invalid pickup deadline',
      });
    }

    const formattedDeadline = deadlineDate
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');

    await pool.query(
      `INSERT INTO posts
       (id, restaurantId, restaurantName, foodType, quantity,
        pickupDeadline, instructions, lat, lng)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,

      [
        id,
        restaurantId || req.session.userId,
        restaurantName,
        foodType,
        quantity,
        formattedDeadline,
        instructions || '',
        location ? location.lat : 19.076,
        location ? location.lng : 72.877,
      ]
    );

    const [rows] = await pool.query(
      'SELECT * FROM posts WHERE id = ?',
      [id]
    );

    res.status(201).json(rows[0]);

  } catch (error) {
    console.error('Error creating post:', error);

    res.status(500).json({
      error: 'Failed to create donation post',
    });
  }
});

// Update donation post status
app.patch('/api/posts/:id/status', async (req, res) => {
  try {
    const { id } = req.params;

    const { status, claimedByNgoId } = req.body;

    if (!status) {
      return res.status(400).json({
        error: 'Status is required',
      });
    }

    let query = 'UPDATE posts SET status = ?';

    const params = [status];

    if (claimedByNgoId !== undefined) {
      query += ', claimedByNgoId = ?';
      params.push(claimedByNgoId);
    }

    query += ' WHERE id = ?';

    params.push(id);

    const [result] = await pool.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Donation post not found',
      });
    }

    // Update MongoDB statistics when donation is completed.
    if (status === 'Completed') {
      const [postRows] = await pool.query(
        `SELECT restaurantId, claimedByNgoId, quantity
         FROM posts WHERE id = ?`,
        [id]
      );

      if (postRows.length > 0) {
        const post = postRows[0];

        if (post.claimedByNgoId) {
          await User.findByIdAndUpdate(
            post.claimedByNgoId,
            {
              $inc: {
                'stats.pickupsCompleted': 1,
              },
            }
          );
        }

        if (post.restaurantId) {
          await User.findByIdAndUpdate(
            post.restaurantId,
            {
              $inc: {
                'stats.totalDonations': post.quantity,
              },
            }
          );
        }
      }
    }

    res.json({
      success: true,
      message: 'Donation status updated successfully',
    });

  } catch (error) {
    console.error('Error updating post status:', error);

    res.status(500).json({
      error: 'Failed to update donation status',
    });
  }
});

// --------------------------------------------------
// 10. GLOBAL ERROR HANDLER
// --------------------------------------------------

app.use((err, req, res, next) => {
  console.error('Server error:', err.message);

  if (err.message === 'Origin not allowed by CORS') {
    return res.status(403).json({
      error: 'Origin not allowed',
    });
  }

  res.status(500).json({
    error: 'Internal server error',
  });
});

// --------------------------------------------------
// 11. START SERVER
// --------------------------------------------------

const startServer = async () => {
  try {
    console.log('Connecting to MongoDB...');

    await connectMongoDB();

    console.log('MongoDB connected successfully.');

    console.log('Checking MySQL connection...');

    await pool.query('SELECT 1');

    console.log('MySQL connected successfully.');

    await seedDefaultAccounts();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`SharePlate backend running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

  } catch (error) {
    console.error('Failed to start SharePlate backend:', error);

    process.exit(1);
  }
};

startServer();
```
