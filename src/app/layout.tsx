import type { Metadata } from "next";
import { Unbounded } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const display = Unbounded({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Synapse | Learn Smarter",
  description: "Synapse helps you create flashcard sets, practice with quizzes, and master vocabulary with fun games",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased bg-mesh ${display.variable}`}>
        <div className="min-h-screen flex flex-col relative">
          {/* Decorative background elements */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div className="decoration-blob w-[600px] h-[600px] bg-[var(--primary)] top-[-200px] right-[-200px] opacity-[0.03]" />
            <div className="decoration-blob w-[500px] h-[500px] bg-[var(--accent)] bottom-[-100px] left-[-100px] opacity-[0.03]" />
          </div>
          
          <Navbar />
          
          <main className="flex-1 relative">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
