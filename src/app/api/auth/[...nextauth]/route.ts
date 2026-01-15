import { eq } from "drizzle-orm";
import type { AuthOptions } from "next-auth";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import KeyCloack from "next-auth/providers/keycloak";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    KeyCloack({
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
      issuer: process.env.KEYCLOAK_ISSUER,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user }) {
      if (!user?.email) return false;

      // Check if user exists in DB
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, user.email));

      if (existing.length === 0) {
        // Insert if not exists
        await db.insert(users).values({
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        });
      } else {
        // Update if exists
        await db
          .update(users)
          .set({
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          })
          .where(eq(users.email, user.email));
      }

      return true;
    },
    async session({ session, token }) {
      // Attach user id to session
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
