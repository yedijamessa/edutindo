import Image from "next/image";
import Link from "next/link";
import styles from "./home-shell.module.css";

export function HomeFooter() {
  return (
    <footer className={styles.footer}>
      <svg
        className={styles.footerWave}
        viewBox="0 0 1440 90"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0 0C220 85 330 68 600 65S1080 60 1440 90H0Z"
          fill="#74a2bd"
          opacity=".6"
        />
        <path
          d="M0 27C225 98 430 78 690 79S1120 47 1440 85v5H0Z"
          fill="#345b7c"
        />
        <path
          d="M0 70C190 13 240 93 550 82S1000 76 1440 90H0Z"
          fill="#0b2544"
        />
      </svg>
      <div className={styles.footerInner}>
        <div className={styles.footerGrid}>
          <div className={styles.foundation}>
            <Link href="/" className={styles.footerBrand}>
              <Image src="/logo-edutindo.png" alt="" width={28} height={42} />
              <span>Edutindo</span>
            </Link>
            <p className={styles.tagline}>
              Breaking Barriers, Building The Future.
            </p>
            <div className={styles.registration}>
              <p>Registration Number: 5025111131101093</p>
              <p>AHU Number: AHU-0027575.AH.01.01</p>
              <p>Foundation Number: AHU-0042444.AH.01.12</p>
            </div>
          </div>
          <nav aria-label="Footer quick links">
            <h2>Quick Links</h2>
            <Link href="/about">About Us</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/get-involved">Get Involved</Link>
          </nav>
          <nav aria-label="Legal">
            <h2>Legal</h2>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
          </nav>
          <p className={styles.footerNote}>
            Education
            <br />
            Lights Brighter
            <br />
            <span>Futures</span>
          </p>
        </div>
        <div className={styles.footerBottom}>
          <p>
            © {new Date().getFullYear()} Yayasan Edutindo. All rights reserved.
          </p>
          <Link href="/contact">
            Let&apos;s build a brighter future <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
