import { ChatXAI } from '@langchain/xai';
import config from '../config';

export const grokapi = async (prompt: string, model = 'grok-3-latest') => {
  const chat = new ChatXAI({
    apiKey: config.ai.xaiApiKey,
    model,
    temperature: 0.7,
  });
  const response = await chat.invoke(prompt);
  return response.content;
};
