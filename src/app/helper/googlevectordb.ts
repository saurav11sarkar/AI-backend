import { TaskType } from '@google/generative-ai';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { QdrantVectorStore } from '@langchain/qdrant';
import config from '../config';

const embeddings = new GoogleGenerativeAIEmbeddings({
  model: 'gemini-embedding-001', // 768 dimensions
  taskType: TaskType.RETRIEVAL_DOCUMENT,
  title: 'Document title',
});

export const vectorStore = new QdrantVectorStore(embeddings, {
  url: config.ai.qdrangEnpoind,
  apiKey: config.ai.qdrantApiKey,
  collectionName: 'grocery-store',
});
