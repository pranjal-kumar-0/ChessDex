import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chess Openings",
  description: "Learn chess openings move by move on an interactive board.",
};

import Link from 'next/link';

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col" style={{ background: "#1F150C", color: "#E1DCC9" }}>
        <header
          className="flex items-center gap-3 px-4 py-3 lg:px-8 lg:py-5 border-b"
          style={{ borderColor: '#3A2818' }}
        >
          <Link href="/" className="flex items-center gap-3 cursor-pointer">
            <span className="text-2xl">♟</span>
            <span className="font-semibold tracking-tight" style={{ color: '#E1DCC9' }}>
              Chess Openings
            </span>
          </Link>
        </header>
        <main className="flex-1 flex justify-center px-2 py-4 lg:px-6 lg:py-10">
          {children}
        </main>
      </body>
    </html>
  );
}
