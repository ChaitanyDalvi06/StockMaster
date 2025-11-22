const Product = require('../models/Product');
const StockMove = require('../models/StockMove');
const StockLevel = require('../models/StockLevel');
const aiService = require('../services/aiService');
const sarvamService = require('../services/sarvamService');
const sarvamChatService = require('../services/sarvamChatService');

// @desc    Get AI demand forecast for a product
// @route   POST /api/ai/forecast
// @access  Private
exports.getDemandForecast = async (req, res) => {
  try {
    const { productId } = req.body;

    const product = await Product.findById(productId)
      .populate('category', 'name');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Get stock levels
    const stockLevels = await StockLevel.find({ product: productId });
    const currentStock = stockLevels.reduce((sum, level) => sum + level.quantity, 0);

    // Get historical movements (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const historicalMoves = await StockMove.find({
      product: productId,
      documentType: 'delivery',
      status: 'done',
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: 1 });

    // Prepare historical data
    const historicalData = historicalMoves.map(move => ({
      date: move.date,
      quantity: move.quantity,
      documentType: move.documentType
    }));

    // Get AI forecast
    const productData = {
      name: product.name,
      sku: product.sku,
      currentStock,
      reorderPoint: product.reorderPoint,
      leadTime: product.leadTime
    };

    const forecast = await aiService.forecastDemand(productData, historicalData);

    res.status(200).json({
      success: forecast.success,
      product: {
        name: product.name,
        sku: product.sku,
        currentStock
      },
      forecast: forecast.data,
      message: forecast.message
    });
  } catch (error) {
    console.error('AI forecast error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating forecast',
      error: error.message
    });
  }
};

// @desc    Get AI reorder suggestions
// @route   GET /api/ai/reorder-suggestions
// @access  Private
exports.getReorderSuggestions = async (req, res) => {
  try {
    // Get all low stock products
    const products = await Product.find({ isActive: true });

    const productsNeedingReorder = [];

    for (const product of products) {
      const stockLevels = await StockLevel.find({ product: product._id });
      const currentStock = stockLevels.reduce((sum, level) => sum + level.quantity, 0);

      if (currentStock <= product.reorderPoint) {
        // Calculate average daily sales (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const deliveries = await StockMove.find({
          product: product._id,
          documentType: 'delivery',
          status: 'done',
          date: { $gte: thirtyDaysAgo }
        });

        const totalSold = deliveries.reduce((sum, move) => sum + move.quantity, 0);
        const averageDailySales = totalSold / 30;

        productsNeedingReorder.push({
          name: product.name,
          sku: product.sku,
          currentStock,
          reorderPoint: product.reorderPoint,
          reorderQuantity: product.reorderQuantity,
          leadTime: product.leadTime,
          averageDailySales
        });
      }
    }

    // Get AI suggestions
    const suggestions = await aiService.getReorderSuggestions(productsNeedingReorder);

    res.status(200).json({
      success: suggestions.success,
      data: suggestions.data,
      message: suggestions.message
    });
  } catch (error) {
    console.error('AI reorder suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating reorder suggestions',
      error: error.message
    });
  }
};

// @desc    Detect anomalies in stock movements
// @route   GET /api/ai/detect-anomalies
// @access  Private
exports.detectAnomalies = async (req, res) => {
  try {
    const { days = 7 } = req.query;

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(days));

    const recentMoves = await StockMove.find({
      date: { $gte: daysAgo },
      status: 'done'
    })
      .populate('product', 'name sku')
      .populate('destinationLocation', 'name');

    const movementsData = recentMoves.map(move => ({
      date: move.date,
      product: {
        name: move.product?.name,
        sku: move.product?.sku
      },
      documentType: move.documentType,
      quantity: move.quantity,
      location: move.destinationLocation?.name
    }));

    // Get AI anomaly detection
    const anomalies = await aiService.detectAnomalies(movementsData);

    res.status(200).json({
      success: anomalies.success,
      data: anomalies.data,
      message: anomalies.message
    });
  } catch (error) {
    console.error('AI anomaly detection error:', error);
    res.status(500).json({
      success: false,
      message: 'Error detecting anomalies',
      error: error.message
    });
  }
};

// @desc    Chat with AI assistant (Using Sarvam AI)
// @route   POST /api/ai/chat
// @access  Private
exports.chatWithAssistant = async (req, res) => {
  try {
    const { question, message } = req.body;
    const userQuestion = question || message;

    if (!userQuestion) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a question'
      });
    }

    // Gather context data
    const totalProducts = await Product.countDocuments({ isActive: true });
    
    const products = await Product.find({ isActive: true });
    let lowStockCount = 0;
    let totalValue = 0;

    for (const product of products) {
      // Use currentStock field directly instead of StockLevel
      const totalStock = product.currentStock || 0;
      
      if (totalStock <= product.reorderPoint) {
        lowStockCount++;
      }
      
      totalValue += totalStock * product.cost;
    }

    const contextData = {
      totalProducts,
      lowStockItems: lowStockCount,
      totalValue: totalValue.toFixed(2),
      pendingReceipts: await require('../models/Receipt').countDocuments({ status: { $ne: 'done' } }),
      pendingDeliveries: await require('../models/Delivery').countDocuments({ status: { $ne: 'done' } })
    };

    // Get AI response using Sarvam Chat Service (with multilingual support)
    const response = await sarvamChatService.generateChatResponse(userQuestion, contextData);

    res.status(200).json({
      success: response.success,
      question: userQuestion,
      message: response.response || response.message,
      response: response.response,
      detectedLanguage: response.detectedLanguage || 'en-IN' // Pass detected language for TTS
    });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting AI response',
      error: error.message
    });
  }
};

// @desc    Get AI insights
// @route   GET /api/ai/insights
// @access  Private
exports.getInsights = async (req, res) => {
  try {
    // Gather comprehensive inventory data
    const products = await Product.find({ isActive: true })
      .populate('category', 'name');

    const inventoryData = [];

    for (const product of products) {
      const stockLevels = await StockLevel.find({ product: product._id });
      const totalStock = stockLevels.reduce((sum, level) => sum + level.quantity, 0);

      // Get movement history (last 90 days)
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      const movements = await StockMove.find({
        product: product._id,
        date: { $gte: ninetyDaysAgo }
      });

      inventoryData.push({
        name: product.name,
        sku: product.sku,
        category: product.category?.name,
        currentStock: totalStock,
        reorderPoint: product.reorderPoint,
        cost: product.cost,
        price: product.price,
        stockValue: totalStock * product.cost,
        movementCount: movements.length
      });
    }

    // Get AI insights
    const insights = await aiService.generateInsights(inventoryData);

    res.status(200).json({
      success: insights.success,
      data: insights.data,
      message: insights.message
    });
  } catch (error) {
    console.error('AI insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating insights',
      error: error.message
    });
  }
};

// @desc    Speech to Text using Sarvam AI
// @route   POST /api/ai/speech-to-text
// @access  Private
exports.speechToText = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No audio file provided'
      });
    }

    const result = await sarvamService.speechToText(
      req.file.buffer,
      req.body.language || 'en-IN'
    );

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.status(200).json({
      success: true,
      text: result.text
    });
  } catch (error) {
    console.error('STT error:', error);
    res.status(500).json({
      success: false,
      message: 'Error converting speech to text',
      error: error.message
    });
  }
};

// @desc    Text to Speech using Sarvam AI
// @route   POST /api/ai/text-to-speech
// @access  Private
exports.textToSpeech = async (req, res) => {
  try {
    const { text, language = 'en-IN', speaker = 'meera' } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'No text provided'
      });
    }

    const result = await sarvamService.textToSpeech(text, language, speaker);

    if (!result.success) {
      return res.status(500).json(result);
    }

    res.set({
      'Content-Type': result.contentType,
      'Content-Length': result.audioBuffer.length,
    });

    res.send(result.audioBuffer);
  } catch (error) {
    console.error('TTS error:', error);
    res.status(500).json({
      success: false,
      message: 'Error converting text to speech',
      error: error.message
    });
  }
};

