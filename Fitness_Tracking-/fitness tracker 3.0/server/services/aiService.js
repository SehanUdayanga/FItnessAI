const https = require('https');

class AIService {
  constructor() {
    this.provider = 'Google Gemini';
    this.runtimeApiKey = null;
    this.runtimeModel = null;
    this.status = 'Connected';
    this.lastApiCheck = new Date().toISOString();
    this.currentDateStr = new Date().toISOString().split('T')[0];
    this.requestsToday = 0;
    this.successfulRequests = 0;
    this.failedRequests = 0;
  }

  getEffectiveApiKey() {
    return this.runtimeApiKey || process.env.GEMINI_API_KEY || '';
  }

  getEffectiveModel() {
    return this.runtimeModel || process.env.GEMINI_MODEL || 'gemini-3.5-flash';
  }

  maskApiKey(key) {
    if (!key || key.trim() === '' || key === 'YOUR_GEMINI_API_KEY_HERE') {
      return 'Not Configured';
    }
    const cleanKey = key.trim();
    if (cleanKey.length <= 8) {
      return '••••••••';
    }
    const visibleSuffix = cleanKey.slice(-4);
    return '••••••••••••' + visibleSuffix;
  }

  _checkDateReset() {
    const today = new Date().toISOString().split('T')[0];
    if (this.currentDateStr !== today) {
      this.currentDateStr = today;
      this.requestsToday = 0;
      this.successfulRequests = 0;
      this.failedRequests = 0;
    }
  }

  recordRequest(isSuccess) {
    this._checkDateReset();
    this.requestsToday += 1;
    if (isSuccess) {
      this.successfulRequests += 1;
      this.status = 'Connected';
    } else {
      this.failedRequests += 1;
      this.status = 'Disconnected';
    }
    this.lastApiCheck = new Date().toISOString();
  }

  getStatus() {
    this._checkDateReset();
    const apiKey = this.getEffectiveApiKey();
    const hasKey = !!apiKey && apiKey !== 'YOUR_GEMINI_API_KEY_HERE';

    return {
      status: hasKey ? this.status : 'Disconnected',
      provider: this.provider,
      model: this.getEffectiveModel(),
      lastApiCheck: this.lastApiCheck,
      requestsToday: this.requestsToday,
      successfulRequests: this.successfulRequests,
      failedRequests: this.failedRequests
    };
  }

  getConfig() {
    const apiKey = this.getEffectiveApiKey();
    const isConfigured = !!apiKey && apiKey !== 'YOUR_GEMINI_API_KEY_HERE' && apiKey.trim() !== '';

    return {
      provider: this.provider,
      model: this.getEffectiveModel(),
      apiKeyMasked: this.maskApiKey(apiKey),
      isConfigured
    };
  }

  updateConfig({ apiKey, model }) {
    if (apiKey && apiKey.trim() && !apiKey.startsWith('••••')) {
      this.runtimeApiKey = apiKey.trim();
      process.env.GEMINI_API_KEY = this.runtimeApiKey;
    }
    if (model && model.trim()) {
      this.runtimeModel = model.trim();
      process.env.GEMINI_MODEL = this.runtimeModel;
    }
    return this.getConfig();
  }

  /**
   * Helper to send low-level HTTP request to Gemini API
   */
  _sendRequest(modelName, apiKey, payload) {
    return new Promise((resolve, reject) => {
      const cleanModel = modelName.replace(/^models\//, '');
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${apiKey}`;
      const url = new URL(endpoint);

      const postData = JSON.stringify(payload);

      const options = {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        },
        timeout: 25000
      };

      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            resolve({ statusCode: res.statusCode, data: parsed });
          } catch (e) {
            reject(new Error(`Failed to parse Gemini response: ${body}`));
          }
        });
      });

      req.on('error', (err) => reject(err));
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Gemini API request timed out (25s limit)'));
      });

      req.write(postData);
      req.end();
    });
  }

  /**
   * Core execute request with multi-model fallback support
   */
  async executeGemini(payload, systemInstruction = null) {
    const apiKey = this.getEffectiveApiKey();
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE' || apiKey.trim() === '') {
      this.recordRequest(false);
      throw new Error('GEMINI_API_KEY_NOT_CONFIGURED');
    }

    const primaryModel = this.getEffectiveModel();
    const candidateModels = [
      primaryModel,
      'gemini-3.5-flash',
      'gemini-flash-latest',
      'gemini-3.7-flash',
      'gemini-3.8-flash',
      'gemini-3.6-flash',
      'gemini-3.1-flash-lite'
    ].filter((m, idx, arr) => arr.indexOf(m) === idx);

    const fullPayload = { ...payload };
    if (systemInstruction) {
      fullPayload.system_instruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    let lastError = null;

    for (const model of candidateModels) {
      try {
        const response = await this._sendRequest(model, apiKey, fullPayload);

        if (response.statusCode >= 200 && response.statusCode < 300) {
          const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!text) {
            throw new Error('Empty text received from Gemini API');
          }
          this.recordRequest(true);
          return text;
        }

        const errMsg = response.data?.error?.message || `HTTP ${response.statusCode}`;
        const errMsgLower = errMsg.toLowerCase();

        // Check for genuine API key rejection
        if (
          response.statusCode === 401 ||
          response.statusCode === 403 ||
          errMsgLower.includes('api_key') ||
          errMsgLower.includes('key not valid') ||
          errMsgLower.includes('api key not valid')
        ) {
          this.recordRequest(false);
          throw new Error('GEMINI_API_KEY_INVALID');
        }

        // If model has rate limit/quota exhausted (429), model retired/unavailable (404), or not supported, fail over to next model
        if (
          response.statusCode === 429 ||
          response.statusCode === 404 ||
          errMsgLower.includes('quota') ||
          errMsgLower.includes('rate-limit') ||
          errMsgLower.includes('resource_exhausted') ||
          errMsgLower.includes('no longer available') ||
          errMsgLower.includes('not found') ||
          errMsgLower.includes('not supported')
        ) {
          console.warn(`Gemini model ${model} temporarily unavailable or rate-limited (${errMsg.split('\n')[0]}), failing over to next model...`);
          lastError = new Error(errMsg);
          continue;
        }

        throw new Error(`Gemini API Error (${response.statusCode}): ${errMsg}`);
      } catch (err) {
        if (err.message === 'GEMINI_API_KEY_INVALID' || err.message === 'GEMINI_API_KEY_NOT_CONFIGURED') {
          throw err;
        }
        lastError = err;
      }
    }

    this.recordRequest(false);
    throw lastError || new Error('Failed to generate response from Gemini API');
  }

  /**
   * Helper to parse JSON from AI response, stripping markdown fences if any
   */
  _extractJson(responseText) {
    if (!responseText) return null;
    let cleaned = responseText.trim();
    // Remove markdown ```json ... ``` code blocks if present
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    try {
      return JSON.parse(cleaned);
    } catch (e) {
      // Try regex match for { ... }
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          return JSON.parse(match[0]);
        } catch (innerError) {
          return null;
        }
      }
      return null;
    }
  }

  /**
   * AI Image Scanner: Identify all visible foods and portions from base64 image data
   * Uses dynamic database reference food names to guide Gemini matching
   */
  async identifyFoodFromImage(imageBase64, mimeType = 'image/jpeg', availableFoodNames = []) {
    const foodListText = Array.isArray(availableFoodNames) && availableFoodNames.length > 0
      ? `\nAVAILABLE FOOD DATABASE LIST:\n${availableFoodNames.join(', ')}\n`
      : '';

    const prompt = `You are analyzing a Sri Lankan food image for a fitness tracking application.
Identify all clearly visible food items.
Prefer Sri Lankan food names.${foodListText}
Instructions:
1. You must try to match each detected food to the provided AVAILABLE FOOD DATABASE LIST whenever suitable. Do not invent a database food name if a suitable food exists in the list.
2. If multiple foods are visible (e.g. Rice, Chicken Curry, Dhal Curry, Pol Sambol), return EACH food item separately in the "foods" array.
3. Estimate the edible portion/weight in grams for each food item.
4. Provide a confidence score between 0.00 and 1.00 for each item.
5. If the image is too blurry, too dark, cropped, or does not clearly show food, set "isUnclear": true and "foods": [].

Return ONLY a structured JSON object with this exact schema:
{
  "isUnclear": false,
  "foods": [
    {
      "detectedName": "Chicken Kottu", // common name detected
      "matchedFoodName": "Chicken Kottu", // closest matching name from the provided list
      "estimatedWeightGrams": 350, // estimated portion weight in grams (positive number)
      "confidence": 0.88 // confidence score between 0.00 and 1.00
    }
  ]
}`;

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              inline_data: {
                mime_type: mimeType,
                data: imageBase64
              }
            },
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 600
      }
    };

    const responseText = await this.executeGemini(payload);
    const parsed = this._extractJson(responseText);

    if (!parsed) {
      return {
        isUnclear: true,
        foods: []
      };
    }

    if (parsed.isUnclear) {
      return {
        isUnclear: true,
        foods: []
      };
    }

    let detectedFoodsList = [];

    if (Array.isArray(parsed.foods)) {
      detectedFoodsList = parsed.foods;
    } else if (parsed.foodName) {
      // Backward-compatible single item fallback
      detectedFoodsList = [
        {
          detectedName: parsed.foodName,
          matchedFoodName: parsed.foodName,
          estimatedWeightGrams: parsed.estimatedWeightGrams || 150,
          confidence: parsed.confidence === 'high' ? 0.95 : (parsed.confidence === 'low' ? 0.65 : 0.85)
        }
      ];
    }

    const sanitizedFoods = detectedFoodsList
      .filter((item) => item && (item.detectedName || item.matchedFoodName))
      .map((item) => {
        let conf = typeof item.confidence === 'number' ? item.confidence : 0.85;
        if (conf > 1) conf = conf / 100; // if given as percentage 85 -> 0.85
        const weight = Number(item.estimatedWeightGrams) > 0 ? Math.round(Number(item.estimatedWeightGrams)) : 150;

        return {
          detectedName: (item.detectedName || item.matchedFoodName || '').trim(),
          matchedFoodName: (item.matchedFoodName || item.detectedName || '').trim(),
          estimatedWeightGrams: weight,
          confidence: Math.max(0.1, Math.min(1.0, conf))
        };
      });

    return {
      isUnclear: sanitizedFoods.length === 0,
      foods: sanitizedFoods
    };
  }

  /**
   * AI Calorie Estimator for unlisted/unknown foods (called ONLY if food is not in MongoDB foods)
   */
  async estimateFoodCaloriesPer100g(foodName) {
    const prompt = `Estimate the standard nutritional calorie density (kcal per 100 grams) for the following food/dish: "${foodName}".
Give priority to authentic preparation style (especially Sri Lankan / South Asian cooking if applicable).

Return ONLY a structured JSON object:
{
  "foodName": "${foodName}",
  "caloriesPer100g": 180 // estimated numeric calories per 100 grams
}`;

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 150
      }
    };

    const responseText = await this.executeGemini(payload);
    const parsed = this._extractJson(responseText);

    if (parsed && typeof parsed.caloriesPer100g === 'number' && parsed.caloriesPer100g > 0) {
      return Math.round(parsed.caloriesPer100g * 10) / 10;
    }

    // Fallback default calorie density if JSON didn't include number
    return 150.0;
  }

  /**
   * Test connection method
   */
  async testConnection(testKey, testModel) {
    const apiKey = testKey && testKey.trim() && !testKey.startsWith('••••')
      ? testKey.trim()
      : this.getEffectiveApiKey();

    const model = testModel && testModel.trim() ? testModel.trim() : this.getEffectiveModel();

    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE' || apiKey.trim() === '') {
      this.status = 'Disconnected';
      this.lastApiCheck = new Date().toISOString();
      return {
        success: false,
        message: 'No API key configured. Please enter a valid Gemini API key.'
      };
    }

    const cleanModel = model.replace(/^models\//, '');
    const startTime = Date.now();

    try {
      const response = await this._sendRequest(cleanModel, apiKey, {
        contents: [
          {
            role: 'user',
            parts: [{ text: 'Ping test. Reply with one word: Connected.' }]
          }
        ],
        generationConfig: {
          maxOutputTokens: 10,
          temperature: 0.1
        }
      });

      const latencyMs = Date.now() - startTime;
      this.lastApiCheck = new Date().toISOString();

      if (response.statusCode >= 200 && response.statusCode < 300) {
        this.status = 'Connected';
        return {
          success: true,
          message: `Connection successful (${latencyMs}ms)`,
          model: cleanModel,
          latencyMs
        };
      }

      this.status = 'Disconnected';
      const errMsg = response.data?.error?.message || `HTTP ${response.statusCode}`;
      return {
        success: false,
        message: `Connection failed: ${errMsg}`
      };
    } catch (err) {
      this.status = 'Disconnected';
      this.lastApiCheck = new Date().toISOString();
      return {
        success: false,
        message: `Network error connecting to Gemini API: ${err.message}`
      };
    }
  }
}

const aiService = new AIService();
module.exports = aiService;
