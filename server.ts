import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Voice Assistant AI Endpoint
app.post('/api/gemini/assistant', async (req, res) => {
  try {
    const { prompt, language = 'bn', screenContext } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!ai) {
      // Graceful fallback response when API key is pending
      const fallbackResponse =
        language === 'bn'
          ? 'নমস্কার! আমি পূজা। আপনার অনুরোধটি পেয়েছি: "' +
            prompt +
            '"। আমার এআই ব্রেন সম্পূর্ণ প্রস্তুত হতে সেটিংস থেকে জেমিনাই এপিআই সংযুক্ত রয়েছে কিনা যাচাই করুন।'
          : `Hello! I am Pooja Assistant. Received your query: "${prompt}". I am ready to assist you.`;
      return res.json({
        reply: fallbackResponse,
        language,
        timestamp: Date.now(),
        source: 'local-fallback',
      });
    }

    const systemInstruction = `You are "Pooja" (পূজা), an ultra-smart, polite, and helpful Android AI Voice Assistant tailored for users speaking Bengali (বাংলা) and English.
Guidelines:
1. Always reply in the same language as the user's intent or query. If the query is in Bengali (or Bengali script/phonetic), respond in natural, graceful Bengali (বাংলা). If English, reply in crisp English.
2. The user will listen to your answer via Text-to-Speech (TTS) on their smartphone. Therefore:
   - Keep answers concise, informative, and conversational (1 to 3 short sentences maximum).
   - Avoid complex markdown tables, asterisks, bullet points, or hard-to-pronounce symbols.
   - Speak warmly as Pooja. E.g., in Bengali, use phrases like "হ্যাঁ, আমি বলে দিচ্ছি...", "অবশ্যই!", "আমি পূজা, আপনার কী সাহায্য করতে পারি?".
3. If screen context is provided (from the Android Accessibility Service), analyze it when relevant to the user's question.`;

    let userContent = prompt;
    if (screenContext) {
      userContent += `\n[Screen Content from Android Accessibility Service]: ${screenContext}`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userContent,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText =
      response.text?.trim() ||
      (language === 'bn'
        ? 'দুঃখিত, আমি এই মুহূর্তে উত্তরটি প্রক্রিয়াজাত করতে পারিনি।'
        : "Sorry, I couldn't process that response at the moment.");

    res.json({
      reply: replyText,
      language,
      timestamp: Date.now(),
      source: 'gemini-3.8-flash',
    });
  } catch (error: any) {
    console.error('Error handling Gemini assistant request:', error);
    res.status(500).json({
      error: error?.message || 'Internal server error processing voice query',
      reply:
        req.body?.language === 'bn'
          ? 'দুঃখিত, সংযোগে একটি সমস্যা হয়েছে। দয়া করে আবার বলুন।'
          : 'Sorry, a connection issue occurred. Please try speaking again.',
    });
  }
});

// Setup Vite middlewares for development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Pooja Assistant server running on port ${PORT}`);
  });
}

startServer();
