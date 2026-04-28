import { RegisterForm } from "@/components/auth/register-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register — TaskFlow",
  description: "Create a new TaskFlow account",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
