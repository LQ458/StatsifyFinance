import User from "@/models/user";
import { DBconnect } from "@/libs/mongodb";
import { requireAdmin } from "@/libs/admin-auth";
import { SAFE_USER_PROJECTION, serializeSafeUser } from "@/libs/safe-user";
import { NextRequest, NextResponse } from "next/server";

function positiveInteger(
  value: string | null,
  fallback: number,
  maximum: number,
) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }
  return Math.min(parsed, maximum);
}

function escapeRegularExpression(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const GET = async (req: NextRequest) => {
  const authorization = await requireAdmin();
  if (!authorization.authorized) {
    return authorization.response;
  }

  const per = positiveInteger(req.nextUrl.searchParams.get("per"), 10, 100);
  const page = positiveInteger(req.nextUrl.searchParams.get("page"), 1, 10_000);
  const username = (req.nextUrl.searchParams.get("username") ?? "")
    .trim()
    .slice(0, 64);

  try {
    await DBconnect();
    const query = username
      ? {
          username: {
            $regex: escapeRegularExpression(username),
            $options: "i",
          },
        }
      : {};
    const users = await User.find(query, SAFE_USER_PROJECTION)
      .sort({ createdAt: -1 })
      .skip((page - 1) * per)
      .limit(per)
      .lean();
    const total = await User.countDocuments(query);

    return NextResponse.json({
      success: true,
      errorMessage: "",
      data: {
        list: users.map((user) =>
          serializeSafeUser(user as Record<string, unknown>),
        ),
        pages: Math.ceil(total / per),
        total,
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
