import { Outfit } from "next/font/google";
import "./globals.css";
import { AppContextProvider } from "@/context/AppContext";
import { Toaster } from "react-hot-toast";
import { ClerkProvider } from "@clerk/nextjs";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata = {
  title: "Mobile Shop",
  description: "A modern e-commerce platform built with Next.js, MongoDB, Stripe, and Clerk.",
  metadataBase: new URL("https://mobile-shop-lime.vercel.app"),
  openGraph: {
    title: "Mobile Shop",
    description: "A modern e-commerce platform built with Next.js, MongoDB, Stripe, and Clerk.",
    url: "https://mobile-shop-lime.vercel.app",
    siteName: "Mobile Shop",
    images: [
      {
        url: "/thumbnail.png", 
        width: 1200,
        height: 630,
        alt: "Mobile Shop Homepage Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mobile Shop",
    description: "A modern mobile e-commerce platform.",
    images: ["/thumbnail.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${outfit.className} antialiased text-gray-700`}>
          <Toaster />
          <AppContextProvider>{children}</AppContextProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
