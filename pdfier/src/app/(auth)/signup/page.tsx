"use client";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";
import Link from "next/link";
import { useState } from "react";
import OtpInput from "@/components/auth/otp";
import { useRouter } from "next/navigation";

export default function Signup() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [user_id, setUser_id] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Signup successful! Please verify your email with the OTP.' });
        setUser_id(data.user_id); // Store the email for OTP step
        setShowOtpInput(true); // Show the OTP input UI
        // Optionally clear password field for security
        setPassword('');
      } else {
        setMessage({ type: 'error', text: data.detail || 'Signup failed. Please try again.' });
      }

      console.log(data);
    } catch (error) {
      setIsLoading(false);
      console.error("Signup error:", error);
      setMessage({ type: 'error', text: 'Network error or unable to connect to the server.' });
    }
  };
   
  const handleVerifyOtp = async (otp: string, user_id: string) => {
    setMessage(null);
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id, otp }),
      });

      const data = await response.json();
      setIsLoading(false);

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Account verified successfully! Redirecting to login...' });
        setTimeout(() => {
          router.push('/login'); // Redirect to login page after successful verification
        }, 2000); // Give user a moment to read success message
      } else {
        setMessage({ type: 'error', text: data.detail || 'OTP verification failed. Please try again.' });
      }
    } catch (error) {
      setIsLoading(false);
      console.error("OTP verification error:", error);
      setMessage({ type: 'error', text: 'Network error during OTP verification.' });
    }
  };

  const handleResendOtp = async (user_id: string, email: string) => {
    setMessage(null);
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id, email }),
      });
      const data = await response.json();
      setIsLoading(false);
      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'OTP resent successfully!' });
      } else {
        setMessage({ type: 'error', text: Array.isArray(data.detail) ? data.detail.map((err: any) => err.msg).join('. ') : (data.detail?.message || data.detail || 'Failed to resend OTP.') });
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Resend OTP error:", error);
      setMessage({ type: 'error', text: 'Network error during OTP resend.' });
    }
  };


  return (
    <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md mx-auto">
      {message && (
        <div className={`p-3 mb-4 rounded-md text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {showOtpInput ? (
        <OtpInput onVerify={handleVerifyOtp} onResend={handleResendOtp} email={email} user_id={user_id} />
      ) : (
        <>
          <div className="text-center mb-8">
            <img src="/images/PDFier_logo.png" alt="PDFier Logo" className="h-50 w-70 mx-auto mt-[-40px] mb-[-40px]" />
            <p className="text-gray-500">Sign up to get started with PDFier</p>
          </div>

          <form className="space-y-5" onSubmit={handleSignup}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="w-full px-4 py-2 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>

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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="w-full px-4 py-2 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
              disabled={isLoading}
            >
              {isLoading ? 'Signing up...' : 'Sign up'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-500"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-500 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                // onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <FcGoogle className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-500 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
                disabled={isLoading} // Disable while loading
              >
                <FaGithub className="h-5 w-5 text-gray-800" />
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in
              </Link>
            </p>
          </div>
        </>
      )}
    </div>
  );
}
