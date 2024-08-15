import type { Metadata, Viewport} from "next";
import { Ubuntu_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "./components/navbar";

const ubuntu = Ubuntu_Mono({weight: "400", subsets : ["latin"], display: 'swap',});

export const metadata: Metadata = {
  title: "Michael Zoubkoff's portfolio.",
  description: "Resume/portfolio site showcasing projects, skills as well as goals.",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (

    <html lang="en" className="cursor-default selection:text-selection">
      <body className={ubuntu.className}>
        <Navbar></Navbar>
        {children}
        </body>
    </html>
  );
}
