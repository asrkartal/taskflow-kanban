import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TaskFlow — Kanban Project Management",
  description:
    "Modern Kanban board for managing your projects with drag-and-drop, real-time updates, and AI-powered task descriptions.",
  keywords: ["kanban", "project management", "task management", "trello alternative"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased dark`}>
      <body className="min-h-full flex flex-col font-sans">
        <TooltipProvider>
          {children}
        </TooltipProvider>
        <Toaster
          position="bottom-right"
          richColors
          closeButton
          toastOptions={{
            className: "glass",
          }}
        />
      </body>
    </html>
  );
}
