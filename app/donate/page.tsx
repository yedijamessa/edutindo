"use client";

import { useState, useEffect } from "react";
import { CreditCard, Heart, Landmark, Package, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getEquipmentNeeds, createDonation, getRecentDonors } from "@/lib/firestore-services";
import type { Equipment, Donation } from "@/types/lms";

export default function DonatePage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [recentDonors, setRecentDonors] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    donorName: "",
    donorEmail: "",
    donorPhone: "",
    amount: "",
    message: "",
    isAnonymous: false,
    paymentMethod: "bank_transfer" as const,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [equipmentData, donorsData] = await Promise.all([
        getEquipmentNeeds("active"),
        getRecentDonors(5),
      ]);
      setEquipment(equipmentData);
      setRecentDonors(donorsData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDonateClick = (item: Equipment) => {
    setSelectedEquipment(item);
    setIsDialogOpen(true);
    setSubmitSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEquipment) return;

    setIsSubmitting(true);
    try {
      await createDonation({
        equipmentId: selectedEquipment.id,
        equipmentName: selectedEquipment.name,
        donorName: formData.donorName,
        donorEmail: formData.donorEmail || undefined,
        donorPhone: formData.donorPhone || undefined,
        amount: parseFloat(formData.amount),
        message: formData.message || undefined,
        isAnonymous: formData.isAnonymous,
        paymentMethod: formData.paymentMethod,
      });

      setSubmitSuccess(true);
      setFormData({
        donorName: "",
        donorEmail: "",
        donorPhone: "",
        amount: "",
        message: "",
        isAnonymous: false,
        paymentMethod: "bank_transfer",
      });

      // Reload data to show updated progress
      setTimeout(() => {
        loadData();
        setIsDialogOpen(false);
        setSubmitSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Error submitting donation:", error);
      alert("Failed to submit donation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-700 border-red-200 hover:bg-red-200";
      case "high":
        return "bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "technology":
        return "💻";
      case "furniture":
        return "🪑";
      case "supplies":
        return "📚";
      default:
        return "📦";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-slate-50 dark:from-slate-950 dark:via-orange-950/10 dark:to-slate-950">
      <Section>
        <div className="max-w-7xl mx-auto space-y-16">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <Badge className="bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 hover:from-orange-200 hover:to-orange-300 border-orange-300 px-4 py-1.5 text-sm font-semibold">
              Support Our Mission
            </Badge>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-orange-800 to-slate-900 dark:from-slate-100 dark:via-orange-400 dark:to-slate-100 bg-clip-text text-transparent">
              Equip the Future
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Your generosity helps us provide essential equipment and resources to empower students
              and teachers. Every contribution makes a lasting impact.
            </p>
          </div>

          {/* Equipment Needs Grid */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  Equipment Needs
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Help us reach our goals for these essential items
                </p>
              </div>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse border-none shadow-xl">
                    <CardHeader className="space-y-4">
                      <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : equipment.length === 0 ? (
              <Card className="border-none shadow-xl bg-white dark:bg-slate-900 p-12 text-center">
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Package className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    No Active Equipment Needs
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Check back soon for new equipment needs!
                  </p>
                </div>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {equipment.map((item) => {
                  const progress = (item.currentAmount / item.targetAmount) * 100;
                  const remaining = item.targetAmount - item.currentAmount;

                  return (
                    <Card
                      key={item.id}
                      className="group border-none shadow-xl bg-white dark:bg-slate-900 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500"></div>
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="text-3xl">{getCategoryIcon(item.category)}</div>
                          <Badge className={getPriorityColor(item.priority)}>
                            {item.priority}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                          {item.name}
                        </CardTitle>
                        <CardDescription className="text-sm leading-relaxed">
                          {item.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm font-medium">
                            <span className="text-slate-600 dark:text-slate-400">Progress</span>
                            <span className="text-orange-600 dark:text-orange-400 font-bold">
                              {progress.toFixed(0)}%
                            </span>
                          </div>
                          <Progress value={progress} className="h-3" />
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-500 dark:text-slate-500">
                              {formatCurrency(item.currentAmount)}
                            </span>
                            <span className="text-slate-500 dark:text-slate-500">
                              {formatCurrency(item.targetAmount)}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                            <span className="font-semibold text-orange-600 dark:text-orange-400">
                              {formatCurrency(remaining)}
                            </span>{" "}
                            remaining to reach goal
                          </p>
                          <Dialog open={isDialogOpen && selectedEquipment?.id === item.id} onOpenChange={(open) => {
                            if (!open) {
                              setIsDialogOpen(false);
                              setSelectedEquipment(null);
                            }
                          }}>
                            <DialogTrigger asChild>
                              <Button
                                onClick={() => handleDonateClick(item)}
                                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                              >
                                <Heart className="w-4 h-4 mr-2" />
                                Donate Now
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle className="text-2xl">
                                  {submitSuccess ? "Thank You! 🎉" : `Support ${item.name}`}
                                </DialogTitle>
                                <DialogDescription>
                                  {submitSuccess
                                    ? "Your donation has been submitted successfully. We'll confirm once we receive your payment."
                                    : "Fill in your details below to make a donation."}
                                </DialogDescription>
                              </DialogHeader>

                              {submitSuccess ? (
                                <div className="py-8 text-center space-y-4">
                                  <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                    <Heart className="w-8 h-8 text-green-600 dark:text-green-400" />
                                  </div>
                                  <p className="text-slate-600 dark:text-slate-400">
                                    Please complete your bank transfer and send the receipt to our WhatsApp.
                                  </p>
                                </div>
                              ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Name *</label>
                                    <Input
                                      required
                                      value={formData.donorName}
                                      onChange={(e) =>
                                        setFormData({ ...formData, donorName: e.target.value })
                                      }
                                      placeholder="Your full name"
                                      disabled={isSubmitting}
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Email</label>
                                    <Input
                                      type="email"
                                      value={formData.donorEmail}
                                      onChange={(e) =>
                                        setFormData({ ...formData, donorEmail: e.target.value })
                                      }
                                      placeholder="your.email@example.com"
                                      disabled={isSubmitting}
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Phone</label>
                                    <Input
                                      type="tel"
                                      value={formData.donorPhone}
                                      onChange={(e) =>
                                        setFormData({ ...formData, donorPhone: e.target.value })
                                      }
                                      placeholder="+62 xxx xxxx xxxx"
                                      disabled={isSubmitting}
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Amount (IDR) *</label>
                                    <Input
                                      required
                                      type="number"
                                      min="1000"
                                      step="1000"
                                      value={formData.amount}
                                      onChange={(e) =>
                                        setFormData({ ...formData, amount: e.target.value })
                                      }
                                      placeholder="100000"
                                      disabled={isSubmitting}
                                    />
                                  </div>

                                  <div className="space-y-2">
                                    <label className="text-sm font-medium">Message (Optional)</label>
                                    <Textarea
                                      value={formData.message}
                                      onChange={(e) =>
                                        setFormData({ ...formData, message: e.target.value })
                                      }
                                      placeholder="Leave a message of encouragement..."
                                      rows={3}
                                      disabled={isSubmitting}
                                    />
                                  </div>

                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      id="anonymous"
                                      checked={formData.isAnonymous}
                                      onChange={(e) =>
                                        setFormData({ ...formData, isAnonymous: e.target.checked })
                                      }
                                      className="rounded border-slate-300"
                                      disabled={isSubmitting}
                                    />
                                    <label htmlFor="anonymous" className="text-sm text-slate-600 dark:text-slate-400">
                                      Make this donation anonymous
                                    </label>
                                  </div>

                                  <DialogFooter>
                                    <Button
                                      type="submit"
                                      disabled={isSubmitting}
                                      className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                                    >
                                      {isSubmitting ? "Submitting..." : "Submit Donation"}
                                    </Button>
                                  </DialogFooter>
                                </form>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Donors Section */}
          {recentDonors.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    Recent Supporters
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Thank you to our generous donors
                  </p>
                </div>
              </div>

              <Card className="border-none shadow-xl bg-white dark:bg-slate-900">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {recentDonors.map((donor, index) => (
                      <div
                        key={donor.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold shadow-md">
                            {donor.donorName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-100">
                              {donor.donorName}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {donor.equipmentName}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-orange-600 dark:text-orange-400">
                            {formatCurrency(donor.amount)}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-500">
                            {donor.confirmedAt?.toLocaleDateString("id-ID")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Payment Information */}
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
                    "Resources to sustain the ministry",
                  ].map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-200"
                    >
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
