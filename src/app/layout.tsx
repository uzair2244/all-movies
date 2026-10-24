import type { Metadata } from "next";
import { Oxygen, Encode_Sans_Condensed } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import DisclaimerBanner from "@/components/DisclaimerBanner";

const oxygen = Oxygen({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-oxygen",
  display: "swap",
});

const encode = Encode_Sans_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-encode",
  display: "swap",
});

export const metadata: Metadata = {
  title: "allmovies — Watch Movies Online",
  description:
    "Welcome to allmovies. Watch and discuss your favourite movies online. Your one stop source for the Latest Movies.",
  openGraph: {
    title: "allmovies — Watch Movies Online",
    description: "Your one stop source for the Latest Movies.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${oxygen.variable} ${encode.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <DisclaimerBanner />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
