"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, GraduationCap, Lightbulb, Users, Globe, School, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/ui/section";

export default function HomePage() {
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

            <h1 className="text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-foreground">
              Breaking Barriers, <br />
              <span className="inline-block whitespace-nowrap bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
                Building The Future
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
              A Christian STEAM education initiative for Indonesia&apos;s next generation of innovators, leaders, and servant-hearted citizens.
            </p>

            <div className="flex flex-nowrap gap-2 sm:gap-4">
              <Button size="lg" asChild className="rounded-full text-sm sm:text-lg h-11 sm:h-14 px-4 sm:px-8 whitespace-nowrap">
                <Link href="/get-involved">
                  Start Your Journey <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="rounded-full text-sm sm:text-lg h-11 sm:h-14 px-4 sm:px-8 whitespace-nowrap">
                <Link href="/about">Learn More</Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <Link href="/teacher" className="group">
                <Card className="bg-orange-50 border-orange-100 hover:border-orange-200 transition-colors cursor-pointer h-full">
                  <CardContent className="p-4 flex flex-col gap-2">
                    <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">For Educators</span>
                    <span className="font-bold text-foreground group-hover:text-orange-600 transition-colors">I'm an Educator</span>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/student" className="group">
                <Card className="bg-blue-50 border-blue-100 hover:border-blue-200 transition-colors cursor-pointer h-full">
                  <CardContent className="p-4 flex flex-col gap-2">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">For Learners</span>
                    <span className="font-bold text-foreground group-hover:text-blue-600 transition-colors">I'm a Learner</span>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 rotate-2 hover:rotate-0 transition-transform duration-500">
              <Image
                src="/meeting-new.png"
                alt="Teacher and children learning joyfully"
                width={800}
                height={600}
                className="w-full h-auto object-cover"
                priority
              />
            </div>
            {/* Floating Badge */}
            <div className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 max-w-xs hidden md:block">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Concept</p>
                  <p className="font-bold text-sm">STEAM–C++</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Faith-filled minds, future-ready skills.</p>
            </div>
          </div>
        </div>
      </Section>

      {/* Why School + STEAM + Christian */}
      <Section id="pathways" className="bg-slate-50 dark:bg-slate-900/40">
        <div className="space-y-8">
          <h2 className="text-center text-3xl md:text-5xl font-bold tracking-tight text-slate-700 dark:text-slate-100">
            Why SCHOOL + STEAM + CHRISTIAN?
          </h2>

          <div className="rounded-3xl bg-white/90 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-8 md:p-10">
            <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-6">OUR VISION</h3>
            <p className="text-base md:text-lg leading-relaxed text-slate-700 dark:text-slate-200">
              Transforming rural Indonesia by unlocking STEAM learning opportunities through SCHOOL partnerships that empower teachers and families to raise a skilled and impact-driven generation, rooted in CHRISTIAN values
              <br />
              and capable of driving INNOVATION that uplifts their local communities.
            </p>
            <p className="mt-5 text-base md:text-lg leading-relaxed text-slate-700 dark:text-slate-200">
              We are committed to rigorous RESEARCH and continuous REFINEMENT to discover and implement the most effective interventions for advancing science education delivery to the unreached.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-none shadow-none bg-orange-500">
              <CardHeader className="bg-orange-400/30 rounded-t-xl flex items-center justify-center py-3">
                <School className="h-6 w-6 text-white" />
              </CardHeader>
              <CardContent className="pt-6 space-y-3">
                <CardTitle className="text-3xl leading-tight text-white">
                  School offers optimum ENGAGEMENT
                </CardTitle>
                <p className="text-orange-50">Higher commitment from parents and students</p>
                <p className="text-orange-50">The widest reach to youths</p>
                <p className="text-orange-50">Opportunity for dormitory school</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-none bg-cyan-500">
              <CardHeader className="bg-cyan-400/30 rounded-t-xl flex items-center justify-center py-3">
                <Lightbulb className="h-6 w-6 text-white" />
              </CardHeader>
              <CardContent className="pt-6 space-y-3">
                <CardTitle className="text-3xl leading-tight text-white">
                  Critical need for local INNOVATORS
                </CardTitle>
                <p className="text-cyan-50">Jobless challenge and low income</p>
                <p className="text-cyan-50">Raising champions for local change</p>
                <p className="text-cyan-50">
                  Improving families + local economy (e.g. productivity gain, export)
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-none bg-yellow-400">
              <CardHeader className="bg-yellow-300/80 rounded-t-xl flex items-center justify-center py-3">
                <Plus className="h-6 w-6 text-slate-900" />
              </CardHeader>
              <CardContent className="pt-6 space-y-3">
                <CardTitle className="text-2xl leading-tight text-slate-900">
                  <span className="whitespace-nowrap">Encountering Jesus brings</span>
                  <br />
                  TRANSFORMATION
                </CardTitle>
                <p className="text-slate-900/85">Adolescence is the &apos;golden&apos; period</p>
                <p className="text-slate-900/85">30h+/week character formation</p>
                <p className="text-slate-900/85">Mission to the 21st century world</p>
              </CardContent>
            </Card>
          </div>

          <div className="rounded-3xl border border-sky-200 dark:border-sky-800 bg-white/90 dark:bg-slate-950 p-6 md:p-10">
            <h3 className="text-center text-4xl md:text-5xl font-bold tracking-tight text-slate-700 dark:text-slate-100">
              Building Blocks
            </h3>

            <div className="mt-6 grid gap-3 md:gap-6 md:grid-cols-2 text-center md:text-left">
              <p className="text-lg md:text-3xl font-semibold text-slate-700 dark:text-slate-200">
                1. <span className="underline">Breaking Barriers</span> in Rural Education
              </p>
              <p className="text-lg md:text-3xl font-semibold text-slate-700 dark:text-slate-200">
                2. <span className="underline">Building The Future</span> for The Next Generation
              </p>
            </div>

            <div className="mt-10 hidden md:grid grid-cols-3 gap-5 items-center justify-items-center">
              <div className="w-full max-w-[260px] rounded-3xl border border-sky-200 dark:border-sky-800 p-6 text-center text-4xl font-semibold text-slate-700 dark:text-slate-200 min-h-[160px]">
                Partnership
                <br />
                Model
              </div>
              <div />
              <div className="w-full max-w-[260px] rounded-3xl border border-sky-200 dark:border-sky-800 p-6 text-center text-4xl font-semibold text-slate-700 dark:text-slate-200 min-h-[160px]">
                Curriculum4.0
              </div>

              <div className="w-full max-w-[260px] rounded-3xl border border-sky-200 dark:border-sky-800 p-6 text-center text-4xl font-semibold text-slate-700 dark:text-slate-200 min-h-[160px]">
                Empowering
                <br />
                Teachers
              </div>
              <div className="h-[220px] w-[220px] rounded-full bg-sky-300 dark:bg-sky-600 flex items-center justify-center text-center px-6">
                <span className="text-3xl font-extrabold leading-tight text-slate-900 dark:text-white">
                  EDUTINDO
                  <br />
                  CHRISTIAN
                  <br />
                  STEAM
                  <br />
                  SCHOOL
                </span>
              </div>
              <div className="w-full max-w-[260px] rounded-3xl border border-sky-200 dark:border-sky-800 p-6 text-center text-4xl font-semibold text-slate-700 dark:text-slate-200 min-h-[160px]">
                Real World
                <br />
                Experience
              </div>

              <div className="w-full max-w-[260px] rounded-3xl border border-sky-200 dark:border-sky-800 p-6 text-center text-4xl font-semibold text-slate-700 dark:text-slate-200 min-h-[160px]">
                Accessible
                <br />
                Resources
              </div>
              <div />
              <div className="w-full max-w-[260px] rounded-3xl border border-sky-200 dark:border-sky-800 p-6 text-center text-4xl font-semibold text-slate-700 dark:text-slate-200 min-h-[160px]">
                Transformative
                <br />
                Character
              </div>
            </div>

            <div className="mt-10 md:hidden space-y-4">
              <div className="mx-auto h-[180px] w-[180px] rounded-full bg-sky-300 dark:bg-sky-600 flex items-center justify-center text-center px-5">
                <span className="text-2xl font-extrabold leading-tight text-slate-900 dark:text-white">
                  EDUTINDO
                  <br />
                  CHRISTIAN
                  <br />
                  STEAM
                  <br />
                  SCHOOL
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  "Partnership Model",
                  "Curriculum4.0",
                  "Empowering Teachers",
                  "Real World Experience",
                  "Accessible Resources",
                  "Transformative Character",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-sky-200 dark:border-sky-800 p-4 text-center text-lg font-semibold text-slate-700 dark:text-slate-200 min-h-[110px] flex items-center justify-center"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Why It's Needed */}
      <Section className="bg-slate-50 dark:bg-slate-900/50">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">The Urgency in Rural Indonesia</h2>
          <p className="text-lg text-muted-foreground">
            Indonesia has world-class potential in its young people. But gaps in critical thinking, confidence, and character formation mean many students never fully grow into the innovators and leaders they could be.
          </p>
        </div>


        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "When Talent Isn’t Enough",
              desc: "Lack of confidence to think critically and speak boldly creates barriers.",
              icon: Users,
              color: "text-orange-500",
              bg: "bg-orange-50 dark:bg-orange-900/20"
            },
            {
              title: "Outdated Focus",
              desc: "Education often emphasizes rote memorization over authentic problem solving.",
              icon: GraduationCap,
              color: "text-cyan-500",
              bg: "bg-cyan-50 dark:bg-cyan-900/20"
            },
            {
              title: "Digital Direction",
              desc: "Young people are connected but need a moral compass to guide their potential.",
              icon: Globe,
              color: "text-pink-500",
              bg: "bg-pink-50 dark:bg-pink-900/20"
            },
            {
              title: "Global Standards",
              desc: "The world expects technical excellence combined with strong character.",
              icon: Lightbulb,
              color: "text-purple-500",
              bg: "bg-purple-50 dark:bg-purple-900/20"
            }
          ].map((item, i) => (
            <Card key={i} className="border-none shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className={`w-12 h-12 rounded-xl ${item.bg} ${item.color} flex items-center justify-center mb-4`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </Section>
    </div>
  
  );
}
