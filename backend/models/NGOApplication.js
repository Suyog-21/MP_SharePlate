const mongoose = require('mongoose');

const documentFileSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  originalName: { type: String, required: true },
  filePath: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  uploadedAt: { type: Date, default: Date.now },
}, { _id: false });

const ngoApplicationSchema = new mongoose.Schema({
  // Organization details
  name: {
    type: String,
    required: true,
    trim: true,
  },
  ngoType: {
    type: String,
    enum: ['Trust', 'Society', 'Section 8 Company', 'Other'],
    required: true,
  },
  yearEstablished: {
    type: Number,
    required: true,
  },
  registrationNumber: {
    type: String,
    required: true,
    trim: true,
  },
  darpanId: {
    type: String,
    trim: true,
    default: '',
  },
  panNumber: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
  },
  website: {
    type: String,
    trim: true,
    default: '',
  },

  // Contact details
  officialEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  contactNumber: {
    type: String,
    required: true,
    trim: true,
  },
  alternateContactNumber: {
    type: String,
    trim: true,
    default: '',
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  pincode: {
    type: String,
    required: true,
    trim: true,
  },

  // Authorized representative
  repName: {
    type: String,
    required: true,
    trim: true,
  },
  repDesignation: {
    type: String,
    required: true,
    trim: true,
  },
  repContact: {
    type: String,
    required: true,
    trim: true,
  },
  repEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },

  // Documents
  documents: {
    registrationCertificate: { type: documentFileSchema, required: true },
    panCard: { type: documentFileSchema, required: true },
    addressProof: { type: documentFileSchema, required: true },
    darpanProof: { type: documentFileSchema, default: null },
    certificate12A_80G: { type: documentFileSchema, default: null },
    fcraCertificate: { type: documentFileSchema, default: null },
  },

  // Application & Verification state
  applicationReferenceId: {
    type: String,
    unique: true,
    required: true,
  },
  status: {
    type: String,
    enum: ['PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED'],
    default: 'PENDING',
  },
  submissionTimestamp: {
    type: Date,
    default: Date.now,
  },

  // Registration ID generation & account activation
  registrationId: {
    type: String,
    unique: true,
    sparse: true,
  },
  isRegistrationIdUsed: {
    type: Boolean,
    default: false,
  },

  // Approver / Rejector audit
  approvalDetails: {
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
  },
  rejectionDetails: {
    rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rejectedAt: { type: Date },
    reason: { type: String, trim: true },
  },
  activationDetails: {
    activatedAt: { type: Date },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
});

ngoApplicationSchema.index({ status: 1 });
ngoApplicationSchema.index({ officialEmail: 1 });

module.exports = mongoose.model('NGOApplication', ngoApplicationSchema);
