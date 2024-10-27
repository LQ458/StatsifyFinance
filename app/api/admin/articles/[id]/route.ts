import Articles from "@/models/articles";
import { DBconnect, DBdisconnect} from "@/libs/mongodb";
import { NextRequest, NextResponse } from "next/server";

export const PUT = async (req: NextRequest, { params }: any) => {
  const { id } = params; // 路由中传递的参数
  const data = await req.json(); // 请求体中传递的数据
  try {
    await DBconnect();
    await Articles.findByIdAndUpdate(
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
  try {
    await DBconnect();
    await Articles.findByIdAndDelete(
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
