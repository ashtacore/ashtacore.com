import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import { query } from "./_generated/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password, Anonymous],
  callbacks: {
    async createOrUpdateUser(ctx, args) {
      // Let the default user creation happen first
      const userId = await ctx.db.insert("users", {
        name: args.profile.name ?? args.profile.email ?? "Anonymous",
        email: args.profile.email,
        emailVerificationTime: args.profile.emailVerified ? Date.now() : undefined,
        image: args.profile.image,
        isAnonymous: args.provider.id === "anonymous",
      });

      // Create a user profile automatically for new users
      try {
        await ctx.db.insert("userProfiles", {
          userId,
          displayName: args.profile.name ?? args.profile.email?.split("@")[0] ?? "User",
          role: "user",
        });
      } catch (error) {
        console.error("Failed to create user profile:", error);
      }

      return userId;
    },
  },
});

export const loggedInUser = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }
    return user;
  },
});
