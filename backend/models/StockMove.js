const mongoose = require('mongoose');

const stockMoveSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  sourceLocation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location'
    // Optional - null for incoming receipts
  },
  destinationLocation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location'
    // Optional - null for outgoing deliveries
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  documentType: {
    type: String,
    enum: ['receipt', 'delivery', 'transfer', 'adjustment'],
    required: true
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  documentReference: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'waiting', 'ready', 'done', 'cancelled'],
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

// Index for faster queries
stockMoveSchema.index({ product: 1, date: -1 });
stockMoveSchema.index({ documentType: 1, status: 1 });
stockMoveSchema.index({ date: -1 });

module.exports = mongoose.model('StockMove', stockMoveSchema);

