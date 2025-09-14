import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }
    
    // Get user profile
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();
    
    return {
      ...user,
      profile,
    };
  },
});

export const ensureUserProfile = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Check if profile already exists
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!existingProfile) {
      await ctx.db.insert("userProfiles", {
        userId,
        displayName: user.name || "User",
        role: "user",
      });
    }
  },
});

export const checkDisplayNameAvailability = query({
  args: { displayName: v.string() },
  handler: async (ctx, args) => {
    const { displayName } = args;
    
    // Check length and character restrictions
    if (displayName.length < 2 || displayName.length > 30) {
      return { available: false, reason: "Display name must be between 2 and 30 characters" };
    }
    
    // Allow letters, numbers, spaces, hyphens, and underscores
    const validPattern = /^[a-zA-Z0-9\s\-_]+$/;
    if (!validPattern.test(displayName)) {
      return { available: false, reason: "Display name can only contain letters, numbers, spaces, hyphens, and underscores" };
    }
    
    // Check if displayName is already taken (case-insensitive)
    const existingProfile = await ctx.db
      .query("userProfiles")
      .filter((q) => q.eq(q.field("displayName"), displayName))
      .first();
    
    if (existingProfile) {
      return { available: false, reason: "This display name is already taken" };
    }
    
    return { available: true };
  },
});

export const updateUserProfile = mutation({
  args: { 
    displayName: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Check if displayName is already taken by another user
    const existingProfile = await ctx.db
      .query("userProfiles")
      .filter((q) => 
        q.and(
          q.eq(q.field("displayName"), args.displayName),
          q.neq(q.field("userId"), userId)
        )
      )
      .first();
    
    if (existingProfile) {
      throw new Error("This display name is already taken");
    }

    // Validate displayName format
    if (args.displayName.length < 2 || args.displayName.length > 30) {
      throw new Error("Display name must be between 2 and 30 characters");
    }
    
    const validPattern = /^[a-zA-Z0-9\s\-_]+$/;
    if (!validPattern.test(args.displayName)) {
      throw new Error("Display name can only contain letters, numbers, spaces, hyphens, and underscores");
    }
    
    // Get or create user profile
    const currentProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (currentProfile) {
      await ctx.db.patch(currentProfile._id, {
        displayName: args.displayName,
      });
    } else {
      await ctx.db.insert("userProfiles", {
        userId,
        displayName: args.displayName,
        role: "user",
      });
    }
  },
});
