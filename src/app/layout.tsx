import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "./components/navbar";
import { RouteTransition } from "./components/RouteTransition";
import { AudioFeedback } from "./components/AudioFeedback";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.zoubkoff.com"),
  title: {
    default: "Michael Zoubkoff's portfolio.",
    template: "%s · Michael Zoubkoff",
  },
  description: "Resume/portfolio site showcasing projects, skills as well as goals.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (

    <html lang="en" className={`${inter.variable} ${robotoMono.variable}`}>
      <body>
        <Navbar />
        <AudioFeedback />
        <RouteTransition>{children}</RouteTransition>
        </body>
    </html>
  );
}
