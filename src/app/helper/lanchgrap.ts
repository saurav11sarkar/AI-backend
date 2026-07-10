import { Annotation, StateGraph } from '@langchain/langgraph';
import { ChatGroq } from '@langchain/groq';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const StateAnnotation = Annotation.Root({
  prompt: Annotation<string>,
  aiMsg: Annotation<ChatMessage[]>,
});

const callLLM = async (state: typeof StateAnnotation.State) => {
  const chat = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: 'llama-3.1-8b-instant',
    temperature: 0.7,
    maxTokens: 100,
  });

  const messages = [
    {
      role: 'system' as const,
      content:
        'You are a helpful assistant. Your name is Saurav. You are a software engineer and you are very good at explaining things in simple terms.',
    },
    {
      role: 'user' as const,
      content: state.prompt,
    },
  ];

  const response = await chat.invoke(messages);

  const aiMsg: ChatMessage[] = [
    ...messages,
    { role: 'assistant' as const, content: String(response.content) },
  ];

  return { aiMsg };
};

const runLangGraph = new StateGraph(StateAnnotation)
  .addNode('agent', callLLM)
  .addEdge('__start__', 'agent')
  .addEdge('agent', '__end__')
  .compile();

export const runLangchainGraph = async (
  prompt: string,
): Promise<{ prompt: string; aiMsg: ChatMessage[] }> => {
  const initialState = {
    prompt,
  };

  return runLangGraph.invoke(initialState);
};
