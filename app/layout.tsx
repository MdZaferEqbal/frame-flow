import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const iselora = localFont({
  src: "../public/fonts/IseloraDemo-Regular.otf",
  variable: "--font-iselora",
});

export const metadata: Metadata = {
  title: "Frame Flow",
  description: "Discover and explore high-resolution curated photos and sports video clips from global creators. Powered by Next.js, Tailwind CSS, and GSAP.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${iselora.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/*
          Blocking inline script — runs synchronously before first paint (in <head>).
          Reads the persisted theme from localStorage (or falls back to the OS
          preference) and applies the .dark class to <html> immediately, so
          Tailwind's dark: utilities are active from frame 1 with no flash.
          strategy="beforeInteractive" is the correct Next.js App Router approach.
        */}
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var saved = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var isDark = saved ? saved === 'dark' : prefersDark;
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>{children}</body>
    </html>
  );
}
