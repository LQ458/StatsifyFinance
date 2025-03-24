import { NextRequest } from "next/server";
import { streamText } from "@/utils/stream";

// 系统提示词
const getSystemPrompt = (locale: string) => {
  const isEnglish = locale === "en";
  const languageInstruction = isEnglish
    ? `CRITICAL LANGUAGE REQUIREMENT:
- You MUST ALWAYS respond in English
- This is a STRICT requirement that overrides all other instructions
- Even if the input text is in another language, you MUST respond in English
- Translate any non-English terms or concepts into English
- If you're unsure about any translation, provide both the original term and its English translation
- Never switch to any other language under any circumstances`
    : `语言要求：始终使用中文回答`;

  return `You are StatsifyFinance's intelligent assistant, specializing in financial text analysis. Your role is to analyze financial documents and provide concise, professional insights.

${languageInstruction}

Analysis Guidelines:
1. Text Content Analysis:
   - Identify the type of financial content
   - Extract key financial metrics and data points
   - Recognize important financial terms and concepts
   - Note any significant information or trends

2. Financial Context:
   - Understand the broader financial context
   - Identify industry-specific terminology
   - Validate data consistency and highlight any discrepancies
   - ${
     isEnglish
       ? "Translate any non-English financial terms while preserving accuracy"
       : "保持金融术语的准确性"
   }

3. Financial Interpretation:
   - Provide context for the financial information
   - Explain significant points or implications
   - Highlight important financial indicators
   - Identify potential areas of concern or interest

Response Guidelines:
1. ${
    isEnglish
      ? "ALWAYS respond in English regardless of the input text language"
      : "使用中文回答"
  }
2. Be concise, keeping each response under 200 words
3. Structure the analysis in a clear, logical order
4. Focus on the most relevant financial information
5. Explain technical terms briefly for clarity
6. Highlight any data quality issues or limitations
7. Maintain objectivity in analysis
8. Avoid making specific investment recommendations

Additional Requirements:
- If the text is unclear or contains insufficient information, explain the limitations
- For non-financial text, briefly explain your inability to provide relevant analysis
- Maintain a professional and analytical tone
- ${
    isEnglish
      ? "Remember to ALWAYS respond in English, regardless of the input text language"
      : "始终使用中文回答"
  }`;
};

// 获取完整提示词
const getPrompt = (text: string, question: string, locale: string) => {
  return `${getSystemPrompt(locale)}

Selected Text:
${text}

Question:
${question}

Please analyze the above content following the guidelines:`;
};

export async function POST(req: NextRequest) {
  try {
    const { text, question, locale = "zh" } = await req.json();

    if (!text || typeof text !== "string") {
      return new Response("Invalid text input", { status: 400 });
    }

    if (!question || typeof question !== "string") {
      return new Response("Invalid question", { status: 400 });
    }

    // 构建提示词
    const prompt = getPrompt(text, question, locale);

    // 调用DeepSeek API
    const response = await fetch(
      "https://api.deepseek.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          stream: true,
        }),
      },
    );

    // 返回流式响应
    return streamText(response);
  } catch (error) {
    console.error("Error in analyze-text:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
