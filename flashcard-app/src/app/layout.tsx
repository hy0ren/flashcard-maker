import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "FlashCards | Learn Smarter",
  description: "Create flashcard sets, practice with quizzes, and master vocabulary with fun games",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-mesh">
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
          
          <footer className="relative py-8 border-t border-[var(--border)] bg-[var(--background-secondary)]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                  <span className="font-semibold text-[var(--foreground)]">FlashCards</span>
                  <span>•</span>
                  <span>Built with Next.js & Tailwind</span>
                </div>
                <p className="text-sm text-[var(--muted)] flex items-center gap-1.5">
                  Practice makes perfect
                  <span className="text-lg">✨</span>
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
