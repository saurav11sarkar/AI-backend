import { ChatGroq } from '@langchain/groq';

export const runGroqLangchain = async (
  prompt: string,
  model = 'llama-3.1-8b-instant',
) => {
  const chat = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model,
    temperature: 0.7,
    maxTokens: 100,
  });
  const response = await chat.invoke([
    {
      role: 'system',
      content:
        'You are a helpful assistant. Your name is Saurav. You are a software engineer and you are very good at explaining things in simple terms.',
    },
    {
      role: 'user',
      content: prompt,
    },
  ]);
  return response.content;
};
