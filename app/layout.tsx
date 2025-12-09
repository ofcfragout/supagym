import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SupaGym - Modern Gym Tracking App",
  description: "Track workouts, compete with friends, and achieve your fitness goals",
  manifest: "/manifest.json",
  themeColor: "#2563eb",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-gray-50">
        {children}
      </body>
    </html>
  );
}
