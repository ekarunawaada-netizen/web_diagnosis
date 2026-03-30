import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Chatbot from '../components/Chatbot';
import { Providers } from "../components/Providers";
import PageLoader from "../components/PageLoader";

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
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossOrigin="" />
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
