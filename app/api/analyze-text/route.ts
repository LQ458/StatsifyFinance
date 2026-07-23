import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/auth";
import { recordProductEvent } from "@/libs/product-events";
import {
  jsonInputError,
  MAX_TEXT_BODY_BYTES,
  readJsonBody,
  RequestInputError,
  textAnalysisRequestSchema,
} from "@/libs/request-validation";
import { streamText } from "@/utils/stream";

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
1. Identify the type of financial content, key metrics, terminology, and trends.
2. Explain relevant context, consistency issues, and important implications.
3. Remain objective and avoid specific investment recommendations.

Response Guidelines:
1. ${isEnglish ? "Always respond in English." : "使用中文回答。"}
2. Keep the response under 200 words.
3. Use a clear logical structure and briefly explain technical terms.
4. State limitations when the source is unclear or insufficient.`;
};

const getPrompt = (text: string, question: string, locale: string) => {
  return `${getSystemPrompt(locale)}

Selected Text:
${text}

Question:
${question}

Please analyze the content following the guidelines above.`;
};

export async function POST(req: NextRequest) {
  try {
    const body = await readJsonBody(req, MAX_TEXT_BODY_BYTES);
    const parsed = textAnalysisRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid text analysis request",
          code: "INVALID_INPUT",
        },
        { status: 400 },
      );
    }

    const endpoint = process.env.DEEPSEEK_ALT_BASE_URL;
    const apiKey = process.env.DEEPSEEK_ALT_API_KEY;
    if (!endpoint || !apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Text analysis is unavailable",
          code: "SERVICE_UNAVAILABLE",
        },
        { status: 503 },
      );
    }

    const session = await getServerSession(authOptions);
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_ALT_MODEL ?? "deepseek-ai/DeepSeek-V3",
        messages: [
          {
            role: "user",
            content: getPrompt(
              parsed.data.text,
              parsed.data.question,
              parsed.data.locale,
            ),
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
          error: "Text analysis is temporarily unavailable",
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
        "text_analysis_completed",
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
        error: "Text analysis is temporarily unavailable",
        code: "INTERNAL_SERVER_ERROR",
      },
      { status: 500 },
    );
  }
}
