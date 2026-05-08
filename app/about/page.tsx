"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, CheckCircle2, Heart } from "lucide-react";
import { Section } from "@/components/ui/section";
import { cn } from "@/components/ui/button";

type Founder = {
  role: string;
  name: string;
  imageSrc?: string;
  imageAlt: string;
  imagePosition?: string;
  imageScale?: number;
  lines: string[];
};

const FOUNDERS: Founder[] = [
  {
    role: "Advisory - Chair",
    name: "Ulbrits Siahaan",
    imageSrc: "/founders/ulbrits.jpeg",
    imageAlt: "Ulbrits Siahaan",
    imagePosition: "center 62%",
    lines: [
      "BSc in Computer Science, Bandung Institute of Technology + Bachelor in Theology, Doulos Theological Seminary Jakarta",
      "Non-denominational Evangelist",
      "Independent Business Advisor",
      "COO / VP in Logistics Background",
    ],
  },
  {
    role: "Advisory",
    name: "Dr Pramudianto",
    imageSrc: "/founders/pram.jpeg",
    imageAlt: "Dr Pramudianto",
    imagePosition: "center -30%",
    imageScale: 1.9,
    lines: [
      "PhD in Human Resources Management and Services, Satya Wacana Christian University",
      "Director of Professional Business Center FBE Atma Jaya University - Yogyakarta",
      "Certified Trainer for Teachers Professional Development",
      "Author",
    ],
  },
  {
    role: "Supervisory - Chair",
    name: "Agustin Martarina",
    imageSrc: "/founders/agustin.jpg",
    imageAlt: "Agustin Martarina",
    lines: [
      "MSc in Accounting, University of Indonesia",
      "Local Curriculum Expert",
      "School Rating Examiner from Central Government",
      "Regional Edu-NGO Coordinator",
    ],
  },
  {
    role: "President/Chair",
    name: "Dr Sasza Chyntara Nabilla",
    imageSrc: "/founders/sasza.jpeg",
    imageAlt: "Dr Sasza Chyntara Nabilla",
    lines: [
      "DPhil in Material Science, University of Oxford",
      "Research Associate & Tutor at Imperial College London",
      "UK STEAM Ambassador",
    ],
  },
  {
    role: "Treasurer",
    name: "Yedija Messa",
    imageSrc: "/founders/messa.jpeg",
    imageAlt: "Yedija Messa",
    lines: [
      "MSc in Data Science, University of Manchester",
      "MBA Candidate",
      "Teaching Experience",
      "Banking/Financial Services Background",
    ],
  },
  {
    role: "Secretary",
    name: "Andre Aribowo",
    imageSrc: "/founders/andre.jpeg",
    imageAlt: "Andre Aribowo",
    lines: [
      "MSc in Local Economic Development, LSE",
      "CIMA Qualified",
      "CAIA Candidate",
      "Endowment / Corp Finance Background",
    ],
  },
  {
    role: "Curriculum",
    name: "Vanessa Caitlin",
    imageSrc: "/founders/vanessa-caitlin.jpeg",
    imageAlt: "Vanessa Caitlin",
    lines: [
      "MA in International Education, University of Manchester (Candidate)",
      "English Language Learner (ELL) Teacher for IB Primary Years Programme",
      "IB & TES Certified",
      "Private Tutor (English)",
    ],
  },
];

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);
}

function getFounderCardSpanClassName(index: number) {
  if (index < 3) return "lg:col-span-4";
  return "lg:col-span-3";
}

function FounderAvatar({
  founder,
  className,
}: {
  founder: Founder;
  className?: string;
}) {
  const { imageSrc, imageAlt, imagePosition, imageScale, name } = founder;
  const [imageFailed, setImageFailed] = useState(false);
  const resolvedImageSrc = imageFailed ? undefined : imageSrc;

  return (
    <div className={cn("relative overflow-hidden rounded-full", className)}>
      {resolvedImageSrc ? (
        <Image
          src={resolvedImageSrc}
          alt={imageAlt}
          fill
          className="object-cover"
          onError={() => setImageFailed(true)}
          style={{
            objectPosition: imagePosition ?? "center",
            transform: `scale(${imageScale ?? 1})`,
          }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-cyan-500 via-sky-500 to-blue-600 text-xl font-bold text-white">
          {getInitials(name)}
        </div>
      )}
    </div>
  );
}

function FounderDetail({ founder }: { founder: Founder }) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-sky-100/80 bg-white/95 shadow-[0_34px_90px_-54px_rgba(15,23,42,0.45)] backdrop-blur-sm">
      <div className="grid lg:grid-cols-[430px_1fr]">
        <div className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(191,219,254,0.55),_transparent_34%),linear-gradient(180deg,#eef6ff,#ffffff)] px-8 py-10 sm:px-10 sm:py-12">
          <div className="absolute left-6 top-6 grid grid-cols-5 gap-2 opacity-70">
            {Array.from({ length: 20 }).map((_, index) => (
              <span key={index} className="h-1.5 w-1.5 rounded-full bg-sky-200" />
            ))}
          </div>

          <div className="relative mx-auto flex max-w-[240px] flex-col items-center">
            <div className="relative h-52 w-52 overflow-hidden rounded-full border-4 border-white shadow-[0_22px_48px_-24px_rgba(30,64,175,0.45)] ring-1 ring-sky-100">
              <FounderAvatar founder={founder} className="h-full w-full" />
            </div>

            <p className="mt-6 inline-flex rounded-full border border-sky-200 bg-white/95 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-sky-700 shadow-sm">
              {founder.role}
            </p>
          </div>
        </div>

        <div className="px-8 py-10 sm:px-10 sm:py-12">
          <h2
            translate="no"
            className="notranslate font-serif text-4xl font-semibold tracking-tight text-[#122454] md:text-5xl"
          >
            {founder.name}
          </h2>

          <div className="mt-8 space-y-5">
            {founder.lines.map((line) => (
              <div key={line} className="flex items-start gap-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                <p className="text-base leading-relaxed text-slate-600">{line}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AboutPage() {
  const [activeIndex, setActiveIndex] = useState(FOUNDERS.length - 1);
  const activeFounder = FOUNDERS[activeIndex];

  return (
    <div className="min-h-screen overflow-hidden bg-[#f7fbff]">
      <Section className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(191,219,254,0.32),_transparent_34%),linear-gradient(180deg,#f8fbff_0%,#eef5ff_100%)]">
        <div className="pointer-events-none absolute -left-24 top-0 h-[420px] w-[420px] rounded-full border border-white/60 bg-white/35 blur-[1px]" />
        <div className="pointer-events-none absolute right-[-140px] top-16 h-[520px] w-[520px] rounded-full bg-blue-100/40 blur-3xl" />
        <div className="pointer-events-none absolute left-[-120px] bottom-0 h-[420px] w-[420px] rounded-full bg-sky-100/50 blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          <div className="mx-auto max-w-4xl text-center">
            <p className="inline-flex rounded-full border border-sky-200 bg-white/90 px-5 py-1.5 text-xs font-bold uppercase tracking-[0.26em] text-blue-600 shadow-sm">
              Serving Team
            </p>
            <h1 className="mt-6 font-serif text-5xl font-semibold tracking-tight text-[#122454] md:text-7xl">
              The Serving Team
            </h1>

            <div className="mt-5 flex items-center justify-center gap-3 text-blue-500">
              <span className="h-[2px] w-24 rounded-full bg-gradient-to-r from-transparent via-blue-500 to-blue-500" />
              <Heart className="h-5 w-5" strokeWidth={1.8} />
              <span className="h-[2px] w-24 rounded-full bg-gradient-to-l from-transparent via-blue-500 to-blue-500" />
            </div>

            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
              Dedicated professionals and educators serving with heart and purpose.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-12">
            {FOUNDERS.map((founder, index) => {
              const isActive = index === activeIndex;

              return (
                <button
                  key={founder.name}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "group relative rounded-[1.75rem] border bg-white/95 px-6 py-5 text-center shadow-[0_22px_60px_-42px_rgba(15,23,42,0.38)] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300",
                    getFounderCardSpanClassName(index),
                    isActive
                      ? "border-blue-400 shadow-[0_28px_70px_-42px_rgba(37,99,235,0.45)]"
                      : "border-sky-100/80 hover:-translate-y-0.5 hover:border-sky-200 hover:bg-white"
                  )}
                >
                  {isActive ? (
                    <span className="absolute right-4 top-4 inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white shadow-[0_10px_20px_-12px_rgba(37,99,235,0.8)]">
                      <Check className="h-4 w-4" strokeWidth={3} />
                    </span>
                  ) : null}

                  <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-full border border-slate-200 shadow-[0_12px_30px_-22px_rgba(15,23,42,0.35)]">
                    <FounderAvatar founder={founder} className="h-full w-full" />
                  </div>

                  <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.28em] text-slate-500">
                    {founder.role}
                  </p>
                  <h2
                    translate="no"
                    className="notranslate mt-2 font-serif text-[1.15rem] font-semibold leading-tight text-[#122454] md:text-[1.35rem]"
                  >
                    {founder.name}
                  </h2>
                  <span className={cn("mx-auto mt-4 block h-[2px] w-7 rounded-full", isActive ? "bg-blue-500" : "bg-blue-300")} />
                </button>
              );
            })}
          </div>

          <div className="mt-7">
            <FounderDetail founder={activeFounder} />
          </div>
        </div>
      </Section>
    </div>
  );
}
