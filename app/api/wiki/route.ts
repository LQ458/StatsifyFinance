import Articles from "@/models/wiki-articles";
import { DBconnect } from "@/libs/mongodb";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  let per = (req.nextUrl.searchParams.get("per") as any) * 1 || 10;
  let page = (req.nextUrl.searchParams.get("page") as any) * 1 || 1;
  let title = (req.nextUrl.searchParams.get("title") as string) || "";
  try {
    await DBconnect();
    let query = {}; // 如果传入 title 则模糊查询，否则查询全部
    if (title) {
      query = {
        $or: [
          { title: { $regex: title, $options: "i" } },
          { enTitle: { $regex: title, $options: "i" } },
        ],
      };
    }

    const data = await Articles.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * per)
      .limit(per);
    const total = await Articles.countDocuments(query);
    return NextResponse.json({
      success: true,
      errorMessage: "",
      data: {
        list: data,
        pages: Math.ceil(total / per),
        total,
      },
    });
  } catch (error) {
    console.error("发生错误:", error);
    return NextResponse.json({
      success: false,
      errorMessage: "服务器错误，请稍后重试。",
    });
  }
};
