import { LoginForm } from "@/components/auth/login-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login — TaskFlow",
  description: "Sign in to your TaskFlow account",
};

export default function LoginPage() {
  return <LoginForm />;
}
