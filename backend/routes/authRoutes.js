const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const NGOApplication = require('../models/NGOApplication');
const OTP = require('../models/OTP');
const { sendDonorRegistrationOTP } = require('../utils/emailService');
const { isAuthenticated } = require('../middleware/auth');

// Simple rate limiter for auth / OTP endpoints to prevent brute force
const attemptTracker = new Map();
const checkRateLimit = (key, maxAttempts = 5, windowMs = 60000) => {
  const now = Date.now();
  const record = attemptTracker.get(key) || { count: 0, resetTime: now + windowMs };
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
    attemptTracker.set(key, record);
    return true;
  }
  if (record.count >= maxAttempts) {
    return false;
  }
  record.count += 1;
  attemptTracker.set(key, record);
  return true;
};

// 1. Send OTP for Donor Registration
router.post('/send-donor-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check rate limit by email/IP
    if (!checkRateLimit(`otp:${normalizedEmail}`, 4, 60000)) {
      return res.status(429).json({ error: 'Too many OTP requests. Please wait a minute before retrying.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists. Please log in.' });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any previous unused OTP for this email & purpose
    await OTP.deleteMany({ email: normalizedEmail, purpose: 'donor_registration' });

    // Store new OTP
    await OTP.create({
      email: normalizedEmail,
      otp: otpCode,
      purpose: 'donor_registration',
      expiresAt,
    });

    // Send email
    await sendDonorRegistrationOTP(normalizedEmail, otpCode);

    res.json({
      success: true,
      message: `OTP sent successfully to ${normalizedEmail}`,
    });
  } catch (error) {
    console.error('Error sending donor OTP:', error);
    res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
  }
});

// 2. Register Food Donor
router.post('/register-donor', async (req, res) => {
  try {
    const { name, email, otp, phone, password, address, city, pincode } = req.body;

    if (!name || !email || !otp || !phone || !password || !address || !city || !pincode) {
      return res.status(400).json({ error: 'All fields are mandatory for food donor registration.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // Verify OTP
    const otpRecord = await OTP.findOne({
      email: normalizedEmail,
      otp: otp.trim(),
      purpose: 'donor_registration',
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid or expired OTP. Please request a new OTP.' });
    }

    // Check if email already registered
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ error: 'This email is already registered.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in MongoDB
    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'donor',
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      pincode: pincode.trim(),
    });

    // Delete used OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    // Establish session
    req.session.userId = newUser._id.toString();
    req.session.userRole = newUser.role;

    res.status(201).json(newUser.toClientJSON());
  } catch (error) {
    console.error('Error registering donor:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'This email is already registered.' });
    }
    res.status(500).json({ error: 'Failed to complete registration. Please try again.' });
  }
});

// 3. Login (Email + Password, auto role detection)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check rate limit on login attempts
    if (!checkRateLimit(`login:${normalizedEmail}`, 10, 60000)) {
      return res.status(429).json({ error: 'Too many login attempts. Please try again after a minute.' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Your account has been deactivated. Please contact support.' });
    }

    // NGO specific verification check
    if (user.role === 'ngo') {
      if (user.ngoProfileId) {
        const ngoProfile = await NGOApplication.findById(user.ngoProfileId);
        if (!ngoProfile || ngoProfile.status !== 'VERIFIED') {
          return res.status(403).json({
            error: 'Your NGO application is not in VERIFIED status. Only approved NGOs can access the portal.',
          });
        }
      } else {
        // Find NGO by officialEmail
        const ngoProfile = await NGOApplication.findOne({ officialEmail: normalizedEmail });
        if (!ngoProfile || ngoProfile.status !== 'VERIFIED') {
          return res.status(403).json({
            error: 'Your NGO application is not verified yet. Verification may take 10-15 days.',
          });
        }
      }
    }

    // Set session in MongoDB store
    req.session.userId = user._id.toString();
    req.session.userRole = user.role;

    res.json(user.toClientJSON());
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// 4. Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ error: 'Failed to log out.' });
    }
    res.clearCookie('connect.sid');
    res.json({ success: true, message: 'Logged out successfully.' });
  });
});

// 5. Current Authenticated User (Session verification)
router.get('/me', async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.json({ user: null });
    }

    const user = await User.findById(req.session.userId);
    if (!user || !user.isActive) {
      req.session.destroy(() => {});
      return res.json({ user: null });
    }

    res.json({ user: user.toClientJSON() });
  } catch (error) {
    console.error('Error in /me:', error);
    res.status(500).json({ error: 'Failed to retrieve user session.' });
  }
});

module.exports = router;
