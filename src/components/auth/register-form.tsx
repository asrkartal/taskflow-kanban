"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, LayoutDashboard, Mail, Lock, User } from "lucide-react";
import { toast } from "sonner";

export function RegisterForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Account created! Check your email for the verification code.");
      setShowOtpInput(true);
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "signup",
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Email verified successfully!");
      router.push("/dashboard");
    } catch {
      toast.error("Failed to verify code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass rounded-2xl p-8 shadow-2xl shadow-black/20 space-y-6 w-full max-w-md mx-auto">

      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/20 mb-2">
          <LayoutDashboard className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          {showOtpInput ? "Verify your email" : "Create an account"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {showOtpInput 
            ? `We sent a 6-digit code to ${email}`
            : "Start managing your projects with TaskFlow"}
        </p>
      </div>

      {!showOtpInput ? (
        <>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 focus:border-primary/50 transition-colors"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 focus:border-primary/50 transition-colors"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 focus:border-primary/50 transition-colors"
                  required
                  disabled={isLoading}
                  minLength={6}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-semibold bg-primary hover:bg-primary/90 transition-all duration-200 hover:shadow-lg hover:shadow-primary/25"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>


          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Sign in
            </Link>
          </div>
        </>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp" className="text-sm font-medium text-center block">
              Verification Code
            </Label>
            <Input
              id="otp"
              type="text"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="text-center text-2xl tracking-[1em] font-bold bg-white/5 border-white/10 focus:border-primary/50 h-14"
              required
              disabled={isLoading}
              maxLength={6}
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11 font-semibold bg-primary hover:bg-primary/90 transition-all duration-200"
            disabled={isLoading || otp.length !== 6}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mx-auto" />
            ) : (
              "Verify Email"
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full text-xs text-muted-foreground"
            onClick={() => setShowOtpInput(false)}
            disabled={isLoading}
          >
            Back to registration
          </Button>
        </form>
      )}
    </div>
  );
}
