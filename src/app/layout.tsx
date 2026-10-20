import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "./components/navbar";
import { RouteTransition } from "./components/RouteTransition";
import { InspectEgg } from "./components/InspectEgg";

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
  description: "I research and build agents. Experimenting with new ways of building software.",
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Michael Zoubkoff",
    title: "Michael Zoubkoff",
    description: "I research and build agents. Experimenting with new ways of building software.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Michael Zoubkoff",
    description: "I research and build agents. Experimenting with new ways of building software.",
  },
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
        <InspectEgg />
        <RouteTransition>{children}</RouteTransition>
        </body>
    </html>
  );
}
