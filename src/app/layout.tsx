import type { Metadata } from "next";
import { Ubuntu_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "./components/navbar";

const ubuntu = Ubuntu_Mono({weight: "400", subsets : ["latin"], display: 'swap',});

export const metadata: Metadata = {
  title: "Z's site.",
  description: "Resume/portfolio site showcasing projects, skills as well as goals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={ubuntu.className}>
        <Navbar></Navbar>
        {children}
        </body>
    </html>
  );
}
