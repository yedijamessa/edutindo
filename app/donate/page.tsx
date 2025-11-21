import { CreditCard, Heart, Landmark } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/ui/section";

export default function DonatePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Section>
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200">Support Us</Badge>
            <h1 className="text-4xl font-extrabold tracking-tight">Support the Ministry</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your giving helps us run trainings, discipleship programs, and outreach to empower the next generation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-none shadow-xl bg-white dark:bg-slate-900">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                  <Landmark className="w-6 h-6" />
                </div>
                <CardTitle>Bank Transfer (Indonesia)</CardTitle>
                <CardDescription>Direct transfer to our foundation account.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-2 border border-slate-100 dark:border-slate-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Bank Name</span>
                    <span className="font-semibold">[Bank Name]</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Account Name</span>
                    <span className="font-semibold">Yayasan Edutindo</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Account Number</span>
                    <span className="font-mono font-bold text-blue-600">123 456 7890</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Please confirm your transfer by sending the receipt to our WhatsApp.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-900/10">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-xl bg-orange-200 text-orange-700 flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6" />
                </div>
                <CardTitle>Prayer Support</CardTitle>
                <CardDescription>Partner with us in spirit.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                  We believe in the power of prayer. Please join us in praying for:
                </p>
                <ul className="space-y-2">
                  {[
                    "Wisdom for our leaders and mentors",
                    "Strength for teachers and students",
                    "Open doors for outreach opportunities",
                    "Resources to sustain the ministry"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-200">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </Section>
    </div>
  );
}
