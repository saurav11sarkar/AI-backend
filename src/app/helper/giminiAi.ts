import { GoogleGenAI } from '@google/genai';
import config from '../config';

const ai = new GoogleGenAI({
  apiKey: config.ai.gminiApiKey,
});

async function generateGminiText(prompt: string, model = 'gemini-2.5-flash') {
  const response = await ai.models.generateContent({
    model,
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    config: {
      systemInstruction: 'You are a helpful assistant. Your name is Saurav.',
    },
  });
  return response.text;
}

export { generateGminiText };
