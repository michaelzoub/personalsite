import type { Metadata, Viewport} from "next";
import { DM_Sans, Space_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "./components/navbar";

const sans = DM_Sans({ subsets: ["latin"], display: 'swap', variable: '--font-sans' });
const mono = Space_Mono({ weight: ['400', '700'], subsets: ["latin"], display: 'swap', variable: '--font-mono' });

export const metadata: Metadata = {
  title: "Michael Zoubkoff's portfolio.",
  description: "Resume/portfolio site showcasing projects, skills as well as goals.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (

    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <Navbar></Navbar>
        {children}
        </body>
    </html>
  );
}
