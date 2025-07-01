"use client"
import { useState } from "react";

export default function OtpInput({ onVerify, onResend, email, user_id }: { onVerify: (otp: string, user_id: string) => void; onResend: (user_id: string, email: string) => void; email: string, user_id: string }) {
    const [otp, setOtp] = useState('');
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onVerify(otp, user_id);
    };
  
    return (
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Verify Your Account</h1>
          <p className="text-gray-500">
            An OTP has been sent to <span className="font-medium text-blue-600">{email}</span>. Please enter it below to verify your account.
          </p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
              One-Time Password (OTP)
            </label>
            <input
              id="otp"
              name="otp"
              type="text"
              required
              maxLength={6} // Assuming a 6-digit OTP
              className="w-full px-4 py-2 border border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900 text-center text-xl tracking-widest"
              placeholder="____"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#471396] hover:bg-[#471396]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#471396]/50 transition"
          >
            Verify Account
          </button>
        </form>
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => onResend(user_id, email)}
            className="text-[#471396] hover:text-[#471396]/90 text-sm font-medium"
          >
            Resend OTP
          </button>
        </div>
      </div>
    );
}