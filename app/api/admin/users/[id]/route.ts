import User from "@/models/user";
import bcrypt from "bcryptjs";
import { DBconnect, DBdisconnect} from "@/libs/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from 'next-auth/jwt';
const cookieName = 'next-auth.session-token'

export const PUT = async (req: NextRequest, { params }: any) => {
  const { id } = params; // 路由中传递的参数
  const data = await req.json(); // 请求体中传递的数据
  const { originalPassword } = data
  const password = await bcrypt.hash(originalPassword, 10);
  data.password = password
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
    await User.findByIdAndUpdate(
      id,
      data,
      { new: true }
    );
    // await prisma.article.update({
    //   where: { id },
    //   data,
    // });
    return NextResponse.json({
      success: true,
      errorMessage: '修改成功',
    });
  } catch (error) {
    console.error("发生错误:", error);
  } finally {
    DBdisconnect();
  }

};

export const DELETE = async (req: NextRequest, { params }: any) => {
  const { id } = params;
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
    await User.findByIdAndDelete(
      id);
    // await prisma.article.delete({
    //   where: { id },
    // });
    return NextResponse.json({
      success: true,
      errorMessage: '删除成功',
    });
  } catch (error) {
    console.error("发生错误:", error);
  } finally {
    DBdisconnect();
  }
};

export const GET = async (req: NextRequest, { params }: any) => {
  const { id } = params;  
  try {
    await DBconnect();    
    const data = await User.find({_id: id});
    return NextResponse.json({
      success: true,
      errorMessage: '',
      data: {
        list: data[0],
      },
    });

  } catch (error) {
    console.error("发生错误:", error);
  } finally {
    // DBdisconnect();
  }

};