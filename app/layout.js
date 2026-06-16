import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { dark } from "@clerk/themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "AI Mock Interview | By Shivam",
  description: "AI-Powered Mock Interview Platform by Shivam — practice smarter, ace your dream job.",
};

export default function RootLayout({ children }) {
  return (
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          suppressHydrationWarning
        >
          <ClerkProvider
            appearance={{
              baseTheme: dark,
              variables: {
                colorPrimary: '#3B82F6', // Tailwind blue-500
              },
              elements: {
                card: 'bg-slate-900 text-white z-[99999]',
                userButtonPopoverCard: 'bg-slate-900 text-white shadow-2xl z-[9999]',
                userButtonPopoverActions: 'bg-slate-800',
                userButtonPopoverActionButton: 'hover:bg-slate-700',
                userButtonPopoverFooter: 'bg-slate-900'
              }
            }}
          >
            <Toaster/>
            {children}
          </ClerkProvider>
        </body>
      </html>
  );
}