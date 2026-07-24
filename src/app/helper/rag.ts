import { ChatGroq } from '@langchain/groq';
import config from '../config';

export const llm = new ChatGroq({
  apiKey: config.ai.groqApikey as string,
  model: 'llama-3.3-70b-versatile',
  temperature: 0.7,
  maxTokens: 100,
  maxRetries: 2,
});
