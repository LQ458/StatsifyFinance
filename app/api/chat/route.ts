import { NextResponse } from "next/server";
import { DeepseekChat } from "./deepseek";

const deepseek = new DeepseekChat({
  apiKey: process.env.DEEPSEEK_API_KEY!,
  baseURL: "https://api.deepseek.com/v1",
});

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    const systemPrompt = `你是 StatsifyFinance 的 AI 助手,专门解答金融分析相关问题。
    请用专业且易懂的方式回答问题,适当加入示例说明。
    如果涉及代码,请使用 markdown 代码块。
    如果不确定的内容,请明确说明。`;

    // 创建流式响应
    const stream = await deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      stream: true,
    });

    // 返回 ReadableStream
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || "";
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ text })}\n\n`),
          );
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { success: false, error: "AI 响应失败" },
      { status: 500 },
    );
  }
}
