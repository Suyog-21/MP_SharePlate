const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'donor', 'ngo', 'restaurant'],
    default: 'donor',
    required: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    trim: true,
  },
  pincode: {
    type: String,
    trim: true,
  },
  ngoProfileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'NGOApplication',
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  stats: {
    totalDonations: { type: Number, default: 0 },
    reliabilityScore: { type: Number, default: 5.0 },
    pickupsCompleted: { type: Number, default: 0 },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Helper for formatting user for responses (exclude sensitive password)
userSchema.methods.toClientJSON = function () {
  return {
    uid: this._id.toString(),
    _id: this._id.toString(),
    name: this.name,
    email: this.email,
    role: this.role,
    phone: this.phone,
    address: this.address,
    city: this.city,
    pincode: this.pincode,
    ngoProfileId: this.ngoProfileId ? this.ngoProfileId.toString() : null,
    stats: {
      totalDonations: this.stats.totalDonations,
      reliabilityScore: this.stats.reliabilityScore,
      pickupsCompleted: this.stats.pickupsCompleted,
    },
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
