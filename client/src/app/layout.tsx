import QueryProvider from "@/providers/QueryProvider";
import type { Metadata } from "next";
import "./globals.css";
import "./immersive.css";

export const metadata: Metadata = {
  title: "Shaivi’s Little World",
  description:
    "A small world for big ideas. Explore a playful, handcrafted creative portfolio.",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
