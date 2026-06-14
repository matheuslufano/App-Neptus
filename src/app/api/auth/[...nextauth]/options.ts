import { ApiError } from "next/dist/server/api-utils";
import { DefaultSession, getServerSession, NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";

import { login } from "@/services/auth-service";
import { UserSession } from "@/types/user-type";
import { getFriendlyMessage } from "@/utils/error-util";
declare module "next-auth/jwt" {
  interface JWT extends UserSession {
    sub: string;
    access_token: string;
    refresh_token: string;
  }
}

declare module "next-auth" {
  interface User extends UserSession {
    access_token: string;
    refresh_token: string;
  }

  interface Session extends DefaultSession {
    user: UserSession;
    access_token?: string;
  }
}

export const options: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { type: "text" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        try {
          const response = await login(credentials);
          return {
            ...response.usuario,
            access_token: response.access_token,
            refresh_token: response.refresh_token,
          };
        } catch (error) {
          if (error instanceof ApiError || error instanceof Error) {
            const friendlyMessage = getFriendlyMessage(error);
            throw new Error(friendlyMessage || error.message);
          }
          throw new Error("Erro ao fazer login, tente novamente");
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ account }) {
      if (account?.provider === "credentials") {
        return true;
      }
      return false;
    },
    async jwt({ token, user }) {
      if (user) {
        const userReponse = user as UserSession & {
          access_token: string;
          refresh_token: string;
        };
        return {
          ...token,
          access_token: userReponse.access_token,
          refresh_token: userReponse.refresh_token,
          sub: userReponse.id,
          profile: userReponse.perfil,
          roles: userReponse.permissoes,
          is_admin: userReponse.is_admin,
          name: userReponse.nome,
          email: userReponse.email,
        } as JWT;
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          id: token.sub,
          nome: token.name,
          email: token.email,
          is_admin: token.is_admin,
          perfil: token.profile,
          permissoes: token.roles,
        },
        access_token: token.access_token,
      };
    },
  },
  pages: {
    signIn: "/login",
  },
};

export const getSessionData = () => getServerSession(options);
