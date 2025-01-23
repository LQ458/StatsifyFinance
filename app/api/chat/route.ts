import { NextResponse } from "next/server";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { streamText } from "ai";
import { z } from "zod";

// 验证请求体的 schema
const requestSchema = z.object({
  message: z.string().min(1).max(1000),
  locale: z.string().default("zh"),
});

// 系统提示词
const getSystemPrompt = (locale: string) => {
  const isEnglish = locale === "en";
  const languageInstruction = isEnglish
    ? `CRITICAL LANGUAGE REQUIREMENT:
- You MUST ALWAYS respond in English
- This is a STRICT requirement that overrides all other instructions
- Even if the user writes in another language, you MUST respond in English
- Translate any non-English terms or concepts into English
- If you're unsure about any translation, provide both the original term and its English translation
- Never switch to any other language under any circumstances`
    : `语言要求：始终使用中文回答`;

  return `You are StatsifyFinance's intelligent assistant, specializing in financial analysis. Your role is to assist users in resolving complex problems and providing concise, professional insights.

${languageInstruction}

Expertise Areas:
1. Quantitative Analysis:
   - Technical Indicators: Explain and apply common technical indicators
   - Strategy Backtesting: Validate investment strategies using historical data
   - Risk Assessment: Calculate metrics such as volatility and VAR

2. Fundamental Analysis:
   - Financial Statement Analysis: Interpret balance sheets, income statements, and cash flow statements
   - Industry Analysis: Identify industry trends and competitive landscapes
   - Macroeconomic Analysis: Assess the impact of macroeconomic factors on investments

3. Portfolio Management:
   - Asset Allocation: Optimize multi-asset portfolios
   - Risk Management: Identify and mitigate potential risks
   - Investment Strategies: Develop data-driven investment strategies

Response Guidelines:
1. ${isEnglish ? "ALWAYS respond in English regardless of the input language" : "使用中文回答"}
2. Be concise, keeping each response under 300 words
3. Provide direct answers without restating the user's question
4. List key points in a clear and logical order
5. Include brief explanations for technical terms to ensure user understanding
6. Use Markdown code blocks for any code examples and ensure proper formatting
7. Clearly state uncertainty if the answer is not definitive; avoid speculation
8. Maintain objectivity and neutrality, refraining from providing specific investment advice

Additional Requirements:
- If the question falls outside the scope of financial analysis, briefly explain your inability to answer and suggest consulting relevant experts
- Maintain a professional and credible tone to ensure trustworthiness
- ${isEnglish ? "Remember to ALWAYS respond in English, regardless of the input language" : "始终使用中文回答"}`;
};

const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY ?? "",
  baseURL: process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com",
});

export async function POST(request: Request) {
  try {
    // 解析并验证请求体
    const body = await request.json();
    const { message, locale } = requestSchema.parse(body);

    // 检查 API key 是否配置
    if (!process.env.DEEPSEEK_API_KEY) {
      throw new Error("DEEPSEEK_API_KEY not configured");
    }

    const stream = await streamText({
      model: deepseek("deepseek-chat"),
      messages: [
        { role: "system", content: getSystemPrompt(locale) },
        { role: "user", content: message },
      ],
      temperature: 0.7,
      maxTokens: 1000,
    });

    // 使用 SDK 提供的方法返回流式响应
    return stream.toDataStreamResponse();
  } catch (error: unknown) {
    console.error("Chat API Error:", error);

    // 区分不同类型的错误
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "无效的请求参数", details: error.errors },
        { status: 400 },
      );
    }

    if (
      error instanceof Error &&
      error.message === "DEEPSEEK_API_KEY not configured"
    ) {
      return NextResponse.json(
        { success: false, error: "服务配置错误" },
        { status: 500 },
      );
    }

    // API 调用错误
    if (error instanceof Error && error.message.includes("deepseek")) {
      return NextResponse.json(
        { success: false, error: "AI 服务暂时不可用" },
        { status: 503 },
      );
    }

    // 其他未知错误
    return NextResponse.json(
      { success: false, error: "服务器内部错误" },
      { status: 500 },
    );
  }
}
