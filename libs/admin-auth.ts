import { getServerSession, type Session } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/auth";

type AdminAuthorization =
  | {
      authorized: true;
    }
  | {
      authorized: false;
      response: NextResponse;
    };

export function authorizeAdminSession(
  session: Session | null,
): AdminAuthorization {
  if (!session?.user) {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          success: false,
          error: "Authentication required",
          code: "UNAUTHORIZED",
        },
        { status: 401 },
      ),
    };
  }

  if (session.user.admin !== true) {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          success: false,
          error: "Administrator access required",
          code: "FORBIDDEN",
        },
        { status: 403 },
      ),
    };
  }

  return { authorized: true };
}

export async function requireAdmin(): Promise<AdminAuthorization> {
  const session = await getServerSession(authOptions);
  return authorizeAdminSession(session);
}
