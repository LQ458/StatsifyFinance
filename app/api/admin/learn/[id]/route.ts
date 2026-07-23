import Learn from "@/models/learn";
import { DBconnect } from "@/libs/mongodb";
import { requireAdmin } from "@/libs/admin-auth";
import { NextRequest, NextResponse } from "next/server";

export const PUT = async (req: NextRequest, { params }: any) => {
  const { id } = params; // 路由中传递的参数
  const authorization = await requireAdmin();
  if (!authorization.authorized) {
    return authorization.response;
  }
  const data = await req.json(); // 请求体中传递的数据
  try {
    await DBconnect();
    await Learn.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true },
    );
    // await prisma.article.update({
    //   where: { id },
    //   data,
    // });
    return NextResponse.json({
      success: true,
      errorMessage: "修改成功",
    });
  } catch (error) {
    console.error("发生错误:", error);
    return NextResponse.json({
      success: false,
      errorMessage: "服务器错误，请稍后重试。",
    });
  }
};

export const DELETE = async (req: NextRequest, { params }: any) => {
  const { id } = params;
  const authorization = await requireAdmin();
  if (!authorization.authorized) {
    return authorization.response;
  }
  try {
    await DBconnect();
    await Learn.findByIdAndDelete(id);
    // await prisma.article.delete({
    //   where: { id },
    // });
    return NextResponse.json({
      success: true,
      errorMessage: "删除成功",
    });
  } catch (error) {
    console.error("发生错误:", error);
    return NextResponse.json({
      success: false,
      errorMessage: "服务器错误，请稍后重试。",
    });
  }
};

export const GET = async (req: NextRequest, { params }: any) => {
  const { id } = params;
  try {
    await DBconnect();
    const data = await Learn.find({ _id: id });
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
