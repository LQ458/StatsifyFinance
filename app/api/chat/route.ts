import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    // 这里可以接入实际的AI服务
    const aiResponse = `
# ${message}

这是一个关于 **${message}** 的详细解释:

## 主要概念

${message}是金融分析中的重要指标，主要用于...

## 计算方法

可以使用以下公式计算:

\`\`\`python
def calculate_metric(data):
    return data.mean() / data.std()
\`\`\`

## 应用场景

1. 投资决策
2. 风险管理
3. 组合优化

## 相关指标

- 指标A
- 指标B
- 指标C
    `;

    return NextResponse.json({
      success: true,
      message: aiResponse,
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get AI response" },
      { status: 500 },
    );
  }
}
