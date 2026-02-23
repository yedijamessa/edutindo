"use client";

import { useState } from "react";
import Image from "next/image";
import { Users, Globe, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/ui/section";
import { cn } from "@/components/ui/button";

type Founder = {
  role: string;
  name: string;
  imageSrc: string;
  imageAlt: string;
  lines: string[];
};

const FOUNDERS: Founder[] = [
  {
    role: "Trustee",
    name: "U Siahaan",
    imageSrc: "/founders/ulbrits.jpeg",
    imageAlt: "U Siahaan",
    lines: [
      "Non-denominational evangelist and member of the Human Resources & Systems Commission at the Indonesian Bible Society (LAI).",
      "Independent business advisor and ex-COO of a leading national logistics startup (30+ years of experience).",
      "Serves as trustee in several educational foundations.",
      "BSc in Computer Engineering from ITB Polytechnic and BSc in Theology from Doulos Theological Seminary.",
    ],
  },
  {
    role: "Trustee",
    name: "Dr Pramudianto, PCC",
    imageSrc: "/founders/pram.jpeg",
    imageAlt: "Dr Pramudianto",
    lines: [
      "Chairman of the Business Development and Economics Centre at Atma Jaya Yogyakarta Catholic University and lecturer at leading Christian universities (15+ years of teaching).",
      "Founder of a human development consultancy serving corporate clients and education institutions; ex-CHRO of a national workforce sourcing company (20+ years of experience).",
      "Author of 17 books on leadership, character-building, and Christian values.",
      "PhD in Management Science from Satya Wacana Christian University.",
    ],
  },
  {
    role: "Supervisor",
    name: "A Martarina",
    imageSrc: "/founders/agustin.jpg",
    imageAlt: "A Martarina",
    lines: [
      "Education Quality Assurance and Development Specialist (Widyapradja) at the Education Quality Assurance Agency of East Nusa Tenggara (20+ years of experience).",
      "Regional NGO coordinator for education and community work in East Nusa Tenggara.",
      "Master of Accounting from the University of Indonesia.",
    ],
  },
  {
    role: "Executive – President",
    name: "Dr S C Nabilla",
    imageSrc: "/founders/sasza.jpeg",
    imageAlt: "Dr S C Nabilla",
    lines: [
      "Research associate at Imperial College London.",
      "DPhil in Materials Science from the University of Oxford.",
      "Active UK STEAM ambassador connecting science and education.",
    ],
  },
  {
    role: "Executive – Treasurer",
    name: "Y M S Pramudito",
    imageSrc: "/founders/messa.jpeg",
    imageAlt: "Y M S Pramudito",
    lines: [
      "MSc in Data Science from the University of Manchester.",
      "Regional lead of Indonesian church diaspora in the UK.",
      "MBA candidate with a focus on education and social impact.",
    ],
  },
  {
    role: "Executive – Secretary",
    name: "A Aribowo, CGMA",
    imageSrc: "/founders/andre.jpeg",
    imageAlt: "A Aribowo",
    lines: [
      "Endowment accountant at a college within the University of Oxford; ex-Corporate Finance manager at an infrastructure private equity firm.",
      "MSc in Local Economic Development from the London School of Economics.",
      "Chartered Global Management Accountant (CGMA) and CAIA candidate.",
    ],
  },
];

function FounderDetail({
  founder,
  activeIndex,
}: {
  founder: Founder;
  activeIndex: number;
}) {
  const { role, name, imageSrc, imageAlt, lines } = founder;
  return (
    <Card className="overflow-hidden border border-sky-100/80 bg-white/90 shadow-[0_24px_70px_-38px_rgba(15,23,42,0.45)] backdrop-blur-sm">
      <CardContent className="p-0">
        <div className="grid md:grid-cols-[280px_1fr]">
          <div className="relative isolate overflow-hidden bg-gradient-to-b from-sky-50 via-blue-50 to-white p-8 md:p-10">
            <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-sky-200/50 blur-2xl" />
            <div className="pointer-events-none absolute -left-14 bottom-0 h-40 w-40 rounded-full bg-blue-100/80 blur-2xl" />

            <div className="relative mx-auto w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white shadow-xl ring-2 ring-sky-100">
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                className="object-cover"
              />
            </div>

            <div className="relative mt-6 text-center">
              <p className="inline-flex rounded-full border border-sky-200 bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-sky-700">
                {role}
              </p>
              <p className="mt-3 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                Member {activeIndex + 1} of {FOUNDERS.length}
              </p>
            </div>
          </div>

          <div className="p-8 md:p-10 lg:p-12">
            <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">{name}</h3>
            <div className="mt-7 space-y-4">
              {lines.map((l, idx) => (
                <p key={idx} className="relative pl-6 text-base leading-relaxed text-slate-600">
                  <span className="absolute left-0 top-[0.62rem] h-2 w-2 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 shadow-[0_0_0_3px_rgba(14,165,233,0.15)]" />
                  {l}
                </p>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AboutPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeFounder = FOUNDERS[activeIndex];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Vision / Intro */}
      <Section className="pb-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200">
              About Edukasi Terang Indonesia
            </Badge>

            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Shaping a generation of <br />
              <span className="text-blue-600">bright Indonesian learners</span>
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed">
              Edukasi Terang Indonesia exists to guide students to become <strong>faith-driven, innovative, and resilient</strong> learners. We want them to master STEAM knowledge, think critically and creatively, collaborate with others, and live out <strong>Christian values</strong> in every area of life.
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600 p-6 rounded-r-xl">
              <p className="text-foreground italic">
                "Our vision is to see Indonesian learners who combine <strong>academic excellence</strong> in STEAM, <strong>creative problem-solving</strong>, and <strong>Christ-like character</strong>."
              </p>
            </div>
          </div>

          <div className="relative">
            <Card className="border-none shadow-2xl rotate-1 hover:rotate-0 transition-transform duration-500">
              <CardContent className="p-4">
                <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-100">
                  <Image
                    src="/homepage/eti-about-team.png"
                    alt="Edukasi Terang Indonesia team"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2 text-blue-600">
                      <Users className="w-5 h-5" />
                      <span className="font-bold">6+ Leaders</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Across ministry, education, and business</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2 text-green-600">
                      <Globe className="w-5 h-5" />
                      <span className="font-bold">3 Continents</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Experience in Indonesia, UK, and beyond</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Section>

      {/* Founders */}
      <Section className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(14,116,144,0.10),_transparent_48%),linear-gradient(to_bottom,_#f8fbff,_#f1f5f9)] dark:bg-slate-900">
        <div className="pointer-events-none absolute -left-24 top-28 h-72 w-72 rounded-full bg-cyan-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-20 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />

        <div className="relative text-center max-w-3xl mx-auto mb-12">
          <p className="inline-flex rounded-full border border-sky-200 bg-white/90 px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-sky-700 shadow-sm">
            Leadership Team
          </p>
          <h2 className="mt-4 text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900">The Team Behind the Vision</h2>
          <p className="mt-4 text-lg text-slate-600">
            Meet the trustees and executives who steward the vision and values of Edukasi Terang Indonesia.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 mb-12">
          {FOUNDERS.map((f, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={f.name}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300",
                  isActive
                    ? "-translate-y-0.5 border-sky-300 bg-white shadow-[0_16px_40px_-30px_rgba(14,116,144,0.95)]"
                    : "border-slate-200/80 bg-white/85 hover:-translate-y-0.5 hover:border-sky-200 hover:bg-white"
                )}
              >
                <span
                  className={cn(
                    "absolute inset-x-0 top-0 h-1 transition-all duration-300",
                    isActive ? "bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600" : "bg-slate-100 group-hover:bg-sky-100"
                  )}
                />

                <div className="relative flex items-center gap-3">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full overflow-hidden relative bg-slate-200 ring-2 transition-all duration-300",
                      isActive ? "ring-sky-200" : "ring-white group-hover:ring-sky-100"
                    )}
                  >
                    <Image src={f.imageSrc} alt={f.name} fill className="object-cover" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 leading-none mb-1">
                      {f.role}
                    </p>
                    <p className={cn("text-base font-semibold leading-tight truncate", isActive ? "text-sky-700" : "text-slate-900")}>
                      {f.name}
                    </p>
                  </div>

                  <span
                    className={cn(
                      "ml-auto inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      isActive ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-500"
                    )}
                  >
                    {index + 1}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="max-w-5xl mx-auto">
          <FounderDetail founder={activeFounder} activeIndex={activeIndex} />
        </div>
      </Section>
    </div>
  );
}
