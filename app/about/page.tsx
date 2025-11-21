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

function FounderDetail({ founder }: { founder: Founder }) {
  const { role, name, imageSrc, imageAlt, lines } = founder;
  return (
    <Card className="overflow-hidden border-none shadow-xl bg-white/50 backdrop-blur-sm">
      <CardContent className="p-8 md:p-12">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="shrink-0">
            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-lg">
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div className="space-y-4 flex-1">
            <div>
              <p className="text-sm font-bold tracking-wider text-muted-foreground uppercase mb-1">{role}</p>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground">{name}</h3>
            </div>
            <div className="space-y-2 text-muted-foreground leading-relaxed">
              {lines.map((l, idx) => (
                <p key={idx}>{l}</p>
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
      <Section className="bg-white dark:bg-slate-900">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-4">The Team Behind the Vision</h2>
          <p className="text-muted-foreground">
            Meet the trustees and executives who steward the vision and values of Edukasi Terang Indonesia.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {FOUNDERS.map((f, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={f.name}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2 rounded-full border transition-all duration-200",
                  isActive
                    ? "bg-blue-50 border-blue-200 shadow-md scale-105"
                    : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                )}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden relative bg-slate-200">
                  <Image src={f.imageSrc} alt={f.name} fill className="object-cover" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold uppercase text-muted-foreground leading-none mb-0.5">{f.role}</p>
                  <p className={cn("text-sm font-semibold leading-none", isActive ? "text-blue-700" : "text-foreground")}>{f.name}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="max-w-4xl mx-auto">
          <FounderDetail founder={activeFounder} />
        </div>
      </Section>
    </div>
  );
}
