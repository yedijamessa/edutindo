"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Flag,
  GraduationCap,
  Handshake,
  School,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/ui/section";

const HOMEPAGE_PHOTO_SOURCES = [
  "/homepage-photos-archive/01.jpg",
  "/homepage-photos-archive/02.jpg",
  "/homepage-photos-archive/03.jpg",
  "/homepage-photos-archive/04.jpg",
  "/homepage-photos-archive/05.jpg",
  "/homepage-photos-archive/06.jpg",
  "/homepage-photos-archive/07.jpg",
  "/homepage-photos-archive/08.jpg",
  "/homepage-photos-archive/09.jpg",
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
    src: HOMEPAGE_PHOTO_SOURCES[0],
    alt: "Edutindo school partnership activity",
  },
  {
    src: HOMEPAGE_PHOTO_SOURCES[1],
    alt: "Edutindo STEAM learning activity",
  },
  {
    src: HOMEPAGE_PHOTO_SOURCES[2],
    alt: "Edutindo faith-centered learning activity",
  },
];

type BuildingBlockItem = {
  title: string;
  description: string;
  icon: LucideIcon;
  accentClassName: string;
  iconClassName: string;
  connectorClassName: string;
  connectorDirection: "up" | "straight" | "down";
};

const BUILDING_BLOCK_PILLARS = [
  {
    number: "1",
    emphasis: "Breaking Barriers",
    suffix: "in Rural Education",
    accentClassName: "from-blue-600 to-sky-500",
    borderClassName: "border-sky-200/90",
  },
  {
    number: "2",
    emphasis: "Building the Future",
    suffix: "for The Next Generation",
    accentClassName: "from-sky-500 to-cyan-400",
    borderClassName: "border-cyan-200/90",
  },
] as const;

const BUILDING_BLOCKS = {
  left: [
    {
      title: "Partnership Model",
      description: "Build trust, grow local capacity, and collaborate with local communities.",
      icon: Handshake,
      accentClassName: "from-blue-600 to-sky-400",
      iconClassName: "text-blue-600",
      connectorClassName: "bg-sky-300",
      connectorDirection: "down",
    },
    {
      title: "Empowering Teachers",
      description: "Technology support, skills training, and improved living standards for educators.",
      icon: School,
      accentClassName: "from-blue-700 to-blue-500",
      iconClassName: "text-blue-600",
      connectorClassName: "bg-sky-300",
      connectorDirection: "straight",
    },
    {
      title: "Accessible Resources",
      description: "Affordable fees, personalized modules, and hybrid learning infrastructure.",
      icon: BookOpen,
      accentClassName: "from-cyan-500 to-teal-400",
      iconClassName: "text-cyan-600",
      connectorClassName: "bg-cyan-300",
      connectorDirection: "up",
    },
  ],
  right: [
    {
      title: "Curriculum 4.0",
      description: "National curriculum, international references, and practical STEAM projects.",
      icon: GraduationCap,
      accentClassName: "from-cyan-400 to-teal-400",
      iconClassName: "text-cyan-600",
      connectorClassName: "bg-cyan-300",
      connectorDirection: "down",
    },
    {
      title: "Real World Experience",
      description: "Relevant projects, experienced mentors, and career exploration exposure.",
      icon: UsersRound,
      accentClassName: "from-sky-500 to-blue-500",
      iconClassName: "text-blue-500",
      connectorClassName: "bg-sky-300",
      connectorDirection: "straight",
    },
    {
      title: "Transformative Character",
      description: "Encounter Christ, grow innovative leadership, and build an impact mindset.",
      icon: Flag,
      accentClassName: "from-cyan-500 to-teal-400",
      iconClassName: "text-cyan-600",
      connectorClassName: "bg-cyan-300",
      connectorDirection: "up",
    },
  ],
} satisfies { left: BuildingBlockItem[]; right: BuildingBlockItem[] };

function BuildingBlockPill({
  number,
  emphasis,
  suffix,
  accentClassName,
  borderClassName,
}: {
  number: string;
  emphasis: string;
  suffix: string;
  accentClassName: string;
  borderClassName: string;
}) {
  return (
    <div
      className={`flex items-center gap-4 rounded-full border bg-white/92 px-5 py-4 shadow-[0_22px_50px_-38px_rgba(37,99,235,0.55)] backdrop-blur-sm ${borderClassName}`}
    >
      <span
        className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xl font-black text-white shadow-[0_12px_26px_-14px_rgba(37,99,235,0.95)] ${accentClassName}`}
      >
        {number}.
      </span>
      <p className="text-lg leading-snug text-[#18356d] md:text-[1.75rem]">
        <span className="font-black">{emphasis}</span>{" "}
        <span className="font-medium text-[#26498d]">{suffix}</span>
      </p>
    </div>
  );
}

function BuildingBlockConnector({
  side,
  direction,
  connectorClassName,
}: {
  side: "left" | "right";
  direction: "up" | "straight" | "down";
  connectorClassName: string;
}) {
  const isLeft = side === "left";
  const tiltClassName =
    direction === "up"
      ? isLeft
        ? "-rotate-[32deg]"
        : "rotate-[32deg]"
      : direction === "down"
        ? isLeft
          ? "rotate-[32deg]"
          : "-rotate-[32deg]"
        : "";

  return (
    <div
      className={`pointer-events-none absolute top-1/2 hidden -translate-y-1/2 lg:block ${
        isLeft ? "right-[-102px]" : "left-[-102px]"
      }`}
    >
      <span className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-4 border-white shadow-sm ${connectorClassName} ${isLeft ? "left-0" : "right-0"}`} />
      <span className={`absolute top-1/2 h-[2px] w-16 -translate-y-1/2 ${connectorClassName} ${isLeft ? "left-3" : "right-3"}`} />
      <span
        className={`absolute top-1/2 h-[2px] w-14 origin-center ${connectorClassName} ${tiltClassName} ${
          isLeft ? "left-[4.5rem]" : "right-[4.5rem]"
        } ${direction === "straight" ? "-translate-y-1/2" : isLeft ? "-translate-y-[0.65rem]" : "-translate-y-[0.65rem]"}`}
      />
    </div>
  );
}

function BuildingBlockCard({
  item,
  side,
}: {
  item: BuildingBlockItem;
  side: "left" | "right";
}) {
  const Icon = item.icon;
  const accentEdgePosition = side === "left" ? "left-0" : "right-0";

  return (
    <Card className="relative overflow-visible rounded-[2rem] border border-sky-100/90 bg-white/95 shadow-[0_34px_70px_-44px_rgba(15,23,42,0.42)] backdrop-blur-sm">
      <span className={`absolute inset-y-0 ${accentEdgePosition} w-[7px] rounded-full bg-gradient-to-b ${item.accentClassName}`} />
      <CardContent className="grid gap-5 px-6 py-7 sm:grid-cols-[104px_1px_1fr] sm:items-center sm:px-7">
        <div className="flex justify-center sm:justify-start">
          <div className="flex h-24 w-24 items-center justify-center rounded-full border border-sky-100 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.98),rgba(224,242,254,0.96))] shadow-[0_18px_34px_-24px_rgba(37,99,235,0.6)]">
            <Icon className={`h-11 w-11 ${item.iconClassName}`} strokeWidth={1.8} />
          </div>
        </div>
        <div className="hidden h-full w-px bg-gradient-to-b from-transparent via-sky-200 to-transparent sm:block" />
        <div className="text-center sm:text-left">
          <p className="text-3xl font-black leading-[0.95] tracking-tight text-[#10255c] md:text-[3rem]">
            {item.title}
          </p>
          <p className="mt-4 text-base leading-relaxed text-slate-600 md:text-[1.15rem]">
            {item.description}
          </p>
        </div>
      </CardContent>
      <BuildingBlockConnector
        side={side}
        direction={item.connectorDirection}
        connectorClassName={item.connectorClassName}
      />
    </Card>
  );
}

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
      <Section className="pt-8 sm:pt-12 md:pt-20 pb-20 md:pb-32 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 overflow-hidden relative">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-orange-400/20 rounded-full blur-3xl" />

        <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-6 sm:space-y-8">
            <Badge variant="secondary" className="px-4 py-1 text-sm">
              EDUKASI TERANG INDONESIA (EDUTINDO) FOUNDATION
            </Badge>

            <h1 className="text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.08] text-foreground">
              Breaking Barriers <br />
              <span className="inline-block whitespace-nowrap pb-[0.08em] bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
                Building The Future
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
              A Christian STEAM education initiative for Indonesia&apos;s next generation of servant-hearted innovators
            </p>

            <div className="flex flex-nowrap gap-2 sm:gap-4">
              <Button size="lg" asChild className="rounded-full text-sm sm:text-lg h-11 sm:h-14 px-4 sm:px-8 whitespace-nowrap">
                <Link href="https://www.edutindo.org/donate">
                  Start Your Journey With Us <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="rounded-full text-sm sm:text-lg h-11 sm:h-14 px-4 sm:px-8 whitespace-nowrap">
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

          <div className="rounded-[2.5rem] border border-sky-100/80 bg-[radial-gradient(circle_at_top,_rgba(191,219,254,0.35),_transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.96))] p-8 shadow-[0_38px_90px_-56px_rgba(37,99,235,0.45)] md:p-10 lg:p-14">
            <div className="text-center">
              <h3 className="text-4xl font-black tracking-tight text-[#10255c] md:text-6xl">
                OUR BUILDING BLOCKS
              </h3>
              <div className="mt-5 flex items-center justify-center gap-4">
                <span className="h-[2px] w-24 rounded-full bg-gradient-to-r from-transparent via-blue-500 to-blue-500" />
                <span className="h-4 w-4 rounded-full bg-blue-500 shadow-[0_0_0_10px_rgba(59,130,246,0.1)]" />
                <span className="h-[2px] w-24 rounded-full bg-gradient-to-l from-transparent via-blue-500 to-blue-500" />
              </div>
            </div>

            <div className="mt-10 grid gap-4 lg:hidden">
              {BUILDING_BLOCK_PILLARS.map((pillar) => (
                <BuildingBlockPill
                  key={pillar.number}
                  number={pillar.number}
                  emphasis={pillar.emphasis}
                  suffix={pillar.suffix}
                  accentClassName={pillar.accentClassName}
                  borderClassName={pillar.borderClassName}
                />
              ))}
            </div>

            <div className="mt-10 flex justify-center lg:hidden">
              <div className="relative flex h-56 w-56 items-center justify-center">
                <div className="absolute inset-[-22px] rounded-full border border-dashed border-sky-200/70" />
                <div className="absolute inset-[-10px] rounded-full bg-sky-400/10 blur-2xl" />
                <div className="relative flex h-full w-full items-center justify-center rounded-full border-[8px] border-white bg-gradient-to-br from-sky-400 via-blue-500 to-blue-700 text-center shadow-[0_30px_70px_-28px_rgba(37,99,235,0.65)]">
                  <p className="text-[1.7rem] font-black leading-[1.05] tracking-tight text-white">
                    EDUTINDO
                    <br />
                    CHRISTIAN
                    <br />
                    STEAM
                    <br />
                    SCHOOL
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 grid gap-5 lg:hidden">
              {BUILDING_BLOCKS.left.map((item) => (
                <BuildingBlockCard key={`mobile-left-${item.title}`} item={item} side="left" />
              ))}
              {BUILDING_BLOCKS.right.map((item) => (
                <BuildingBlockCard key={`mobile-right-${item.title}`} item={item} side="right" />
              ))}
            </div>

            <div className="relative mt-12 hidden lg:block">
              <div className="grid grid-cols-[minmax(0,1fr)_320px_minmax(0,1fr)] gap-x-8 gap-y-10">
                <div className="pr-8">
                  <BuildingBlockPill
                    number={BUILDING_BLOCK_PILLARS[0].number}
                    emphasis={BUILDING_BLOCK_PILLARS[0].emphasis}
                    suffix={BUILDING_BLOCK_PILLARS[0].suffix}
                    accentClassName={BUILDING_BLOCK_PILLARS[0].accentClassName}
                    borderClassName={BUILDING_BLOCK_PILLARS[0].borderClassName}
                  />
                </div>
                <div />
                <div className="pl-8">
                  <BuildingBlockPill
                    number={BUILDING_BLOCK_PILLARS[1].number}
                    emphasis={BUILDING_BLOCK_PILLARS[1].emphasis}
                    suffix={BUILDING_BLOCK_PILLARS[1].suffix}
                    accentClassName={BUILDING_BLOCK_PILLARS[1].accentClassName}
                    borderClassName={BUILDING_BLOCK_PILLARS[1].borderClassName}
                  />
                </div>

                <div className="pr-8">
                  <BuildingBlockCard item={BUILDING_BLOCKS.left[0]} side="left" />
                </div>
                <div className="row-span-3 flex items-center justify-center">
                  <div className="relative flex h-[288px] w-[288px] items-center justify-center">
                    <div className="absolute inset-[-42px] rounded-full border border-dashed border-sky-200/80" />
                    <div className="absolute inset-[-20px] rounded-full border border-white/80 shadow-[0_0_0_1px_rgba(191,219,254,0.7)]" />
                    <div className="absolute inset-[-20px] rounded-full bg-sky-400/10 blur-3xl" />
                    <div className="relative flex h-full w-full items-center justify-center rounded-full border-[8px] border-white bg-gradient-to-br from-sky-400 via-blue-500 to-blue-700 text-center shadow-[0_36px_80px_-30px_rgba(37,99,235,0.7)]">
                      <p className="text-[2.15rem] font-black leading-[1.02] tracking-tight text-white">
                        EDUTINDO
                        <br />
                        CHRISTIAN
                        <br />
                        STEAM
                        <br />
                        SCHOOL
                      </p>
                    </div>
                  </div>
                </div>
                <div className="pl-8">
                  <BuildingBlockCard item={BUILDING_BLOCKS.right[0]} side="right" />
                </div>

                <div className="pr-8">
                  <BuildingBlockCard item={BUILDING_BLOCKS.left[1]} side="left" />
                </div>
                <div className="pl-8">
                  <BuildingBlockCard item={BUILDING_BLOCKS.right[1]} side="right" />
                </div>

                <div className="pr-8">
                  <BuildingBlockCard item={BUILDING_BLOCKS.left[2]} side="left" />
                </div>
                <div className="pl-8">
                  <BuildingBlockCard item={BUILDING_BLOCKS.right[2]} side="right" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </div>

  );
}
