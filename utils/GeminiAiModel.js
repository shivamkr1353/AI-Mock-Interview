import {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } from "@google/generative-ai";
  
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const openRouterApiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  const openRouterModel = process.env.NEXT_PUBLIC_OPENROUTER_MODEL || "nvidia/nemotron-3-super-120b-a12b:free";

  let genAI;
  if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
  }
  
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
   * Call OpenRouter endpoint.
   */
  async function callOpenRouter(prompt, modelName) {
    console.log(`🤖 Requesting OpenRouter with model: ${modelName}`);
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: "user", content: prompt }],
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      const error = new Error(`OpenRouter API error: ${response.status} - ${errText}`);
      error.status = response.status;
      throw error;
    }

    const data = await response.json();
    if (!data.choices || data.choices.length === 0) {
      throw new Error("Invalid response format from OpenRouter (no choices)");
    }

    const rawText = data.choices[0].message.content;
    
    // Clean any reasoning tags like <think>...</think> if the user decides to switch to a reasoning model later
    const cleanText = rawText.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

    return {
      response: {
        text: async () => cleanText
      }
    };
  }

  /**
   * Send a message with automatic retry and model fallback.
   * Retries up to 3 times with exponential backoff.
   * Falls back to alternate models on persistent 503/429 errors.
   */
  export async function sendMessageWithRetry(prompt, maxRetries = 3) {
    let lastError;

    // 1. Try Gemini first
    if (genAI) {
      for (const modelName of MODEL_CANDIDATES) {
        const model = genAI.getGenerativeModel({ model: modelName });
        const chat = model.startChat({ generationConfig });

        for (let attempt = 0; attempt < maxRetries; attempt++) {
          try {
            console.log(`🤖 Trying Gemini model: ${modelName} (attempt ${attempt + 1}/${maxRetries})`);
            const result = await chat.sendMessage(prompt);
            console.log(`✅ Success with Gemini model: ${modelName}`);
            return result;
          } catch (error) {
            lastError = error;
            const status = error?.status || error?.httpStatusCode;
            console.warn(`⚠️ Gemini ${modelName} attempt ${attempt + 1} failed:`, error.message);

            // If 503 (overloaded) or 429 (rate limited), wait and retry
            if (status === 503 || status === 429) {
              const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
              console.log(`⏳ Waiting ${Math.round(delay)}ms before retry...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }

            // For other errors, break and try the next Gemini candidate or fall back to OpenRouter
            break;
          }
        }
        console.log(`❌ All retries exhausted for Gemini ${modelName}, trying next model...`);
      }
    }

    // 2. Fall back to OpenRouter if Gemini failed/exhausted or if Gemini key is missing
    if (openRouterApiKey) {
      console.log("⚠️ Falling back to OpenRouter...");
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          console.log(`🤖 Trying OpenRouter model: ${openRouterModel} (attempt ${attempt + 1}/${maxRetries})`);
          const result = await callOpenRouter(prompt, openRouterModel);
          console.log(`✅ Success with OpenRouter model: ${openRouterModel}`);
          return result;
        } catch (error) {
          lastError = error;
          const status = error.status;
          console.warn(`⚠️ OpenRouter attempt ${attempt + 1} failed:`, error.message);

          if (status === 429 || status === 503 || status === 502 || status === 504) {
            const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
            console.log(`⏳ Waiting ${Math.round(delay)}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }

          throw error;
        }
      }
    }

    // All models and retries failed
    throw lastError || new Error("All AI models are currently unavailable. Please try again later.");
  }

  // Keep the original chatSession export for backward compatibility
  const model = genAI ? genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
  }) : null;

  export const chatSession = model ? model.startChat({
      generationConfig,
  }) : {
      sendMessage: async (prompt) => {
          return sendMessageWithRetry(prompt);
      }
  };