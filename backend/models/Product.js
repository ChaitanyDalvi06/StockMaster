const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    trim: true
  },
  sku: {
    type: String,
    required: [true, 'Please provide a SKU'],
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String, // Changed to String for easier demo (category name)
    required: false // Made optional for easier demo
  },
  unitOfMeasure: {
    type: String,
    required: [true, 'Please provide a unit of measure'],
    enum: ['pcs', 'kg', 'litre', 'meter', 'box', 'carton', 'dozen'],
    default: 'pcs'
  },
  cost: {
    type: Number,
    required: [true, 'Please provide a cost'],
    min: 0
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: 0
  },
  reorderPoint: {
    type: Number,
    default: 10,
    min: 0
  },
  reorderQuantity: {
    type: Number,
    default: 50,
    min: 0
  },
  leadTime: {
    type: Number,
    default: 7,
    min: 0,
    comment: 'Lead time in days'
  },
  supplier: {
    name: String,
    contact: String,
    email: String
  },
  barcode: {
    type: String,
    trim: true
  },
  image: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // For AI demand forecasting
  salesHistory: [{
    date: Date,
    quantity: Number,
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location'
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total stock across all locations
productSchema.virtual('totalStock', {
  ref: 'StockLevel',
  localField: '_id',
  foreignField: 'product',
  justOne: false
});

// Index for faster searches
productSchema.index({ name: 'text', sku: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);

