const Receipt = require('../models/Receipt');
const Delivery = require('../models/Delivery');
const Transfer = require('../models/Transfer');
const Adjustment = require('../models/Adjustment');
const StockMove = require('../models/StockMove');
const StockLevel = require('../models/StockLevel');
const Product = require('../models/Product');

// Helper function to update stock levels
const updateStockLevel = async (productId, locationId, quantity, operation) => {
  let stockLevel = await StockLevel.findOne({
    product: productId,
    location: locationId
  });

  if (!stockLevel) {
    if (quantity < 0) {
      throw new Error('Insufficient stock');
    }
    stockLevel = new StockLevel({
      product: productId,
      location: locationId,
      quantity: 0
    });
  }

  if (operation === 'add') {
    stockLevel.quantity += quantity;
  } else if (operation === 'subtract') {
    if (stockLevel.quantity < quantity) {
      throw new Error('Insufficient stock');
    }
    stockLevel.quantity -= quantity;
  } else if (operation === 'set') {
    stockLevel.quantity = quantity;
  }

  stockLevel.available = stockLevel.quantity - stockLevel.reserved;
  await stockLevel.save();

  return stockLevel;
};

// RECEIPT OPERATIONS

// @desc    Get all receipts
// @route   GET /api/operations/receipts
// @access  Private
exports.getReceipts = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let query = {};
    if (status) {
      query.status = status;
    }

    const receipts = await Receipt.find(query)
      .populate('warehouse', 'name code')
      .populate('destination', 'name code')
      .populate('products.product', 'name sku')
      .populate('user', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Receipt.countDocuments(query);

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      receipts
    });
  } catch (error) {
    console.error('Get receipts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching receipts'
    });
  }
};

// @desc    Create receipt
// @route   POST /api/operations/receipts
// @access  Private
exports.createReceipt = async (req, res) => {
  try {
    const { supplier, warehouse, destination, products, scheduledDate, notes } = req.body;

    const receipt = await Receipt.create({
      supplier,
      warehouse,
      destination,
      products,
      scheduledDate,
      notes,
      user: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Receipt created successfully',
      receipt
    });
  } catch (error) {
    console.error('Create receipt error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating receipt'
    });
  }
};

// @desc    Validate/Complete receipt
// @route   PUT /api/operations/receipts/:id/validate
// @access  Private
exports.validateReceipt = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'Receipt not found'
      });
    }

    if (receipt.status === 'done') {
      return res.status(400).json({
        success: false,
        message: 'Receipt already validated'
      });
    }

    // Update received quantities if provided
    if (req.body.products) {
      receipt.products = req.body.products;
    }

    // Update stock levels and create stock moves
    for (const item of receipt.products) {
      // Update product stock directly
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.receivedQuantity;
        await product.save();
      }

      // If location tracking is enabled, update stock level
      if (receipt.destination) {
        await updateStockLevel(
          item.product,
          receipt.destination,
          item.receivedQuantity,
          'add'
        );
      }

      // Create stock move
      await StockMove.create({
        product: item.product,
        destinationLocation: receipt.destination,
        quantity: item.receivedQuantity,
        documentType: 'receipt',
        documentId: receipt._id,
        documentReference: receipt.reference,
        status: 'done',
        user: req.user.id
      });
    }

    receipt.status = 'done';
    receipt.completedDate = new Date();
    await receipt.save();

    res.status(200).json({
      success: true,
      message: 'Receipt validated successfully',
      receipt
    });
  } catch (error) {
    console.error('Validate receipt error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error validating receipt'
    });
  }
};

// DELIVERY OPERATIONS

// @desc    Get all deliveries
// @route   GET /api/operations/deliveries
// @access  Private
exports.getDeliveries = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let query = {};
    if (status) {
      query.status = status;
    }

    const deliveries = await Delivery.find(query)
      .populate('warehouse', 'name code')
      .populate('source', 'name code')
      .populate('products.product', 'name sku')
      .populate('user', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Delivery.countDocuments(query);

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      deliveries
    });
  } catch (error) {
    console.error('Get deliveries error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching deliveries'
    });
  }
};

// @desc    Create delivery
// @route   POST /api/operations/deliveries
// @access  Private
exports.createDelivery = async (req, res) => {
  try {
    const { customer, warehouse, source, products, scheduledDate, notes } = req.body;

    const delivery = await Delivery.create({
      customer,
      warehouse,
      source,
      products,
      scheduledDate,
      notes,
      user: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Delivery created successfully',
      delivery
    });
  } catch (error) {
    console.error('Create delivery error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating delivery'
    });
  }
};

// @desc    Validate/Complete delivery
// @route   PUT /api/operations/deliveries/:id/validate
// @access  Private
exports.validateDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id);

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'Delivery not found'
      });
    }

    if (delivery.status === 'done') {
      return res.status(400).json({
        success: false,
        message: 'Delivery already validated'
      });
    }

    // Update delivered quantities if provided
    if (req.body.products) {
      delivery.products = req.body.products;
    }

    // Update stock levels and create stock moves
    for (const item of delivery.products) {
      // Update product stock directly
      const product = await Product.findById(item.product);
      if (product) {
        product.stock -= item.deliveredQuantity;
        await product.save();
      }

      // If location tracking is enabled, update stock level
      if (delivery.source) {
        await updateStockLevel(
          item.product,
          delivery.source,
          item.deliveredQuantity,
          'subtract'
        );
      }

      // Create stock move
      await StockMove.create({
        product: item.product,
        sourceLocation: delivery.source,
        destinationLocation: null, // External delivery
        quantity: item.deliveredQuantity,
        documentType: 'delivery',
        documentId: delivery._id,
        documentReference: delivery.reference,
        status: 'done',
        user: req.user.id
      });
    }

    delivery.status = 'done';
    delivery.completedDate = new Date();
    await delivery.save();

    res.status(200).json({
      success: true,
      message: 'Delivery validated successfully',
      delivery
    });
  } catch (error) {
    console.error('Validate delivery error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error validating delivery'
    });
  }
};

// TRANSFER OPERATIONS

// @desc    Get all transfers
// @route   GET /api/operations/transfers
// @access  Private
exports.getTransfers = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let query = {};
    if (status) {
      query.status = status;
    }

    const transfers = await Transfer.find(query)
      .populate('sourceLocation', 'name code warehouse')
      .populate('destinationLocation', 'name code warehouse')
      .populate('products.product', 'name sku')
      .populate('user', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Transfer.countDocuments(query);

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      transfers
    });
  } catch (error) {
    console.error('Get transfers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transfers'
    });
  }
};

// @desc    Create transfer
// @route   POST /api/operations/transfers
// @access  Private
exports.createTransfer = async (req, res) => {
  try {
    const { sourceLocation, destinationLocation, products, scheduledDate, notes } = req.body;

    if (sourceLocation === destinationLocation) {
      return res.status(400).json({
        success: false,
        message: 'Source and destination locations cannot be the same'
      });
    }

    const transfer = await Transfer.create({
      sourceLocation,
      destinationLocation,
      products,
      scheduledDate,
      notes,
      user: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Transfer created successfully',
      transfer
    });
  } catch (error) {
    console.error('Create transfer error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating transfer'
    });
  }
};

// @desc    Validate/Complete transfer
// @route   PUT /api/operations/transfers/:id/validate
// @access  Private
exports.validateTransfer = async (req, res) => {
  try {
    const transfer = await Transfer.findById(req.params.id);

    if (!transfer) {
      return res.status(404).json({
        success: false,
        message: 'Transfer not found'
      });
    }

    if (transfer.status === 'done') {
      return res.status(400).json({
        success: false,
        message: 'Transfer already validated'
      });
    }

    // Update transferred quantities if provided
    if (req.body.products) {
      transfer.products = req.body.products;
    }

    // Update stock levels and create stock moves
    for (const item of transfer.products) {
      // Note: Transfers don't change total stock, just locations
      // Product stock level remains the same
      
      // Skip location tracking since we're using string-based locations
      // In a full implementation, you would:
      // 1. Subtract from sourceLocation stockLevel
      // 2. Add to destinationLocation stockLevel
      // For now, we just create the move history for audit trail

      // Create stock move
      await StockMove.create({
        product: item.product,
        sourceLocation: null, // String locations not supported in StockMove yet
        destinationLocation: null, // String locations not supported in StockMove yet
        quantity: item.transferredQuantity,
        documentType: 'transfer',
        documentId: transfer._id,
        documentReference: transfer.reference,
        status: 'done',
        user: req.user.id,
        notes: `Transfer from ${transfer.sourceLocation || 'N/A'} to ${transfer.destinationLocation || 'N/A'}`
      });
    }

    transfer.status = 'done';
    transfer.completedDate = new Date();
    await transfer.save();

    res.status(200).json({
      success: true,
      message: 'Transfer validated successfully',
      transfer
    });
  } catch (error) {
    console.error('Validate transfer error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error validating transfer'
    });
  }
};

// ADJUSTMENT OPERATIONS

// @desc    Get all adjustments
// @route   GET /api/operations/adjustments
// @access  Private
exports.getAdjustments = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let query = {};
    if (status) {
      query.status = status;
    }

    const adjustments = await Adjustment.find(query)
      .populate('location', 'name code warehouse')
      .populate('products.product', 'name sku')
      .populate('user', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Adjustment.countDocuments(query);

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      adjustments
    });
  } catch (error) {
    console.error('Get adjustments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching adjustments'
    });
  }
};

// @desc    Create adjustment
// @route   POST /api/operations/adjustments
// @access  Private
exports.createAdjustment = async (req, res) => {
  try {
    const { location, products, reason, notes } = req.body;

    // Get current system quantities
    const productsWithSystemQty = await Promise.all(
      products.map(async (item) => {
        const stockLevel = await StockLevel.findOne({
          product: item.product,
          location
        });

        return {
          product: item.product,
          systemQuantity: stockLevel ? stockLevel.quantity : 0,
          countedQuantity: item.countedQuantity,
          difference: item.countedQuantity - (stockLevel ? stockLevel.quantity : 0)
        };
      })
    );

    const adjustment = await Adjustment.create({
      location,
      products: productsWithSystemQty,
      reason,
      notes,
      user: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Adjustment created successfully',
      adjustment
    });
  } catch (error) {
    console.error('Create adjustment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating adjustment'
    });
  }
};

// @desc    Validate/Complete adjustment
// @route   PUT /api/operations/adjustments/:id/validate
// @access  Private
exports.validateAdjustment = async (req, res) => {
  try {
    const adjustment = await Adjustment.findById(req.params.id);

    if (!adjustment) {
      return res.status(404).json({
        success: false,
        message: 'Adjustment not found'
      });
    }

    if (adjustment.status === 'done') {
      return res.status(400).json({
        success: false,
        message: 'Adjustment already validated'
      });
    }

    // Update stock levels and create stock moves
    for (const item of adjustment.products) {
      // Update product stock directly with the difference
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.difference; // difference can be positive or negative
        await product.save();
      }

      // Skip location tracking since we're using string-based locations
      // In a full implementation, you would update StockLevel per location

      // Create stock move (only if there's a difference)
      if (item.difference !== 0) {
        await StockMove.create({
          product: item.product,
          sourceLocation: null, // String locations not supported in StockMove yet
          destinationLocation: null, // String locations not supported in StockMove yet
          quantity: Math.abs(item.difference),
          documentType: 'adjustment',
          documentId: adjustment._id,
          documentReference: adjustment.reference,
          status: 'done',
          user: req.user.id,
          notes: `Adjustment at ${adjustment.location || 'N/A'}: ${adjustment.reason || 'Stock correction'}`
        });
      }
    }

    adjustment.status = 'done';
    await adjustment.save();

    res.status(200).json({
      success: true,
      message: 'Adjustment validated successfully',
      adjustment
    });
  } catch (error) {
    console.error('Validate adjustment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error validating adjustment'
    });
  }
};

// @desc    Get stock move history
// @route   GET /api/operations/moves
// @access  Private
exports.getStockMoves = async (req, res) => {
  try {
    const { product, documentType, status, startDate, endDate, page = 1, limit = 20 } = req.query;

    let query = {};

    if (product) query.product = product;
    if (documentType) query.documentType = documentType;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const moves = await StockMove.find(query)
      .populate('product', 'name sku')
      // Removed location populates - sourceLocation and destinationLocation are now null
      // Location info is stored in the notes field instead
      .populate('user', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ date: -1 });

    const count = await StockMove.countDocuments(query);

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      moves
    });
  } catch (error) {
    console.error('Get stock moves error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stock moves'
    });
  }
};

