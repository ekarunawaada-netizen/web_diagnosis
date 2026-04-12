import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "../components/Providers";
import PageLoader from "../components/PageLoader";
import Chatbot from "../components/Chatbot";

const manrope = Manrope({ subsets: ["latin"], variable: '--font-manrope' });
const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });

export const metadata: Metadata = {
  title: "MediScan - Diagnosis Interaktif",
  description: "Platform Diagnosis Digital Terpercaya",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <meta name="theme-color" content="#f7f9fb" />
      </head>
      <body className={`${inter.className} bg-surface font-body text-on-surface antialiased overflow-x-hidden`}>
        <PageLoader />
        <Providers>
          {children}
          <Chatbot />
        </Providers>
      </body>
    </html>
  );
}
