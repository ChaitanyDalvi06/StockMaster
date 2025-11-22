const OpenAI = require('openai');

// Initialize OpenAI client with OpenRouter
// OpenRouter provides access to GPT-4o-mini and other models
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-initialization',
  baseURL: process.env.OPENAI_BASE_URL || 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3001',
    'X-Title': 'StockMaster Inventory System',
  }
});

/**
 * AI-powered demand forecasting
 * Analyzes historical sales data to predict future demand
 */
exports.forecastDemand = async (product, historicalData) => {
  try {
    const prompt = `
You are an inventory management AI assistant. Analyze the following historical sales data and provide demand forecasting insights.

Product: ${product.name} (SKU: ${product.sku})
Current Stock: ${product.currentStock}
Reorder Point: ${product.reorderPoint}
Lead Time: ${product.leadTime} days

Historical Sales Data (last 30 days):
${JSON.stringify(historicalData, null, 2)}

Please provide:
1. Predicted demand for the next 7, 14, and 30 days
2. Recommended reorder quantity
3. Optimal reorder point based on the data
4. Any patterns or trends observed (seasonality, growth, etc.)
5. Risk assessment (high/medium/low) of stockout

Respond in JSON format:
{
  "predictions": {
    "next7Days": number,
    "next14Days": number,
    "next30Days": number
  },
  "recommendations": {
    "reorderQuantity": number,
    "optimalReorderPoint": number,
    "urgency": "high" | "medium" | "low"
  },
  "insights": {
    "trend": string,
    "seasonality": string,
    "stockoutRisk": "high" | "medium" | "low",
    "confidence": number (0-100)
  },
  "explanation": string
}
`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert inventory management analyst specializing in demand forecasting and supply chain optimization.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(completion.choices[0].message.content);
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('AI Forecasting Error:', error);
    return {
      success: false,
      message: 'Failed to generate forecast',
      error: error.message
    };
  }
};

/**
 * Get intelligent reorder suggestions
 * Analyzes multiple products and suggests which ones need reordering
 */
exports.getReorderSuggestions = async (products) => {
  try {
    const productsData = products.map(p => ({
      name: p.name,
      sku: p.sku,
      currentStock: p.currentStock,
      reorderPoint: p.reorderPoint,
      reorderQuantity: p.reorderQuantity,
      leadTime: p.leadTime,
      averageDailySales: p.averageDailySales || 0
    }));

    const prompt = `
You are an inventory management AI assistant. Analyze the following products and provide intelligent reorder suggestions.

Products:
${JSON.stringify(productsData, null, 2)}

For each product that needs reordering, provide:
1. Priority level (critical/high/medium/low)
2. Recommended order quantity (considering lead time and sales velocity)
3. Expected stockout date if no action taken
4. Reason for recommendation

Respond in JSON format:
{
  "suggestions": [
    {
      "sku": string,
      "name": string,
      "priority": "critical" | "high" | "medium" | "low",
      "recommendedQuantity": number,
      "expectedStockoutDate": string (ISO date),
      "reason": string,
      "currentStock": number,
      "daysUntilStockout": number
    }
  ],
  "summary": {
    "totalProductsNeedingReorder": number,
    "criticalCount": number,
    "estimatedTotalCost": number (if possible to estimate)
  }
}
`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert inventory management analyst specializing in reorder optimization and supply chain management.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(completion.choices[0].message.content);
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('AI Reorder Suggestions Error:', error);
    return {
      success: false,
      message: 'Failed to generate reorder suggestions',
      error: error.message
    };
  }
};

/**
 * Detect anomalies in stock movements
 * Identifies unusual patterns that might indicate theft, errors, or other issues
 */
exports.detectAnomalies = async (stockMovements) => {
  try {
    const movementsData = stockMovements.map(m => ({
      date: m.date,
      product: m.product.name,
      type: m.documentType,
      quantity: m.quantity,
      location: m.destinationLocation?.name || 'N/A'
    }));

    const prompt = `
You are an inventory security and analysis AI. Analyze the following stock movements and detect any anomalies or suspicious patterns.

Stock Movements (last 7 days):
${JSON.stringify(movementsData, null, 2)}

Look for:
1. Unusual quantities (too high or too low)
2. Unusual timing patterns
3. Suspicious transfer patterns
4. Potential data entry errors
5. Potential theft indicators

Respond in JSON format:
{
  "anomalies": [
    {
      "type": "unusual_quantity" | "timing_pattern" | "suspicious_transfer" | "data_error" | "potential_theft",
      "severity": "high" | "medium" | "low",
      "description": string,
      "affectedProducts": [string],
      "recommendation": string
    }
  ],
  "overallRisk": "high" | "medium" | "low",
  "summary": string
}
`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in inventory security and anomaly detection, specializing in identifying unusual patterns in stock movements.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(completion.choices[0].message.content);
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('AI Anomaly Detection Error:', error);
    return {
      success: false,
      message: 'Failed to detect anomalies',
      error: error.message
    };
  }
};

/**
 * Inventory AI Assistant - Chat interface
 * Answers natural language questions about inventory
 */
exports.chatAssistant = async (question, contextData) => {
  try {
    console.log('=== AI Chat Debug ===');
    console.log('Question:', question);
    console.log('API Key exists:', !!process.env.OPENAI_API_KEY);
    console.log('Model:', process.env.OPENAI_MODEL);
    console.log('Base URL:', openai.baseURL);
    
    const context = `
Current Inventory Context:
- Total Products: ${contextData.totalProducts || 'N/A'}
- Low Stock Items: ${contextData.lowStockItems || 'N/A'}
- Total Value: ${contextData.totalValue || 'N/A'}
- Pending Receipts: ${contextData.pendingReceipts || 'N/A'}
- Pending Deliveries: ${contextData.pendingDeliveries || 'N/A'}

Additional Context:
${JSON.stringify(contextData.additionalInfo || {}, null, 2)}
`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'openai/gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are StockMaster AI Assistant, a specialized AI helper for the StockMaster Inventory Management System.

STRICT RULES:
1. You ONLY answer questions related to inventory management, stock levels, products, receipts, deliveries, transfers, adjustments, and warehouse operations.
2. You MUST NOT provide code, programming help, or technical assistance unrelated to using this inventory system.
3. If asked about anything unrelated to inventory management (like "write code", "explain programming", etc.), politely decline and redirect the user to ask about their inventory.
4. Focus on helping users understand their current inventory status, make stock decisions, and use the StockMaster system effectively.

Current Inventory Context:
${context}

Remember: You are an inventory management assistant, NOT a general-purpose AI or coding assistant. Stay focused on inventory-related queries only.`
        },
        {
          role: 'user',
          content: question
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    console.log('AI Response received successfully');
    
    return {
      success: true,
      response: completion.choices[0].message.content
    };
  } catch (error) {
    console.error('AI Chat Error:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      code: error.code,
      type: error.type
    });
    return {
      success: false,
      message: 'Failed to get AI response',
      error: error.message
    };
  }
};

/**
 * Generate insights from inventory data
 */
exports.generateInsights = async (inventoryData) => {
  try {
    const prompt = `
Analyze this inventory data and provide actionable insights:

${JSON.stringify(inventoryData, null, 2)}

Provide insights on:
1. Top performing products
2. Slow-moving inventory
3. Stock turnover analysis
4. Cost optimization opportunities
5. Space utilization recommendations

Respond in JSON format with clear, actionable insights.
`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert inventory analyst providing strategic insights for business optimization.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.4,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(completion.choices[0].message.content);
    return {
      success: true,
      data: result
    };
  } catch (error) {
    console.error('AI Insights Error:', error);
    return {
      success: false,
      message: 'Failed to generate insights',
      error: error.message
    };
  }
};

