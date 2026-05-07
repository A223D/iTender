import type { Metadata } from "next";
import { Toaster } from "sonner";

import "./globals.css";

export const metadata: Metadata = {
  title: "Scout | Small Business Influencer Marketplace",
  description: "Scout helps small businesses connect with micro-influencers for paid and in-kind collaborations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="font-sans antialiased">
        {children}
        <Toaster
          position="bottom-right"
          visibleToasts={4}
          gap={8}
          toastOptions={{ unstyled: true, classNames: { toast: "" } }}
        />
      </body>
    </html>
  );
}
