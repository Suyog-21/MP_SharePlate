require('dotenv').config();
const mysql = require('mysql2/promise');

async function initializeDatabase() {
  try {
    console.log('Connecting to MySQL...');
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306,
    });

    console.log('Creating database if it does not exist...');
    await connection.query(`CREATE DATABASE IF NOT EXISTS ecorescue_db;`);
    
    // Switch to database
    await connection.query(`USE ecorescue_db;`);

    console.log('Creating posts table (without foreign keys to decouple from MySQL users table)...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id VARCHAR(255) PRIMARY KEY,
        restaurantId VARCHAR(255) NOT NULL,
        restaurantName VARCHAR(255) NOT NULL,
        foodType VARCHAR(255) NOT NULL,
        quantity INT NOT NULL,
        pickupDeadline DATETIME NOT NULL,
        instructions TEXT,
        lat FLOAT NOT NULL,
        lng FLOAT NOT NULL,
        status ENUM('Available', 'Claimed', 'Picked Up', 'Completed', 'Expired') DEFAULT 'Available',
        claimedByNgoId VARCHAR(255) DEFAULT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_restaurant (restaurantId),
        INDEX idx_claimedByNgo (claimedByNgoId),
        INDEX idx_status (status)
      );
    `);

    console.log('MySQL posts table initialized successfully!');
    await connection.end();
  } catch (error) {
    console.error('Error initializing MySQL database:', error);
  }
}

initializeDatabase();
