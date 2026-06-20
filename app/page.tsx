"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/ui/section";

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

const HOMEPAGE_CAROUSEL_SLIDES = SMP_BETUN_PHOTO_SOURCES.map((src, index) => ({
  src,
  alt: `Edutindo learning and community photo ${index + 1}`,
}));

const HOMEPAGE_FEATURE_IMAGES = [
  {
    src: "/homepage/eti-group-project.png",
    alt: "Students collaborating in a classroom",
  },
  {
    src: "/homepage/eti-steam-lab.png",
    alt: "Students working on STEAM projects",
  },
  {
    src: "/homepage/eti-activity-bible.png",
    alt: "Students in Bible-focused learning activity",
  },
];

export default function HomePage() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % HOMEPAGE_CAROUSEL_SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const currentSlide = HOMEPAGE_CAROUSEL_SLIDES[activeSlide];

  const showPrevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + HOMEPAGE_CAROUSEL_SLIDES.length) % HOMEPAGE_CAROUSEL_SLIDES.length);
  };

  const showNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % HOMEPAGE_CAROUSEL_SLIDES.length);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <Section className="relative isolate overflow-hidden bg-slate-50 pt-8 pb-16 sm:pt-12 sm:pb-20 md:pt-20 md:pb-32">
        <div className="absolute inset-0 -z-20 bg-[url('/homepage/1-section-bg-mobile.png')] bg-cover bg-center bg-no-repeat sm:hidden" />
        <div className="absolute inset-0 -z-20 hidden bg-[url('/homepage/1-section-bg.png')] bg-cover bg-center bg-no-repeat sm:block" />
        <div className="absolute inset-0 -z-10 bg-white/42" />

        <div className="relative z-10 grid items-center gap-10 sm:gap-12 lg:grid-cols-2">
          <div className="min-w-0 space-y-6 sm:space-y-8">
            <Badge
              variant="secondary"
              className="mx-auto hidden w-fit max-w-full whitespace-normal px-4 py-1 text-center text-xs leading-relaxed sm:flex sm:mx-0 sm:text-left sm:text-sm"
            >
              EDUKASI TERANG INDONESIA (EDUTINDO) FOUNDATION
            </Badge>

            <h1 className="text-4xl font-extrabold leading-[1.02] tracking-tight text-foreground sm:text-5xl sm:leading-[1.08] md:text-6xl lg:text-6xl xl:text-7xl">
              Breaking Barriers <br />
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text pb-[0.08em] text-transparent sm:inline-block sm:whitespace-nowrap">
                Building The Future
              </span>
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl">
              A Christian STEAM education initiative for Indonesia&apos;s next generation of servant-hearted innovators
            </p>

            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-row sm:gap-4">
              <Button
                size="lg"
                asChild
                className="h-12 w-full whitespace-normal rounded-full px-3 text-center text-sm sm:h-14 sm:w-auto sm:whitespace-nowrap sm:px-8 sm:text-lg"
              >
                <Link href="https://www.edutindo.org/donate">
                  <span className="truncate">Start Your Journey With Us</span>
                  <ArrowRight className="ml-2 h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="h-12 w-full whitespace-nowrap rounded-full px-3 text-center text-sm sm:h-14 sm:w-auto sm:px-8 sm:text-lg"
              >
                <Link href="/about">Learn About Us</Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="relative mx-auto aspect-[16/10] w-full max-w-2xl overflow-hidden rounded-3xl border-4 border-white shadow-2xl transition-transform duration-500 rotate-2 hover:rotate-0 dark:border-slate-800">
              <Image
                src={currentSlide.src}
                alt={currentSlide.alt}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
                priority
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/75 via-slate-900/30 to-transparent p-4">
                <p className="text-xs sm:text-sm font-semibold text-white">
                  Edutindo photo archive
                  <span className="ml-2 text-white/80">
                    {activeSlide + 1} / {HOMEPAGE_CAROUSEL_SLIDES.length}
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={showPrevSlide}
                className="absolute left-3 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/45 text-white hover:bg-slate-900/65 transition-colors"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={showNextSlide}
                className="absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/45 text-white hover:bg-slate-900/65 transition-colors"
                aria-label="Next slide"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

            </div>
          </div>
        </div>
      </Section>

      {/* Why School + STEAM + Christian */}
      <Section id="pathways" className="bg-slate-50 dark:bg-slate-900/40">
        <div className="space-y-8">


          <div className="rounded-3xl bg-white/90 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 md:p-10">
            <h3 className="mb-4 text-xs font-extrabold tracking-tight md:mb-6 md:text-4xl">OUR VISION</h3>
            <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-200 md:text-lg">
              Transforming rural Indonesia by unlocking STEAM learning opportunities through SCHOOL partnerships that empower teachers and families to raise a skilled and impact-driven generation, rooted in CHRISTIAN values and capable of driving INNOVATION that uplifts their local communities.
            </p>
            <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100/70 dark:bg-slate-800/70 p-3 md:mt-5 md:p-5">
              <p className="text-xs md:text-sm font-semibold tracking-[0.12em] uppercase text-slate-500 dark:text-slate-400">Our Approach</p>
              <p className="mt-2 text-xs leading-relaxed italic text-slate-700 dark:text-slate-200 md:text-base">
                We are committed to rigorous research and continuous refinement to discover and implement the most effective interventions for advancing science education delivery to the unreached.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 md:gap-6">
            <Card className="overflow-hidden border-none bg-orange-500 shadow-none">
              <div className="relative h-20 sm:h-28 md:h-44">
                <Image
                  src={HOMEPAGE_FEATURE_IMAGES[0].src}
                  alt={HOMEPAGE_FEATURE_IMAGES[0].alt}
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="p-2.5 sm:p-4 md:p-6">
                <CardTitle className="text-[11px] leading-tight text-white sm:text-base md:text-3xl">
                  School offers optimum ENGAGEMENT
                </CardTitle>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-none bg-cyan-500 shadow-none">
              <div className="relative h-20 sm:h-28 md:h-44">
                <Image
                  src={HOMEPAGE_FEATURE_IMAGES[1].src}
                  alt={HOMEPAGE_FEATURE_IMAGES[1].alt}
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="p-2.5 sm:p-4 md:p-6">
                <CardTitle className="text-[11px] leading-tight text-white sm:text-base md:text-3xl">
                  Critical need for local INNOVATORS
                </CardTitle>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-none bg-yellow-400 shadow-none">
              <div className="relative h-20 sm:h-28 md:h-44">
                <Image
                  src={HOMEPAGE_FEATURE_IMAGES[2].src}
                  alt={HOMEPAGE_FEATURE_IMAGES[2].alt}
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="p-2.5 sm:p-4 md:p-6">
                <CardTitle className="text-[10px] leading-tight text-slate-900 sm:text-base md:text-3xl">
                  Encountering Jesus brings
                  <span className="hidden md:inline">
                    <br />
                  </span>
                  <span className="md:ml-0"> </span>
                  TRANSFORMATION
                </CardTitle>
              </CardContent>
            </Card>
          </div>

          <div className="overflow-hidden rounded-[2.5rem] border border-sky-100/80 bg-white/95 shadow-[0_38px_90px_-56px_rgba(37,99,235,0.45)]">
            <a
              href="/homepage/building-blocks-reference.png"
              target="_blank"
              rel="noreferrer"
              className="block"
              aria-label="Open Edutindo building blocks framework image"
            >
              <Image
                src="/homepage/building-blocks-reference.png"
                alt="Edutindo building blocks framework"
                width={1680}
                height={940}
                className="h-auto w-full"
              />
              <span className="block px-4 pb-4 text-center text-[11px] text-slate-500 md:hidden">
                Tap image to open and zoom
              </span>
            </a>
          </div>
        </div>
      </Section>
    </div>

  );
}
