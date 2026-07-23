import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/libs/admin-auth";
import { RequestInputError } from "@/libs/request-validation";
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
      errno: 0,
      data: {
        url: fileName,
      },
    });
  } catch (error) {
    const status = error instanceof RequestInputError ? error.status : 500;
    return NextResponse.json(
      {
        errno: 1,
        message:
          error instanceof RequestInputError ? error.message : "文件上传失败",
      },
      { status },
    );
  }
};
