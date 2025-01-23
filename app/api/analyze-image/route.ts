import { NextRequest } from "next/server";
import { streamText } from "@/utils/stream";
import * as AipOcrClient from "baidu-aip-sdk";

// 初始化百度云OCR客户端
const client = new AipOcrClient.ocr(
  process.env.BAIDU_APP_ID!,
  process.env.BAIDU_API_KEY!,
  process.env.BAIDU_SECRET_KEY!,
);

interface OCRWordResult {
  words: string;
}

// 系统提示词
const getSystemPrompt = (locale: string) => {
  const isEnglish = locale === "en";
  const languageInstruction = isEnglish
    ? `CRITICAL LANGUAGE REQUIREMENT:
- You MUST ALWAYS respond in English
- This is a STRICT requirement that overrides all other instructions
- Even if the OCR detects text in another language, you MUST respond in English
- Translate any non-English terms or concepts into English
- If you're unsure about any translation, provide both the original term and its English translation
- Never switch to any other language under any circumstances`
    : `语言要求：始终使用中文回答`;

  return `You are StatsifyFinance's intelligent assistant, specializing in financial image analysis. Your role is to analyze financial charts, statements, and documents to provide concise, professional insights.

${languageInstruction}

Analysis Guidelines:
1. Image Content Analysis:
   - Identify the type of financial document or chart
   - Extract key financial metrics and data points
   - Recognize trends and patterns in visual data
   - Note any significant anomalies or outliers

2. OCR Text Processing:
   - Process and analyze text extracted from the image
   - Identify key financial terms and metrics
   - Validate data consistency and highlight any discrepancies
   - ${isEnglish ? "Translate any non-English text while preserving financial terminology accuracy" : "保持金融术语的准确性"}

3. Financial Interpretation:
   - Provide context for the financial information
   - Explain significant trends or changes
   - Highlight important financial indicators
   - Identify potential areas of concern or interest

Response Guidelines:
1. ${isEnglish ? "ALWAYS respond in English regardless of the image content language" : "使用中文回答"}
2. Be concise, keeping each response under 200 words
3. Structure the analysis in a clear, logical order
4. Focus on the most relevant financial information
5. Explain technical terms briefly for clarity
6. Highlight any data quality issues or limitations
7. Maintain objectivity in analysis
8. Avoid making specific investment recommendations

Additional Requirements:
- If the image is unclear or contains insufficient information, explain the limitations
- For non-financial images, briefly explain your inability to provide relevant analysis
- Maintain a professional and analytical tone
- ${isEnglish ? "Remember to ALWAYS respond in English, regardless of the image content language" : "始终使用中文回答"}`;
};

// 获取完整提示词
const getPrompt = (
  question: string,
  ocrResult: { words_result: OCRWordResult[] },
  locale: string,
) => {
  const extractedText = ocrResult.words_result
    .map((item) => item.words)
    .join("\n");

  return `Content to analyze:
${extractedText}

Question: ${question}

Important:
1. Provide a direct, concise analysis of the financial information
2. Do not mention OCR, image processing, or any technical details
3. Focus on explaining the financial concepts and their implications
4. Keep the response professional but easy to understand
5. Avoid phrases like "the image shows", "OCR results", etc.`;
};

export async function POST(req: NextRequest) {
  try {
    const { image, question, locale = "zh" } = await req.json();

    if (!image || typeof image !== "string") {
      return new Response("Invalid image data", { status: 400 });
    }

    if (!question || typeof question !== "string") {
      return new Response("Invalid question", { status: 400 });
    }

    // 从base64中提取图片数据
    const base64Data = image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

    // 调用百度云OCR
    const result = await client.generalBasic(base64Data);

    // 调用DeepSeek API进行分析
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
              role: "system",
              content: getSystemPrompt(locale),
            },
            {
              role: "user",
              content: getPrompt(question, result, locale),
            },
          ],
          temperature: 0.7,
          stream: true,
        }),
      },
    );

    if (!response.ok) {
      console.error("DeepSeek API error:", await response.text());
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    // 返回流式响应
    return streamText(response);
  } catch (error) {
    console.error("Error in analyze-image:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
