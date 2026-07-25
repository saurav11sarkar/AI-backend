import { TaskType } from '@google/generative-ai';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';

const embeddings = new GoogleGenerativeAIEmbeddings({
  model: 'gemini-embedding-001', // 768 dimensions
  taskType: TaskType.RETRIEVAL_DOCUMENT,
  title: 'Document title',
});
