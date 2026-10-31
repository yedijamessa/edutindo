"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Heart,
  Landmark,
  Laptop,
  LoaderCircle,
  Mail,
  Package,
  School,
  ShieldCheck,
  Upload,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  getEquipmentNeeds,
  createDonation,
  getRecentDonors,
} from "@/lib/firestore-services";
import type { Equipment, Donation } from "@/types/lms";
import styles from "./donate.module.css";

const SUPPORT_AREAS = [
  {
    category: "technology",
    name: "Learning Devices",
    description: "Laptops and tablets for students and teachers.",
    image: "/donate/technology.webp",
    icon: Laptop,
    color: "blue",
  },
  {
    category: "furniture",
    name: "Classroom Furniture",
    description: "Desks, chairs, and learning equipment for rural schools.",
    image: "/donate/furniture.webp",
    icon: School,
    color: "orange",
  },
  {
    category: "supplies",
    name: "Teaching Resources",
    description: "Books, curriculum materials, and science kits.",
    image: "/donate/supplies.webp",
    icon: BookOpen,
    color: "cyan",
  },
] as const;

function Leaves({ className }: { className: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 240"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M20 235C32 162 70 98 91 12"
        stroke="currentColor"
        strokeWidth="2"
      />
      <g fill="currentColor" opacity=".72">
        <path d="M84 42C61 22 78 6 93 0c8 19 2 29-9 42ZM78 63C88 30 110 29 118 29c-7 23-17 30-40 34ZM70 87C43 62 52 44 61 32c15 12 21 32 9 55ZM60 115C76 81 96 78 111 81c-12 25-28 34-51 34ZM50 141C24 117 30 98 39 85c16 13 21 34 11 56ZM40 167C54 136 76 130 93 133c-11 23-31 34-53 34ZM29 199C9 181 8 159 15 145c17 14 21 32 14 54ZM23 220C39 191 56 185 73 188c-8 21-26 31-50 32Z" />
      </g>
    </svg>
  );
}

type ReceiptUploadStatus = "idle" | "uploading" | "success" | "error";
type TurnstileWindow = Window & {
  onReceiptCaptchaSuccess?: (token: string) => void;
  onReceiptCaptchaExpired?: () => void;
  turnstile?: {
    reset: (selector?: string) => void;
  };
};

const MAX_RECEIPT_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

async function withDataTimeout<T>(task: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      task,
      new Promise<T>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error("Donation data is taking too long to load.")),
          8000,
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export default function DonatePage() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [recentDonors, setRecentDonors] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [showAllNeeds, setShowAllNeeds] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [receiptStatus, setReceiptStatus] =
    useState<ReceiptUploadStatus>("idle");
  const [receiptMessage, setReceiptMessage] = useState<string | null>(null);
  const [receiptCaptchaToken, setReceiptCaptchaToken] = useState("");
  const receiptInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;
    const turnstileWindow = window as TurnstileWindow;
    turnstileWindow.onReceiptCaptchaSuccess = (token: string) => {
      setReceiptCaptchaToken(token);
    };
    turnstileWindow.onReceiptCaptchaExpired = () => {
      setReceiptCaptchaToken("");
    };

    return () => {
      delete turnstileWindow.onReceiptCaptchaSuccess;
      delete turnstileWindow.onReceiptCaptchaExpired;
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setLoadError(false);
      const [equipmentResult, donorsResult] = await Promise.allSettled([
        withDataTimeout(getEquipmentNeeds("active")),
        withDataTimeout(getRecentDonors(5)),
      ]);
      if (equipmentResult.status === "fulfilled")
        setEquipment(equipmentResult.value);
      else setLoadError(true);
      if (donorsResult.status === "fulfilled")
        setRecentDonors(donorsResult.value);
    } catch (error) {
      console.error("Error loading data:", error);
      setLoadError(true);
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

  const uploadReceipt = async (file: File) => {
    setReceiptStatus("uploading");
    setReceiptMessage(null);

    try {
      if (TURNSTILE_SITE_KEY && !receiptCaptchaToken) {
        setReceiptStatus("error");
        setReceiptMessage(
          "Please complete the captcha check before uploading your receipt.",
        );
        return;
      }

      const payload = new FormData();
      payload.append("receipt", file);
      if (formData.donorName.trim())
        payload.append("donorName", formData.donorName.trim());
      if (formData.donorEmail.trim())
        payload.append("donorEmail", formData.donorEmail.trim());
      if (TURNSTILE_SITE_KEY)
        payload.append("captchaToken", receiptCaptchaToken);

      const res = await fetch("/api/donate/receipt", {
        method: "POST",
        body: payload,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Failed to upload receipt.");
      }

      setReceiptStatus("success");
      setReceiptMessage(
        data?.message || "Receipt received. Our team has been notified.",
      );
      setReceiptCaptchaToken("");
      (window as TurnstileWindow).turnstile?.reset("#receipt-turnstile");
    } catch (error) {
      console.error("Receipt upload error:", error);
      setReceiptStatus("error");
      setReceiptMessage(
        error instanceof Error
          ? error.message
          : "Failed to upload receipt. Please try again.",
      );
      setReceiptCaptchaToken("");
      (window as TurnstileWindow).turnstile?.reset("#receipt-turnstile");
    }
  };

  const handleReceiptSelected = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (files.length > 1) {
      setReceiptStatus("error");
      setReceiptMessage("Please upload exactly one receipt file.");
      event.target.value = "";
      return;
    }

    const file = files[0];
    if (file.size > MAX_RECEIPT_SIZE_BYTES) {
      setReceiptStatus("error");
      setReceiptMessage("Receipt file is too large. Maximum size is 8 MB.");
      event.target.value = "";
      return;
    }

    await uploadReceipt(file);
    event.target.value = "";
  };

  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="donate-heading">
        <Leaves className={styles.heroEdgeLeaves} />
        <div className={`${styles.container} ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              <Heart size={19} strokeWidth={1.8} aria-hidden="true" /> Support
              Edutindo
            </p>
            <h1 id="donate-heading">
              <span className={styles.headingLine}>Bring the Vision</span>
              <br />
              <span>to Reality</span>
            </h1>
            <p className={styles.lead}>
              Your generosity and prayer help us to empower students and
              teachers, provide essential equipment, and break barriers to build
              a brighter future for Indonesia.
            </p>
            <span className={styles.heroUnderline} aria-hidden="true" />
          </div>
          <div className={styles.heroArt}>
            <Leaves className={styles.heroLeaves} />
            <div className={styles.heroPhoto}>
              <Image
                src="/donate/hero.webp"
                alt="Illustration of a hopeful Indonesian student in a sunlit classroom"
                fill
                sizes="(min-width: 1400px) 520px, (min-width: 900px) 43vw, 90vw"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section
        id="equipment-needs"
        className={styles.needs}
        aria-labelledby="equipment-heading"
      >
        <div className={styles.container}>
          <div className={styles.sectionHeading}>
            <div className={styles.sectionTitle}>
              <span className={styles.packageIcon}>
                <Package size={29} strokeWidth={1.7} aria-hidden="true" />
              </span>
              <div>
                <h2 id="equipment-heading">Equipment Needs</h2>
                <p>
                  Essential items to break the barriers and build the future.
                </p>
              </div>
            </div>
            {equipment.length > 3 && (
              <button
                type="button"
                className={styles.textLink}
                onClick={() => setShowAllNeeds((value) => !value)}
              >
                {showAllNeeds ? "Show fewer needs" : "See all needs"}
                <ArrowRight size={17} aria-hidden="true" />
              </button>
            )}
          </div>
          {loading ? (
            <div
              className={styles.equipmentGrid}
              aria-label="Loading equipment needs"
              aria-busy="true"
            >
              {[1, 2, 3].map((i) => (
                <div key={i} className={styles.skeleton}>
                  <span />
                  <span />
                  <span />
                </div>
              ))}
            </div>
          ) : equipment.length > 0 ? (
            <div className={styles.equipmentGrid}>
              {(showAllNeeds ? equipment : equipment.slice(0, 3)).map(
                (item) => {
                  const visual = SUPPORT_AREAS.find(
                    (area) => area.category === item.category,
                  );
                  const Icon = visual?.icon ?? Package;
                  const progress =
                    item.targetAmount > 0
                      ? Math.min(
                          100,
                          Math.max(
                            0,
                            (item.currentAmount / item.targetAmount) * 100,
                          ),
                        )
                      : 0;
                  return (
                    <article
                      className={`${styles.equipmentCard} ${styles[visual?.color ?? "blue"]}`}
                      key={item.id}
                    >
                      <div className={styles.equipmentCopy}>
                        <span className={styles.equipmentIcon}>
                          <Icon
                            size={27}
                            strokeWidth={1.6}
                            aria-hidden="true"
                          />
                        </span>
                        <h3>{item.name}</h3>
                        <p>{item.description}</p>
                      </div>
                      {(item.imageUrl || visual?.image) && (
                        <Image
                          src={item.imageUrl || visual!.image}
                          alt=""
                          width={150}
                          height={140}
                          className={styles.equipmentImage}
                          sizes="150px"
                        />
                      )}
                      <div className={styles.equipmentProgress}>
                        <div className={styles.progressLabels}>
                          <strong>{progress.toFixed(0)}%</strong>
                          <span>{formatCurrency(item.targetAmount)}</span>
                        </div>
                        <div
                          className={styles.progressTrack}
                          role="progressbar"
                          aria-label={`${item.name} funding progress`}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={Math.round(progress)}
                        >
                          <span style={{ width: `${progress}%` }} />
                        </div>
                        <p>Raised {formatCurrency(item.currentAmount)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDonateClick(item)}
                        className={styles.supportNeed}
                      >
                        <Heart size={14} aria-hidden="true" /> Support this need{" "}
                        <ArrowRight size={15} aria-hidden="true" />
                      </button>
                    </article>
                  );
                },
              )}
            </div>
          ) : (
            <>
              <p className={styles.needsNotice} role="status">
                {loadError
                  ? "Current funding needs are unavailable right now. You can still give by bank transfer or contact our team."
                  : "Contact our team for current funding targets and priorities, or give directly by bank transfer."}
                {loadError && (
                  <button type="button" onClick={loadData}>
                    Try again
                  </button>
                )}
              </p>
              <div className={styles.equipmentGrid}>
                {SUPPORT_AREAS.map(
                  ({ name, description, image, icon: Icon, color }) => (
                    <article
                      className={`${styles.equipmentCard} ${styles.categoryCard} ${styles[color]}`}
                      key={name}
                    >
                      <div className={styles.equipmentCopy}>
                        <span className={styles.equipmentIcon}>
                          <Icon
                            size={27}
                            strokeWidth={1.6}
                            aria-hidden="true"
                          />
                        </span>
                        <h3>{name}</h3>
                        <p>{description}</p>
                      </div>
                      <Image
                        src={image}
                        alt=""
                        width={150}
                        height={140}
                        className={styles.equipmentImage}
                        sizes="150px"
                      />
                      <Link href="/contact" className={styles.categoryLink}>
                        Discuss this need{" "}
                        <ArrowRight size={15} aria-hidden="true" />
                      </Link>
                    </article>
                  ),
                )}
              </div>
            </>
          )}
        </div>
      </section>

      <section
        className={styles.supportSection}
        aria-label="Ways to support Edutindo"
      >
        <div className={styles.container}>
          <div className={styles.supportGrid}>
            <section className={styles.bankCard} aria-labelledby="bank-heading">
              <span className={styles.panelIcon}>
                <Landmark size={25} strokeWidth={1.7} aria-hidden="true" />
              </span>
              <h2 id="bank-heading">Bank Transfer (Rupiah)</h2>
              <p className={styles.panelIntro}>
                Direct transfer to our foundation account.
              </p>
              <dl className={styles.bankDetails}>
                <div>
                  <dt>Bank Name</dt>
                  <dd>Bank Central Asia (BCA)</dd>
                </div>
                <div>
                  <dt>Account Name</dt>
                  <dd>Yayasan Edukasi Terang Indonesia</dd>
                </div>
                <div>
                  <dt>Account Number</dt>
                  <dd className={styles.accountNumber}>731 556 3399</dd>
                </div>
              </dl>
              <div className={styles.receipt}>
                {TURNSTILE_SITE_KEY && (
                  <>
                    <Script
                      src="https://challenges.cloudflare.com/turnstile/v0/api.js"
                      async
                      defer
                    />
                    <div
                      id="receipt-turnstile"
                      className="cf-turnstile"
                      data-sitekey={TURNSTILE_SITE_KEY}
                      data-callback="onReceiptCaptchaSuccess"
                      data-expired-callback="onReceiptCaptchaExpired"
                    />
                    <p className={styles.receiptHint}>
                      Complete the captcha to verify this upload.
                    </p>
                  </>
                )}
                <input
                  ref={receiptInputRef}
                  type="file"
                  accept="application/pdf,image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif"
                  className={styles.hiddenInput}
                  aria-label="Upload payment receipt"
                  onChange={handleReceiptSelected}
                />
                <button
                  type="button"
                  className={styles.receiptButton}
                  disabled={receiptStatus === "uploading"}
                  onClick={() => receiptInputRef.current?.click()}
                >
                  {receiptStatus === "uploading" ? (
                    <LoaderCircle
                      className={styles.spinner}
                      size={17}
                      aria-hidden="true"
                    />
                  ) : (
                    <Upload size={17} aria-hidden="true" />
                  )}
                  {receiptStatus === "uploading"
                    ? "Uploading Receipt..."
                    : "Attach Receipt Here"}
                </button>
                <p className={styles.receiptHint}>
                  Upload 1 receipt file only (max 8 MB).
                </p>
                {receiptStatus === "success" && receiptMessage && (
                  <div className={styles.success} role="status">
                    <CheckCircle2 size={18} aria-hidden="true" />
                    <span>{receiptMessage}</span>
                  </div>
                )}
                {receiptStatus === "error" && receiptMessage && (
                  <div className={styles.error} role="alert">
                    <AlertCircle size={18} aria-hidden="true" />
                    <span>{receiptMessage}</span>
                  </div>
                )}
              </div>
            </section>
            <section
              className={styles.prayerCard}
              aria-labelledby="prayer-heading"
            >
              <Leaves className={styles.prayerLeaves} />
              <span className={styles.prayerIcon}>
                <Heart size={27} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <h2 id="prayer-heading">Prayer Support</h2>
              <p className={styles.panelIntro}>
                Stand with us through your prayers.
              </p>
              <p className={styles.prayerIntro}>
                We believe in the power of prayer and our strength alone will
                not be enough. Please join us in prayer for:
              </p>
              <ul>
                <li>Wisdom for our leaders and partners</li>
                <li>Commitment for teachers and students</li>
                <li>Resources to break the barriers and build the future</li>
              </ul>
            </section>
          </div>

          {recentDonors.length > 0 && (
            <section
              className={styles.recentSupporters}
              aria-labelledby="supporters-heading"
            >
              <h2 id="supporters-heading">Recent Supporters</h2>
              <p>Thank you to our generous donors.</p>
              <div>
                {recentDonors.map((donor) => (
                  <div className={styles.donorRow} key={donor.id}>
                    <span className={styles.donorAvatar}>
                      {donor.donorName.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <strong>{donor.donorName}</strong>
                      <p>{donor.equipmentName}</p>
                    </div>
                    <div className={styles.donorAmount}>
                      <strong>{formatCurrency(donor.amount)}</strong>
                      <p>{donor.confirmedAt?.toLocaleDateString("id-ID")}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section
            className={styles.otherWays}
            aria-labelledby="other-ways-heading"
          >
            <div className={styles.otherIntro}>
              <Leaves className={styles.otherLeaves} />
              <h2 id="other-ways-heading">Other Ways to Support</h2>
              <p>
                Not sure how to help? Here are other ways you can get involved
                or reach out to us directly.
              </p>
            </div>
            <div className={styles.otherWay}>
              <span className={styles.wayIcon}>
                <Mail size={24} strokeWidth={1.7} aria-hidden="true" />
              </span>
              <h3>Contact Us</h3>
              <p>
                Have questions or want to discuss a partnership? We’d love to
                hear from you.
              </p>
              <Link href="/contact" className={styles.textLink}>
                Get in Touch <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
            <div className={styles.otherWay}>
              <span className={styles.wayIcon}>
                <ShieldCheck size={24} strokeWidth={1.7} aria-hidden="true" />
              </span>
              <h3>Transparency</h3>
              <p>
                We are committed to responsible stewardship and sharing how your
                support makes an impact.
              </p>
              <details className={styles.commitment}>
                <summary>
                  Our Commitment <ArrowRight size={16} aria-hidden="true" />
                </summary>
                <p>
                  For questions about donation confirmation and the use of
                  funds, please <Link href="/contact">contact our team</Link>.
                </p>
              </details>
            </div>
            <div className={styles.otherWay}>
              <span className={styles.wayIcon}>
                <Users size={24} strokeWidth={1.7} aria-hidden="true" />
              </span>
              <h3>Get Involved</h3>
              <p>
                Explore other ways to support such as volunteering,
                partnerships, or spreading the word.
              </p>
              <Link href="/get-involved" className={styles.textLink}>
                Get Involved <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </section>
        </div>
      </section>
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsDialogOpen(false);
            setSelectedEquipment(null);
          }
        }}
      >
        <DialogContent className={styles.dialog}>
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {submitSuccess
                ? "Thank You! 🎉"
                : `Support ${selectedEquipment?.name ?? "equipment"}`}
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
                Please complete your bank transfer, then attach your receipt
                using the upload button on this page.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="donor-name" className="text-sm font-medium">
                  Name *
                </label>
                <Input
                  required
                  id="donor-name"
                  value={formData.donorName}
                  onChange={(e) =>
                    setFormData({ ...formData, donorName: e.target.value })
                  }
                  placeholder="Your full name"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="donor-email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  type="email"
                  id="donor-email"
                  value={formData.donorEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, donorEmail: e.target.value })
                  }
                  placeholder="your.email@example.com"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="donor-phone" className="text-sm font-medium">
                  Phone
                </label>
                <Input
                  type="tel"
                  id="donor-phone"
                  value={formData.donorPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, donorPhone: e.target.value })
                  }
                  placeholder="+62 xxx xxxx xxxx"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="donor-amount" className="text-sm font-medium">
                  Amount (IDR) *
                </label>
                <Input
                  required
                  type="number"
                  min="1000"
                  step="1000"
                  id="donor-amount"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  placeholder="100000"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="donor-message" className="text-sm font-medium">
                  Message (Optional)
                </label>
                <Textarea
                  id="donor-message"
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
                <label
                  htmlFor="anonymous"
                  className="text-sm text-slate-600 dark:text-slate-400"
                >
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
  );
}
