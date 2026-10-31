"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import styles from "./hero-photo-carousel.module.css";

const SMP_BETUN_PHOTO_SOURCES = [
  "/smp_betun/WhatsApp Image 2025-12-03 at 21.55.46.jpeg",
  "/smp_betun/WhatsApp Image 2025-12-03 at 21.55.47.jpeg",
  "/smp_betun/WhatsApp Image 2025-12-03 at 21.55.47 (1).jpeg",
  "/smp_betun/WhatsApp Image 2025-12-03 at 21.55.47 (2).jpeg",
  "/smp_betun/WhatsApp Image 2025-12-03 at 21.55.47 (3).jpeg",
  "/smp_betun/WhatsApp Image 2025-12-03 at 21.55.47 (4).jpeg",
  "/smp_betun/WhatsApp Image 2025-12-03 at 21.55.47 (5).jpeg",
  "/smp_betun/WhatsApp Image 2025-12-03 at 21.55.47 (6).jpeg",
  "/smp_betun/WhatsApp Image 2025-12-03 at 21.55.47 (7).jpeg",
  "/smp_betun/WhatsApp Image 2025-12-03 at 21.55.47 (8).jpeg",
  "/smp_betun/WhatsApp Image 2025-12-03 at 21.55.47 (9).jpeg",
  "/smp_betun/WhatsApp Image 2025-12-03 at 21.55.47 (10).jpeg",
  "/smp_betun/WhatsApp Image 2025-12-03 at 21.55.47 (13).jpeg",
  "/smp_betun/WhatsApp Image 2025-12-03 at 21.55.47 (14).jpeg",
  "/smp_betun/WhatsApp Image 2025-12-03 at 21.55.48.jpeg",
  "/smp_betun/WhatsApp Image 2025-12-03 at 21.55.48 (1).jpeg",
  "/smp_betun/WhatsApp Image 2025-12-03 at 21.55.48 (2).jpeg",
  "/smp_betun/WhatsApp Image 2025-12-03 at 21.55.48 (3).jpeg",
  "/smp_betun/WhatsApp Image 2025-12-03 at 21.55.56.jpeg",
  "/smp_betun/WhatsApp Image 2025-12-03 at 21.55.56 (1).jpeg",
  "/smp_betun/WhatsApp Image 2025-12-03 at 21.55.56 (2).jpeg",
  "/smp_betun/WhatsApp Image 2025-12-03 at 21.55.56 (3).jpeg",
  "/smp_betun/WhatsApp Image 2025-12-03 at 21.55.56 (4).jpeg",
  "/smp_betun/WhatsApp Image 2025-12-03 at 21.55.56 (5).jpeg",
  "/smp_betun/WhatsApp Image 2025-12-03 at 21.55.56 (6).jpeg",
  "/smp_betun/WhatsApp Image 2025-12-03 at 21.55.56 (7).jpeg",
  "/smp_betun/WhatsApp Image 2025-12-03 at 21.55.57.jpeg",
  "/smp_betun/WhatsApp Image 2025-12-03 at 21.55.57 (1).jpeg",
  "/smp_betun/WhatsApp Image 2025-12-03 at 21.55.57 (2).jpeg",
  "/smp_betun/WhatsApp Image 2025-12-03 at 21.55.57 (3).jpeg",
  "/smp_betun/WhatsApp Image 2025-12-03 at 21.55.57 (4).jpeg",
  "/smp_betun/WhatsApp Image 2025-12-03 at 21.55.57 (5).jpeg",
  "/smp_betun/WhatsApp Image 2025-12-03 at 21.55.57 (6).jpeg",
  "/smp_betun/WhatsApp Image 2025-12-03 at 21.55.57 (7).jpeg",
  "/smp_betun/WhatsApp Image 2025-12-03 at 21.55.57 (8).jpeg",
  "/smp_betun/WhatsApp Image 2025-12-03 at 21.55.57 (9).jpeg",
  "/smp_betun/WhatsApp Image 2025-12-03 at 21.55.57 (10).jpeg",
  "/smp_betun/WhatsApp Image 2025-12-03 at 21.55.58.jpeg",
  "/smp_betun/WhatsApp Image 2025-12-03 at 21.55.58 (1).jpeg",
  "/smp_betun/WhatsApp Image 2025-12-03 at 21.55.58 (2).jpeg",
  "/smp_betun/WhatsApp Image 2025-12-03 at 21.56.00.jpeg",
  "/smp_betun/WhatsApp Image 2025-12-03 at 21.56.00 (1).jpeg",
  "/smp_betun/WhatsApp Image 2025-12-03 at 21.56.01.jpeg",
  "/smp_betun/WhatsApp Image 2025-12-03 at 21.56.01 (1).jpeg",
];

export function HeroPhotoCarousel() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const interval = window.setInterval(() => {
      setActiveSlide((index) => (index + 1) % SMP_BETUN_PHOTO_SOURCES.length);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [paused]);

  const moveSlide = (direction: number) => {
    setActiveSlide(
      (index) =>
        (index + direction + SMP_BETUN_PHOTO_SOURCES.length) %
        SMP_BETUN_PHOTO_SOURCES.length,
    );
  };

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Foto kegiatan Edutindo"
    >
      <Image
        src={SMP_BETUN_PHOTO_SOURCES[activeSlide]}
        alt={`Foto kegiatan belajar dan komunitas Edutindo ${activeSlide + 1}`}
        fill
        sizes="(min-width: 1400px) 540px, (min-width: 900px) 44vw, 90vw"
        priority={activeSlide === 0}
        className={styles.photo}
      />
      <button
        type="button"
        onClick={() => moveSlide(-1)}
        className={`${styles.control} ${styles.previous}`}
        aria-label="Foto sebelumnya"
      >
        <ChevronLeft size={20} aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => moveSlide(1)}
        className={`${styles.control} ${styles.next}`}
        aria-label="Foto berikutnya"
      >
        <ChevronRight size={20} aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => setPaused((value) => !value)}
        className={`${styles.control} ${styles.pause}`}
        aria-label={paused ? "Putar slideshow" : "Jeda slideshow"}
      >
        {paused ? (
          <Play size={15} aria-hidden="true" />
        ) : (
          <Pause size={15} aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
