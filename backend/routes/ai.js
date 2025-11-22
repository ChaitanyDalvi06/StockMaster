const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  getDemandForecast,
  getReorderSuggestions,
  detectAnomalies,
  chatWithAssistant,
  getInsights,
  speechToText,
  textToSpeech
} = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/auth');

// Configure multer for audio file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  },
});

// All routes are protected
router.use(protect);

router.post('/forecast', getDemandForecast);
router.get('/reorder-suggestions', getReorderSuggestions);
router.get('/detect-anomalies', authorize('admin', 'manager'), detectAnomalies);
router.post('/chat', chatWithAssistant);
router.get('/insights', authorize('admin', 'manager'), getInsights);

// Sarvam AI routes
router.post('/speech-to-text', upload.single('audio'), speechToText);
router.post('/text-to-speech', textToSpeech);

module.exports = router;

