"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, GraduationCap, Lightbulb, Users, Globe, School, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
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
              Breaking Barriers <br />
              <span className="inline-block whitespace-nowrap pb-[0.08em] bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
                Building The Future
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
              &ldquo;A Christian STEAM education initiative for Indonesia&apos;s next generation of servant-hearted innovators.&rdquo;
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
                src="/meeting-new.png"
                alt="Teacher and children learning joyfully"
                width={800}
                height={600}
                className="w-full h-auto object-cover"
                priority
              />
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
                  src="/homepage/eti-group-project.png"
                  alt="Students collaborating in a classroom"
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
                  src="/homepage/eti-steam-lab.png"
                  alt="Students working on STEAM projects"
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
                  src="/homepage/eti-activity-bible.png"
                  alt="Students in Bible-focused learning activity"
                  fill
                  className="object-cover"
                />
              </div>
              <CardContent className="p-6">
                <CardTitle className="text-2xl leading-tight text-slate-900">
                  <span className="whitespace-nowrap">Encountering Jesus brings</span>
                  <br />
                  TRANSFORMATION
                </CardTitle>
              </CardContent>
            </Card>
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white via-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-slate-900 p-8 md:p-10">
            <h3 className="text-center text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              OUR BUILDING BLOCKS
            </h3>

            <Card className="mt-8 border border-sky-200/70 bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg">
              <CardContent className="p-6 md:p-8 text-center">
                <p className="text-lg md:text-xl font-extrabold leading-tight tracking-wide">
                  EDUTINDO CHRISTIAN STEAM SCHOOL
                </p>
              </CardContent>
            </Card>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <Card className="border border-amber-200 bg-amber-50/80 dark:bg-amber-900/20">
                <CardContent className="p-5 text-center">
                  <Users className="mx-auto mb-3 h-6 w-6 text-amber-600" />
                  <p className="text-lg font-bold leading-tight text-slate-900 dark:text-slate-100">
                    <span className="block">Partnership</span>
                    <span className="block">Model</span>
                  </p>
                </CardContent>
              </Card>
              <Card className="border border-cyan-200 bg-cyan-50/80 dark:bg-cyan-900/20">
                <CardContent className="p-5 text-center">
                  <GraduationCap className="mx-auto mb-3 h-6 w-6 text-cyan-600" />
                  <p className="text-lg font-bold leading-tight text-slate-900 dark:text-slate-100">
                    <span className="block">Curriculum</span>
                    <span className="block">4.0</span>
                  </p>
                </CardContent>
              </Card>
              <Card className="border border-violet-200 bg-violet-50/80 dark:bg-violet-900/20">
                <CardContent className="p-5 text-center">
                  <Globe className="mx-auto mb-3 h-6 w-6 text-violet-600" />
                  <p className="text-lg font-bold leading-tight text-slate-900 dark:text-slate-100">
                    <span className="block">Real World</span>
                    <span className="block">Experience</span>
                  </p>
                </CardContent>
              </Card>
              <Card className="border border-emerald-200 bg-emerald-50/80 dark:bg-emerald-900/20">
                <CardContent className="p-5 text-center">
                  <Lightbulb className="mx-auto mb-3 h-6 w-6 text-emerald-600" />
                  <p className="text-lg font-bold leading-tight text-slate-900 dark:text-slate-100">
                    <span className="block">Empowering</span>
                    <span className="block">Teachers</span>
                  </p>
                </CardContent>
              </Card>
              <Card className="border border-rose-200 bg-rose-50/80 dark:bg-rose-900/20">
                <CardContent className="p-5 text-center">
                  <School className="mx-auto mb-3 h-6 w-6 text-rose-600" />
                  <p className="text-lg font-bold leading-tight text-slate-900 dark:text-slate-100">
                    <span className="block">Accessible</span>
                    <span className="block">Resources</span>
                  </p>
                </CardContent>
              </Card>
              <Card className="border border-indigo-200 bg-indigo-50/80 dark:bg-indigo-900/20">
                <CardContent className="p-5 text-center">
                  <Plus className="mx-auto mb-3 h-6 w-6 text-indigo-600" />
                  <p className="text-lg font-bold leading-tight text-slate-900 dark:text-slate-100">
                    <span className="block">Transformative</span>
                    <span className="block">Character</span>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Section>
    </div>

  );
}
