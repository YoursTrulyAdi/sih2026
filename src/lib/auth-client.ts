import { createAuthClient } from "better-auth/react";
import { sentinelClient } from "@better-auth/infra/client";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
  fetchOptions: {
    credentials: "include",
  },
  plugins: [
    sentinelClient(),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;
