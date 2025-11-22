const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  getProductStockByLocation,
  getCategories,
  createCategory
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Product routes
router.route('/')
  .get(getProducts)
  .post(authorize('admin', 'manager'), createProduct);

router.get('/low-stock', getLowStockProducts);

router.route('/:id')
  .get(getProduct)
  .put(authorize('admin', 'manager'), updateProduct)
  .delete(authorize('admin'), deleteProduct);

router.get('/:id/stock-by-location', getProductStockByLocation);

// Category routes
router.route('/categories')
  .get(getCategories)
  .post(authorize('admin', 'manager'), createCategory);

module.exports = router;

