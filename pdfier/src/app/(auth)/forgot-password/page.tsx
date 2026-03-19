"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Loader2, ArrowRight, KeyRound, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import OtpInput from "@/components/auth/otp"; 

type ResetPasswordStep = 'email_input' | 'otp_entry' | 'new_password_entry' | 'reset_success';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [user_id, setUser_id] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [step, setStep] = useState<ResetPasswordStep>('email_input');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
        setMessage({ type: 'success', text: data.message || 'OTP sent to your email. Please check your inbox.' });
        setUser_id(data.user_id); 
        setStep('otp_entry');
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
        setMessage({ type: 'success', text: data.message || 'Account verified successfully!' });
        setStep('new_password_entry');
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
        setMessage({ type: 'error', text: Array.isArray(data.detail) ? data.detail.map((err: { msg: string }) => err.msg).join('. ') : (data.detail?.message || data.detail || 'Failed to resend OTP.') });
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Resend OTP error:", error);
      setMessage({ type: 'error', text: 'Network error during OTP resend.' });
    }
  };

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
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/forgot/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user_id, new_password: newPassword }), 
      });

      const data = await response.json();
      setIsLoading(false);

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Password reset successful!' });
        setStep('reset_success');
        setTimeout(() => {
          router.push('/login'); 
        }, 2000); 
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

  const formVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { type: "spring", bounce: 0, duration: 0.4 } },
    exit: { opacity: 0, scale: 1.05, transition: { duration: 0.2 } }
  };

  const staggerVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
  };

  const renderContent = () => {
    switch (step) {
      case 'email_input':
        return (
          <motion.div key="email_input" variants={formVariants} initial="hidden" animate="show" exit="exit" className="w-full">
            <motion.div variants={staggerVariants} initial="hidden" animate="show" className="text-center mb-8">
              <div className="flex items-center justify-center space-x-3 mb-6">
                <div className="relative flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 text-primary shadow-inner border border-primary/20">
                  <KeyRound size={24} className="absolute text-primary" />
                </div>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Reset Password</h1>
              <p className="text-muted-foreground mt-2">Enter your email to receive a verification code.</p>
            </motion.div>

            <form className="space-y-6" onSubmit={handleRequestOtp}>
              <motion.div variants={staggerVariants} initial="hidden" animate="show" className="space-y-2">
                <label htmlFor="email" className="text-sm font-semibold text-foreground">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-border/50 text-foreground rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </motion.div>
              <motion.div variants={staggerVariants} initial="hidden" animate="show">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-6 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-lg hover:shadow-primary/40 hover:shadow-xl hover:-translate-y-1"
                >
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sending...</>
                  ) : (
                    <>Send OTP <ArrowRight className="ml-2 h-5 w-5" /></>
                  )}
                </Button>
              </motion.div>
            </form>
          </motion.div>
        );

      case 'otp_entry':
        return (
          <motion.div key="otp_entry" variants={formVariants} initial="hidden" animate="show" exit="exit" className="w-full">
            <div className="text-center mb-8">
              <div className="inline-flex justify-center items-center w-16 h-16 rounded-2xl bg-primary/10 mb-4 border border-primary/20">
                  <Mail className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Verify Email</h1>
              <p className="text-muted-foreground mt-2">We sent a 4-digit code to <span className="font-semibold text-foreground">{email}</span></p>
            </div>
            <OtpInput onVerify={handleVerifyOtp} onResend={handleResendOtp} email={email} user_id={user_id} isLoading={isLoading} />
          </motion.div>
        );

      case 'new_password_entry':
        return (
          <motion.div key="new_password_entry" variants={formVariants} initial="hidden" animate="show" exit="exit" className="w-full">
            <motion.div variants={staggerVariants} initial="hidden" animate="show" className="text-center mb-8">
               <div className="inline-flex justify-center items-center w-16 h-16 rounded-2xl bg-primary/10 mb-4 border border-primary/20">
                  <Lock className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Set New Password</h1>
              <p className="text-muted-foreground mt-2">Create a strong, new password.</p>
            </motion.div>

            <form className="space-y-5" onSubmit={handleSetNewPassword}>
              <motion.div variants={staggerVariants} initial="hidden" animate="show" className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="new-password" className="text-sm font-semibold text-foreground">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <input
                      id="new-password"
                      name="new-password"
                      type="password"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-border/50 text-foreground rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="confirm-new-password" className="text-sm font-semibold text-foreground">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <input
                      id="confirm-new-password"
                      name="confirm-new-password"
                      type="password"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-secondary/50 border border-border/50 text-foreground rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      placeholder="••••••••"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </motion.div>
              
              <motion.div variants={staggerVariants} initial="hidden" animate="show" className="pt-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-6 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-lg hover:shadow-primary/40 hover:shadow-xl hover:-translate-y-1"
                >
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving...</>
                  ) : (
                    <>Set Password <CheckCircle2 className="ml-2 h-5 w-5" /></>
                  )}
                </Button>
              </motion.div>
            </form>
          </motion.div>
        );

      case 'reset_success':
        return (
          <motion.div key="reset_success" variants={formVariants} initial="hidden" animate="show" className="w-full text-center space-y-6 py-6">
             <div className="inline-flex justify-center items-center w-24 h-24 rounded-full bg-green-500/10 mb-2 border-4 border-green-500/20">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
             <h1 className="text-3xl font-bold tracking-tight text-foreground">Password Reset!</h1>
             <p className="text-muted-foreground text-md max-w-[250px] mx-auto">Your password has been successfully updated. Redirecting to login...</p>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full font-sans">
      <AnimatePresence mode="wait">
        {message && (
          <motion.div 
            key="message-box"
            initial={{ opacity: 0, y: -20, scale: 0.95 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`p-4 mb-6 rounded-xl text-sm font-medium border ${
              message.type === 'success' ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-destructive/10 text-destructive border-destructive/20'
            }`}
          >
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>

      {step !== 'reset_success' && (
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-muted-foreground">
            Remembered your password?{' '}
            <Link href="/login" className="font-bold text-primary hover:text-primary/80 transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      )}
    </div>
  );
}
