const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a location name'],
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Please provide a location code'],
    unique: true,
    uppercase: true,
    trim: true
  },
  warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Warehouse',
    required: [true, 'Please provide a warehouse']
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    default: null
  },
  type: {
    type: String,
    enum: ['warehouse', 'zone', 'rack', 'shelf', 'bin'],
    required: true
  },
  capacity: {
    type: Number,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index for warehouse and name
locationSchema.index({ warehouse: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Location', locationSchema);

