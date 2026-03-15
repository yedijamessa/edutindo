import type { Metadata } from "next";
import { Suspense } from "react";
import Script from "next/script";
import "./globals.css";
import { GoogleTagPageViews } from "@/components/analytics/google-tag-page-views";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ThemeProvider } from "@/components/theme-provider";
import { InactivitySignOut } from "@/components/auth/inactivity-signout";

export const metadata: Metadata = {
  title: "Edutindo",
  description: "Yayasan Edutindo – Breaking Barriers, Building The Future",
  other: {
    google: "notranslate",
  },
  icons: {
    icon: [
      { url: "/favicon_io/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon_io/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon_io/favicon.ico" },
    ],
    apple: [{ url: "/favicon_io/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/favicon_io/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const googleTagId = process.env.NEXT_PUBLIC_GOOGLE_TAG_ID ?? "G-4XH15RQM5W";

  return (
    <html lang="en" translate="no" className="notranslate" suppressHydrationWarning>
      <body className="font-sans notranslate" suppressHydrationWarning>
        {googleTagId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${googleTagId}`}
              strategy="afterInteractive"
            />
            <Script id="google-tag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('js', new Date());
                gtag('config', ${JSON.stringify(googleTagId)});
              `}
            </Script>
            <Suspense fallback={null}>
              <GoogleTagPageViews tagId={googleTagId} />
            </Suspense>
          </>
        ) : null}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <InactivitySignOut />
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
