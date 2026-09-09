import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Shaivi’s Little World",
  description:
    "A small world for big ideas. Explore a playful, handcrafted creative portfolio.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
