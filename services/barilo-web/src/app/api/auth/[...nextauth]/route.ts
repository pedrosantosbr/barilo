import NextAuth, { User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  secret: process.env.JWT_SECRET,
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        let user: User = {
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
            user = (await resp.json()) as User;
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
});

export { handler as GET, handler as POST };
