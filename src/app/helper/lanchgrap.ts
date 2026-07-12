import { StateGraph, MessagesAnnotation } from '@langchain/langgraph';
import { ChatGroq } from '@langchain/groq';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import { tool } from '@langchain/core/tools';
import { AIMessage } from '@langchain/core/messages';
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Beginner-friendly LangGraph example with tool calling
//
//   START -> agent (ask the AI) -> tools? -> agent -> ... -> END
//
// The AI answers directly, OR it can call a "tool" (a normal function) to
// get extra information, then use the tool's result to answer.
// ---------------------------------------------------------------------------

// 1. Define a tool. This is a plain function the AI is allowed to call.
const getCurrentTime = tool(
  async () => {
    return new Date().toISOString();
  },
  {
    name: 'get_current_time',
    description: 'Get the current date and time.',
    schema: z.object({}),
  },
);

const tools = [getCurrentTime];
const toolNode = new ToolNode(tools);

// 2. The AI model we want to talk to, with the tools bound to it so it
//    knows they exist and can decide to call them.
const model = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: 'llama-3.1-8b-instant',
  temperature: 0.7,
  maxTokens: 1024,
}).bindTools(tools);

// 3. The "agent" node: takes the conversation so far (state.messages),
//    sends it to the AI, and returns the AI's reply.
const callModel = async (state: typeof MessagesAnnotation.State) => {
  const response = await model.invoke(state.messages);
  return { messages: [response] };
};

// 4. After the agent replies, decide: did it ask to call a tool, or is
//    it done? `tool_calls` only exists on AI messages, and is empty
//    when the AI didn't request a tool - so we guard both cases.
const shouldContinue = (state: typeof MessagesAnnotation.State) => {
  const lastMessage = state.messages[state.messages.length - 1];
  if (lastMessage instanceof AIMessage && lastMessage.tool_calls?.length) {
    return 'tools';
  }
  return '__end__';
};

// 5. Wire the graph together: start -> agent -> (tools -> agent)* -> end.
const graph = new StateGraph(MessagesAnnotation)
  .addNode('agent', callModel)
  .addNode('tools', toolNode)
  .addEdge('__start__', 'agent')
  .addEdge('tools', 'agent')
  .addConditionalEdges('agent', shouldContinue)
  .compile();

// 4. Simple helper: pass a plain text question in, get the AI's answer back.
export const runLangchainGraph = async (prompt: string) => {
  try {
    const result = await graph.invoke({
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant. Your name is Saurav. You are a software engineer and you are very good at explaining things in simple terms. ' +
            'You only have access to these tools: get_current_time. Never call, mention, or make up any other tool (e.g. search or weather tools). ' +
            "If a question needs a tool you don't have, say honestly that you don't have access to that information instead of pretending to look it up.",
        },
        { role: 'user', content: prompt },
      ],
    });

    const lastMessage = result.messages[result.messages.length - 1];

    return {
      prompt,
      answer: String(lastMessage.content),
    };
  } catch {
    // The model can occasionally "hallucinate" a call to a tool it doesn't
    // actually have (e.g. a search/weather tool), which the API rejects.
    // Fail soft instead of throwing a 500 for what is really an AI mistake.
    return {
      prompt,
      answer:
        "Sorry, I don't have access to that information right now. Could you ask something else?",
    };
  }
};
