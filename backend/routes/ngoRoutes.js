const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const NGOApplication = require('../models/NGOApplication');
const User = require('../models/User');
const OTP = require('../models/OTP');
const {
  sendNGOApplicationReceived,
  sendNGOActivationOTP,
} = require('../utils/emailService');

// Setup upload storage for NGO verification documents
const uploadDir = path.join(__dirname, '..', 'uploads', 'ngo-documents');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = file.fieldname + '-' + Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
    cb(null, safeName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type (${file.mimetype}). Only PDF, JPEG, and PNG are allowed.`));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB per file
  fileFilter,
});

const documentUpload = upload.fields([
  { name: 'registrationCertificate', maxCount: 1 },
  { name: 'panCard', maxCount: 1 },
  { name: 'addressProof', maxCount: 1 },
  { name: 'darpanProof', maxCount: 1 },
  { name: 'certificate12A_80G', maxCount: 1 },
  { name: 'fcraCertificate', maxCount: 1 },
]);

// Helper to mask email for security (e.g. j***e@domain.com)
const maskEmail = (email) => {
  if (!email || !email.includes('@')) return email;
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `${local[0]}*@${domain}`;
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
};

// 1. Submit NGO Verification Application
router.post('/apply', (req, res) => {
  documentUpload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      const {
        name,
        ngoType,
        yearEstablished,
        registrationNumber,
        darpanId,
        panNumber,
        website,
        officialEmail,
        contactNumber,
        alternateContactNumber,
        address,
        city,
        state,
        pincode,
        repName,
        repDesignation,
        repContact,
        repEmail,
      } = req.body;

      // Validate required text fields
      if (
        !name ||
        !ngoType ||
        !yearEstablished ||
        !registrationNumber ||
        !panNumber ||
        !officialEmail ||
        !contactNumber ||
        !address ||
        !city ||
        !state ||
        !pincode ||
        !repName ||
        !repDesignation ||
        !repContact ||
        !repEmail
      ) {
        return res.status(400).json({ error: 'Please fill in all mandatory organization, contact, and representative fields.' });
      }

      // Validate required documents
      const files = req.files || {};
      if (!files.registrationCertificate || !files.panCard || !files.addressProof) {
        return res.status(400).json({
          error: 'Mandatory documents missing: Registration Certificate, PAN Card, and Address Proof are required.',
        });
      }

      const normalizedEmail = officialEmail.trim().toLowerCase();

      // Check if an existing verified account or pending application exists
      const existingApp = await NGOApplication.findOne({
        officialEmail: normalizedEmail,
        status: { $in: ['PENDING', 'UNDER_REVIEW', 'VERIFIED'] },
      });

      if (existingApp) {
        if (existingApp.status === 'VERIFIED') {
          return res.status(400).json({
            error: 'An NGO with this official email has already been approved. Please activate your account or log in.',
          });
        }
        return res.status(400).json({
          error: `An application from this organization is already currently ${existingApp.status.toLowerCase()}. Ref: ${existingApp.applicationReferenceId}`,
        });
      }

      // Format document records
      const formatDoc = (fileArray) => {
        if (!fileArray || fileArray.length === 0) return null;
        const f = fileArray[0];
        return {
          fileName: f.filename,
          originalName: f.originalname,
          filePath: f.path,
          mimeType: f.mimetype,
          size: f.size,
          uploadedAt: new Date(),
        };
      };

      const documents = {
        registrationCertificate: formatDoc(files.registrationCertificate),
        panCard: formatDoc(files.panCard),
        addressProof: formatDoc(files.addressProof),
        darpanProof: formatDoc(files.darpanProof),
        certificate12A_80G: formatDoc(files.certificate12A_80G),
        fcraCertificate: formatDoc(files.fcraCertificate),
      };

      // Generate unique application reference ID
      const timestampPart = Date.now().toString().slice(-6);
      const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
      const applicationReferenceId = `APP-${timestampPart}-${randomPart}`;

      // Save application with PENDING status
      const application = await NGOApplication.create({
        name: name.trim(),
        ngoType,
        yearEstablished: parseInt(yearEstablished, 10),
        registrationNumber: registrationNumber.trim(),
        darpanId: darpanId ? darpanId.trim() : '',
        panNumber: panNumber.trim().toUpperCase(),
        website: website ? website.trim() : '',
        officialEmail: normalizedEmail,
        contactNumber: contactNumber.trim(),
        alternateContactNumber: alternateContactNumber ? alternateContactNumber.trim() : '',
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        repName: repName.trim(),
        repDesignation: repDesignation.trim(),
        repContact: repContact.trim(),
        repEmail: repEmail.trim().toLowerCase(),
        documents,
        applicationReferenceId,
        status: 'PENDING',
        submissionTimestamp: new Date(),
      });

      // Send confirmation email
      await sendNGOApplicationReceived(normalizedEmail, application.name, applicationReferenceId);

      res.status(201).json({
        success: true,
        applicationReferenceId,
        message:
          'Your NGO verification application has been successfully submitted. Our administration team will manually verify your documents and organization details. The verification process may take 10–15 days. You will receive an email once your application has been reviewed.',
      });
    } catch (error) {
      console.error('Error submitting NGO application:', error);
      res.status(500).json({ error: 'Failed to submit application. Please verify details and try again.' });
    }
  });
});

// 2. Lookup Registration ID & Request OTP for Activation
router.post('/request-activation-otp', async (req, res) => {
  try {
    const { registrationId } = req.body;
    if (!registrationId || !registrationId.trim()) {
      return res.status(400).json({ error: 'NGO Registration ID is required.' });
    }

    const regId = registrationId.trim().toUpperCase();

    // 1. Verify Registration ID exists
    const ngo = await NGOApplication.findOne({ registrationId: regId });
    if (!ngo) {
      return res.status(404).json({ error: 'Invalid Registration ID. Please check the ID received in your approval email.' });
    }

    // 2. Verify associated NGO application has been approved
    if (ngo.status !== 'VERIFIED') {
      return res.status(403).json({ error: `This application is not approved yet (Current status: ${ngo.status}).` });
    }

    // 3. Verify Registration ID has not already been used
    if (ngo.isRegistrationIdUsed) {
      return res.status(400).json({
        error: 'This Registration ID has already been used and activated. Please proceed to the Login page.',
      });
    }

    // 4. Generate OTP for email ownership verification
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // Clear previous activation OTPs for this email
    await OTP.deleteMany({ email: ngo.officialEmail, purpose: 'ngo_activation' });

    await OTP.create({
      email: ngo.officialEmail,
      otp: otpCode,
      purpose: 'ngo_activation',
      expiresAt,
    });

    // Send OTP email
    await sendNGOActivationOTP(ngo.officialEmail, otpCode, ngo.name);

    res.json({
      success: true,
      ngoName: ngo.name,
      registeredEmail: ngo.officialEmail,
      maskedEmail: maskEmail(ngo.officialEmail),
      message: `An activation OTP has been sent to your registered email (${maskEmail(ngo.officialEmail)}).`,
    });
  } catch (error) {
    console.error('Error requesting activation OTP:', error);
    res.status(500).json({ error: 'Failed to process activation request. Please try again.' });
  }
});

// 3. Registration ID-Based Account Activation
router.post('/activate', async (req, res) => {
  try {
    const { registrationId, email, otp, password, confirmPassword } = req.body;

    if (!registrationId || !email || !otp || !password || !confirmPassword) {
      return res.status(400).json({ error: 'All fields (Registration ID, Email, OTP, Password, Confirm Password) are required.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const regId = registrationId.trim().toUpperCase();
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Verify Registration ID exists and status is VERIFIED
    const ngo = await NGOApplication.findOne({ registrationId: regId });
    if (!ngo) {
      return res.status(404).json({ error: 'Registration ID not found.' });
    }

    if (ngo.status !== 'VERIFIED') {
      return res.status(403).json({ error: 'NGO application has not been approved.' });
    }

    // 2. Verify Registration ID has not already been used
    if (ngo.isRegistrationIdUsed) {
      return res.status(400).json({ error: 'This Registration ID has already been activated. Please log in.' });
    }

    // 3. Verify Email matches originally registered email
    if (ngo.officialEmail.toLowerCase() !== normalizedEmail) {
      return res.status(400).json({
        error: 'The provided email address does not match the organization’s officially registered email.',
      });
    }

    // 4. Verify OTP
    const otpRecord = await OTP.findOne({
      email: normalizedEmail,
      otp: otp.trim(),
      purpose: 'ngo_activation',
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid or expired OTP. Please request a new OTP.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Atomically activate: Create user & update NGO application
    // Check if user already exists
    let user = await User.findOne({ email: normalizedEmail });
    if (user) {
      user.password = hashedPassword;
      user.role = 'ngo';
      user.name = ngo.name;
      user.phone = ngo.contactNumber;
      user.address = ngo.address;
      user.city = ngo.city;
      user.pincode = ngo.pincode;
      user.ngoProfileId = ngo._id;
      user.isActive = true;
      await user.save();
    } else {
      user = await User.create({
        name: ngo.name,
        email: normalizedEmail,
        password: hashedPassword,
        role: 'ngo',
        phone: ngo.contactNumber,
        address: ngo.address,
        city: ngo.city,
        pincode: ngo.pincode,
        ngoProfileId: ngo._id,
        isActive: true,
      });
    }

    // Mark registration ID as used atomically
    ngo.isRegistrationIdUsed = true;
    ngo.activationDetails = {
      activatedAt: new Date(),
      userId: user._id,
    };
    await ngo.save();

    // Clean up OTP
    await OTP.deleteMany({ email: normalizedEmail, purpose: 'ngo_activation' });

    // Establish session
    req.session.userId = user._id.toString();
    req.session.userRole = user.role;

    res.json({
      success: true,
      message: 'NGO account activated successfully! You are now logged in.',
      user: user.toClientJSON(),
    });
  } catch (error) {
    console.error('Error activating NGO account:', error);
    res.status(500).json({ error: 'Failed to activate account. Please try again.' });
  }
});

module.exports = router;
