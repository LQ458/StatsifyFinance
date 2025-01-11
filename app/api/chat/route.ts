import { NextResponse } from "next/server";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { streamText } from "ai";
import { z } from "zod";

// 验证请求体的 schema
const requestSchema = z.object({
  message: z.string().min(1).max(1000),
});

// 系统提示词
const SYSTEM_PROMPT = `你是 StatsifyFinance 的 AI 助手,专门解答金融分析相关问题。

专业领域:
- 量化分析: 技术指标、策略回测、风险评估
- 基本面分析: 财务报表分析、行业分析、宏观经济分析  
- 投资组合: 资产配置、风险管理、投资策略

回答要求:
1. 使用专业且易懂的方式解释概念
2. 适当加入实际案例和数据说明
3. 代码示例使用 markdown 代码块
4. 不确定的内容要明确说明
5. 保持客观中立,不推荐具体投资建议

如果问题超出金融分析范围,请礼貌说明并建议咨询其他专业人士。`;

const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY ?? "",
  baseURL: process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com",
});

export async function POST(request: Request) {
  try {
    // 解析并验证请求体
    const body = await request.json();
    const { message } = requestSchema.parse(body);

    // 检查 API key 是否配置
    if (!process.env.DEEPSEEK_API_KEY) {
      throw new Error("DEEPSEEK_API_KEY not configured");
    }

    const stream = await streamText({
      model: deepseek("deepseek-chat"),
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message },
      ],
      temperature: 0.7,
      maxTokens: 2000,
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
