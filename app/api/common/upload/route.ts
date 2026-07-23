import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/libs/admin-auth";
import { jsonInputError, RequestInputError } from "@/libs/request-validation";
import { saveUploadedImage, validateUploadRequest } from "@/libs/upload";

export const POST = async (req: NextRequest) => {
  const authorization = await requireAdmin();
  if (!authorization.authorized) {
    return authorization.response;
  }

  try {
    validateUploadRequest(req);
    const data = await req.formData();
    const fileName = await saveUploadedImage(data);

    return NextResponse.json({
      success: true,
      errorMessage: "文件上传成功",
      data: fileName,
    });
  } catch (error) {
    if (error instanceof RequestInputError) {
      return jsonInputError(error);
    }

    return NextResponse.json(
      {
        success: false,
        error: "文件上传失败",
        code: "UPLOAD_FAILED",
      },
      { status: 500 },
    );
  }
};
