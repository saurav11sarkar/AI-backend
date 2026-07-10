import OpenAI from 'openai';
import config from '../config';

const openai = new OpenAI({
  apiKey: config.ai.openaiApiKey,
});

const generateAiText = async (prompt: string, model = 'gpt-4o-mini') => {
  const response = await openai.responses.create({
    model,
    input: prompt,
  });

  return response.output_text;
};

export { openai, generateAiText };
