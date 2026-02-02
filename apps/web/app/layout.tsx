import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Travel MVP",
  description: "Mobile-first travel booking MVP"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#14532d" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      </head>
      <body className="min-h-dvh">
        <div className="mx-auto max-w-[420px] px-4 pb-24 pt-4">{children}</div>
      </body>
    </html>
  );
}
