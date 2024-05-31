import type { NextApiRequest, NextApiResponse } from "next";
import { AuthOptions, DefaultUser } from "next-auth";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { setCookie } from "nookies";
import jwt from "jsonwebtoken";

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  return await NextAuth(req, res, {
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
      CredentialsProvider({
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Senha", type: "password" },
        },
        async authorize(credentials) {
          let user: DefaultUser = {
            id: "",
          };

          let accessToken = "";

          try {
            const resp = await fetch(`${process.env.API_URL}/api/v1/token/`, {
              credentials: "include",
              mode: "cors",
              body: JSON.stringify(credentials),
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
            });

            if (!resp.ok) {
              try {
                const err = await resp.json();
                console.log(err, resp.status);
                // todo: handle error
                return null;
              } catch (e) {
                console.log(e);
                // todo: handle error
                return null;
              }
            }

            try {
              const data = (await resp.json()) as {
                access: string;
                refresh: string;
              };
              accessToken = data.access;
            } catch (e) {
              console.log(e);
              // todo: handle error
              return null;
            }
          } catch (e) {
            console.log(e);
            // todo: handle error
            return null;
          }

          try {
            const resp = await fetch(
              `${process.env.API_URL}/api/v1/current-user/`,
              {
                credentials: "include",
                mode: "cors",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            );

            if (!resp.ok) {
              try {
                const err = await resp.json();
                console.log(err);
                // todo: handle error
                return null;
              } catch (e) {
                // todo: handle error
                return null;
              }
            }

            try {
              user = (await resp.json()) as DefaultUser;

              // set cookie
              // get expiration time from token
              const decodedToken = jwt.decode(accessToken) as { exp: number };

              // Calculate maxAge in seconds from the token's expiration time
              const maxAge = decodedToken.exp - Math.floor(Date.now() / 1000);
              setCookie({ res }, "barilo.accessToken", accessToken, {
                maxAge: maxAge,
                path: "/",
                httpOnly: true,
              });

              return user;
            } catch (e) {
              // todo: handle error
              console.log(e);
            }
          } catch (e) {
            // todo: handle error
            console.log(e);
            return null;
          }

          return null;
        },
      }),
    ],
  } as AuthOptions);
}
