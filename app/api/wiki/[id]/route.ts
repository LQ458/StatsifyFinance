import Articles from "@/models/wiki-articles";
import { DBconnect } from "@/libs/mongodb";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest, { params }: any) => {
  const { id } = params;
  try {
    await DBconnect();
    const data = await Articles.find({ _id: id });
    return NextResponse.json({
      success: true,
      errorMessage: "",
      data: {
        list: data[0],
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
