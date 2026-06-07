import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mac Falcon",
  description: "Give your AI a body. Mobile robotics kits for Mac Mini.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#05070d] text-slate-100 antialiased">{children}</body>
    </html>
  );
}
