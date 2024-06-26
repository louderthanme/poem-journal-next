import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoClient } from "mongodb";
import clientPromise from "@/app/_utils/mongodb";
import { NextApiRequest, NextApiResponse } from "next";
import { Account, Profile, Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";

const options: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({
      user,
      account,
      profile,
    }: {
      user: User;
      account: Account | null;
      profile?: Profile;
    }): Promise<boolean> {
      try {
        const client: MongoClient = await clientPromise;
        const db = client.db("poetrystream");
        const usersCollection = db.collection("users");

        // Create index on the userId field in the poems collection if not exists
        const poemsCollection = db.collection("poems");
        await poemsCollection.createIndex({ userId: 1 });

        const existingUser = await usersCollection.findOne({
          email: user.email,
        });

        if (!existingUser) {
          const newUser = {
            id: `${account?.provider}-${account?.providerAccountId}`,
            name: user.name,
            email: user.email,
            image: user.image,
            createdAt: new Date(),
          };

          await usersCollection.insertOne(newUser);
          console.log("New user created:", newUser);
        } else {
          console.log("User already exists:", existingUser);
        }

        return true;
      } catch (error) {
        console.error("Error during sign-in:", error);
        return false;
      }
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      console.log("Redirecting to:", url);

      // Normalize URL to avoid trailing slash issues
      const cleanUrl = url.endsWith("/") ? url.slice(0, -1) : url;

      // Check if the user is on the /auth page
      if (cleanUrl === `${baseUrl}/auth`) {
        // Redirect to the homepage instead of staying on the /auth page
        return baseUrl;
      }

      // Allow redirection to proceed if within the base URL, otherwise default to base URL
      return cleanUrl.startsWith(baseUrl) ? cleanUrl : baseUrl;
    },
    async session({
      session,
      user,
      token,
    }: {
      session: Session;
      user: User;
      token: JWT;
    }): Promise<Session> {
      console.log("Session callback:", session);
      return session;
    },
    async jwt({
      token,
      user,
      account,
      profile,
      isNewUser,
    }: {
      token: JWT;
      user?: User;
      account?: Account | null;
      profile?: Profile;
      isNewUser?: boolean;
    }): Promise<JWT> {
      console.log("JWT callback:", token);
      return token;
    },
  },
  debug: true,
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  return NextAuth(req, res, options);
}
