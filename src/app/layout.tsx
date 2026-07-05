import type { Metadata, Viewport} from "next";
import "./globals.css";
import { Navbar } from "./components/navbar";

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

    <html lang="en">
      <body>
        <Navbar />
        {children}
        </body>
    </html>
  );
}
