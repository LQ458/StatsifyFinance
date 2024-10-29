import User from "@/models/user";
import { DBconnect, DBdisconnect} from "@/libs/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from 'next-auth/jwt';
const cookieName = 'next-auth.session-token'

export const GET = async (req: NextRequest) => {
  let per = (req.nextUrl.searchParams.get('per') as any) * 1 || 10;
  let page = (req.nextUrl.searchParams.get('page') as any) * 1 || 1;
  let username = (req.nextUrl.searchParams.get('username') as string) || '';
  try {
    await DBconnect();
    const query = username ? { username: { $regex: username, $options: 'i' } } : {}; // 如果传入 title 则模糊查询，否则查询全部
    const data = await User.find(query).sort({ createdAt: -1 }).skip((page - 1) * per).limit(per);
    const totalCount = await User.countDocuments();
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
    // DBdisconnect();
  }

};