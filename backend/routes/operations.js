const express = require('express');
const router = express.Router();
const {
  getReceipts,
  createReceipt,
  validateReceipt,
  getDeliveries,
  createDelivery,
  validateDelivery,
  getTransfers,
  createTransfer,
  validateTransfer,
  getAdjustments,
  createAdjustment,
  validateAdjustment,
  getStockMoves
} = require('../controllers/operationsController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Receipt routes - Admin & Manager can create/validate
// Note: Specific routes (validate) must come BEFORE generic routes (:id)
router.put('/receipts/:id/validate', authorize('admin', 'manager'), validateReceipt);
router.route('/receipts')
  .get(getReceipts)
  .post(authorize('admin', 'manager'), createReceipt);

// Delivery routes - Admin & Manager can create/validate
router.put('/deliveries/:id/validate', authorize('admin', 'manager'), validateDelivery);
router.route('/deliveries')
  .get(getDeliveries)
  .post(authorize('admin', 'manager'), createDelivery);

// Transfer routes - All authenticated users can create, Admin & Manager validate
router.put('/transfers/:id/validate', authorize('admin', 'manager'), validateTransfer);
router.route('/transfers')
  .get(getTransfers)
  .post(createTransfer); // Staff can create transfers

// Adjustment routes
router.put('/adjustments/:id/validate', authorize('admin', 'manager'), validateAdjustment);
router.route('/adjustments')
  .get(getAdjustments)
  .post(authorize('admin', 'manager'), createAdjustment);

// Stock moves history
router.get('/moves', getStockMoves);

module.exports = router;

