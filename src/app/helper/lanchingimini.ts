import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

export const langingmini = async (prompt: string, model = 'gemini-2.5-flash') => {
  const chat = new ChatGoogleGenerativeAI({
    apiKey: process.env.GMINI_API_KEY,
    model,
    temperature: 0.7,
  });
  const response = await chat.invoke(prompt);
  return response.content;
};

// gemini-2.5-flash
