const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
  reference: {
    type: String,
    required: false, // Auto-generated if not provided
    unique: true
  },
  sourceLocation: {
    type: String, // Changed to String for easier demo (location name)
    required: false
  },
  destinationLocation: {
    type: String, // Changed to String for easier demo (location name)
    required: false
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    requestedQuantity: {
      type: Number,
      required: true,
      min: 0
    },
    transferredQuantity: {
      type: Number,
      default: 0,
      min: 0
    }
  }],
  status: {
    type: String,
    enum: ['draft', 'waiting', 'ready', 'done', 'cancelled'],
    default: 'draft'
  },
  scheduledDate: {
    type: Date,
    default: Date.now
  },
  completedDate: {
    type: Date
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Auto-generate reference
transferSchema.pre('save', async function(next) {
  if (!this.reference) {
    const count = await this.constructor.countDocuments();
    this.reference = `TRF${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Transfer', transferSchema);

