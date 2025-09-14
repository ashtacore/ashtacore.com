import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SignInForm } from "../SignInForm";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SignInModal({ isOpen, onClose }: SignInModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const user = useQuery(api.users.getCurrentUser);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 200);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Auto-close modal when user successfully signs in
  useEffect(() => {
    if (user && isOpen) {
      handleClose();
    }
  }, [user, isOpen]);

  if (!isOpen && !isClosing) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${
        isOpen && !isClosing
          ? "bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 backdrop-blur-sm"
          : "bg-black bg-opacity-0"
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white dark:bg-card-dark rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-200 ${
          isOpen && !isClosing
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 translate-y-4"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Welcome Back</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Sign in to your account</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <svg
              className="w-5 h-5 text-gray-400 dark:text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <SignInForm />
        </div>
      </div>
    </div>
  );
}
