import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import User from "@/models/user";
import { DBconnect } from "@/libs/mongodb";
import { recordProductEvent } from "@/libs/product-events";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      admin?: boolean;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    admin?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    admin?: boolean;
  }
}

const credentialsSchema = z.object({
  username: z.string().trim().min(1).max(64),
  password: z.string().min(1).max(128),
});

export const authOptions: AuthOptions = {
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "用户名", type: "text" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        try {
          await DBconnect();
          const user = await User.findOne(
            { username: parsed.data.username },
            {
              _id: 1,
              username: 1,
              password: 1,
              admin: 1,
              email: 1,
              image: 1,
            },
          ).lean<{
            _id: { toString(): string };
            username: string;
            password: string;
            admin: boolean;
            email: string;
            image?: string | null;
          }>();

          if (
            !user ||
            !(await bcrypt.compare(parsed.data.password, user.password))
          ) {
            return null;
          }

          return {
            id: user._id.toString(),
            name: user.username,
            email: user.email,
            image: user.image ?? null,
            admin: user.admin === true,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 3 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
    signOut: "/profile",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.admin = user.admin === true;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.id === "string" ? token.id : undefined;
        session.user.admin = token.admin === true;
      }
      return session;
    },
  },
  events: {
    async signIn() {
      await recordProductEvent("login_completed", true);
    },
  },
};

export default authOptions;
