import Articles from "@/models/articles";
import { DBconnect, DBdisconnect} from "@/libs/mongodb";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  let per = (req.nextUrl.searchParams.get('per') as any) * 1 || 10;
  let page = (req.nextUrl.searchParams.get('page') as any) * 1 || 1;
  let title = (req.nextUrl.searchParams.get('title') as string) || '';
  try {
    await DBconnect();
    const query = title ? { title: { $regex: title, $options: 'i' } } : {}; // 如果传入 title 则模糊查询，否则查询全部
    const data = await Articles.find(query).sort({ createdAt: -1 }).skip((page - 1) * per).limit(per);
    const totalCount = await Articles.countDocuments();
    const total = Math.ceil(totalCount / per);
    return NextResponse.json({
      success: true,
      errorMessage: '',
      data: {
        list: data,
        pages: Math.ceil(total / per),
        total,
      },
    });

  } catch (error) {
    console.error("发生错误:", error);
  } finally {
    DBdisconnect();
  }

};

// post请求
export const POST = async (req: NextRequest) => {
  const data = await req.json();
  try {
    await DBconnect();
    await Articles.create(data);
    // await prisma.article.create({
    //   data,
    // });
    DBdisconnect();
    return NextResponse.json({
      success: true,
      errorMessage: '创建成功',
      data: {},
    });
  } catch (error) {
    console.error("发生错误:", error);
  } finally {
    DBdisconnect();
  }
};
