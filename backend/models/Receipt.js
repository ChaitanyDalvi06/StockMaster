const mongoose = require('mongoose');

const receiptSchema = new mongoose.Schema({
  reference: {
    type: String,
    required: false, // Auto-generated if not provided
    unique: true
  },
  supplier: {
    name: {
      type: String,
      required: [true, 'Please provide supplier name']
    },
    contact: String,
    email: String
  },
  warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: false // Made optional for demo
  },
  destination: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: false // Made optional for demo
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    orderedQuantity: {
      type: Number,
      required: true,
      min: 0
    },
    receivedQuantity: {
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
receiptSchema.pre('save', async function(next) {
  if (!this.reference) {
    const count = await this.constructor.countDocuments();
    this.reference = `RCP${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Receipt', receiptSchema);

