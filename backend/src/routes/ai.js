const express = require("express");
const asyncHandler = require("express-async-handler");
const { GoogleGenAI } = require("@google/genai");
const cheerio = require("cheerio");
const { YoutubeTranscript } = require("youtube-transcript");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Initialize the Gemini client
// Note: It automatically uses process.env.GEMINI_API_KEY if not explicitly passed
const ai = new GoogleGenAI({});

router.use(requireAuth);

router.post("/summarize-url", asyncHandler(async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    let textContent = "";

    // 1. Fetch content (Transcript for YouTube, HTML for normal articles)
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      try {
        const transcript = await YoutubeTranscript.fetchTranscript(url);
        textContent = transcript.map(t => t.text).join(" ");
      } catch (err) {
        console.warn("Transcript fetch failed, falling back to Gemini Search Grounding:", err.message);
        textContent = null; // Signal that we should use Search Grounding
      }
    } else {
      const response = await fetch(url);
      if (!response.ok) {
        return res.status(400).json({ error: `Failed to fetch URL: ${response.statusText}` });
      }
      const html = await response.text();

      // Extract readable text using cheerio
      const $ = cheerio.load(html);
      
      // Remove scripts, styles, and other non-content tags
      $('script, style, noscript, nav, footer, iframe, header').remove();
      
      // Get raw text and clean up whitespace
      let extractedText = $('body').text() || $.text();
      textContent = extractedText.replace(/\s+/g, ' ').trim();
    }

    if (textContent !== null && textContent.length < 50) {
      return res.status(400).json({ error: "Could not extract enough text from the URL to summarize." });
    }

    // Truncate to avoid exceeding token limits (rough approximation)
    const MAX_CHARS = 50000;
    if (textContent !== null && textContent.length > MAX_CHARS) {
      textContent = textContent.substring(0, MAX_CHARS) + "... [content truncated]";
    }

    // 3. Send to Gemini for summarization
    let prompt;
    let tools = undefined;

    if (textContent !== null) {
      prompt = `Please provide a clear, comprehensive, and well-structured summary of the following web page content. 
This summary will be saved as notes in a Personal Knowledge Management System.
Format the output nicely using Markdown (bullet points, headers, etc. if appropriate).

CONTENT TO SUMMARIZE:
---------------------
${textContent}`;
    } else {
      // Fallback for YouTube videos when scraping is blocked
      prompt = `Please provide a clear, comprehensive, and well-structured summary of the following YouTube video.
URL: ${url}
Use your Google Search tool to find information, transcripts, or summaries about this specific video and provide a detailed summary.
Format the output nicely using Markdown (bullet points, headers, etc. if appropriate).`;
      tools = [{ googleSearch: {} }];
    }

    const aiResponse = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
      tools: tools,
    });

    const summary = aiResponse.text;

    res.json({ summary });
  } catch (error) {
    console.error("AI Summarization Error:", error);
    res.status(500).json({ error: "Failed to generate summary. Please check the URL or try again later." });
  }
}));

module.exports = router;
