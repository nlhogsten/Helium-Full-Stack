import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./components/providers/QueryProvider";
import { createClient } from '@/utils/supabase/server'
import UserHydrator from "./components/providers/UserHydrator";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Helium",
  description: "Translation Management Dashboard",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const { data: { user } }    = await supabase.auth.getUser()
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
        <UserHydrator initialUser={user} initialSession={session} />
          {children}
        </Providers>
      </body>
    </html>
  );
}
