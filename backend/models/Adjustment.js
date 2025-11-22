const mongoose = require('mongoose');

const adjustmentSchema = new mongoose.Schema({
  reference: {
    type: String,
    required: false, // Auto-generated if not provided
    unique: true
  },
  location: {
    type: String, // Changed to String for easier demo (location name)
    required: false
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    systemQuantity: {
      type: Number,
      required: true,
      min: 0
    },
    countedQuantity: {
      type: Number,
      required: true,
      min: 0
    },
    difference: {
      type: Number,
      required: true
    }
  }],
  reason: {
    type: String,
    enum: ['physical_inventory', 'damage', 'theft', 'expiry', 'other'],
    default: 'physical_inventory'
  },
  status: {
    type: String,
    enum: ['draft', 'done', 'cancelled'],
    default: 'draft'
  },
  date: {
    type: Date,
    default: Date.now
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
adjustmentSchema.pre('save', async function(next) {
  if (!this.reference) {
    const count = await this.constructor.countDocuments();
    this.reference = `ADJ${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Calculate difference before saving
adjustmentSchema.pre('save', function(next) {
  this.products.forEach(item => {
    item.difference = item.countedQuantity - item.systemQuantity;
  });
  next();
});

module.exports = mongoose.model('Adjustment', adjustmentSchema);

