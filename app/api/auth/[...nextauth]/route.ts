import { DBconnect } from "../../../../libs/mongodb";
import User from "../../../../models/user";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

type Credentials = {
  username: string;
  password: string;
};

const handler = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {},
      async authorize(credentials) {
        const { username, password } = credentials as Credentials;
        try {
          await DBconnect();
          const user = await User.findOne(
            { username },
            { _id: 1, username: 1, password: 1, admin: 1, email: 1, image: 1 },
          );

          if (!user) {
            return null;
          }
          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (!passwordsMatch) {
            return null;
          }
          const { _id: id, admin, email, image } = user;
          user.password = null;
          return {
            ...user,
            id,
            admin,
            email,
            image,
            name: username,
          };
        } catch (error) {
          console.log("Error: ", error);
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
    async jwt({
      token,
      user,
      trigger,
      session,
    }: {
      token: any;
      user: any;
      trigger?: "signIn" | "signUp" | "update";
      session?: any;
    }) {
      if (trigger === "update" && session) {
        return {
          ...token,
          ...session.user,
        };
      }
      return { ...token, ...user };
    },
    async session({ session, token }: { session: any; token: any }) {
      return {
        ...session,
        user: {
          ...session.user,
          ...token,
        },
      };
    },
  },
});

export { handler as GET, handler as POST };
