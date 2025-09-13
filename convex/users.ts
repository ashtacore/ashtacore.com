import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    let profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    // If no profile exists, we'll return user data without profile
    // The profile will be created by the auth callback on next login
    // or can be created manually using ensureUserProfile mutation

    return {
      ...user,
      profile,
    };
  },
});

export const createUserProfile = mutation({
  args: {
    displayName: v.string(),
    role: v.optional(v.union(v.literal("admin"), v.literal("user"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingProfile) {
      // Update existing profile instead of throwing error
      return await ctx.db.patch(existingProfile._id, {
        displayName: args.displayName,
        role: args.role || existingProfile.role,
      });
    }

    return await ctx.db.insert("userProfiles", {
      userId,
      displayName: args.displayName,
      role: args.role || "user",
    });
  },
});

export const ensureUserProfile = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingProfile) {
      return existingProfile;
    }

    const user = await ctx.db.get(userId);
    return await ctx.db.insert("userProfiles", {
      userId,
      displayName: user?.name || user?.email?.split("@")[0] || "User",
      role: "user",
    });
  },
});

export const getAllUserProfiles = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("userProfiles").collect();
  },
});

export const makeUserAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existingProfile) {
      return await ctx.db.patch(existingProfile._id, {
        role: "admin",
      });
    }

    const user = await ctx.db.get(userId);
    return await ctx.db.insert("userProfiles", {
      userId,
      displayName: user?.name || "Admin User",
      role: "admin",
    });
  },
});
