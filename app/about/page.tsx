"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
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
    role: "Advisory - Chair",
    name: "U Siahaan",
    imageSrc: "/founders/ulbrits.jpeg",
    imageAlt: "U Siahaan",
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
    lines: [
      "PhD in Human Resources Management and Services, Satya Wacana Christian University",
      "Director of Professional Business Center FBE Atma Jaya University - Yogyakarta",
      "Certified Trainer for Teachers Professional Development",
      "Author",
    ],
  },
  {
    role: "Supervisor - Chair",
    name: "A Martarina",
    imageSrc: "/founders/agustin.jpg",
    imageAlt: "A Martarina",
    lines: [
      "MSc in Accounting, University of Indonesia",
      "Local Curriculum Expert",
      "School Rating Examiner from Central Government",
      "Regional Edu-NGO Coordinator",
    ],
  },
  {
    role: "President/Chair",
    name: "Dr S C Nabilla",
    imageSrc: "/founders/sasza.jpeg",
    imageAlt: "Dr S C Nabilla",
    lines: [
      "DPhil in Material Science, University of Oxford",
      "Research Associate & Tutor at Imperial College London",
      "UK STEAM Ambassador",
    ],
  },
  {
    role: "Treasurer",
    name: "Y M S Pramudito",
    imageSrc: "/founders/messa.jpeg",
    imageAlt: "Y M S Pramudito",
    lines: [
      "MSc in Data Science, University of Manchester",
      "MBA Candidate",
      "Teaching Experience",
      "Banking/Financial Services Background",
    ],
  },
  {
    role: "Secretary",
    name: "A Aribowo",
    imageSrc: "/founders/andre.jpeg",
    imageAlt: "A Aribowo",
    lines: [
      "MSc in Local Economic Development, LSE",
      "CIMA Qualified",
      "CAIA Candidate",
      "Endowment / Corp Finance Background",
    ],
  },
];

function FounderDetail({
  founder,
}: {
  founder: Founder;
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
            </div>
          </div>

          <div className="p-8 md:p-10 lg:p-12">
            <h3 translate="no" className="notranslate text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
              {name}
            </h3>
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


      {/* Founders */}
      <Section className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(14,116,144,0.10),_transparent_48%),linear-gradient(to_bottom,_#f8fbff,_#f1f5f9)] dark:bg-slate-900">
        <div className="pointer-events-none absolute -left-24 top-28 h-72 w-72 rounded-full bg-cyan-200/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 bottom-20 h-72 w-72 rounded-full bg-blue-200/30 blur-3xl" />

        <div className="relative text-center max-w-3xl mx-auto mb-12">
          <p className="inline-flex rounded-full border border-sky-200 bg-white/90 px-4 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-sky-700 shadow-sm">
            Serving Team
          </p>
          <h2 className="mt-4 text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900">The Serving Team</h2>
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
                    <p
                      translate="no"
                      className={cn(
                        "notranslate text-base font-semibold leading-tight truncate",
                        isActive ? "text-sky-700" : "text-slate-900"
                      )}
                    >
                      {f.name}
                    </p>
                  </div>

                </div>
              </button>
            );
          })}
        </div>

        <div className="max-w-5xl mx-auto">
          <FounderDetail founder={activeFounder} />
        </div>
      </Section>

    </div>
  );
}
