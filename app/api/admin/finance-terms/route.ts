import FinanceTerms from "@/models/finance-terms";
import { DBconnect, DBdisconnect} from "@/libs/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from 'next-auth/jwt';
const cookieName = 'next-auth.session-token'

export const GET = async (req: NextRequest) => {
  let per = (req.nextUrl.searchParams.get('per') as any) * 1 || 10;
  let page = (req.nextUrl.searchParams.get('page') as any) * 1 || 1;
  let title = (req.nextUrl.searchParams.get('title') as string) || '';
  try {
    await DBconnect();
    const query = {} as any
    if(title){
      query['$or'] = [{title: { $regex: title, $options: 'i' }},
                      {enTitle: { $regex: title, $options: 'i' }}]
    }
    console.log('query:::', query)
    const data = await FinanceTerms.find(query).sort({ createdAt: -1 }).skip((page - 1) * per).limit(per);
    const total = await FinanceTerms.countDocuments(query);
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
  }

};

// post请求
export const POST = async (req: NextRequest) => {
  const data = await req.json();
  const token = await getToken({
    req, cookieName,
    secret: process?.env?.AUTH_SECRET    
  });
  console.log('管理员验证,isAdmin::::', token?.admin) 
  if(!Boolean(token?.admin)){
    // 没有权限
    return NextResponse.json({
      success: false,
      errorMessage: '您没有权限操作此功能!',
    });
  }
  try {
    await DBconnect();
    await FinanceTerms.create(data);
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
  }
};
