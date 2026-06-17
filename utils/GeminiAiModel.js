const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");
  
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const generationConfig = {
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 4096,
    responseMimeType: "text/plain",
  };

  // Models to try in order of preference
  const MODEL_CANDIDATES = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
  ];

  /**
   * Send a message with automatic retry and model fallback.
   * Retries up to 3 times with exponential backoff.
   * Falls back to alternate models on persistent 503/429 errors.
   */
  export async function sendMessageWithRetry(prompt, maxRetries = 3) {
    let lastError;

    for (const modelName of MODEL_CANDIDATES) {
      const model = genAI.getGenerativeModel({ model: modelName });
      const chat = model.startChat({ generationConfig });

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          console.log(`🤖 Trying model: ${modelName} (attempt ${attempt + 1}/${maxRetries})`);
          const result = await chat.sendMessage(prompt);
          console.log(`✅ Success with model: ${modelName}`);
          return result;
        } catch (error) {
          lastError = error;
          const status = error?.status || error?.httpStatusCode;
          console.warn(`⚠️ ${modelName} attempt ${attempt + 1} failed:`, error.message);

          // If 503 (overloaded) or 429 (rate limited), wait and retry
          if (status === 503 || status === 429) {
            const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
            console.log(`⏳ Waiting ${Math.round(delay)}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }

          // For other errors, don't retry — throw immediately
          throw error;
        }
      }
      console.log(`❌ All retries exhausted for ${modelName}, trying next model...`);
    }

    // All models and retries failed
    throw lastError || new Error("All Gemini models are currently unavailable. Please try again later.");
  }

  // Keep the original chatSession export for backward compatibility
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  });

  export const chatSession = model.startChat({
      generationConfig,
  });