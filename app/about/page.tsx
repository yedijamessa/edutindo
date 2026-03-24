"use client";

import { useState } from "react";
import Image from "next/image";
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

      <Section className="bg-white/90 dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              VALUES BEHIND THE LOGO
            </h2>
            <p className="mt-4 text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              Every part of the Edutindo logo reflects the values we carry in our mission: breaking barriers,
              building the future, and forming servant-hearted innovators rooted in Christian character.
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border border-orange-200 bg-orange-50/70 dark:bg-orange-900/20">
              <CardContent className="p-6">
                <div className="h-2.5 w-16 rounded-full bg-orange-500 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Breaking Barriers</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  We step into difficult contexts so students in underserved regions can access meaningful education.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-cyan-200 bg-cyan-50/70 dark:bg-cyan-900/20">
              <CardContent className="p-6">
                <div className="h-2.5 w-16 rounded-full bg-cyan-500 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Building The Future</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  We prepare learners with STEAM thinking, practical skills, and integrity for long-term community impact.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-blue-200 bg-blue-50/70 dark:bg-blue-900/20">
              <CardContent className="p-6">
                <div className="h-2.5 w-16 rounded-full bg-blue-500 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Christ-Centered Formation</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  Character formation and service-minded leadership remain central to how we teach and build partnerships.
                </p>
              </CardContent>
            </Card>

            <Card className="border border-indigo-200 bg-indigo-50/70 dark:bg-indigo-900/20">
              <CardContent className="p-6">
                <div className="h-2.5 w-16 rounded-full bg-indigo-500 mb-4" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Collaborative Impact</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  We work with teachers, families, and partners so transformation is shared, sustainable, and measurable.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </Section>

      <Section className="bg-slate-50 dark:bg-slate-900/40 border-t border-slate-200/80 dark:border-slate-800">
        <div className="max-w-6xl mx-auto space-y-8">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
            Our Vision
          </h2>

          <div className="flex justify-center">
            <Image
              src="/logo-edutindo.png"
              alt="Edutindo lantern logo"
              width={240}
              height={360}
              className="h-auto w-40 sm:w-48 md:w-56"
            />
          </div>

          <div className="border-l-2 border-sky-300 pl-6 md:pl-7 space-y-4">
            <p className="text-2xl leading-relaxed text-slate-700 dark:text-slate-200">
              Transforming rural Indonesia by unlocking <span className="font-bold">STEAM</span> learning opportunities
              through <span className="font-bold">SCHOOL</span> partnerships that empower teachers and families to raise
              a skilled and impact-driven generation, rooted in <span className="font-bold">CHRISTIAN</span> values and
              capable of driving{" "}
              <span className="font-bold underline decoration-slate-500 underline-offset-4">INNOVATION</span> that
              uplifts their local communities.
            </p>
            <p className="text-2xl leading-relaxed text-slate-700 dark:text-slate-200">
              We are committed to rigorous <span className="font-bold">RESEARCH</span> and continuous{" "}
              <span className="font-bold">REFINEMENT</span> to discover and implement the most effective interventions
              for advancing science education delivery to the unreached.
            </p>
          </div>
        </div>
      </Section>
    </div>
  );
}
