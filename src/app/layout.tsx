import type { Metadata } from "next";
import "./globals.css";
import { VisualEditsMessenger } from "orchids-visual-edits";
import { LanguageProvider } from "@/lib/language-context";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";

export const metadata: Metadata = {
  title: "SDEL.AI - AI Content Generation",
  description: "Generate images, videos and audio with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="antialiased">
        <Script
          id="orchids-browser-logs"
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts/orchids-browser-logs.js"
          strategy="afterInteractive"
          data-orchids-project-id="fd1da8b4-e5dc-4358-b600-21c518300dc8"
        />
        <LanguageProvider>
          {children}
        </LanguageProvider>
        <Toaster position="bottom-right" richColors />
        <VisualEditsMessenger />
      </body>
    </html>
  );
}
