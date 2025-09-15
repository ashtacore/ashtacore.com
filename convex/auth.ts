// convex/auth.ts
import { convexAuth } from "@convex-dev/auth/server";
import { ConvexCredentials } from "@convex-dev/auth/providers/ConvexCredentials";
import { createAccount, retrieveAccount } from "@convex-dev/auth/server";
import { Scrypt } from "lucia";
import isEmail from 'validator/lib/isEmail';

const scrypt = new Scrypt();

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    ConvexCredentials({
      authorize: async (credentials, ctx) => {
        console.log(credentials);

        const email = String(credentials.email ?? "").toLowerCase();
        const password = String(credentials.password ?? "");
        if (!email || !password || !isEmail(email)) throw new Error("Invalid email or password given");;

        if (credentials.flow == "signUp") {
          // First check for an existing matching ID, and quit if ID is already registered
          try {
            const existing = await retrieveAccount(ctx, {
              provider: "credentials",
              account: { id: email },
            });

            if (existing?.user?._id) {
              throw new Error("AlreadyRegistered");
            }
          }
          catch (err: any) {
            if (err?.message.includes("InvalidAccountId")) {
              console.log("account does not exist, let's continue");
            }
            if (err?.message.includes("AlreadyRegistered")) {
              throw new Error("AlreadyRegistered");
            }
          }

          // Create account
          const name = String(credentials.name ?? "");
          const role = credentials.role ? String(credentials.role) : "user";

          const { user } = await createAccount(ctx, {
            provider: "credentials",
            account: { id: email, secret: password },
            profile: {
              email,
              name,
              role,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            } as any,
          });

          return { userId: user._id };
        }
        else if (credentials.flow == "signIn") {
          try {
            const existing = await retrieveAccount(ctx, {
              provider: "credentials",
              account: { id: email, secret: password },
            });

            console.log(existing);
            if (existing?.user?._id) {
              console.log(existing?.user?._id);
              return { userId: existing.user._id };
            }
          }
          catch (err: any) {
            console.log(err);
          }
          throw new Error("Invalid username or password provided");
        }
        else {
          throw new Error("Invalid flow descriptor");
        }
      },

      // Tell Convex Auth how to verify the stored hash
      crypto: {
        hashSecret: async (secret: string) => scrypt.hash(secret),
        verifySecret: async (secret: string, hash: string) => scrypt.verify(hash, secret),
      },
    }),
  ],
});