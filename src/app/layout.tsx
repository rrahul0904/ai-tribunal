import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Tribunal",
  description: "An evidence-first interactive AI ethics hearing platform.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
