const Product = require('../models/Product');
const StockLevel = require('../models/StockLevel');
const Receipt = require('../models/Receipt');
const Delivery = require('../models/Delivery');
const Transfer = require('../models/Transfer');
const StockMove = require('../models/StockMove');

// @desc    Get dashboard KPIs
// @route   GET /api/dashboard/kpis
// @access  Private
exports.getDashboardKPIs = async (req, res) => {
  try {
    // Total Products in Stock
    const totalProducts = await Product.countDocuments({ isActive: true });

    // Low Stock Items
    const products = await Product.find({ isActive: true });
    const lowStockItems = [];
    const outOfStockItems = [];

    for (const product of products) {
      const stockLevels = await StockLevel.find({ product: product._id });
      const totalStock = stockLevels.reduce((sum, level) => sum + level.quantity, 0);

      if (totalStock === 0) {
        outOfStockItems.push(product);
      } else if (totalStock <= product.reorderPoint) {
        lowStockItems.push(product);
      }
    }

    // Pending Receipts
    const pendingReceipts = await Receipt.countDocuments({
      status: { $in: ['draft', 'waiting', 'ready'] }
    });

    // Pending Deliveries
    const pendingDeliveries = await Delivery.countDocuments({
      status: { $in: ['draft', 'waiting', 'ready'] }
    });

    // Internal Transfers Scheduled
    const scheduledTransfers = await Transfer.countDocuments({
      status: { $in: ['draft', 'waiting', 'ready'] }
    });

    // Total Stock Value
    let totalStockValue = 0;
    for (const product of products) {
      const stockLevels = await StockLevel.find({ product: product._id });
      const totalStock = stockLevels.reduce((sum, level) => sum + level.quantity, 0);
      totalStockValue += totalStock * product.cost;
    }

    // Recent Stock Movements (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentMovements = await StockMove.countDocuments({
      date: { $gte: sevenDaysAgo },
      status: 'done'
    });

    res.status(200).json({
      success: true,
      kpis: {
        totalProducts,
        lowStockItems: lowStockItems.length,
        outOfStockItems: outOfStockItems.length,
        pendingReceipts,
        pendingDeliveries,
        scheduledTransfers,
        totalStockValue: totalStockValue.toFixed(2),
        recentMovements
      }
    });
  } catch (error) {
    console.error('Get dashboard KPIs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard KPIs'
    });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    const { period = '7' } = req.query; // days
    
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    // Stock movements by type
    const movementsByType = await StockMove.aggregate([
      {
        $match: {
          date: { $gte: daysAgo },
          status: 'done'
        }
      },
      {
        $group: {
          _id: '$documentType',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' }
        }
      }
    ]);

    // Receipts by status
    const receiptsByStatus = await Receipt.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Deliveries by status
    const deliveriesByStatus = await Delivery.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Top products by stock value
    const allProducts = await Product.find({ isActive: true })
      .select('name sku cost price')
      .limit(10);

    const topProductsByValue = [];
    for (const product of allProducts) {
      const stockLevels = await StockLevel.find({ product: product._id });
      const totalStock = stockLevels.reduce((sum, level) => sum + level.quantity, 0);
      const stockValue = totalStock * product.cost;

      if (totalStock > 0) {
        topProductsByValue.push({
          product: product.name,
          sku: product.sku,
          quantity: totalStock,
          value: stockValue
        });
      }
    }

    topProductsByValue.sort((a, b) => b.value - a.value);

    // Daily stock movements (last 7 days)
    const dailyMovements = await StockMove.aggregate([
      {
        $match: {
          date: { $gte: daysAgo },
          status: 'done'
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        movementsByType,
        receiptsByStatus,
        deliveriesByStatus,
        topProductsByValue: topProductsByValue.slice(0, 10),
        dailyMovements
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics'
    });
  }
};

// @desc    Get low stock alerts
// @route   GET /api/dashboard/low-stock-alerts
// @access  Private
exports.getLowStockAlerts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
      .populate('category', 'name');

    const alerts = [];

    for (const product of products) {
      const stockLevels = await StockLevel.find({ product: product._id })
        .populate('location', 'name code warehouse');
      
      const totalStock = stockLevels.reduce((sum, level) => sum + level.quantity, 0);

      if (totalStock <= product.reorderPoint) {
        const severity = totalStock === 0 ? 'critical' : 
                        totalStock <= product.reorderPoint * 0.5 ? 'high' : 'medium';

        alerts.push({
          product: {
            id: product._id,
            name: product.name,
            sku: product.sku,
            category: product.category?.name
          },
          currentStock: totalStock,
          reorderPoint: product.reorderPoint,
          reorderQuantity: product.reorderQuantity,
          deficit: Math.max(0, product.reorderPoint - totalStock),
          severity,
          stockLocations: stockLevels.map(sl => ({
            location: sl.location.name,
            quantity: sl.quantity
          }))
        });
      }
    }

    // Sort by severity
    const severityOrder = { critical: 0, high: 1, medium: 2 };
    alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    res.status(200).json({
      success: true,
      count: alerts.length,
      alerts
    });
  } catch (error) {
    console.error('Get low stock alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching low stock alerts'
    });
  }
};

// @desc    Get recent activities
// @route   GET /api/dashboard/recent-activities
// @access  Private
exports.getRecentActivities = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const recentMoves = await StockMove.find()
      .populate('product', 'name sku')
      .populate('user', 'name')
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const activities = recentMoves.map(move => ({
      id: move._id,
      type: move.documentType,
      product: move.product?.name,
      sku: move.product?.sku,
      quantity: move.quantity,
      status: move.status,
      reference: move.documentReference,
      user: move.user?.name,
      date: move.date,
      createdAt: move.createdAt
    }));

    res.status(200).json({
      success: true,
      activities
    });
  } catch (error) {
    console.error('Get recent activities error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent activities'
    });
  }
};

