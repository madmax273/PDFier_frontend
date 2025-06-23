"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation"; // For client-side navigation

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handles the traditional email/password login submission.
   * Sends credentials to the backend FastAPI API.
   * Displays messages and redirects on success.
   * @param e The form submission event.
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null); // Clear any previous messages
    setIsLoading(true); // Indicate loading state

    try {
      // Make a fetch call to your FastAPI backend's login endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ username, password }).toString(),
      });

      const data = await response.json(); // Parse the response JSON
      setIsLoading(false); // End loading state

      if (response.ok) {
        // Handle successful login
        setMessage({ type: 'success', text: data.message || 'Login successful! Redirecting...' });
        
        // Redirect to a protected page (e.g., dashboard) after successful login.
        // Using router.replace() prevents navigating back to the login page
        // via the browser's back button after successful login.
        setTimeout(() => {
          router.replace('/dashboard'); 
        }, 1500); // Allow user to see the success message briefly

      } else {
        // Handle login failure (e.g., invalid credentials, backend error)
        const errorMessage = Array.isArray(data.detail) 
          ? data.detail.map((err: any) => err.msg).join('. ') 
          : (data.detail?.message || data.detail || 'Login failed. Please check your credentials.');
        setMessage({ type: 'error', text: errorMessage });
      }
    } catch (error) {
      // Handle network errors or unexpected issues during the fetch operation
      setIsLoading(false);
      console.error("Login error:", error); // Log detailed error for debugging
      setMessage({ type: 'error', text: 'Network error or unable to connect to the server. Please try again later.' });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md mx-auto font-sans">
      {/* Display success or error messages to the user */}
      {message && (
        <div className={`p-3 mb-4 rounded-lg text-sm 
          ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {/* Header section for the login form */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Sign in to your account</h1>
        <p className="text-gray-500">Welcome back to PDFier</p>
      </div>

      {/* Login form for email and password */}
      <form className="space-y-6" onSubmit={handleLogin}>
        {/* Email input field */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
          </div>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full px-4 py-2 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900"
            placeholder="Enter your email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Password input field */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            {/* Link for password recovery */}
            <Link href="/forgot-password" className="text-xs font-medium text-blue-600 hover:text-blue-500">
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full px-4 py-2 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Submit button for login */}
        <button
          type="submit"
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      {/* Link to Signup Page */}
      <div className="mt-6 text-center text-sm">
        <p className="text-gray-600">
          Don't have an account?{' '}
          <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

