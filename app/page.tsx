"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, GraduationCap, Lightbulb, Users, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/ui/section";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <Section className="pt-20 pb-32 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 overflow-hidden relative">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-orange-400/20 rounded-full blur-3xl" />

        <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-8">
            <Badge variant="secondary" className="px-4 py-1 text-sm">
              EDUKASI TERANG INDONESIA
            </Badge>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground">
              Building Futures, <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
                Breaking Barriers
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
              A Christian STEAM education initiative for Indonesia&apos;s next generation of innovators, leaders, and servant-hearted citizens.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild className="rounded-full text-lg h-14 px-8">
                <Link href="/get-involved">
                  Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="rounded-full text-lg h-14 px-8">
                <Link href="/about">Learn More</Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <Link href="/#for-educators" className="group">
                <Card className="bg-orange-50 border-orange-100 hover:border-orange-200 transition-colors cursor-pointer h-full">
                  <CardContent className="p-4 flex flex-col gap-2">
                    <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">For Educators</span>
                    <span className="font-bold text-foreground group-hover:text-orange-600 transition-colors">I&apos;m an Educator</span>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/#for-learners" className="group">
                <Card className="bg-blue-50 border-blue-100 hover:border-blue-200 transition-colors cursor-pointer h-full">
                  <CardContent className="p-4 flex flex-col gap-2">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">For Learners</span>
                    <span className="font-bold text-foreground group-hover:text-blue-600 transition-colors">I&apos;m a Learner</span>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 rotate-2 hover:rotate-0 transition-transform duration-500">
              <Image
                src="/homepage/eti-hero-classroom.jpg"
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

      {/* Quick Pathways */}
      <Section id="pathways" className="bg-white dark:bg-slate-950">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-orange-500 text-white border-none card-hover">
            <CardHeader>
              <CardTitle>School Partnership</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-6 text-orange-50">
                Collaborate with us to redesign your curriculum using our STEAM–C++ framework, training, and mentoring.
              </p>
              <Button variant="secondary" className="w-full bg-white text-orange-600 hover:bg-orange-50" asChild>
                <Link href="/contact">For Principals</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-cyan-500 text-white border-none card-hover">
            <CardHeader>
              <CardTitle>Teacher Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-6 text-cyan-50">
                Workshops, coaching, and ready-to-use lesson designs that make STEAM & character-building practical.
              </p>
              <Button variant="secondary" className="w-full bg-white text-cyan-600 hover:bg-cyan-50" asChild>
                <Link href="/contact">For Teachers</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-yellow-400 text-slate-900 border-none card-hover">
            <CardHeader>
              <CardTitle>Learner Experience</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-6 text-slate-800/80">
                Joyful projects, clubs, and programs where students explore science, tech, arts, and faith in everyday life.
              </p>
              <Button variant="secondary" className="w-full bg-slate-900 text-yellow-400 hover:bg-slate-800" asChild>
                <Link href="/get-involved">For Parents</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Section>

      {/* Why It's Needed */}
      <Section className="bg-slate-50 dark:bg-slate-900/50">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Indonesia Needs This Now</h2>
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
