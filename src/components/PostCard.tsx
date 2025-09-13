import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { CommentSection } from "./CommentSection";
import { MarkdownContent } from "./MarkdownContent";
import { Id } from "../../convex/_generated/dataModel";

interface PostCardProps {
  post: {
    _id: Id<"posts">;
    title: string;
    excerpt: string;
    content: string;
    tags: string[];
    _creationTime: number;
    author: {
      name: string;
      email?: string;
    };
  };
}

export function PostCard({ post }: PostCardProps) {
  const [showFullContent, setShowFullContent] = useState(false);
  const [showComments, setShowComments] = useState(false);
  
  const comments = useQuery(api.comments.getComments, { postId: post._id });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200">
      <div className="p-8">
        <header className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 leading-tight hover:text-blue-600 transition-colors">
            {post.title}
          </h2>
          <div className="flex items-center text-sm text-gray-600 mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">
                  {post.author.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="font-medium">{post.author.name}</span>
            </div>
            <span className="mx-3">•</span>
            <time className="text-gray-500">{formatDate(post._creationTime)}</time>
          </div>
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200 hover:bg-blue-100 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </header>

        <div className="markdown-content">
          {showFullContent ? (
            <MarkdownContent content={post.content} />
          ) : (
            <MarkdownContent content={post.excerpt} />
          )}
        </div>

        <div className="mt-8 flex items-center justify-between pt-6 border-t border-gray-100">
          <button
            onClick={() => setShowFullContent(!showFullContent)}
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
          >
            <span>{showFullContent ? "Show Less" : "Read More"}</span>
            <svg 
              className={`w-4 h-4 transition-transform ${showFullContent ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <button
            onClick={() => setShowComments(!showComments)}
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-800 text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a9.863 9.863 0 01-4.906-1.289L3 21l1.289-5.094A9.863 9.863 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
            </svg>
            <span>
              {comments ? `${comments.length} ${comments.length === 1 ? 'Comment' : 'Comments'}` : "Comments"}
            </span>
          </button>
        </div>

        {showComments && (
          <div className="mt-8 pt-8 border-t border-gray-200">
            <CommentSection postId={post._id} />
          </div>
        )}
      </div>
    </article>
  );
}
