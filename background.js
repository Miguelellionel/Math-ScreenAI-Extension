chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "analyzeImage") {
    handleGeminiRequest(request.apiKey, request.base64Image)
      .then(response => sendResponse(response))
      .catch(error => sendResponse({ error: error.message }));
    
    return true; 
  }
});

async function handleGeminiRequest(apiKey, base64Image) {
  const modelName = "models/gemini-3.5-flash-lite"; 
  const url = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`;

  // UPDATED PROMPT: Forbids LaTeX and forces actual Unicode math symbols
  const systemPrompt = `You are an expert problem solver. Your ONLY goal is to provide the direct, final answers to the problems shown on the screen.

  - If it is a categorization/matching task, output exactly which items belong in which category.
  - If it is a math problem, solve it and provide the final answer.
  - If it is a question, answer it directly.

  STRICT FORMATTING RULES:
  1. Use ACTUAL Unicode math symbols (like ∈, ×, ÷, ≤, ≥, π, √, ∑, ±) instead of LaTeX code. NEVER use backslashes for math symbols (e.g., use '∈' instead of '\\in', use '×' instead of '\\times').
  2. DO NOT describe the screen or say "Based on the image".
  3. DO NOT mention blurriness, resolution, or that you are an AI.
  4. DO NOT give meta-commentary or introductions.
  5. Just output the direct, clear, formatted answers immediately.`;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          { text: systemPrompt },
          { inline_data: { mime_type: "image/jpeg", data: base64Image } }
        ]
      }
    ],
    generationConfig: { 
      temperature: 0.2, 
      maxOutputTokens: 500 
    }
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const result = await response.json();

    if (result.candidates && result.candidates[0]?.content?.parts[0]?.text) {
      return { 
        success: true, 
        text: result.candidates[0].content.parts[0].text.trim().replace(/[`"]/g, '') 
      };
    } else {
      throw new Error("Empty or invalid response from AI.");
    }
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error("Request timed out after 30s. Check your internet or API key restrictions.");
    }
    throw error;
  }
}