import Category from "@/models/category";
import { DBconnect } from "@/libs/mongodb";
import { NextRequest, NextResponse } from "next/server";

export const PUT = async (req: NextRequest, { params }: any) => {
  const { id } = params; // 路由中传递的参数
  const data = await req.json(); // 请求体中传递的数据
  try {
    await DBconnect();
    await Category.findByIdAndUpdate(
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
  try {
    await DBconnect();
    await Category.findByIdAndDelete(id);
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
