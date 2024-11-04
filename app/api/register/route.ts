import User from "@/models/user";
import bcrypt from "bcryptjs";
import { DBconnect } from "@/libs/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await DBconnect();
  const { username, password, email } = Object.fromEntries(
    ["username", "password", "email"].map((key) => [
      key,
      req.nextUrl.searchParams.get(key),
    ]),
  );
  console.log(username, password, email);
  if (!password || !username || !email) {
    return NextResponse.json(
      { error: "Please fill in all fields" },
      { status: 400 },
    );
  }
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      password: passwordHash,
      email,
      originalPassword: password,
      admin: false,
    });
    const {
      password: _,
      originalPassword: __,
      ...userWithoutPassword
    } = user.toObject();

    return NextResponse.json(
      { message: "用户创建成功", user: userWithoutPassword },
      { status: 201 },
    );
  } catch (error: any) {
    if (error.code === 11000) {
      // MongoDB duplicate key error code
      const duplicateField = Object.keys(error.keyPattern)[0];
      const errorMessage =
        duplicateField === "username"
          ? "Username already exists"
          : "Email already exists";
      return NextResponse.json({ error: errorMessage }, { status: 403 });
    }
    return NextResponse.json(
      { error: "服务器错误，请稍后重试。", message: error.message },
      { status: 500 },
    );
  }
}
