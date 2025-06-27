"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Importing the provided OtpInput component
import OtpInput from "@/components/auth/otp"; // Adjust this path if your OtpInput is elsewhere

// Define the steps for the password reset flow
type ResetPasswordStep = 'email_input' | 'otp_entry' | 'new_password_entry' | 'reset_success';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [user_id, setUser_id] = useState(''); // To store user_id received after requesting OTP
  const [otp, setOtp] = useState(''); // OTP will be handled by OtpInput internally, but we might need it for validation
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [step, setStep] = useState<ResetPasswordStep>('email_input'); // Current step in the flow
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handles the request to send an OTP to the user's email for password reset.
   * This is the first step of the forgot password flow.
   * Backend should return a user_id or reset_token upon success.
   * @param e The form submission event.
   */
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/forgot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      setIsLoading(false);

      if (response.ok) {
        // Assume backend returns { message: "...", user_id: "..." }
        setMessage({ type: 'success', text: data.message || 'OTP sent to your email. Please check your inbox.' });
        setUser_id(data.user_id); // Store the user_id for the next step
        setStep('otp_entry'); // Move to the OTP entry step
      } else {
        const errorMessage = data.detail || 'Failed to send OTP. Please try again.';
        setMessage({ type: 'error', text: errorMessage });
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Request OTP error:", error);
      setMessage({ type: 'error', text: 'Network error or unable to connect to the server.' });
    }
  };

  /**
   * Handles the OTP verification only (first part of password reset).
   * This is called by the OtpInput component.
   * Backend should verify OTP and return a temporary token for password reset.
   * @param enteredOtp The OTP entered by the user.
   * @param currentUserId The user_id associated with the OTP request.
   */
 
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
        // setTimeout(() => {
        //   router.push('/login'); // Redirect to login page after successful verification
        // }, 2000); // Give user a moment to read success message
        setStep('new_password_entry'); // Move to the new password entry step
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

  /**
   * Handles the setting of a new password after OTP has been successfully verified.
   * @param e The form submission event.
   */
  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsLoading(true);

    if (newPassword !== confirmNewPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      setIsLoading(false);
      return;
    }

    try {
      // This endpoint needs to consume the OTP/verification token received in the previous step
      // For simplicity, we are passing email and the already verified OTP to the reset endpoint
      // A more robust solution might use a temporary 'reset_token' from verify-reset-otp endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/forgot/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user_id, new_password: newPassword }), // Pass email, the verified OTP, and new password
      });

      const data = await response.json();
      setIsLoading(false);

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Password reset successful! Redirecting to login.' });
        setTimeout(() => {
          router.push('/login'); // Redirect to login page after successful password reset
        }, 2000); // Give user a moment to read success message
        
      } else {
        const errorMessage = data.detail || 'Password reset failed. Please try again.';
        setMessage({ type: 'error', text: errorMessage });
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Set new password error:", error);
      setMessage({ type: 'error', text: 'Network error or unable to connect to the server.' });
    }
  };

  // Function to resend OTP, called from OtpInput


  const renderContent = () => {
    switch (step) {
      case 'email_input':
        return (
          <form className="space-y-6" onSubmit={handleRequestOtp}>
            <div className="text-center mb-8">
              <img src="/images/PDFier_logo.png" alt="PDFier Logo" className="h-50 w-70 mx-auto mt-[-40px] mb-[-40px]" />
              <p className="text-gray-500">Pls Verify your email with OTP.</p>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
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
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        );

      case 'otp_entry':
        // Render the reusable OtpInput component here
        return (
          <OtpInput 
            onVerify={handleVerifyOtp} 
            onResend={handleResendOtp} 
            email={email} 
            user_id={user_id} 
            // Pass isLoading to OtpInput if it needs to disable its fields
            // You might need to add an 'disabled' prop to your OtpInput component
          />
        );

      case 'new_password_entry':
        return (
          <form className="space-y-6" onSubmit={handleSetNewPassword}>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Set Your New Password</h1>
              <p className="text-gray-500">Enter and confirm your new password below.</p>
            </div>
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                id="new-password"
                name="new-password"
                type="password"
                autoComplete="new-password"
                required
                className="w-full px-4 py-2 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="confirm-new-password" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                id="confirm-new-password"
                name="confirm-new-password"
                type="password"
                autoComplete="new-password"
                required
                className="w-full px-4 py-2 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900"
                placeholder="Confirm new password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Setting Password...' : 'Set Password'}
            </button>
          </form>
        );

      case 'reset_success':
        return (
          <div className="text-center space-y-6">
             <h1 className="text-3xl font-bold text-gray-800 mb-2">Password Reset Successful!</h1>
             <p className="text-gray-500">You will be redirected to the login page shortly.</p>
             <div className="flex justify-center">
                 {/* Optional: Add a small loading spinner here if desired */}
             </div>
          </div>
        );
      default:
        return null; // Should not happen
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md mx-auto font-sans">
      {/* Display success or error messages */}
      {message && (
        <div className={`p-3 mb-4 rounded-lg text-sm 
          ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {renderContent()}

      {/* Link to Login Page if not in final success state (as it will redirect automatically) */}
      {step !== 'reset_success' && (
        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            Remembered your password?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
