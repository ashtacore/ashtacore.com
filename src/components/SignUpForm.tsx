import { useState, useEffect } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

interface SignUpFormProps {
  onSwitchToSignIn: () => void;
}

export function SignUpForm({ onSwitchToSignIn }: SignUpFormProps) {
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [displayNameError, setDisplayNameError] = useState("");
  const [isCheckingDisplayName, setIsCheckingDisplayName] = useState(false);
  const [displayNameValid, setDisplayNameValid] = useState(false);

  // Real-time displayName validation
  const displayNameCheck = useQuery(
    api.users.checkDisplayNameAvailability,
    displayName.length >= 2 ? { displayName } : "skip"
  );

  const updateUserProfile = useMutation(api.users.updateUserProfile);

  useEffect(() => {
    if (displayName.length < 2) {
      setDisplayNameError("");
      setDisplayNameValid(false);
      setIsCheckingDisplayName(false);
      return;
    }

    if (displayNameCheck === undefined) {
      setIsCheckingDisplayName(true);
      setDisplayNameValid(false);
    } else {
      setIsCheckingDisplayName(false);
      if (displayNameCheck.available) {
        setDisplayNameError("");
        setDisplayNameValid(true);
      } else {
        setDisplayNameError(displayNameCheck.reason || "Display name is not available");
        setDisplayNameValid(false);
      }
    }
  }, [displayNameCheck, displayName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password || !displayName) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (!displayNameValid) {
      setError("Please choose a valid display name");
      return;
    }

    setIsSubmitting(true);

    try {
      // First, create the account
      await signIn("password", { email, password, flow: "signUp" });
      
      // Then update the profile with the displayName
      await updateUserProfile({ displayName });
    } catch (err: any) {
      console.error("Sign up failed:", err);
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDisplayNameInputStyle = () => {
    if (displayName.length < 2) {
      return "border-gray-300 dark:border-gray-600";
    }
    if (isCheckingDisplayName) {
      return "border-yellow-400 dark:border-yellow-500";
    }
    if (displayNameValid) {
      return "border-green-500 dark:border-green-400";
    }
    return "border-red-500 dark:border-red-400";
  };

  const getDisplayNameIcon = () => {
    if (displayName.length < 2) return null;
    
    if (isCheckingDisplayName) {
      return (
        <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      );
    }
    
    if (displayNameValid) {
      return (
        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      );
    }
    
    return (
      <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
      </svg>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
          <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Email Address
        </label>
        <input
          id="signup-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="auth-input-field"
          required
          autoComplete="email"
        />
      </div>

      <div>
        <label htmlFor="signup-displayname" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Display Name
        </label>
        <div className="relative">
          <input
            id="signup-displayname"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Choose a display name (2-30 characters)"
            className={`auth-input-field pr-10 ${getDisplayNameInputStyle()}`}
            required
            minLength={2}
            maxLength={30}
            autoComplete="username"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {getDisplayNameIcon()}
          </div>
        </div>
        {displayNameError && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{displayNameError}</p>
        )}
        {displayName.length >= 2 && displayNameValid && (
          <p className="mt-1 text-sm text-green-600 dark:text-green-400">Display name is available!</p>
        )}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Letters, numbers, spaces, hyphens, and underscores only
        </p>
      </div>

      <div>
        <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Password
        </label>
        <input
          id="signup-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a password (min. 8 characters)"
          className="auth-input-field"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>

      <div>
        <label htmlFor="signup-confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Confirm Password
        </label>
        <input
          id="signup-confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm your password"
          className="auth-input-field"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !displayNameValid}
        className="auth-button"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Creating Account...</span>
          </span>
        ) : (
          "Create Account"
        )}
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={onSwitchToSignIn}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
        >
          Already have an account? Sign in
        </button>
      </div>
    </form>
  );
}
