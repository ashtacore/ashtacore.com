import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { PostCard } from "./PostCard";
import { Sidebar } from "./Sidebar";

export function BlogLayout() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [loadedPosts, setLoadedPosts] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const postsResult = useQuery(api.posts.listPosts, {
    paginationOpts: { numItems: 6, cursor },
    search: searchTerm || undefined,
    tag: selectedTag || undefined,
  });

  useEffect(() => {
    if (postsResult) {
      setIsLoading(false);
      if (cursor === null) {
        setLoadedPosts(postsResult.page);
      } else {
        setLoadedPosts(prev => [...prev, ...postsResult.page]);
      }
      setHasMore(!postsResult.isDone);
    }
  }, [postsResult, cursor]);

  useEffect(() => {
    setLoadedPosts([]);
    setCursor(null);
    setHasMore(true);
    setIsLoading(true);
  }, [searchTerm, selectedTag]);

  const loadMore = () => {
    if (postsResult && !postsResult.isDone && !isLoading) {
      setIsLoading(true);
      setCursor(postsResult.continueCursor);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000
      ) {
        if (hasMore && postsResult && !postsResult.isDone && !isLoading) {
          loadMore();
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, postsResult, isLoading]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <main className="flex-1 lg:w-2/3">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Latest Posts</h1>
            <p className="text-gray-600 dark:text-gray-400">
              I hope you learn something today!
            </p>
          </div>
          
          <div className="space-y-8">
            {loadedPosts.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No posts found</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm || selectedTag 
                    ? "Try adjusting your search or filter criteria." 
                    : "Check back later for new content."}
                </p>
              </div>
            )}
            
            {loadedPosts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
            
            {isLoading && (
              <div className="text-center py-8">
                <div className="inline-flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-600 dark:text-gray-400">Loading posts...</span>
                </div>
              </div>
            )}
            
            {hasMore && postsResult && !postsResult.isDone && !isLoading && (
              <div className="text-center py-8">
                <button
                  onClick={loadMore}
                  className="px-8 py-3 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium shadow-sm hover:shadow-md"
                >
                  Load More Posts
                </button>
              </div>
            )}
          </div>
        </main>
        
        <aside className="lg:w-1/3">
          <div className="sticky top-24">
            <Sidebar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedTag={selectedTag}
              onTagSelect={setSelectedTag}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
