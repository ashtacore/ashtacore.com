import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  posts: defineTable({
    title: v.string(),
    content: v.string(),
    excerpt: v.string(),
    tags: v.array(v.string()),
    authorId: v.id("users"),
    published: v.boolean(),
    slug: v.string(),
  })
    .index("by_published", ["published"])
    .index("by_slug", ["slug"])
    .searchIndex("search_posts", {
      searchField: "content",
      filterFields: ["published", "tags"],
    }),

  comments: defineTable({
    postId: v.id("posts"),
    authorId: v.id("users"),
    content: v.string(),
    parentId: v.optional(v.id("comments")),
  })
    .index("by_post", ["postId"])
    .index("by_author", ["authorId"])
    .index("by_parent", ["parentId"]),

  userProfiles: defineTable({
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("user")),
    displayName: v.string(),
    bio: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_role", ["role"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
