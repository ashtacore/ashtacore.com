import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

interface SidebarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedTag: string | null;
  onTagSelect: (tag: string | null) => void;
}

export function Sidebar({ searchTerm, onSearchChange, selectedTag, onTagSelect }: SidebarProps) {
  const tags = useQuery(api.posts.getAllTags);
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Search Posts
        </h3>
        <div className="relative">
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className={`w-full px-4 py-3 pl-10 border rounded-lg outline-none transition-all duration-200 ${
              searchFocused 
                ? 'border-blue-500 ring-2 ring-blue-100 shadow-sm' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          />
          <svg
            className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors ${
              searchFocused ? 'text-blue-500' : 'text-gray-400'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchTerm && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          Filter by Tags
        </h3>
        <div className="space-y-2">
          <button
            onClick={() => onTagSelect(null)}
            className={`block w-full text-left px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
              selectedTag === null
                ? "bg-blue-100 text-blue-800 font-medium border border-blue-200"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <span className="flex items-center justify-between">
              <span>All Posts</span>
              {selectedTag === null && (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </span>
          </button>
          {tags?.map(({ tag, count }) => (
            <button
              key={tag}
              onClick={() => onTagSelect(tag)}
              className={`block w-full text-left px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                selectedTag === tag
                  ? "bg-blue-100 text-blue-800 font-medium border border-blue-200"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span className="flex items-center justify-between">
                <span>#{tag}</span>
                <span className="flex items-center space-x-2">
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                    {count}
                  </span>
                  {selectedTag === tag && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* About Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          About
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed">
          Welcome my personal blog. I mostly write about technology. Both the things I use professionally 
          and the things I play around with in my free time. 
        </p>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Real-time updates</span>
          </div>
        </div>
      </div>
    </div>
  );
}
