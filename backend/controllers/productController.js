const Product = require('../models/Product');
const StockLevel = require('../models/StockLevel');
const Category = require('../models/Category');

// @desc    Get all products
// @route   GET /api/products
// @access  Private
exports.getProducts = async (req, res) => {
  try {
    const { search, category, status, page = 1, limit = 10 } = req.query;

    let query = {};

    // Search by name or SKU
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by status
    if (status) {
      query.isActive = status === 'active';
    }

    const products = await Product.find(query)
      .populate('category', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    // Get stock levels for each product
    const productsWithStock = await Promise.all(
      products.map(async (product) => {
        const stockLevels = await StockLevel.find({ product: product._id })
          .populate('location', 'name code');
        
        const totalStock = stockLevels.reduce((sum, level) => sum + level.quantity, 0);
        
        return {
          ...product.toObject(),
          totalStock,
          stockLevels
        };
      })
    );

    const count = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      products: productsWithStock
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products'
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name description');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Get stock levels
    const stockLevels = await StockLevel.find({ product: product._id })
      .populate('location', 'name code warehouse');

    const totalStock = stockLevels.reduce((sum, level) => sum + level.quantity, 0);

    res.status(200).json({
      success: true,
      product: {
        ...product.toObject(),
        totalStock,
        stockLevels
      }
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product'
    });
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private (admin, manager)
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      sku,
      description,
      category,
      unitOfMeasure,
      cost,
      price,
      reorderPoint,
      reorderQuantity,
      leadTime,
      supplier,
      barcode,
      initialStock,
      location
    } = req.body;

    // Check if SKU already exists
    const skuExists = await Product.findOne({ sku });
    if (skuExists) {
      return res.status(400).json({
        success: false,
        message: 'Product with this SKU already exists'
      });
    }

    // Create product
    const product = await Product.create({
      name,
      sku,
      description,
      category,
      unitOfMeasure,
      cost,
      price,
      reorderPoint,
      reorderQuantity,
      leadTime,
      supplier,
      barcode
    });

    // If initial stock is provided, create stock level
    if (initialStock && location) {
      await StockLevel.create({
        product: product._id,
        location,
        quantity: initialStock,
        available: initialStock
      });
    }

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating product'
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (admin, manager)
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating product'
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (admin)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Soft delete - just mark as inactive
    product.isActive = false;
    await product.save();

    res.status(200).json({
      success: true,
      message: 'Product deactivated successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product'
    });
  }
};

// @desc    Get products below reorder point
// @route   GET /api/products/low-stock
// @access  Private
exports.getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .populate('category', 'name');

    const lowStockProducts = [];

    for (const product of products) {
      const stockLevels = await StockLevel.find({ product: product._id });
      const totalStock = stockLevels.reduce((sum, level) => sum + level.quantity, 0);

      if (totalStock <= product.reorderPoint) {
        lowStockProducts.push({
          ...product.toObject(),
          currentStock: totalStock,
          deficit: product.reorderPoint - totalStock
        });
      }
    }

    res.status(200).json({
      success: true,
      count: lowStockProducts.length,
      products: lowStockProducts
    });
  } catch (error) {
    console.error('Get low stock products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching low stock products'
    });
  }
};

// @desc    Get product stock by location
// @route   GET /api/products/:id/stock-by-location
// @access  Private
exports.getProductStockByLocation = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const stockLevels = await StockLevel.find({ product: req.params.id })
      .populate({
        path: 'location',
        populate: {
          path: 'warehouse',
          select: 'name code'
        }
      });

    res.status(200).json({
      success: true,
      product: {
        name: product.name,
        sku: product.sku
      },
      stockLevels
    });
  } catch (error) {
    console.error('Get product stock by location error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product stock'
    });
  }
};

// @desc    Get categories
// @route   GET /api/products/categories
// @access  Private
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate('parent', 'name');

    res.status(200).json({
      success: true,
      count: categories.length,
      categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories'
    });
  }
};

// @desc    Create category
// @route   POST /api/products/categories
// @access  Private (admin, manager)
exports.createCategory = async (req, res) => {
  try {
    const { name, description, parent } = req.body;

    const category = await Category.create({
      name,
      description,
      parent
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating category'
    });
  }
};

