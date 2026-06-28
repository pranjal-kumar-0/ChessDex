import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Chess Openings",
  description: "Learn chess openings move by move on an interactive board.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen" style={{ background: "#1F150C", color: "#E1DCC9" }}>
        {children}
      </body>
    </html>
  );
}
