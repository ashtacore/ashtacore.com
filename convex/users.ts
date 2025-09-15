import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";
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
    
    return {
      ...user
    };
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
      .query("users")
      .filter((q) => q.eq(q.field("name"), displayName))
      .first();
    
    if (existingProfile) {
      return { available: false, reason: "This display name is already taken" };
    }
    
    return { available: true };
  },
});
