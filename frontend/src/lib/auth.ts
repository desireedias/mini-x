import { betterAuth } from "better-auth";
import { jwt, username } from "better-auth/plugins";
import { Pool } from "pg";

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      username: {
        type: "string",
        required: true,
      },
      bio: {
        type: "string",
        required: false,
      },
      avatar: {
        type: "string",
        required: false,
      },
      banner: {
        type: "string",
        required: false,
      },
    },
  },
  plugins: [
    jwt({
      jwt: {
        expirationTime: "7d",
      },
    }),
  ],
  trustedOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://mini-x-963l.onrender.com",
    process.env.NEXT_PUBLIC_APP_URL || "",
  ],
});
