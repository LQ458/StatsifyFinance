import User from "@/models/user";
import bcrypt from "bcryptjs";
import { DBconnect } from "@/libs/mongodb";
import { recordProductEvent } from "@/libs/product-events";
import {
  jsonInputError,
  readJsonBody,
  registrationSchema,
  RequestInputError,
} from "@/libs/request-validation";
import { NextRequest, NextResponse } from "next/server";

const MAX_REGISTRATION_BODY_BYTES = 8 * 1024;

export async function POST(req: NextRequest) {
  try {
    const body = await readJsonBody(req, MAX_REGISTRATION_BODY_BYTES);
    const parsed = registrationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid registration details",
          code: "INVALID_INPUT",
        },
        { status: 400 },
      );
    }

    await DBconnect();
    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    await User.create({
      username: parsed.data.username,
      password: passwordHash,
      email: parsed.data.email,
      admin: false,
    });
    await recordProductEvent("registration_completed", false);

    return NextResponse.json(
      {
        success: true,
        message: "用户创建成功",
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof RequestInputError) {
      return jsonInputError(error);
    }

    if ((error as { code?: number }).code === 11000) {
      return NextResponse.json(
        {
          success: false,
          error: "Username or email already exists",
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
}
