const mongoose = require('mongoose');

const stockLevelSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  reserved: {
    type: Number,
    default: 0,
    min: 0,
    comment: 'Quantity reserved for pending operations'
  },
  available: {
    type: Number,
    default: 0,
    min: 0,
    comment: 'Available quantity = quantity - reserved'
  }
}, {
  timestamps: true
});

// Compound unique index
stockLevelSchema.index({ product: 1, location: 1 }, { unique: true });

// Update available quantity before saving
stockLevelSchema.pre('save', function(next) {
  this.available = this.quantity - this.reserved;
  next();
});

module.exports = mongoose.model('StockLevel', stockLevelSchema);

