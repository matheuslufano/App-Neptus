import "./globals.css";

import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Toaster } from "sonner";

import Providers from "@/auth/Providers";
import DataSyncManager from "@/components/DataSyncManager";
import OfflineIndicator from "@/components/OfflineIndicator";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";

// Nova forma de definir viewport no Next.js
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#1e40af",
};

export const metadata: Metadata = {
  title: "Neptus",
  description: "Monitoramento da qualidade da água em tanques de peixe.",
  metadataBase: new URL("https://neptus.vercel.app"),

  applicationName: "Neptus",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Neptus",
    startupImage: "/assets/icon-1024x1024.png",
  },
  formatDetection: {
    telephone: false,
  },

  openGraph: {
    title: "Neptus",
    description: "Monitoramento da qualidade da água em tanques de peixe.",
    images: [
      {
        url: "/assets/icon-1024x1024.png",
        width: 1024,
        height: 1024,
        alt: "Neptus - Monitoramento de qualidade da água",
      },
    ],
    type: "website",
  },

  icons: {
    icon: [
      { url: "/assets/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/assets/apple-touch-icon.png",
    other: [
      {
        rel: "manifest",
        url: "/manifest.json",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "192x192",
        url: "/android-chrome-192x192.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "512x512",
        url: "/android-chrome-512x512.png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <head>
        {process.env.NODE_ENV === "development" && (
          <Script
            src="//unpkg.com/react-grab/dist/index.global.js"
            crossOrigin="anonymous"
            strategy="beforeInteractive"
          />
        )}
        <meta name="application-name" content="Neptus" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="Neptus" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="theme-color" content="#1e40af" />
        <meta name="msapplication-navbutton-color" content="#1e40af" />
        <meta name="msapplication-TileColor" content="#1e40af" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className="antialiased">
        <Providers>
          <ServiceWorkerRegistration />
          <OfflineIndicator />
          <DataSyncManager />
          <Toaster
            position="top-center"
            richColors
            closeButton
            expand={true}
            visibleToasts={3}
            toastOptions={{
              duration: 4000,
              style: {
                maxWidth: "400px",
                padding: "12px 16px",
              },
            }}
          />
          {children}
        </Providers>
      </body>
    </html>
  );
}
