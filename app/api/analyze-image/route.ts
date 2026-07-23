import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/auth";
import { recognizeImageText } from "@/libs/baidu-ocr";
import { recordProductEvent } from "@/libs/product-events";
import {
  jsonInputError,
  MAX_IMAGE_BODY_BYTES,
  parseImageAnalysisRequest,
  readJsonBody,
  RequestInputError,
} from "@/libs/request-validation";
import { streamText } from "@/utils/stream";

interface OCRWordResult {
  words: string;
}

const getSystemPrompt = (locale: string) => {
  const isEnglish = locale === "en";
  return `You are StatsifyFinance's financial image analysis assistant.

${isEnglish ? "Always respond in English." : "始终使用中文回答。"}

Identify the financial document or chart, extract key metrics and trends, explain important implications, state data-quality limitations, remain objective, and avoid specific investment recommendations. Keep the response under 200 words.`;
};

const getPrompt = (question: string, words: OCRWordResult[]): string => {
  const extractedText = words
    .map((item) => item.words)
    .join("\n")
    .slice(0, 12_000);

  return `Content to analyze:
${extractedText}

Question: ${question}

Provide a direct financial analysis. Do not mention OCR or image-processing details.`;
};

export async function POST(req: NextRequest) {
  try {
    const body = await readJsonBody(req, MAX_IMAGE_BODY_BYTES);
    const parsed = parseImageAnalysisRequest(body);

    const baiduApiKey = process.env.BAIDU_API_KEY;
    const baiduSecretKey = process.env.BAIDU_SECRET_KEY;
    const endpoint = process.env.DEEPSEEK_ALT_BASE_URL;
    const deepseekApiKey = process.env.DEEPSEEK_ALT_API_KEY;
    if (!baiduApiKey || !baiduSecretKey || !endpoint || !deepseekApiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Image analysis is unavailable",
          code: "SERVICE_UNAVAILABLE",
        },
        { status: 503 },
      );
    }

    const session = await getServerSession(authOptions);
    const words = await recognizeImageText(parsed.base64);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${deepseekApiKey}`,
      },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_ALT_MODEL ?? "deepseek-ai/DeepSeek-V3",
        messages: [
          {
            role: "system",
            content: getSystemPrompt(parsed.locale),
          },
          {
            role: "user",
            content: getPrompt(parsed.question, words),
          },
        ],
        temperature: 0.7,
        stream: true,
      }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: "Image analysis is temporarily unavailable",
          code: "UPSTREAM_ERROR",
        },
        { status: 502 },
      );
    }

    const headers = new Headers({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    return streamText(response, headers, async () => {
      await recordProductEvent(
        "image_analysis_completed",
        Boolean(session?.user?.id),
      );
    });
  } catch (error) {
    if (error instanceof RequestInputError) {
      return jsonInputError(error);
    }

    return NextResponse.json(
      {
        success: false,
        error: "Image analysis is temporarily unavailable",
        code: "INTERNAL_SERVER_ERROR",
      },
      { status: 500 },
    );
  }
}
