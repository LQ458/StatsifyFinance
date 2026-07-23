import mongoose from "mongoose";
import User from "@/models/user";
import { DBconnect } from "@/libs/mongodb";
import { requireAdmin } from "@/libs/admin-auth";
import {
  adminUserUpdateSchema,
  SAFE_USER_PROJECTION,
  serializeSafeUser,
} from "@/libs/safe-user";
import {
  jsonInputError,
  readJsonBody,
  RequestInputError,
} from "@/libs/request-validation";
import { NextRequest, NextResponse } from "next/server";

const MAX_USER_UPDATE_BODY_BYTES = 16 * 1024;
type RouteContext = { params: Promise<{ id: string }> };

function invalidIdResponse() {
  return NextResponse.json(
    {
      success: false,
      error: "Invalid user id",
      code: "INVALID_INPUT",
    },
    { status: 400 },
  );
}

export const PUT = async (req: NextRequest, { params }: RouteContext) => {
  const { id } = await params;
  const authorization = await requireAdmin();
  if (!authorization.authorized) {
    return authorization.response;
  }

  if (!mongoose.isValidObjectId(id)) {
    return invalidIdResponse();
  }

  try {
    const body = await readJsonBody(req, MAX_USER_UPDATE_BODY_BYTES);
    const parsed = adminUserUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid user update",
          code: "INVALID_INPUT",
        },
        { status: 400 },
      );
    }

    await DBconnect();
    const updated = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          ...parsed.data,
          updatedAt: new Date(),
        },
      },
      { new: true, runValidators: true, projection: SAFE_USER_PROJECTION },
    ).lean();

    if (!updated) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
          code: "NOT_FOUND",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      errorMessage: "修改成功",
    });
  } catch (error) {
    if (error instanceof RequestInputError) {
      return jsonInputError(error);
    }

    if ((error as { code?: number }).code === 11000) {
      return NextResponse.json(
        {
          success: false,
          error: "Email already exists",
          code: "ACCOUNT_EXISTS",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "服务器错误，请稍后重试。",
        code: "INTERNAL_SERVER_ERROR",
      },
      { status: 500 },
    );
  }
};

export const DELETE = async (_req: NextRequest, { params }: RouteContext) => {
  const { id } = await params;
  const authorization = await requireAdmin();
  if (!authorization.authorized) {
    return authorization.response;
  }

  if (!mongoose.isValidObjectId(id)) {
    return invalidIdResponse();
  }

  try {
    await DBconnect();
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
          code: "NOT_FOUND",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      errorMessage: "删除成功",
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "服务器错误，请稍后重试。",
        code: "INTERNAL_SERVER_ERROR",
      },
      { status: 500 },
    );
  }
};

export const GET = async (_req: NextRequest, { params }: RouteContext) => {
  const { id } = await params;
  const authorization = await requireAdmin();
  if (!authorization.authorized) {
    return authorization.response;
  }

  if (!mongoose.isValidObjectId(id)) {
    return invalidIdResponse();
  }

  try {
    await DBconnect();
    const user = await User.findById(id, SAFE_USER_PROJECTION).lean();
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
          code: "NOT_FOUND",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      errorMessage: "",
      data: {
        list: serializeSafeUser(user as Record<string, unknown>),
      },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "服务器错误，请稍后重试。",
        code: "INTERNAL_SERVER_ERROR",
      },
      { status: 500 },
    );
  }
};
