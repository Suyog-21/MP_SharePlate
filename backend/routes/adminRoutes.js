const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const NGOApplication = require('../models/NGOApplication');
const { isAuthenticated, requireRole } = require('../middleware/auth');
const { sendNGOApprovalEmail, sendNGORejectionEmail } = require('../utils/emailService');

// All routes here require authenticated Admin
router.use(isAuthenticated, requireRole('admin'));

// Helper to generate a secure, random, unpredictable Registration ID
// Example output: NGO-REG-A9F4-37B2-C8D1
const generateSecureRegistrationId = () => {
  const bytes = crypto.randomBytes(6).toString('hex').toUpperCase();
  return `NGO-REG-${bytes.slice(0, 4)}-${bytes.slice(4, 8)}-${bytes.slice(8, 12)}`;
};

// 1. Get Applications with filtering and summary counts
router.get('/ngo/applications', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && status !== 'ALL') {
      filter.status = status.toUpperCase();
    }

    const applications = await NGOApplication.find(filter)
      .sort({ submissionTimestamp: -1 })
      .populate('approvalDetails.approvedBy', 'name email')
      .populate('rejectionDetails.rejectedBy', 'name email');

    // Summary counts
    const counts = {
      ALL: await NGOApplication.countDocuments(),
      PENDING: await NGOApplication.countDocuments({ status: 'PENDING' }),
      UNDER_REVIEW: await NGOApplication.countDocuments({ status: 'UNDER_REVIEW' }),
      VERIFIED: await NGOApplication.countDocuments({ status: 'VERIFIED' }),
      REJECTED: await NGOApplication.countDocuments({ status: 'REJECTED' }),
    };

    res.json({
      applications,
      counts,
    });
  } catch (error) {
    console.error('Error fetching NGO applications:', error);
    res.status(500).json({ error: 'Failed to retrieve NGO applications.' });
  }
});

// 2. Get Single Application Details
router.get('/ngo/applications/:id', async (req, res) => {
  try {
    const application = await NGOApplication.findById(req.params.id)
      .populate('approvalDetails.approvedBy', 'name email')
      .populate('rejectionDetails.rejectedBy', 'name email')
      .populate('activationDetails.userId', 'name email');

    if (!application) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    res.json(application);
  } catch (error) {
    console.error('Error fetching NGO application details:', error);
    res.status(500).json({ error: 'Failed to retrieve application details.' });
  }
});

// 3. Mark Application as UNDER_REVIEW
router.patch('/ngo/applications/:id/under-review', async (req, res) => {
  try {
    const application = await NGOApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    if (application.status === 'VERIFIED') {
      return res.status(400).json({ error: 'Cannot change status of an already verified application.' });
    }

    application.status = 'UNDER_REVIEW';
    await application.save();

    res.json({
      success: true,
      message: 'Application marked as UNDER_REVIEW.',
      application,
    });
  } catch (error) {
    console.error('Error marking under review:', error);
    res.status(500).json({ error: 'Failed to update application status.' });
  }
});

// 4. Approve NGO Application
router.post('/ngo/applications/:id/approve', async (req, res) => {
  try {
    const application = await NGOApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    if (application.status === 'VERIFIED') {
      return res.status(400).json({
        error: `Application is already approved. Registration ID: ${application.registrationId}`,
      });
    }

    // Generate unique, unpredictable registration ID
    let registrationId = generateSecureRegistrationId();
    // Ensure uniqueness
    let exists = await NGOApplication.findOne({ registrationId });
    while (exists) {
      registrationId = generateSecureRegistrationId();
      exists = await NGOApplication.findOne({ registrationId });
    }

    // Update application
    application.status = 'VERIFIED';
    application.registrationId = registrationId;
    application.isRegistrationIdUsed = false;
    application.approvalDetails = {
      approvedBy: req.currentUser._id,
      approvedAt: new Date(),
    };

    await application.save();

    // Send approval email with Registration ID and activation instructions
    await sendNGOApprovalEmail(application.officialEmail, application.name, registrationId);

    res.json({
      success: true,
      message: `NGO Application approved successfully. Registration ID ${registrationId} generated and emailed to ${application.officialEmail}.`,
      application,
    });
  } catch (error) {
    console.error('Error approving NGO application:', error);
    res.status(500).json({ error: 'Failed to approve application.' });
  }
});

// 5. Reject NGO Application
router.post('/ngo/applications/:id/reject', async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ error: 'A specific rejection reason is required.' });
    }

    const application = await NGOApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found.' });
    }

    if (application.status === 'VERIFIED' && application.isRegistrationIdUsed) {
      return res.status(400).json({ error: 'Cannot reject an activated NGO organization.' });
    }

    application.status = 'REJECTED';
    application.rejectionDetails = {
      rejectedBy: req.currentUser._id,
      rejectedAt: new Date(),
      reason: reason.trim(),
    };

    await application.save();

    // Send rejection email with reason
    await sendNGORejectionEmail(application.officialEmail, application.name, reason.trim());

    res.json({
      success: true,
      message: `Application marked as REJECTED and notification sent to ${application.officialEmail}.`,
      application,
    });
  } catch (error) {
    console.error('Error rejecting NGO application:', error);
    res.status(500).json({ error: 'Failed to reject application.' });
  }
});

// 6. Secure Document Download / Viewer Endpoint
router.get('/documents/:filename', (req, res) => {
  try {
    const safeFilename = path.basename(req.params.filename);
    const filePath = path.join(__dirname, '..', 'uploads', 'ngo-documents', safeFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Requested document not found on server.' });
    }

    res.sendFile(filePath);
  } catch (error) {
    console.error('Error serving document:', error);
    res.status(500).json({ error: 'Failed to access document.' });
  }
});

module.exports = router;
