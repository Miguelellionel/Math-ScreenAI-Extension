document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput = document.getElementById('apiKey');
  const saveKeyBtn = document.getElementById('saveKey');
  const status = document.getElementById('status');
  const scanBtn = document.getElementById('scanBtn');
  const spinner = document.getElementById('spinner');
  const resultDiv = document.getElementById('result');
  const modelInfo = document.getElementById('modelInfo');

  // 1. Load saved API key AND the last answer
  chrome.storage.local.get(['aiApiKey', 'lastAnswer'], (result) => {
    if (result.aiApiKey) apiKeyInput.value = result.aiApiKey;
    
    // If we have a previous answer, show it immediately so they don't have to rescan!
    if (result.lastAnswer) {
      resultDiv.innerHTML = formatAIResponse(result.lastAnswer);
      resultDiv.style.display = 'block';
      scanBtn.textContent = "🔄 Rescan Screen"; // Change button text to indicate it's a rescan
    }
  });

  // 2. Save API key
  saveKeyBtn.addEventListener('click', () => {
    const key = apiKeyInput.value.trim();
    if (!key) return;
    chrome.storage.local.set({ aiApiKey: key }, () => {
      status.style.display = 'block';
      setTimeout(() => status.style.display = 'none', 1500);
    });
  });

  // 3. Scan / Rescan Logic
  scanBtn.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();
    
    scanBtn.disabled = true;
    scanBtn.textContent = "Scanning...";
    spinner.style.display = 'block';
    resultDiv.style.display = 'none';
    if (modelInfo) modelInfo.textContent = "Preparing image...";

    try {
      if (!apiKey) throw new Error("NO_API_KEY");

      const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'jpeg', quality: 50 });
      const rawBase64 = dataUrl.split(',')[1];

      if (modelInfo) modelInfo.textContent = "Compressing image...";
      // High quality (1280px, 80%) so the AI can actually read drag-and-drop items clearly
      const compressedBase64 = await compressImage(rawBase64, 1280, 0.8);

      if (modelInfo) modelInfo.textContent = "Asking AI...";
      const aiResponse = await chrome.runtime.sendMessage({ 
        action: "analyzeImage", 
        apiKey: apiKey, 
        base64Image: compressedBase64 
      });

      if (aiResponse.error) throw new Error(aiResponse.error);

      const rawText = aiResponse.text;

      // --- SAVE THE ANSWER SO IT SURVIVES CLICKING AWAY ---
      chrome.storage.local.set({ lastAnswer: rawText });

      // Format and show the answer
      const formattedHTML = formatAIResponse(rawText);
      resultDiv.innerHTML = formattedHTML;
      resultDiv.style.display = 'block';
      scanBtn.textContent = "🔄 Rescan Screen";
      
    } catch (error) {
      if (error.message.includes('429') || error.message.includes('quota')) {
        resultDiv.innerHTML = `⚠️ <b>AI is overloaded.</b><br><span style="font-size:14px;">Wait a minute, or add your own free API key above.</span>`;
      } else if (error.message === "NO_API_KEY") {
        resultDiv.innerHTML = `⚠️ <b>No API Key set.</b><br><span style="font-size:14px;">Add a free Gemini key above.</span>`;
      } else {
        resultDiv.textContent = "Error: " + error.message;
      }
      resultDiv.style.display = 'block';
      if (modelInfo) modelInfo.textContent = "";
      
    } finally {
      scanBtn.disabled = false;
      spinner.style.display = 'none';
    }
  });
});

// --- CUSTOM FORMATTER (Makes Markdown and Math look beautiful) ---
function formatAIResponse(text) {
  let html = text;

  // 1. Block Math: $$math$$
  html = html.replace(/\$\$(.*?)\$\$/g, '<div class="math-block">$1</div>');

  // 2. Inline Math: $math$
  html = html.replace(/\$(.*?)\$/g, '<span class="math">$1</span>');

  // 3. Bold: **text**
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // 4. Lists: lines starting with "* " or "- "
  const lines = html.split('\n');
  const formattedLines = lines.map(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      return `<div class="list-item">• ${trimmed.substring(2)}</div>`;
    }
    if (trimmed.length > 0) {
      return `<p>${trimmed}</p>`;
    }
    return '';
  });
  
  html = formattedLines.join('');
  html = html.replace(/<p>\s*<\/p>/g, '');

  return html;
}

// --- HELPER: Resize and compress image ---
function compressImage(base64String, maxWidth = 1280, quality = 0.8) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, maxWidth / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      resolve(canvas.toDataURL('image/jpeg', quality).split(',')[1]);
    };
    img.onerror = () => resolve(base64String); 
    img.src = 'data:image/jpeg;base64,' + base64String;
  });
}