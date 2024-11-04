import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// This function can be marked `async` if using `await` inside
export async function middleware(req: NextRequest) {
  // console.log('中间件执行了',req.nextUrl.pathname);

  if (req.nextUrl.pathname.startsWith("/admin")) {
    const cookieName = "next-auth.session-token";
    const token = await getToken({
      req,
      cookieName,
      secret: process?.env?.AUTH_SECRET,
    });
    console.log("isAdmin::::", token?.admin);
    // 访问的如果是管理后台，我们可以在这里做判断
    if (req.cookies.get(cookieName)) {
      if (!Boolean(token?.admin)) {
        // 跳转到首页
        return NextResponse.redirect(new URL("/", req.url));
      }
      // 已经登陆了，什么都不做
    } else {
      // 跳转到登陆页面
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }
  // return NextResponse.redirect(new URL('/home', request.url));
}

// // See "Matching Paths" below to learn more
// export const config = {
//   matcher: '/about/:path*',
// }
