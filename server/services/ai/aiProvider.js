const { GoogleGenAI } = require('@google/genai');
const OpenAI = require('openai');

class AIProvider {
  constructor() {
    this.provider = process.env.AI_PROVIDER || 'gemini';
    this.geminiClient = null;
    this.openaiClient = null;
    this.initClients();
  }

  initClients() {
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '') {
      try {
        this.geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        console.log('[AI Provider] Initialized Google Gemini client');
      } catch (err) {
        console.warn('[AI Provider] Could not initialize Gemini:', err.message);
      }
    }

    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== '') {
      try {
        this.openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        console.log('[AI Provider] Initialized OpenAI client');
      } catch (err) {
        console.warn('[AI Provider] Could not initialize OpenAI:', err.message);
      }
    }
  }

  async callAI({ systemInstruction, prompt, fallbackHandler }) {
    this.provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase();

    // 1. Try Gemini if configured
    if (this.provider === 'gemini' && (process.env.GEMINI_API_KEY || '').trim() !== '') {
      try {
        if (!this.geminiClient) this.initClients();
        if (this.geminiClient) {
          // Use standard Gemini call
          const response = await this.geminiClient.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `${systemInstruction ? `[SYSTEM]: ${systemInstruction}\n\n` : ''}${prompt}\n\nIMPORTANT: Respond with pure JSON only. Do not enclose in markdown code blocks if possible.`,
            config: {
              responseMimeType: 'application/json',
            },
          });

          const rawText = response.text ? response.text.trim() : '';
          const cleanedText = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
          return JSON.parse(cleanedText);
        }
      } catch (err) {
        console.warn(`[AI Provider] Gemini API request failed (${err.message}). Falling back to internal engine.`);
      }
    }

    // 2. Try OpenAI if configured
    if (this.provider === 'openai' && (process.env.OPENAI_API_KEY || '').trim() !== '') {
      try {
        if (!this.openaiClient) this.initClients();
        if (this.openaiClient) {
          const completion = await this.openaiClient.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemInstruction || 'You are an expert technical interviewer and reviewer. Always output pure valid JSON.' },
              { role: 'user', content: prompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.3,
          });

          const content = completion.choices[0]?.message?.content?.trim();
          return JSON.parse(content);
        }
      } catch (err) {
        console.warn(`[AI Provider] OpenAI API request failed (${err.message}). Falling back to internal engine.`);
      }
    }

    // 3. Fallback to specialized algorithmic engine
    if (fallbackHandler && typeof fallbackHandler === 'function') {
      return fallbackHandler();
    }

    throw new Error('AI Provider could not fulfill request and no fallback was specified.');
  }
}

module.exports = new AIProvider();
