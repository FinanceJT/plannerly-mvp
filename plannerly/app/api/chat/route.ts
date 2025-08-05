import OpenAI from "openai";

export const runtime = 'edge';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Stub prompt builder - can be enhanced to include system prompts
function buildPrompt(messages: ChatMessage[]): ChatMessage[] {
  return messages;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  const { messages } = await req.json();
  const promptMessages = buildPrompt(messages);

  // Create a chat completion with streaming enabled
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: promptMessages,
    stream: true,
  });

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of response) {
        const content = chunk.choices?.[0]?.delta?.content;
        if (content) {
          controller.enqueue(encoder.encode(content));
        }
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
