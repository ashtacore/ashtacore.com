import { Authenticated, Unauthenticated, useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { BlogLayout } from "./components/BlogLayout";
import { CreatePostForm } from "./components/CreatePostForm";
import { SignInModal } from "./components/SignInModal";
import { AboutPage } from "./components/AboutPage";
import { DarkModeToggle } from "./components/DarkModeToggle";
import { useState, useEffect } from "react";

export default function App() {
  const [currentPage, setCurrentPage] = useState<"blog" | "about" | "create">("blog");
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const user = useQuery(api.users.getCurrentUser);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <button 
                onClick={() => setCurrentPage("blog")}
                className="text-2xl font-bold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Ashtacore
              </button>
              <div className="hidden md:flex space-x-6">
                <button
                  onClick={() => setCurrentPage("blog")}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    currentPage === "blog"
                      ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                  }`}
                >
                  Blog
                </button>
                <button
                  onClick={() => setCurrentPage("about")}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    currentPage === "about"
                      ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                      : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                  }`}
                >
                  Meet Jay
                </button>
                {user?.role === "admin" && (
                  <button
                    onClick={() => setCurrentPage("create")}
                    className={`px-3 py-2 text-sm font-medium transition-colors ${
                      currentPage === "create"
                        ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                        : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                    }`}
                  >
                    Create Post
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <DarkModeToggle />
              <Authenticated>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {(user?.name || "A").charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <SignOutButton />
                </div>
              </Authenticated>
              <Unauthenticated>
                <button
                  onClick={() => setIsSignInModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-sm hover:shadow-md"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Sign In
                </button>
              </Unauthenticated>
            </div>
          </div>
        </div>
      </nav>

      <main className="min-h-screen">
        {currentPage === "blog" && <BlogLayout />}
        {currentPage === "about" && <AboutPage />}
        {currentPage === "create" && user?.role === "admin" && <CreatePostPage />}
      </main>
      
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-16 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>&copy; 2025 Joshua Jay Runyan. Built with Convex and React.</p>
						<div className="flex justify-center gap-6 mt-4">
	            <a href="mailto:runyan@ashtacore.com" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
	              Email
	            </a>
	            <a href="https://www.linkedin.com/in/joshua-jay-runyan/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
	              LinkedIn
	            </a>
	            <a href="https://github.com/ashtacore" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
	              GitHub
	            </a>
	          </div>
          </div>
        </div>
      </footer>
      
      <SignInModal 
        isOpen={isSignInModalOpen} 
        onClose={() => setIsSignInModalOpen(false)} 
      />
      <Toaster position="top-right" />
    </div>
  );
}

function CreatePostPage() {
  return (
    <CreatePostForm />
  );
}
