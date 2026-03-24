"use client"
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface OtpInputProps {
  onVerify: (otp: string, user_id: string) => void;
  onResend: (user_id: string, email: string) => void;
  email: string;
  user_id: string;
  isLoading?: boolean;
}

export default function OtpInput({ onVerify, onResend, email, user_id, isLoading = false }: OtpInputProps) {
  const [otp, setOtp] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onVerify(otp, user_id);
  };

  const formVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } }
  };

  return (
    <motion.div variants={formVariants} initial="hidden" animate="show" className="w-full">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <motion.div variants={formVariants} className="space-y-2">
          <label htmlFor="otp" className="text-sm font-semibold text-foreground text-center block mb-4">
            One-Time Password (OTP)
          </label>
          <input
            id="otp"
            name="otp"
            type="text"
            required
            maxLength={4}
            disabled={isLoading}
            className="w-full px-4 py-4 bg-secondary/50 border border-border/50 text-foreground rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-center text-3xl font-bold tracking-[0.5em]"
            placeholder="••••"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
        </motion.div>
        
        <motion.div variants={formVariants}>
          <Button
            type="submit"
            disabled={isLoading || otp.length < 4}
            className="w-full py-6 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-lg hover:shadow-primary/40 hover:shadow-xl hover:-translate-y-1"
          >
            {isLoading ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verifying...</>
            ) : (
              "Verify Account"
            )}
          </Button>
        </motion.div>
      </form>
      
      <motion.div variants={formVariants} className="mt-6 text-center">
        <button
          type="button"
          onClick={() => onResend(user_id, email)}
          disabled={isLoading}
          className="text-primary hover:text-primary/80 transition-colors text-sm font-semibold disabled:opacity-50"
        >
          Resend OTP
        </button>
      </motion.div>
    </motion.div>
  );
}