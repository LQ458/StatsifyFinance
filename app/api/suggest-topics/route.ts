import { createTranslator } from "next-intl";
import { NextResponse } from "next/server";
import messages from "@/messages/zh.json";

export async function POST(request: Request) {
  const { pageType, locale = "zh" } = await request.json();

  // 创建翻译器实例
  const t = createTranslator({ locale, messages });

  const topics =
    pageType === "quantitative"
      ? [
          {
            title: t("analysis.quantitative.categories.profitability"),
          },
        ]
      : [];

  return NextResponse.json({ success: true, data: topics });
}
