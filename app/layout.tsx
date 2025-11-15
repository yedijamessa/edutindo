import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Edutindo",
  description: "Yayasan Edutindo – Education with Light",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header
          style={{
            borderBottom: "1px solid #eee",
            padding: "12px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontWeight: 700 }}>Edutindo</div>
          <nav style={{ display: "flex", gap: "16px", fontSize: "0.9rem" }}>
            <Link href="/">Home</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/donate">Donate</Link>
            <Link href="/get-involved">Get involved</Link>
          </nav>
        </header>

        <main style={{ padding: "24px", maxWidth: 960, margin: "0 auto" }}>
          {children}
        </main>

        <footer
          style={{
            borderTop: "1px solid #eee",
            padding: "12px 24px",
            textAlign: "center",
            fontSize: "0.8rem",
            color: "#666",
            marginTop: "48px",
          }}
        >
          © {new Date().getFullYear()} Yayasan Edutindo
        </footer>
      </body>
    </html>
  );
}
