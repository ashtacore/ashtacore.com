import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { CommentSection } from "./CommentSection";
import { MarkdownContent } from "./MarkdownContent";

export function PostView() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const post = useQuery(api.posts.getPost, slug ? { slug } : "skip");

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (post === undefined) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600 dark:text-gray-400">Loading post...</span>
          </div>
        </div>
      </div>
    );
  }

  if (post === null) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Post not found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            The post you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Blog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate("/")}
        className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-sm mb-8 transition-colors"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Blog
      </button>

      <article className="bg-white dark:bg-card-dark rounded-lg shadow-sm border border-gray-200 dark:border-card-border-dark overflow-hidden">
        <div className="p-8">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">
              {post.title}
            </h1>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {post.author.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="font-medium text-base">{post.author.name}</span>
              </div>
              <span className="mx-3">•</span>
              <time className="text-gray-500 dark:text-gray-400">{formatDate(post._creationTime)}</time>
            </div>
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium rounded-full border border-blue-200 dark:border-blue-700"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          <div className="markdown-content prose prose-lg dark:prose-invert max-w-none">
            <MarkdownContent content={post.content} />
          </div>
        </div>
      </article>

      <div className="mt-8">
        <CommentSection postId={post._id} />
      </div>
    </div>
  );
}