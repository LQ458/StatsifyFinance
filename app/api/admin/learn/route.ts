import Learn from "@/models/learn";
import { DBconnect } from "@/libs/mongodb";
import { requireAdmin } from "@/libs/admin-auth";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  let per = (req.nextUrl.searchParams.get("per") as any) * 1 || 10;
  let page = (req.nextUrl.searchParams.get("page") as any) * 1 || 1;
  let title = (req.nextUrl.searchParams.get("title") as string) || "";
  let type = (req.nextUrl.searchParams.get("type") as string) || "";
  let featured = (req.nextUrl.searchParams.get("featured") as string) || "";
  try {
    await DBconnect();
    let query = {}; // 如果传入 title 则模糊查询，否则查询全部
    if (title) {
      query = {
        type,
        $or: [
          { title: { $regex: title, $options: "i" } },
          { enTitle: { $regex: title, $options: "i" } },
        ],
      };
    } else {
      query = {
        type,
      };
    }
    // 如果带了index参数，就是首页推荐用的，重新写查询条件
    if (featured) {
      query = {
        featured: true,
      };
    }

    const data = await Learn.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * per)
      .limit(per);
    const total = await Learn.countDocuments(query);
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

// post请求
export const POST = async (req: NextRequest) => {
  const authorization = await requireAdmin();
  if (!authorization.authorized) {
    return authorization.response;
  }
  const data = await req.json();
  try {
    await DBconnect();
    await Learn.create(data);
    // await prisma.article.create({
    //   data,
    // });

    return NextResponse.json({
      success: true,
      errorMessage: "创建成功",
      data: {},
    });
  } catch (error) {
    console.error("发生错误:", error);
    return NextResponse.json({
      success: false,
      errorMessage: "服务器错误，请稍后重试。",
    });
  }
};
