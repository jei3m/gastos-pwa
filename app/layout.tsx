import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google"; // Already imported
import "./globals.css";
import { AccountProvider } from "@/context/account-context";
import { TanstackProvider } from "@/context/tanstack-context";

const APP_NAME = "Gastos";
const APP_DEFAULT_TITLE = "Gastos";
const APP_TITLE_TEMPLATE = "%s - Gastos";
const APP_DESCRIPTION = "Finance tracker PWA built with Next JS";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: APP_DEFAULT_TITLE,
    statusBarStyle: "default",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
      <html lang="en">
        <body className={`${poppins.variable} font-sans antialiased m-auto max-w-[600px]`}>
          <TanstackProvider>
            <AccountProvider>
              {children}
            </AccountProvider>            
          </TanstackProvider>
        </body>
      </html>
  );
}