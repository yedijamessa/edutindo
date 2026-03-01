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

            <h1 className="text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight leading-[1.08] text-foreground">
              Breaking Barriers, <br />
              <span className="inline-block whitespace-nowrap pb-[0.08em] bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
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

          <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 md:p-12 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-400/5 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10">
              <h3 className="text-center text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2">
                Building Blocks
              </h3>
              <p className="text-center text-slate-400 text-sm md:text-base mb-8">The pillars that power our mission</p>

              <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:gap-6 justify-center items-center">
                <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 rounded-full px-5 py-2.5">
                  <span className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">1</span>
                  <span className="text-sm md:text-base font-semibold text-orange-200">
                    <span className="underline decoration-orange-400">Breaking Barriers</span> in Rural Education
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-full px-5 py-2.5">
                  <span className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-white text-xs font-bold">2</span>
                  <span className="text-sm md:text-base font-semibold text-cyan-200">
                    <span className="underline decoration-cyan-400">Building The Future</span> for The Next Generation
                  </span>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="mt-12 hidden md:grid grid-cols-3 gap-6 items-center justify-items-center">
                {/* Row 1 */}
                <div className="group w-full rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/10 hover:border-amber-400/40">
                  <div className="mx-auto mb-4 w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/30 transition-colors">
                    <Users className="w-6 h-6 text-amber-400" />
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-1">Partnership</h4>
                  <p className="text-lg font-semibold text-amber-300/80">Model</p>
                </div>

                <div />

                <div className="group w-full rounded-2xl bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/10 hover:border-cyan-400/40">
                  <div className="mx-auto mb-4 w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors">
                    <GraduationCap className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h4 className="text-2xl font-bold text-white">Curriculum 4.0</h4>
                </div>

                {/* Row 2 */}
                <div className="group w-full rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/10 hover:border-emerald-400/40">
                  <div className="mx-auto mb-4 w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
                    <Lightbulb className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-1">Empowering</h4>
                  <p className="text-lg font-semibold text-emerald-300/80">Teachers</p>
                </div>

                {/* Center Circle */}
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-[260px] h-[260px] rounded-full bg-gradient-to-br from-sky-400/20 to-blue-500/20 animate-pulse" />
                  <div className="absolute w-[240px] h-[240px] rounded-full border border-sky-400/30" />
                  <div className="relative h-[220px] w-[220px] rounded-full bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 flex items-center justify-center text-center px-5 shadow-2xl shadow-sky-500/30">
                    <span className="text-xl font-extrabold leading-tight text-white drop-shadow-md tracking-wide">
                      EDUTINDO
                      <br />
                      CHRISTIAN
                      <br />
                      STEAM
                      <br />
                      SCHOOL
                    </span>
                  </div>
                </div>

                <div className="group w-full rounded-2xl bg-gradient-to-br from-violet-500/10 to-violet-600/5 border border-violet-500/20 p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-violet-500/10 hover:border-violet-400/40">
                  <div className="mx-auto mb-4 w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center group-hover:bg-violet-500/30 transition-colors">
                    <Globe className="w-6 h-6 text-violet-400" />
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-1">Real World</h4>
                  <p className="text-lg font-semibold text-violet-300/80">Experience</p>
                </div>

                {/* Row 3 */}
                <div className="group w-full rounded-2xl bg-gradient-to-br from-rose-500/10 to-rose-600/5 border border-rose-500/20 p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-rose-500/10 hover:border-rose-400/40">
                  <div className="mx-auto mb-4 w-12 h-12 rounded-xl bg-rose-500/20 flex items-center justify-center group-hover:bg-rose-500/30 transition-colors">
                    <School className="w-6 h-6 text-rose-400" />
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-1">Accessible</h4>
                  <p className="text-lg font-semibold text-rose-300/80">Resources</p>
                </div>

                <div />

                <div className="group w-full rounded-2xl bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border border-indigo-500/20 p-6 text-center transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/10 hover:border-indigo-400/40">
                  <div className="mx-auto mb-4 w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/30 transition-colors">
                    <Plus className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-1">Transformative</h4>
                  <p className="text-lg font-semibold text-indigo-300/80">Character</p>
                </div>
              </div>

              {/* Mobile Layout */}
              <div className="mt-10 md:hidden space-y-6">
                <div className="relative mx-auto flex items-center justify-center">
                  <div className="absolute w-[210px] h-[210px] rounded-full bg-gradient-to-br from-sky-400/20 to-blue-500/20 animate-pulse" />
                  <div className="relative h-[180px] w-[180px] rounded-full bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 flex items-center justify-center text-center px-5 shadow-2xl shadow-sky-500/30">
                    <span className="text-lg font-extrabold leading-tight text-white drop-shadow-md tracking-wide">
                      EDUTINDO
                      <br />
                      CHRISTIAN
                      <br />
                      STEAM
                      <br />
                      SCHOOL
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Partnership Model", icon: Users, color: "amber" },
                    { label: "Curriculum 4.0", icon: GraduationCap, color: "cyan" },
                    { label: "Empowering Teachers", icon: Lightbulb, color: "emerald" },
                    { label: "Real World Experience", icon: Globe, color: "violet" },
                    { label: "Accessible Resources", icon: School, color: "rose" },
                    { label: "Transformative Character", icon: Plus, color: "indigo" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`rounded-2xl bg-gradient-to-br from-${item.color}-500/10 to-${item.color}-600/5 border border-${item.color}-500/20 p-4 text-center flex flex-col items-center justify-center gap-2 min-h-[110px]`}
                    >
                      <item.icon className={`w-5 h-5 text-${item.color}-400`} />
                      <span className="text-sm font-semibold text-white">{item.label}</span>
                    </div>
                  ))}
                </div>
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
