# 👁️ Screen AI Agent

An AI-powered browser extension that "looks" at your active screen and instantly solves problems, categorizes items, answers questions, or explains text. 

Unlike standard extensions that only read the hidden HTML of a specific website, Screen AI Agent uses Google's Gemini Vision API to literally **see** your screen. It works on **any website**, PDF, or interactive drag-and-drop quiz.

##  Features

- **Universal Compatibility:** Works on any website. No need to whitelist URLs.
- **Vision AI Powered:** Uses Google Gemini to read text, numbers, images, and layouts directly from a screenshot.
- **Smart State Memory:** Clicking away from the extension doesn't delete your answers. The last result is saved and instantly shown when you reopen the popup.
- **Beautiful Formatting:** Automatically renders Markdown (bolding, lists) and uses clean Unicode math symbols (like `∈`, `×`, `÷`) instead of broken LaTeX code.
- **Optimized Performance:** Intelligently compresses and resizes screenshots to ensure lightning-fast API responses without sacrificing text readability.
- **Privacy First:** The extension only captures the active tab (the popup itself is excluded from the screenshot).

## ️ Prerequisites

To use this extension, you need a **free Gemini API key** from Google.
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Click **Create API Key**.
3. Copy the key.

## 📥 Installation

1. **Download the Code:**
   Clone this repository or download the source code as a ZIP file and extract it to a folder on your computer.

2. **Open Extensions Page:**
   - **Chrome/Brave:** Navigate to `chrome://extensions/`
   - **Edge:** Navigate to `edge://extensions/`

3. **Enable Developer Mode:**
   Toggle the **Developer mode** switch in the top right corner of the page.

4. **Load the Extension:**
   Click the **Load unpacked** button in the top left corner. Select the folder where you extracted the extension files.

5. **Pin the Extension:**
   Click the puzzle piece icon 🧩 in your browser toolbar, find **Screen AI Agent**, and click the pin icon 📌 to keep it easily accessible.

## 🚀 How to Use

1. Click the **Screen AI Agent** icon in your browser toolbar.
2. Paste your free Gemini API key into the input box and click **Save Key**.
3. Navigate to any webpage, quiz, or document.
4. Click **📸 Scan Screen**.
5. Wait a few seconds for the AI to analyze the image and render the answer.

*Note: If you click away from the popup to interact with the page, simply click the extension icon again. Your previous answer will still be there!*

## ⚠️ Troubleshooting

- **"Request timed out" Error:** This usually happens if your API key has "Application Restrictions" (like HTTP Referrers) enabled in the Google Cloud Console. Ensure your API key restrictions are set to **None**.
- **Extension doesn't work on `chrome://` pages:** For security reasons, Chrome extensions cannot take screenshots of internal browser pages (like the New Tab page, Settings, or the Chrome Web Store). It must be used on standard `https://` websites.
- **AI gives weird answers:** The AI is highly dependent on image clarity. If the text on your screen is very small, try zooming in on the webpage before scanning.

## 📂 Project Structure

- `manifest.json`: Extension configuration (Manifest V3).
- `popup.html`: The user interface for the extension popup.
- `popup.js`: Handles UI logic, image compression, and custom Markdown/Unicode formatting.
- `background.js`: The service worker that securely communicates with the Gemini API.

## 📜 License

This project is open-source and available for personal and educational use.
