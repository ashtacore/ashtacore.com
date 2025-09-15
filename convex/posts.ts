import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { paginationOptsValidator } from "convex/server";

export const listPosts = query({
  args: { 
    paginationOpts: paginationOptsValidator,
    search: v.optional(v.string()),
    tag: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Handle search queries
    if (args.search) {
      const result = await ctx.db
        .query("posts")
        .withSearchIndex("search_posts", (q) =>
          q.search("content", args.search!).eq("published", true)
        )
        .paginate(args.paginationOpts);

      const postsWithAuthors = await Promise.all(
        result.page.map(async (post) => {
          const author = await ctx.db.get(post.authorId);
          
          return {
            ...post,
            author: {
              name: author?.name || "Anonymous",
              email: author?.email,
            },
          };
        })
      );

      return {
        ...result,
        page: postsWithAuthors,
      };
    }
    
    // Handle regular queries with optional tag filtering
    let result = await ctx.db
      .query("posts")
      .withIndex("by_published", (q) => q.eq("published", true))
      .order("desc")
      .paginate(args.paginationOpts);

    // Filter by tag if specified
    if (args.tag) {
      result.page = result.page.filter(post => post.tags.includes(args.tag!));
    }

    const postsWithAuthors = await Promise.all(
      result.page.map(async (post) => {
        const author = await ctx.db.get(post.authorId);
        
        return {
          ...post,
          author: {
            name: author?.name || "Anonymous",
            email: author?.email,
          },
        };
      })
    );

    return {
      ...result,
      page: postsWithAuthors,
    };
  },
});

export const getPost = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const post = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .filter((q) => q.eq(q.field("published"), true))
      .first();

    if (!post) return null;

    const author = await ctx.db.get(post.authorId);

    return {
      ...post,
      author: {
        name: author?.name || "Anonymous",
        email: author?.email,
      },
    };
  },
});

export const getAllTags = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_published", (q) => q.eq("published", true))
      .collect();

    const tagCounts = new Map<string, number>();
    
    posts.forEach(post => {
      post.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    return Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  },
});

export const createPost = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);

    if (user?.role !== "admin") {
      throw new Error("Only admins can create posts");
    }

    const slug = args.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const excerpt = args.content
      .substring(0, 200)
      .trim() + 
			(args.content.length > 200 ? "..." : "");

    return await ctx.db.insert("posts", {
      title: args.title,
      content: args.content,
      excerpt,
      tags: args.tags,
      authorId: userId,
      published: true,
      slug,
    });
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);

    if (user?.role !== "admin") {
      throw new Error("Only admins can upload images");
    }

    return await ctx.storage.generateUploadUrl();
  },
});

export const getImageUrl = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
