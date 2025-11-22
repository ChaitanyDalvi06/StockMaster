const axios = require('axios');

const SARVAM_API_KEY = process.env.SARVAM_API_KEY;
const SARVAM_BASE_URL = 'https://api.sarvam.ai';

/**
 * Detect language by checking for non-ASCII characters and common patterns
 * Returns the appropriate language code for Sarvam AI
 */
const detectLanguage = (text) => {
  const lowerText = text.toLowerCase();
  
  // Check for Devanagari script (Hindi/Marathi/Sanskrit)
  if (/[\u0900-\u097F]/.test(text)) {
    // Check for Marathi-specific words
    const marathiWords = ['आहे', 'आहेत', 'काय', 'कसे', 'किती', 'कुठे', 'aahe', 'aahet', 'kiti', 'kay'];
    if (marathiWords.some(word => text.includes(word) || lowerText.includes(word))) {
      return 'mr-IN';
    }
    return 'hi-IN';
  }
  
  // Check for Bengali script
  if (/[\u0980-\u09FF]/.test(text)) return 'bn-IN';
  
  // Check for Gujarati script
  if (/[\u0A80-\u0AFF]/.test(text)) return 'gu-IN';
  
  // Check for Kannada script
  if (/[\u0C80-\u0CFF]/.test(text)) return 'kn-IN';
  
  // Check for Malayalam script
  if (/[\u0D00-\u0D7F]/.test(text)) return 'ml-IN';
  
  // Check for Punjabi/Gurmukhi script
  if (/[\u0A00-\u0A7F]/.test(text)) return 'pa-IN';
  
  // Check for Tamil script
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta-IN';
  
  // Check for Telugu script
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te-IN';
  
  // Check for Odia script
  if (/[\u0B00-\u0B7F]/.test(text)) return 'od-IN';
  
  // Check for common Romanized Indian language words
  const languagePatterns = {
    'mr-IN': ['kiti', 'kay', 'kase', 'kuthe', 'aahe', 'aahet', 'ahe', 'ahet', 'cha', 'chi', 'che', 'ani', 'mag'],
    'hi-IN': ['kitne', 'kya', 'kaise', 'kyun', 'hai', 'hain', 'ho', 'ka', 'ki', 'ke', 'abhi', 'tak', 'nahi', 'nahin'],
    'ta-IN': ['enna', 'epdi', 'yenna', 'ethu', 'irukku', 'iruku', 'oru'],
    'te-IN': ['enta', 'ela', 'yemi', 'yela', 'undi', 'unnadi'],
    'kn-IN': ['yeshtu', 'hege', 'yaava', 'yaake', 'ide', 'idhe'],
    'gu-IN': ['ketla', 'kem', 'kevi', 'kyare', 'che', 'chhe'],
    'bn-IN': ['koto', 'ki', 'kivabe', 'keno', 'ache', 'achhe'],
    'pa-IN': ['kinne', 'ki', 'kive', 'kyu', 'hai', 'hain'],
  };
  
  // Check each language pattern
  for (const [lang, words] of Object.entries(languagePatterns)) {
    if (words.some(word => lowerText.includes(word))) {
      return lang;
    }
  }
  
  // Default to English if no pattern matches
  return 'en-IN';
};

/**
 * Translate text using Sarvam AI
 */
const translateText = async (text, sourceLanguage, targetLanguage) => {
  try {
    // If source and target are the same, no translation needed
    if (sourceLanguage === targetLanguage) {
      return { success: true, translatedText: text };
    }

    console.log(`Translating from ${sourceLanguage} to ${targetLanguage}: "${text}"`);

    const response = await axios.post(
      `${SARVAM_BASE_URL}/translate`,
      {
        input: text,
        source_language_code: sourceLanguage,
        target_language_code: targetLanguage,
        speaker_gender: 'Female',
        mode: 'formal',
        model: 'mayura:v1',
        enable_preprocessing: true,
      },
      {
        headers: {
          'API-Subscription-Key': SARVAM_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Translation result:', response.data.translated_text);

    return {
      success: true,
      translatedText: response.data.translated_text || text,
    };
  } catch (error) {
    console.error('Translation error:', error.response?.data || error.message);
    // Return original text if translation fails
    return {
      success: true,
      translatedText: text,
    };
  }
};

/**
 * Simple rule-based chatbot using Sarvam AI for language processing
 * Analyzes user questions and generates appropriate responses
 */
exports.generateChatResponse = async (question, contextData) => {
  try {
    // Detect the language of the input
    const detectedLanguage = detectLanguage(question);
    console.log(`Detected language: ${detectedLanguage} for question: "${question}"`);
    
    // Translate to English if needed (for all non-English languages)
    let englishQuestion = question;
    if (detectedLanguage !== 'en-IN') {
      const translation = await translateText(question, detectedLanguage, 'en-IN');
      englishQuestion = translation.translatedText;
      console.log(`Translated to English: "${englishQuestion}"`);
    }
    
    const lowerQuestion = englishQuestion.toLowerCase();
    
    // Analyze the question and generate appropriate response
    let response = '';

    // Product-related queries
    if (lowerQuestion.includes('how many product') || lowerQuestion.includes('total product') || 
        lowerQuestion.includes('stock') || lowerQuestion.includes('item') || 
        lowerQuestion.includes('product')) {
      response = `You currently have ${contextData.totalProducts || 0} products in your inventory. ${
        contextData.lowStockItems > 0 
          ? `${contextData.lowStockItems} of them are running low on stock.` 
          : 'All products are well-stocked!'
      }`;
    }
    // Low stock queries
    else if (lowerQuestion.includes('low stock') || lowerQuestion.includes('running low')) {
      response = `There are ${contextData.lowStockItems || 0} products with low stock levels. ${
        contextData.lowStockItems > 0 
          ? 'You should consider reordering these items soon to avoid stockouts.' 
          : 'Great job! All your products are well-stocked.'
      }`;
    }
    // Inventory value queries
    else if (lowerQuestion.includes('inventory value') || lowerQuestion.includes('total value') || lowerQuestion.includes('worth')) {
      response = `Your total inventory value is ₹${contextData.totalValue?.toLocaleString('en-IN') || 0}. This represents the current worth of all products in your warehouse.`;
    }
    // Pending receipts
    else if (lowerQuestion.includes('receipt') || lowerQuestion.includes('incoming')) {
      response = `You have ${contextData.pendingReceipts || 0} pending receipts waiting to be validated. ${
        contextData.pendingReceipts > 0 
          ? 'These need to be processed to update your stock levels.' 
          : 'All receipts are up to date!'
      }`;
    }
    // Pending deliveries
    else if (lowerQuestion.includes('deliver') || lowerQuestion.includes('outgoing') || lowerQuestion.includes('shipment')) {
      response = `There are ${contextData.pendingDeliveries || 0} pending deliveries. ${
        contextData.pendingDeliveries > 0 
          ? 'Make sure to validate them to keep your customers happy!' 
          : 'All deliveries are processed!'
      }`;
    }
    // Stock movement queries
    else if (lowerQuestion.includes('stock move') || lowerQuestion.includes('movement') || lowerQuestion.includes('history')) {
      response = `I can help you track stock movements. You can view detailed movement history in the Move History section. This includes all receipts, deliveries, transfers, and adjustments.`;
    }
    // Warehouse queries
    else if (lowerQuestion.includes('warehouse') || lowerQuestion.includes('location')) {
      response = `You can manage multiple warehouses and locations in StockMaster. Use the Internal Transfers feature to move stock between locations efficiently.`;
    }
    // General help
    else if (lowerQuestion.includes('help') || lowerQuestion.includes('what can you do')) {
      response = `I can help you with:
• Checking product counts and stock levels
• Monitoring low stock items
• Viewing inventory value
• Tracking pending receipts and deliveries
• Understanding stock movements
• Managing warehouses and locations

Just ask me anything about your inventory!`;
    }
    // Dashboard/overview queries
    else if (lowerQuestion.includes('dashboard') || lowerQuestion.includes('overview') || lowerQuestion.includes('summary')) {
      response = `Here's your inventory overview:
📦 Total Products: ${contextData.totalProducts || 0}
⚠️ Low Stock Items: ${contextData.lowStockItems || 0}
💰 Total Value: ₹${contextData.totalValue?.toLocaleString('en-IN') || 0}
📥 Pending Receipts: ${contextData.pendingReceipts || 0}
📤 Pending Deliveries: ${contextData.pendingDeliveries || 0}`;
    }
    // Default response
    else {
      response = `I'm your StockMaster AI assistant. I can help you with inventory-related questions like product counts, stock levels, pending operations, and more. What would you like to know about your inventory?`;
    }

    // Translate response back to user's language if needed
    let finalResponse = response;
    if (detectedLanguage !== 'en-IN') {
      const translation = await translateText(response, 'en-IN', detectedLanguage);
      finalResponse = translation.translatedText;
      console.log(`Translated response to ${detectedLanguage}: "${finalResponse}"`);
    }

    return {
      success: true,
      response: finalResponse,
      detectedLanguage: detectedLanguage
    };
  } catch (error) {
    console.error('Chat generation error:', error);
    return {
      success: false,
      message: 'Failed to generate response',
      error: error.message
    };
  }
};

/**
 * Translate text for multilingual support using Sarvam AI
 */
exports.translateText = async (text, targetLanguage = 'hi-IN') => {
  try {
    // If target is English, no translation needed
    if (targetLanguage === 'en-IN') {
      return { success: true, translatedText: text };
    }

    const response = await axios.post(
      `${SARVAM_BASE_URL}/translate`,
      {
        input: text,
        source_language_code: 'en-IN',
        target_language_code: targetLanguage,
        speaker_gender: 'Female',
        mode: 'formal',
        model: 'mayura:v1',
        enable_preprocessing: true,
      },
      {
        headers: {
          'API-Subscription-Key': SARVAM_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      translatedText: response.data.translated_text || text,
    };
  } catch (error) {
    console.error('Translation error:', error.response?.data || error.message);
    // Return original text if translation fails
    return {
      success: true,
      translatedText: text,
    };
  }
};

