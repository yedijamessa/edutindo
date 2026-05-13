"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/ui/section";

const HOMEPAGE_PHOTO_SOURCES = [
  "/homepage-photos-archive/01.jpg",
  "/homepage-photos-archive/02.jpg",
  "/homepage-photos-archive/10.jpg",
  "/homepage-photos-archive/11.jpg",
  "/homepage-photos-archive/12.jpg",
  "/homepage-photos-archive/13.jpg",
  "/homepage-photos-archive/14.jpg",
  "/homepage-photos-archive/15.jpg",
  "/homepage-photos-archive/16.jpg",
  "/homepage-photos-archive/17.jpg",
  "/homepage-photos-archive/18.jpg",
  "/homepage-photos-archive/19.jpg",
  "/homepage-photos-archive/20.jpg",
  "/homepage-photos-archive/21.jpg",
  "/homepage-photos-archive/22.jpg",
  "/homepage-photos-archive/23.jpg",
  "/homepage-photos-archive/24.jpg",
  "/homepage-photos-archive/25.png",
  "/homepage-photos-archive/26.png",
  "/homepage-photos-archive/27.png",
  "/homepage-photos-archive/28.png",
];

const HOMEPAGE_CAROUSEL_SLIDES = HOMEPAGE_PHOTO_SOURCES.map((src, index) => ({
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
      <Section className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 pt-8 pb-16 dark:from-slate-900 dark:to-slate-800 sm:pt-12 sm:pb-20 md:pt-20 md:pb-32">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-orange-400/20 rounded-full blur-3xl" />

        <div className="relative z-10 grid items-center gap-10 sm:gap-12 lg:grid-cols-2">
          <div className="min-w-0 space-y-6 sm:space-y-8">
            <Badge
              variant="secondary"
              className="mx-auto flex w-fit max-w-full whitespace-normal px-4 py-1 text-center text-xs leading-relaxed sm:mx-0 sm:text-left sm:text-sm"
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

            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Button
                size="lg"
                asChild
                className="h-12 w-full whitespace-normal rounded-full px-5 text-center text-base sm:h-14 sm:w-auto sm:whitespace-nowrap sm:px-8 sm:text-lg"
              >
                <Link href="https://www.edutindo.org/donate">
                  Start Your Journey With Us <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="h-12 w-full whitespace-normal rounded-full px-5 text-center text-base sm:h-14 sm:w-auto sm:whitespace-nowrap sm:px-8 sm:text-lg"
              >
                <Link href="/about">Learn About Us</Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 rotate-2 hover:rotate-0 transition-transform duration-500">
              <Image
                src={currentSlide.src}
                alt={currentSlide.alt}
                width={800}
                height={600}
                className="w-full h-auto object-cover"
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


          <div className="rounded-3xl bg-white/90 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-8 md:p-10">
            <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-6">OUR VISION</h3>
            <p className="text-base md:text-lg leading-relaxed text-slate-700 dark:text-slate-200">
              Transforming rural Indonesia by unlocking STEAM learning opportunities through SCHOOL partnerships that empower teachers and families to raise a skilled and impact-driven generation, rooted in CHRISTIAN values and capable of driving INNOVATION that uplifts their local communities.
            </p>
            <div className="mt-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100/70 dark:bg-slate-800/70 p-4 md:p-5">
              <p className="text-xs md:text-sm font-semibold tracking-[0.12em] uppercase text-slate-500 dark:text-slate-400">Our Approach</p>
              <p className="mt-2 text-sm md:text-base leading-relaxed italic text-slate-700 dark:text-slate-200">
                We are committed to rigorous research and continuous refinement to discover and implement the most effective interventions for advancing science education delivery to the unreached.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-none shadow-none bg-orange-500 overflow-hidden">
              <div className="relative h-44">
                <Image
                  src={HOMEPAGE_FEATURE_IMAGES[0].src}
                  alt={HOMEPAGE_FEATURE_IMAGES[0].alt}
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="p-6">
                <CardTitle className="text-3xl leading-tight text-white">
                  School offers optimum ENGAGEMENT
                </CardTitle>
              </CardContent>
            </Card>

            <Card className="border-none shadow-none bg-cyan-500 overflow-hidden">
              <div className="relative h-44">
                <Image
                  src={HOMEPAGE_FEATURE_IMAGES[1].src}
                  alt={HOMEPAGE_FEATURE_IMAGES[1].alt}
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="p-6">
                <CardTitle className="text-3xl leading-tight text-white">
                  Critical need for local INNOVATORS
                </CardTitle>
              </CardContent>
            </Card>

            <Card className="border-none shadow-none bg-yellow-400 overflow-hidden">
              <div className="relative h-44">
                <Image
                  src={HOMEPAGE_FEATURE_IMAGES[2].src}
                  alt={HOMEPAGE_FEATURE_IMAGES[2].alt}
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="p-6">
                <CardTitle className="text-3xl leading-tight text-slate-900">
                  <span className="whitespace-nowrap">Encountering Jesus brings</span>
                  <br />
                  TRANSFORMATION
                </CardTitle>
              </CardContent>
            </Card>
          </div>

          <div className="overflow-hidden rounded-[2.5rem] border border-sky-100/80 bg-white/95 shadow-[0_38px_90px_-56px_rgba(37,99,235,0.45)]">
            <Image
              src="/homepage/building-blocks-reference.png"
              alt="Edutindo building blocks framework"
              width={1680}
              height={940}
              className="h-auto w-full"
            />
          </div>
        </div>
      </Section>
    </div>

  );
}
