"use client";

import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  allScholarships,
  Career,
  careers,
  explorationAreas,
  isUnsure,
  matchCareer,
  Pathway,
  Scholarship,
  studyRegionSuggestions,
  Skill,
  University,
} from "@/lib/citacitaku/careers";
import type { AIGuidance, GuidanceRoadmapStage, WeeklyAction } from "@/lib/citacitaku/guidance";

type Grade = "10" | "11" | "12";
type FormData = { name: string; dream: string; grade: Grade | "" };
type FeedbackCategory = "feature" | "career" | "bug" | "other";
type DetailResponse = {
  overview: string;
  whyItMatters: string;
  steps: Array<{ title: string; description: string }>;
  checklist: string[];
  exampleOutput: string;
  verificationNotes: string[];
  firstStep: string;
};

const navItems = [
  ["Jalur", "jalur"],
  ["Kampus", "kampus"],
  ["Beasiswa", "beasiswa"],
  ["Roadmap", "roadmap"],
  ["Skills", "skills"],
  ["Portfolio", "portfolio"],
  ["CV", "cv"],
] as const;

const TRIAL_CODE = "yski-2026";
const TRIAL_CODE_SESSION_KEY = "citacitaku-trial-code";

const genericPathways: Pathway[] = [
  { icon: "🔎", title: "Kenali profesinya", description: "Cari tahu aktivitas sehari-hari, lingkungan kerja, dan dampak profesi ini.", preparation: ["Wawancara praktisi", "Video day-in-the-life", "Catat hal yang menarik", "Catat hal yang belum jelas"] },
  { icon: "🎓", title: "Petakan pendidikan formal", description: "Temukan jurusan dan kualifikasi yang benar-benar diperlukan sebelum memilih kampus.", preparation: ["Nama jurusan terkait", "Kualifikasi wajib", "Durasi belajar", "Syarat masuk"] },
  { icon: "🌏", title: "Bandingkan beberapa pilihan", description: "Cari opsi di Indonesia dan luar negeri dari sumber resmi, bukan hanya satu kampus impian.", preparation: ["US", "Australia", "Asia", "UK", "Europe"] },
  { icon: "🌱", title: "Coba dari skala kecil", description: "Mulai aktivitas yang membantumu menguji apakah bidang ini cocok untukmu.", preparation: ["Proyek mini", "Komunitas", "Kursus pengantar", "Jurnal refleksi"] },
];

const genericSkills: Skill[] = [
  { name: "Riset informasi", kind: "Hard Skill", why: "Membantu menemukan jalur pendidikan yang benar.", activity: "Cari tiga deskripsi pekerjaan dari organisasi tepercaya dan bandingkan." },
  { name: "Literasi digital", kind: "Hard Skill", why: "Membantu menilai sumber dan menyimpan temuan dengan rapi.", activity: "Buat dokumen berisi tautan resmi jurusan, kampus, dan beasiswa." },
  { name: "Komunikasi", kind: "Soft Skill", why: "Berguna di hampir semua bidang dan saat mencari mentor.", activity: "Susun lima pertanyaan untuk seseorang yang bekerja di bidang ini." },
  { name: "Bahasa Inggris", kind: "Soft Skill", why: "Membuka bahan belajar dan pilihan pendidikan lebih luas.", activity: "Cari satu video pengantar profesi dalam bahasa Inggris." },
];

const genericPortfolio = [
  "Catatan hasil riset tentang profesi dan kualifikasinya",
  "Proyek kecil yang berhubungan dengan masalah di bidang tersebut",
  "Wawancara singkat dengan mahasiswa atau praktisi",
  "Kursus pengantar dan refleksi tentang yang dipelajari",
  "Dokumentasi kegiatan organisasi, volunteer, atau kompetisi yang relevan",
];

const defaultQsSortRanks: Record<string, number> = {
  "Massachusetts Institute of Technology": 1,
  "UCL": 8,
  "ETH Zurich": 8,
  "National University of Singapore": 10,
  "University of Hong Kong": 11,
  "Nanyang Technological University": 12,
  "University of New South Wales": 19,
  "University of Melbourne": 22,
  "University of Sydney": 28,
  "Australian National University": 29,
  "Monash University": 31,
  "University of Toronto": 32,
  "King's College London": 37,
  "University of Tokyo": 39,
  "University of Manchester": 40,
  "University of Queensland": 40,
  "University of British Columbia": 45,
  "TU Delft": 48,
  "Hong Kong Polytechnic University": 50,
  "University of Amsterdam": 60,
  "University of Auckland": 67,
  "University of Warwick": 68,
  "University of Leeds": 77,
  "University of Sheffield": 82,
  "University of Technology Sydney": 87,
  "University of Nottingham": 97,
  "Purdue University": 100,
  "University of Waterloo": 113,
  "Leiden University": 119,
  "RMIT University": 119,
  "University of Helsinki": 123,
  "Erasmus University Rotterdam": 148,
  "University of Southern California": 153,
  "Universitas Indonesia": 191,
  "Universitas Gadjah Mada": 206,
  "Universitas Airlangga": 276,
  "Institut Teknologi Bandung": 287,
  "Institut Pertanian Bogor": 399,
  "Universitas Padjadjaran": 496,
  "Institut Teknologi Sepuluh Nopember": 497,
  "Universitas Diponegoro": 662,
  "BINUS University": 901,
  "Telkom University": 1201,
  "Universitas Trisakti": 1401,
  "Universitas Pendidikan Indonesia": 1401,
  "Universitas Negeri Yogyakarta": 1401,
  "Universitas Katolik Indonesia Atma Jaya": 1401,
};

const careerQsSortRanks: Record<string, Record<string, number>> = {
  "data-scientist": {
    "University of Waterloo": 40,
    "Monash University": 48,
    "University of Auckland": 75,
  },
  "software-engineer": {
    "National University of Singapore": 4,
    "University of Toronto": 13,
    "University of Technology Sydney": 45,
  },
  "designer": {
    "University of the Arts London": 2,
    "Hong Kong Polytechnic University": 15,
    "RMIT University": 18,
  },
};

const defaultQsRankLabels: Record<string, string> = {
  "Massachusetts Institute of Technology": "QS WUR 2027 #1",
  "UCL": "QS WUR 2027 #=8",
  "ETH Zurich": "QS WUR 2027 #=8",
  "National University of Singapore": "QS WUR 2027 #10",
  "University of Hong Kong": "QS WUR 2027 #11",
  "Nanyang Technological University": "QS WUR 2027 #12",
  "University of New South Wales": "QS WUR 2027 #19",
  "University of Melbourne": "QS WUR 2027 #=22",
  "University of Sydney": "QS WUR 2027 #28",
  "Australian National University": "QS WUR 2027 #29",
  "Monash University": "QS WUR 2027 #31",
  "University of Toronto": "QS WUR 2027 #32",
  "King's College London": "QS WUR 2027 #37",
  "University of Tokyo": "QS WUR 2027 #39",
  "University of Manchester": "QS WUR 2027 #=40",
  "University of Queensland": "QS WUR 2027 #=40",
  "University of British Columbia": "QS WUR 2027 #=45",
  "TU Delft": "QS WUR 2027 #48",
  "Hong Kong Polytechnic University": "QS WUR 2027 #50",
  "University of Amsterdam": "QS WUR 2027 #60",
  "University of Auckland": "QS WUR 2027 #67",
  "University of Warwick": "QS WUR 2027 #=68",
  "University of Leeds": "QS WUR 2027 #=77",
  "University of Sheffield": "QS WUR 2027 #=82",
  "University of Technology Sydney": "QS WUR 2027 #=87",
  "University of Nottingham": "QS WUR 2027 #=97",
  "Purdue University": "QS WUR 2027 #=100",
  "University of Waterloo": "QS WUR 2027 #=113",
  "Leiden University": "QS WUR 2027 #=119",
  "RMIT University": "QS WUR 2027 #=119",
  "University of Helsinki": "QS WUR 2027 #=123",
  "Erasmus University Rotterdam": "QS WUR 2027 #148",
  "University of Southern California": "QS WUR 2027 #153",
  "Universitas Indonesia": "QS WUR 2027 #=191",
  "Universitas Gadjah Mada": "QS WUR 2027 #=206",
  "Universitas Airlangga": "QS WUR 2027 #276",
  "Institut Teknologi Bandung": "QS WUR 2027 #287",
  "Institut Pertanian Bogor": "QS WUR 2027 #399",
  "Universitas Padjadjaran": "QS WUR 2027 #496",
  "Institut Teknologi Sepuluh Nopember": "QS WUR 2027 #=497",
  "Universitas Diponegoro": "QS WUR 2027 #=662",
  "BINUS University": "QS WUR 2027 #901-950",
  "Telkom University": "QS WUR 2027 #1201-1400",
  "Universitas Trisakti": "QS WUR 2027 #1401+",
  "Universitas Pendidikan Indonesia": "QS WUR 2027 #1401+",
  "Universitas Negeri Yogyakarta": "QS WUR 2027 #1401+",
  "Universitas Katolik Indonesia Atma Jaya": "QS WUR 2027 #1401+",
};

const careerQsRankLabels: Record<string, Record<string, string>> = {
  "data-scientist": {
    "University of Waterloo": "QS Data Science & AI 2026 #40",
    "Monash University": "QS Data Science & AI 2026 #48",
    "University of Auckland": "QS Data Science & AI 2026 #51-100",
  },
  "software-engineer": {
    "National University of Singapore": "QS Computer Science 2026 #=4",
    "University of Toronto": "QS Computer Science 2026 #13",
    "University of Technology Sydney": "QS Computer Science 2026 #45",
  },
  "designer": {
    "University of the Arts London": "QS Art & Design 2026 #2",
    "Hong Kong Polytechnic University": "QS Art & Design 2026 #15",
    "RMIT University": "QS Art & Design 2026 #18",
  },
};

const requiredOverseasRegions = ["US", "UK", "Eropa", "Asia", "Australia"] as const;

const requiredRegionalUniversities: Array<University & { requiredRegion: (typeof requiredOverseasRegions)[number] }> = [
  {
    name: "Massachusetts Institute of Technology",
    country: "US",
    majors: ["Cek program terkait jurusan target"],
    note: "Gunakan sebagai pembanding US berbasis QS. Selalu cek apakah program undergraduate dan kurikulumnya cocok dengan tujuanmu.",
    tags: ["US", "QS ranked"],
    competitiveLevel: "Very Competitive",
    requiredRegion: "US",
  },
  {
    name: "UCL",
    country: "UK",
    majors: ["Cek program terkait jurusan target"],
    note: "Gunakan sebagai pembanding UK berbasis QS. Untuk UK, jalurnya tidak selalu harus lulus SMA lalu foundation. Bandingkan A-Level, IB Diploma, BTEC International Level 3, foundation tertentu yang dapat menerima kelas 11, International Year One, atau direct entry yang sangat tergantung universitas dan jurusan.",
    tags: ["UK", "QS ranked"],
    competitiveLevel: "Very Competitive",
    requiredRegion: "UK",
  },
  {
    name: "ETH Zurich",
    country: "Swiss",
    majors: ["Cek program terkait jurusan target"],
    note: "Gunakan sebagai pembanding Eropa berbasis QS. Cek bahasa pengantar, biaya non-EU, dan visa/residence permit.",
    tags: ["Eropa", "QS ranked"],
    competitiveLevel: "Very Competitive",
    requiredRegion: "Eropa",
  },
  {
    name: "National University of Singapore",
    country: "Singapura",
    majors: ["Cek program terkait jurusan target"],
    note: "Gunakan sebagai pembanding Asia berbasis QS. Cek bahasa pengantar, beasiswa, dan syarat subject/test.",
    tags: ["Asia", "QS ranked"],
    competitiveLevel: "Very Competitive",
    requiredRegion: "Asia",
  },
  {
    name: "University of Melbourne",
    country: "Australia",
    majors: ["Cek program terkait jurusan target"],
    note: "Gunakan sebagai pembanding Australia berbasis QS. Cek pathway, bachelor structure, dan accreditation bila bidangnya teregulasi.",
    tags: ["Australia", "QS ranked"],
    competitiveLevel: "Very Competitive",
    requiredRegion: "Australia",
  },
];

function qsSortRank(university: University, careerId: string): number {
  return careerQsSortRanks[careerId]?.[university.name] ?? defaultQsSortRanks[university.name] ?? Number.MAX_SAFE_INTEGER;
}

function qsRankLabel(university: University, careerId: string): string | null {
  return careerQsRankLabels[careerId]?.[university.name] ?? defaultQsRankLabels[university.name] ?? null;
}

function sortUniversitiesByRelevantQs(universities: University[], careerId: string): University[] {
  return universities
    .map((university, index) => ({ university, index }))
    .sort((left, right) => qsSortRank(left.university, careerId) - qsSortRank(right.university, careerId) || left.index - right.index)
    .map(({ university }) => university);
}

function regionForCountry(country: string): (typeof requiredOverseasRegions)[number] | null {
  if (country === "USA" || country === "US" || country === "Amerika Serikat") return "US";
  if (country === "UK") return "UK";
  if (["Australia"].includes(country)) return "Australia";
  if (["Jepang", "China", "Korea Selatan", "Singapura", "Taiwan", "Hong Kong", "Malaysia"].includes(country)) return "Asia";
  if (["Belanda", "Finlandia", "Swiss", "Jerman", "Prancis", "Italia", "Irlandia"].includes(country)) return "Eropa";
  return null;
}

function ensureRequiredRegionalUniversities(universities: University[], careerId: string): University[] {
  const coveredRegions = new Set(
    universities
      .filter((university) => Boolean(qsRankLabel(university, careerId)))
      .map((university) => regionForCountry(university.country))
      .filter((region): region is (typeof requiredOverseasRegions)[number] => Boolean(region)),
  );
  const additions = requiredRegionalUniversities.filter((university) => !coveredRegions.has(university.requiredRegion));
  return sortUniversitiesByRelevantQs([...universities, ...additions], careerId);
}

const Arrow = ({ direction = "right" }: { direction?: "right" | "left" }) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className={`h-5 w-5 ${direction === "left" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Spark = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 2.8c.6 5.4 3.8 8.6 9.2 9.2-5.4.6-8.6 3.8-9.2 9.2C11.4 15.8 8.2 12.6 2.8 12c5.4-.6 8.6-3.8 9.2-9.2Z" strokeLinejoin="round" />
  </svg>
);

function Brand() {
  return (
    <div className="flex items-center gap-2.5 font-display font-bold text-ink">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-forest text-white"><Spark /></span>
      <span>Cita-cita Ku</span>
    </div>
  );
}
export default function Home() {
  const [trialUnlocked, setTrialUnlocked] = useState(false);
  const [trialCode, setTrialCode] = useState("");
  const [trialError, setTrialError] = useState("");
  const [form, setForm] = useState<FormData>({ name: "", dream: "", grade: "" });
  const [submitted, setSubmitted] = useState<FormData | null>(null);
  const [guidance, setGuidance] = useState<AIGuidance | null>(null);
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [careerPickerOpen, setCareerPickerOpen] = useState(false);

  useEffect(() => {
    setTrialUnlocked(window.sessionStorage.getItem(TRIAL_CODE_SESSION_KEY) === TRIAL_CODE);
  }, []);

  function handleTrialSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (trialCode.trim() !== TRIAL_CODE) {
      setTrialError("Kode belum sesuai.");
      return;
    }
    window.sessionStorage.setItem(TRIAL_CODE_SESSION_KEY, TRIAL_CODE);
    setTrialError("");
    setTrialUnlocked(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim() || !form.dream.trim() || !form.grade) return;
    const cleanForm = { name: form.name.trim(), dream: form.dream.trim(), grade: form.grade } as FormData & { grade: Grade };
    setLoading(true);
    setNotice("");
    try {
      const response = await fetch("/api/citacitaku/guidance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanForm),
      });
      const payload = await response.json() as { guidance?: AIGuidance; warning?: string; error?: string };
      if (!response.ok || !payload.guidance) throw new Error(payload.error || "Panduan belum bisa dibuat.");
      setGuidance(payload.guidance);
      setNotice(payload.warning || "");
    } catch {
      setGuidance(null);
      setNotice("Panduan lokal ditampilkan agar hasil tetap tersedia.");
    } finally {
      setLoading(false);
      setSubmitted(cleanForm);
      window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
    }
  }

  if (!trialUnlocked) {
    return (
      <div className="citacitaku min-h-screen overflow-hidden">
        <header className="shell flex items-center justify-between py-5 sm:py-7">
          <Brand />
          <span className="hidden text-sm font-semibold text-ink/55 sm:block">Akses trial terbatas.</span>
        </header>

        <main className="shell grid min-h-[calc(100vh-6rem)] place-items-center py-10">
          <form onSubmit={handleTrialSubmit} className="section-card w-full max-w-md text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-mint text-xl font-bold text-forest">🔐</span>
            <h1 className="mt-5 font-display text-3xl font-bold text-ink">Masukkan trial code</h1>
            <p className="mt-2 text-sm leading-6 text-ink/55">Masukkan kode akses untuk membuka Cita-cita Ku.</p>
            <label className="mt-6 block text-left">
              <span className="mb-2 block text-sm font-bold text-ink/70">Trial code</span>
              <input
                value={trialCode}
                onChange={(event) => {
                  setTrialCode(event.target.value);
                  setTrialError("");
                }}
                className="focusable min-h-14 w-full rounded-2xl border border-ink/15 bg-[#fcfdfb] px-4 text-center text-base font-bold tracking-wide text-ink placeholder:text-ink/35"
                placeholder="yski-2026"
                autoComplete="off"
                required
              />
            </label>
            {trialError && <p role="alert" className="mt-3 text-sm font-bold text-coral">{trialError}</p>}
            <button type="submit" className="primary-button mt-6 w-full">Masuk</button>
          </form>
        </main>
      </div>
    );
  }

  if (submitted) {
    return (
      <Result
        data={submitted as FormData & { grade: Grade }}
        guidance={guidance}
        notice={notice}
        onReset={() => {
          setSubmitted(null);
          setGuidance(null);
          setNotice("");
          window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
        }}
      />
    );
  }

  return (
    <div className="citacitaku min-h-screen overflow-hidden">
      {loading && <RoadmapLoading />}
      <header className="shell flex items-center justify-between py-5 sm:py-7">
        <Brand />
        <span className="hidden text-sm font-semibold text-ink/55 sm:block">Ada banyak jalan menuju masa depanmu.</span>
      </header>

      <section className="shell relative pb-16 pt-8 sm:pb-24 sm:pt-14">
        <div aria-hidden="true" className="dot-grid absolute -right-20 top-0 -z-10 h-64 w-64 rounded-full opacity-70" />
        <div aria-hidden="true" className="absolute -left-24 top-72 -z-10 h-56 w-56 rounded-full bg-[#fed7aa]/45 blur-3xl" />

        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-forest/10 bg-white px-4 py-2 text-sm font-bold text-forest shadow-sm">
            Untuk Pelajar SMA <span aria-hidden="true">🇮🇩</span>
          </div>
          <h1 className="text-4xl font-extrabold leading-[1.08] text-ink sm:text-6xl md:text-7xl">
            Cita-citamu bukan cuma mimpi.
            <span className="mt-2 block text-forest">Yuk cari jalannya.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-ink/65 sm:text-lg">
            Jawab 3 pertanyaan sederhana dan lihat beberapa jalan yang bisa kamu mulai dari sekarang.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="section-card mx-auto mt-10 max-w-2xl p-5 text-left sm:mt-14 sm:p-9">
          <div className="mb-7 flex items-center justify-between border-b border-ink/10 pb-5">
            <div>
              <p className="font-display text-xl font-bold">Kenalan dulu, yuk!</p>
              <p className="mt-1 text-sm text-ink/55">Cuma butuh sekitar 1 menit.</p>
            </div>
            <span className="rounded-full bg-cream px-3 py-1.5 text-xs font-bold text-ink/60">3 pertanyaan</span>
          </div>

          <label className="block">
            <span className="mb-2.5 block font-display text-base font-bold"><span className="mr-2 text-forest">01</span>Nama kamu siapa?</span>
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className="focusable min-h-14 w-full rounded-2xl border border-ink/15 bg-[#fcfdfb] px-4 text-base text-ink placeholder:text-ink/35"
              placeholder="Contoh: Messa"
              autoComplete="given-name"
              required
            />
          </label>

          <div className="mt-7">
            <label htmlFor="dream-input" className="mb-2.5 block font-display text-base font-bold"><span className="mr-2 text-forest">02</span>Apa cita-citamu?</label>
            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <input
                id="dream-input"
                value={form.dream}
                onChange={(event) => setForm({ ...form, dream: event.target.value })}
                className="focusable min-h-14 w-full rounded-2xl border border-ink/15 bg-[#fcfdfb] px-4 text-base text-ink placeholder:text-ink/35"
                placeholder="Contoh: Software Engineer atau Belum tahu"
                required
              />
              <Dialog open={careerPickerOpen} onOpenChange={setCareerPickerOpen}>
                <DialogTrigger asChild>
                  <button type="button" className="focusable inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-forest/20 bg-mint px-4 text-sm font-bold text-forest transition hover:bg-forest hover:text-white sm:min-w-44">
                    Pilih dari daftar <span aria-hidden="true">▾</span>
                  </button>
                </DialogTrigger>
                <DialogContent className="citacitaku max-h-[86vh] max-w-[min(92vw,34rem)] overflow-hidden rounded-[28px] border-ink/10 bg-white p-0 text-ink dark:bg-white">
                  <DialogHeader className="border-b border-ink/10 px-5 py-5">
                    <DialogTitle className="font-display text-2xl font-bold text-ink">Pilih cita-citamu</DialogTitle>
                    <DialogDescription className="mt-2 text-sm leading-6 text-ink/55">Kamu juga tetap bisa ketik bebas kalau pilihanmu belum ada di daftar.</DialogDescription>
                  </DialogHeader>
                  <div className="max-h-[calc(86vh-9rem)] overflow-y-auto px-4 py-4">
                    <div className="grid gap-2">
                      {[...careers.map((career) => career.title), "Belum tahu"].map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            setForm((current) => ({ ...current, dream: option }));
                            setCareerPickerOpen(false);
                          }}
                          className={`focusable rounded-2xl border p-4 text-left transition hover:border-forest/30 hover:bg-mint/35 ${form.dream === option ? "border-forest bg-mint/60" : "border-ink/10 bg-[#fcfdfb]"}`}
                        >
                          <span className="block font-bold text-ink">{option}</span>
                          <span className="mt-1 block text-xs leading-5 text-ink/50">{option === "Belum tahu" ? "Mulai dari eksplorasi area minat dulu." : "Pilih ini sebagai target awal. Bisa diubah kapan saja."}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <p className="mt-2 text-xs leading-5 text-ink/45">Ketik bebas atau buka daftar pilihan—misalnya Marine Biologist, Game Designer, atau Food Technologist.</p>
          </div>

          <fieldset className="mt-7">
            <legend className="mb-3 font-display text-base font-bold"><span className="mr-2 text-forest">03</span>Sekarang kamu kelas berapa?</legend>
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              {(["10", "11", "12"] as Grade[]).map((grade) => (
                <button
                  key={grade}
                  type="button"
                  onClick={() => setForm({ ...form, grade })}
                  aria-pressed={form.grade === grade}
                  className={`focusable min-h-16 rounded-2xl border px-2 font-bold transition ${form.grade === grade ? "border-forest bg-mint text-forest shadow-sm" : "border-ink/15 bg-white text-ink/65 hover:border-forest/40 hover:bg-mint/25"}`}
                >
                  <span className="block text-xs font-medium opacity-60">Kelas</span>{grade}
                </button>
              ))}
            </div>
          </fieldset>

          <button type="submit" className="primary-button mt-8 w-full" disabled={loading || !form.name.trim() || !form.dream.trim() || !form.grade}>
            {loading ? <><span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Sedang menyiapkan panduan...</> : <>Lihat Jalan Menuju Cita-Citaku <Arrow /></>}
          </button>
          <p className="mt-4 text-center text-xs font-semibold tracking-wide text-ink/45">Gratis <span className="mx-2">•</span> Tanpa login <span className="mx-2">•</span> Untuk siswa SMA</p>
        </form>
      </section>

      <FeedbackSection />

      <footer className="border-t border-ink/10 bg-white/60 py-7">
        <div className="shell flex flex-col gap-2 text-sm text-ink/50 sm:flex-row sm:items-center sm:justify-between">
          <Brand />
          <p>Dibuat untuk membantu kamu memulai, satu langkah kecil pada satu waktu.</p>
        </div>
      </footer>
    </div>
  );
}

function RoadmapLoading() {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#f7fbff]/85 px-5 backdrop-blur-md" role="status" aria-live="polite">
      <div className="animate-rise w-full max-w-md rounded-[28px] border border-ink/10 bg-white p-6 text-center shadow-2xl shadow-ink/10 sm:p-8">
        <div className="mx-auto flex w-full max-w-xs items-center justify-between">
          {[0, 1, 2].map((item) => (
            <div key={item} className="flex items-center">
              <span className={`h-4 w-4 rounded-full bg-forest ${item === 1 ? "animate-ping" : "animate-pulse"}`} />
              {item < 2 && <span className="mx-2 h-1 w-20 overflow-hidden rounded-full bg-mint"><span className="roadmap-loader-bar block h-full rounded-full bg-forest" /></span>}
            </div>
          ))}
        </div>
        <p className="mt-6 font-display text-2xl font-bold text-ink">Menyiapkan roadmap...</p>
        <div className="mt-6 space-y-3 text-left">
          {[0, 1, 2].map((item) => (
            <div key={item} className="rounded-2xl border border-ink/10 bg-[#fcfdfb] p-4">
              <div className="h-3 w-28 animate-pulse rounded-full bg-mint" />
              <div className="mt-3 h-4 w-4/5 animate-pulse rounded-full bg-ink/10" />
              <div className="mt-2 h-3 w-3/5 animate-pulse rounded-full bg-ink/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Result({ data, guidance, notice, onReset }: { data: FormData & { grade: Grade }; guidance: AIGuidance | null; notice: string; onReset: () => void }) {
  const career = useMemo(() => matchCareer(data.dream), [data.dream]);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const unsure = isUnsure(data.dream);

  if (unsure) return <UnsureResult name={data.name} grade={data.grade} onReset={onReset} />;

  const target = guidance?.targetTitle ?? career?.title ?? data.dream;

  return (
    <div className="citacitaku min-h-screen pb-16 xl:pl-56">
      <ResultHeader onReset={onReset} />
      <ResultFloatingNav mobileOpen={mobileNavOpen} onToggle={() => setMobileNavOpen((open) => !open)} onNavigate={() => setMobileNavOpen(false)} />

      <div className="shell pt-6 sm:pt-10">
        <section className="animate-rise relative overflow-hidden rounded-[30px] bg-ink p-6 text-white shadow-card sm:p-10">
          <div aria-hidden="true" className="dot-grid absolute -right-10 -top-12 h-64 w-64 rounded-full opacity-25" />
          <div className="relative grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <p className="text-sm font-bold text-[#bae6fd]">Rencana masa depanmu</p>
                {guidance && (guidance.researched || !guidance.generated) && <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/70">{guidance.researched ? `Diriset dengan ${guidance.provider === "openai" ? "OpenAI Search" : "Google Search"}` : "Data lokal"}</span>}
              </div>
              <h1 className="max-w-3xl text-3xl font-bold leading-tight sm:text-5xl">Hai {data.name} <span aria-hidden="true">👋</span></h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-white/70 sm:text-lg">
                Kalau kamu ingin menjadi <strong className="text-white">{target}</strong>, ini beberapa jalan yang bisa kamu mulai dari <strong className="text-white">Kelas {data.grade}</strong>.
              </p>
              {guidance?.intro && <p className="mt-2 max-w-3xl text-sm leading-6 text-[#dbeafe]">{guidance.intro}</p>}
              <p className="mt-4 max-w-3xl rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-xs font-semibold leading-5 text-white/65">
                Disclaimer: panduan ini dibuat dengan bantuan AI sebagai titik awal eksplorasi. Informasi kampus, beasiswa, syarat, dan jadwal tetap perlu dicek kembali di sumber resmi.
              </p>
              {!career && (
                <div className="mt-5 max-w-2xl rounded-2xl border border-white/15 bg-white/10 p-4 text-sm leading-6 text-white/75">
                  {guidance?.researched
                    ? "Keren! Profesi ini belum ada di profil awal, jadi AI mencarikan konteks tambahan dari web. Lihat dan periksa sumber pencariannya di bawah."
                    : "Keren! Kami belum punya panduan khusus untuk profesi ini, jadi kami tidak akan menebak-nebak. Panduan di bawah membantumu mencari jalur yang tepat dari sumber tepercaya."}
                </div>
              )}
            </div>
            <div className="grid min-w-48 grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/10 p-3 text-sm backdrop-blur">
              <span className="text-white/55">Nama</span><strong className="text-right">{data.name}</strong>
              <span className="text-white/55">Sekarang</span><strong className="text-right">Kelas {data.grade}</strong>
              <span className="text-white/55">Target</span><strong className="text-right">{target}</strong>
            </div>
          </div>
        </section>

        {notice && <p className="mt-4 rounded-2xl border border-[#fb923c]/50 bg-cream px-4 py-3 text-sm font-semibold text-ink/65">{notice}</p>}

        <div className="mt-8 space-y-8 sm:mt-12 sm:space-y-12">
          <PathwaysSection career={career} guidance={guidance} target={target} grade={data.grade} />
          {guidance?.sources && guidance.sources.length > 0 && <ResearchSourcesSection guidance={guidance} />}
          <UniversitiesSection career={career} target={target} grade={data.grade} />
          <ScholarshipsSection career={career} target={target} grade={data.grade} />
          <RoadmapSection grade={data.grade} target={target} stages={guidance?.roadmap} />
          <SkillsSection career={career} generatedSkills={guidance?.skills} target={target} grade={data.grade} />
          <PortfolioSection career={career} target={target} grade={data.grade} generatedIdeas={guidance?.portfolioIdeas} />
          <CvSection career={career} target={target} grade={data.grade} generatedSuggestions={guidance?.cvSuggestions} />
          <ThisWeekSection career={career} target={target} grade={data.grade} generatedActions={guidance?.weeklyActions} />
        </div>

        <FeedbackSection contained context={{ dream: data.dream, grade: data.grade, page: "result" }} />
        <Disclaimer />
      </div>
    </div>
  );
}

function ResearchSourcesSection({ guidance }: { guidance: AIGuidance }) {
  return (
    <section className="section-card border-forest/20 bg-mint/20">
      <SectionHeading
        eyebrow="Sumber riset AI"
        title="Sumber untuk profesi spesifikmu"
        description="Tautan ini dikembalikan oleh alat pencarian provider, bukan dibuat dari ingatan model. Buka sumbernya sebelum mengambil keputusan penting."
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {guidance.sources.map((source, index) => (
          <a
            key={source.url}
            href={source.url}
            target="_blank"
            rel="noreferrer"
            className="focusable group flex items-start gap-3 rounded-2xl border border-ink/10 bg-white p-4 transition hover:-translate-y-0.5 hover:border-forest/30 hover:shadow-md"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-mint text-xs font-bold text-forest">{index + 1}</span>
            <span className="min-w-0">
              <span className="block font-bold leading-5 text-ink group-hover:text-forest">{source.title}</span>
              <span className="mt-1 block truncate text-xs text-ink/40">{source.url}</span>
            </span>
            <span aria-hidden="true" className="ml-auto text-forest">↗</span>
          </a>
        ))}
      </div>
    </section>
  );
}

function ResultHeader({ onReset }: { onReset: () => void }) {
  return (
    <header className="border-b border-ink/10 bg-white/70 backdrop-blur">
      <div className="shell flex min-h-16 items-center justify-between">
        <Brand />
        <button onClick={onReset} className="focusable flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-forest hover:bg-mint/50"><Arrow direction="left" /> Ulangi</button>
      </div>
    </header>
  );
}

function ResultFloatingNav({ mobileOpen, onToggle, onNavigate }: { mobileOpen: boolean; onToggle: () => void; onNavigate: () => void }) {
  return (
    <>
      <nav aria-label="Navigasi hasil" className="fixed bottom-0 left-0 top-0 z-30 hidden w-56 border-r border-ink/10 bg-white xl:block">
        <div className="flex min-h-full flex-col justify-center px-8 py-24">
          {navItems.map(([label, id]) => (
            <a key={id} href={`#${id}`} className="focusable block py-4 text-lg font-bold text-ink/55 transition hover:text-forest">
              {label}
            </a>
          ))}
        </div>
      </nav>

      <div className="fixed bottom-5 right-5 z-40 xl:hidden">
        {mobileOpen && (
          <nav aria-label="Navigasi hasil mobile" className="animate-rise mb-3 w-52 rounded-2xl border border-ink/10 bg-white/95 p-2 shadow-2xl shadow-ink/15 backdrop-blur-md">
            {navItems.map(([label, id]) => (
              <a key={id} href={`#${id}`} onClick={onNavigate} className="focusable block rounded-xl px-3.5 py-3 text-sm font-bold text-ink/70 transition hover:bg-mint hover:text-forest">
                {label}
              </a>
            ))}
          </nav>
        )}
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={mobileOpen}
          aria-label="Buka navigasi hasil"
          className="focusable ml-auto grid h-14 w-14 place-items-center rounded-2xl bg-ink text-white shadow-2xl shadow-ink/25 transition hover:-translate-y-0.5 hover:bg-forest"
        >
          <span className="grid gap-1.5">
            <span className={`block h-0.5 w-6 rounded-full bg-current transition ${mobileOpen ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`block h-0.5 w-6 rounded-full bg-current transition ${mobileOpen ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-6 rounded-full bg-current transition ${mobileOpen ? "-translate-y-2 -rotate-45" : ""}`} />
          </span>
        </button>
      </div>
    </>
  );
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="mb-6 max-w-3xl">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="section-title">{title}</h2>
      {description && <p className="mt-3 leading-7 text-ink/60">{description}</p>}
    </div>
  );
}

function DetailButton({ target, grade, section, title, summary, bullets = [] }: { target: string; grade?: Grade; section: string; title: string; summary: string; bullets?: string[] }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [detail, setDetail] = useState<DetailResponse | null>(null);
  const [error, setError] = useState("");

  async function requestDetail() {
    if (status === "loading" || detail) return;
    setStatus("loading");
    setError("");

    try {
      const response = await fetch("/api/citacitaku/detail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target, grade, section, title, summary, bullets }),
      });
      const payload = await response.json() as { detail?: DetailResponse; error?: string };
      if (!response.ok || !payload.detail) throw new Error(payload.error || "Detail belum bisa dibuat.");
      setDetail(payload.detail);
      setStatus("ready");
    } catch (detailError) {
      setError(detailError instanceof Error ? detailError.message : "Detail belum bisa dibuat.");
      setStatus("error");
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) void requestDetail();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button type="button" className="focusable mt-4 inline-flex min-h-10 items-center justify-center rounded-xl bg-mint px-4 py-2 text-sm font-bold text-forest transition hover:bg-forest hover:text-white">
          Minta lebih detail
        </button>
      </DialogTrigger>
      <DialogContent className="citacitaku max-h-[88vh] max-w-[min(92vw,54rem)] overflow-hidden rounded-[28px] border-ink/10 bg-white p-0 text-ink dark:bg-white">
        <DialogHeader className="border-b border-ink/10 px-5 py-5 sm:px-7">
          <p className="eyebrow mb-2">{section}</p>
          <DialogTitle className="font-display text-2xl font-bold leading-tight text-ink sm:text-3xl">{title}</DialogTitle>
          <DialogDescription className="mt-2 text-sm leading-6 text-ink/55">Hasil AI untuk memperdalam poin ini. Tetap verifikasi informasi penting dari sumber resmi.</DialogDescription>
        </DialogHeader>
        <div className="max-h-[calc(88vh-10rem)] overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          {status === "loading" && (
            <div className="rounded-2xl bg-mint/35 p-5 text-sm font-semibold text-forest">AI sedang menyiapkan penjelasan detail...</div>
          )}
          {status === "error" && (
            <div className="rounded-2xl border border-coral/30 bg-cream p-5 text-sm font-semibold text-coral">{error}</div>
          )}
          {status === "ready" && detail && <DetailResult detail={detail} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailResult({ detail }: { detail: DetailResponse }) {
  return (
    <div className="space-y-5 text-sm leading-6 text-ink/65">
      <div className="rounded-2xl bg-mint/35 p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-forest">Inti poin</p>
        <p className="mt-2 text-base font-semibold leading-7 text-ink">{detail.overview}</p>
        <p className="mt-3 leading-6 text-ink/60">{detail.whyItMatters}</p>
      </div>

      <section>
        <h3 className="font-display text-xl font-bold text-ink">Langkah konkret</h3>
        <ol className="mt-3 grid gap-3">
          {detail.steps.map((step, index) => (
            <li key={`${step.title}-${index}`} className="rounded-2xl border border-ink/10 bg-[#fcfdfb] p-4">
              <div className="flex gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink text-xs font-bold text-white">{index + 1}</span>
                <div>
                  <p className="font-bold text-ink">{step.title}</p>
                  <p className="mt-1 text-ink/60">{step.description}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-ink/10 p-4">
          <h3 className="font-display text-lg font-bold text-ink">Checklist</h3>
          <ul className="mt-3 space-y-2.5">
            {detail.checklist.map((item) => (
              <li key={item} className="flex gap-2"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border border-forest/30 text-[10px] font-bold text-forest">✓</span><span>{item}</span></li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-ink/10 p-4">
          <h3 className="font-display text-lg font-bold text-ink">Yang perlu dicek</h3>
          <ul className="mt-3 space-y-2.5">
            {detail.verificationNotes.map((item) => (
              <li key={item} className="flex gap-2"><span className="text-coral">!</span><span>{item}</span></li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-2xl bg-cream p-4">
        <h3 className="font-display text-lg font-bold text-ink">Contoh hasil</h3>
        <p className="mt-2 text-ink/65">{detail.exampleOutput}</p>
      </section>

      <section className="rounded-2xl bg-ink p-4 text-white">
        <p className="text-xs font-bold uppercase tracking-wider text-[#bae6fd]">Mulai dari sini</p>
        <p className="mt-2 font-semibold leading-6 text-white/85">{detail.firstStep}</p>
      </section>
    </div>
  );
}

function PathwaysSection({ career, guidance, target, grade }: { career: Career | null; guidance: AIGuidance | null; target: string; grade: Grade }) {
  const paths = guidance?.pathways ?? career?.pathways ?? genericPathways;
  const majors = guidance?.possibleMajors ?? career?.possibleMajors;
  return (
    <section id="jalur" className="section-card">
      <SectionHeading eyebrow="01 · Pilihan jalan" title="Beberapa jalan yang bisa kamu pilih" description={guidance?.careerDescription ?? career?.description ?? "Mulai dengan memahami profesinya, lalu petakan beberapa jalur sebelum memutuskan."} />
      {majors && (
        <div className="mb-6 rounded-2xl bg-mint/45 p-4">
          <p className="mb-2 text-sm font-bold text-forest">Jurusan yang bisa dipelajari</p>
          <div className="flex flex-wrap gap-2">{majors.map((major) => <span key={major} className="tag bg-white">{major}</span>)}</div>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {paths.map((path, index) => (
          <article key={path.title} className="rounded-2xl border border-ink/10 bg-[#fcfdfb] p-5 transition hover:-translate-y-0.5 hover:border-forest/25 hover:shadow-md">
            <div className="mb-4 flex items-center gap-3"><span className="text-2xl">{path.icon}</span><p className="text-xs font-bold uppercase tracking-wider text-forest">Jalur {index + 1}</p></div>
            <h3 className="text-xl font-bold">{path.title}</h3>
            <p className="mt-2 text-sm leading-6 text-ink/60">{path.description}</p>
            <p className="mt-5 text-xs font-bold uppercase tracking-wider text-ink/45">Yang perlu dipersiapkan</p>
            <ul className="mt-3 grid gap-2 text-sm text-ink/70 sm:grid-cols-2">
              {path.preparation.map((item) => <li key={item} className="flex gap-2"><span className="text-forest">✓</span>{item}</li>)}
            </ul>
            <DetailButton
              target={target}
              grade={grade}
              section="Jalur"
              title={path.title}
              summary={path.description}
              bullets={path.preparation}
            />
          </article>
        ))}
      </div>
      <p className="mt-5 rounded-2xl bg-cream px-4 py-3 text-sm leading-6 text-ink/65"><strong>Ada banyak jalan menuju masa depanmu.</strong> Persyaratan berbeda pada setiap universitas. Selalu cek website resmi universitas.</p>
    </section>
  );
}

function UniversitiesSection({ career, target, grade }: { career: Career | null; target: string; grade: Grade }) {
  if (!career) return <UnknownUniversities target={target} grade={grade} />;
  const indonesiaUniversities = sortUniversitiesByRelevantQs(career.indonesiaUniversities, career.id);
  const overseasUniversities = ensureRequiredRegionalUniversities(career.overseasUniversities, career.id);

  return (
    <section id="kampus" className="section-card">
      <SectionHeading eyebrow="02 · Kampus" title="Kampus yang bisa kamu pertimbangkan" description="Ini titik awal untuk riset, bukan peringkat atau prediksi peluang masuk. Bandingkan kurikulum dan kecocokanmu." />
      <StudyRegionComparison />
      <div className="grid gap-3 md:grid-cols-2">
        <RegionDialogButton
          label="🇮🇩 Dalam Negeri"
          description={`${indonesiaUniversities.length} pilihan kampus Indonesia untuk mulai dibandingkan.`}
          dialogTitle="🇮🇩 Kampus Dalam Negeri"
          dialogDescription="Bandingkan jurusan, kurikulum, biaya, lokasi, dan jalur seleksi dari website resmi tiap kampus."
        >
          <UniversityGroup universities={indonesiaUniversities} careerId={career.id} target={target} grade={grade} />
        </RegionDialogButton>
        <RegionDialogButton
          label="🌍 Luar Negeri"
          description={`${overseasUniversities.length} pilihan kampus luar negeri untuk riset awal.`}
          dialogTitle="🌍 Kampus Luar Negeri"
          dialogDescription="Gunakan daftar ini sebagai awal riset, lalu cek persyaratan akademik, bahasa, visa, biaya, dan beasiswa di sumber resmi."
        >
          <UniversityGroup universities={overseasUniversities} overseas careerId={career.id} target={target} grade={grade} />
        </RegionDialogButton>
      </div>
    </section>
  );
}

function StudyRegionComparison() {
  return (
    <div className="mb-8 rounded-2xl border border-forest/15 bg-mint/35 p-5">
      <h3 className="text-lg font-bold">Saat riset kuliah luar negeri, selalu bandingkan kawasan ini</h3>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {studyRegionSuggestions.map((item) => (
          <article key={item.region} className="rounded-2xl bg-white/80 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-bold text-forest">{item.region}</h4>
              <span className="text-xs font-semibold text-ink/45">{item.examples}</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-ink/60">{item.note}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

function RegionDialogButton({ label, description, dialogTitle, dialogDescription, children }: { label: string; description: string; dialogTitle: string; dialogDescription: string; children: ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className="focusable group flex min-h-36 w-full items-center justify-between rounded-2xl border border-ink/10 bg-[#fcfdfb] p-5 text-left transition hover:-translate-y-0.5 hover:border-forest/30 hover:bg-mint/30 hover:shadow-md">
          <span>
            <span className="block font-display text-2xl font-bold text-ink">{label}</span>
            <span className="mt-2 block text-sm leading-6 text-ink/55">{description}</span>
          </span>
          <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-mint text-xl font-bold text-forest transition group-hover:bg-forest group-hover:text-white">→</span>
        </button>
      </DialogTrigger>
      <DialogContent className="citacitaku max-h-[88vh] max-w-[min(92vw,70rem)] overflow-hidden rounded-[28px] border-ink/10 bg-white p-0 text-ink dark:bg-white">
        <DialogHeader className="border-b border-ink/10 px-5 py-5 sm:px-7">
          <DialogTitle className="font-display text-2xl font-bold text-ink sm:text-3xl">{dialogTitle}</DialogTitle>
          <DialogDescription className="mt-2 max-w-3xl text-sm leading-6 text-ink/55">{dialogDescription}</DialogDescription>
        </DialogHeader>
        <div className="max-h-[calc(88vh-9rem)] overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function UniversityGroup({ universities, overseas = false, careerId = "", target, grade }: { universities: University[]; overseas?: boolean; careerId?: string; target: string; grade: Grade }) {
  return (
    <div>
      <div className="grid gap-3 md:grid-cols-2">
        {universities.map((university) => {
          const rank = qsRankLabel(university, careerId);
          return (
            <article key={university.name} className="rounded-2xl border border-ink/10 p-5">
              <div className="flex items-start justify-between gap-3">
                <div><h4 className="font-display text-lg font-bold">{university.name}</h4>{overseas && <p className="mt-1 text-xs font-bold text-forest">{university.country}</p>}</div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  {rank && <span className="rounded-full bg-mint px-2.5 py-1 text-[10px] font-bold text-forest">{rank}</span>}
                  {university.competitiveLevel && <span className="rounded-full bg-cream px-2.5 py-1 text-[10px] font-bold text-ink/60">{university.competitiveLevel}</span>}
                </div>
              </div>
              <p className="mt-3 text-sm font-semibold text-ink/75">{university.majors.join(" · ")}</p>
              <p className="mt-2 text-sm leading-6 text-ink/55">{university.note}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">{university.tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}</div>
              <DetailButton
                target={target}
                grade={grade}
                section={overseas ? "Kampus luar negeri" : "Kampus dalam negeri"}
                title={university.name}
                summary={`${university.note} Program terkait: ${university.majors.join(", ")}.`}
                bullets={[university.country, ...university.tags, university.competitiveLevel ?? "", qsRankLabel(university, careerId) ?? ""].filter(Boolean)}
              />
            </article>
          );
        })}
      </div>
    </div>
  );
}

function UnknownUniversities({ target, grade }: { target: string; grade: Grade }) {
  const steps = [
    ["Cari kata kunci jurusan", `Telusuri “jurusan untuk menjadi ${target}” lalu cocokkan dari beberapa sumber.`],
    ["Buat shortlist Indonesia", "Pilih 4–6 kampus dan baca kurikulum pada website fakultas masing-masing."],
    ["Buat shortlist luar negeri", "Wajib bandingkan US, Australia, Asia, UK, dan Europe dari sumber resmi."],
    ["Tanya orang yang menjalani", "Hubungi mahasiswa, alumni, atau asosiasi profesi untuk menguji hasil risetmu."],
  ];
  return (
    <section id="kampus" className="section-card">
      <SectionHeading eyebrow="02 · Kampus" title="Cara menemukan kampus yang tepat" description={`Kami belum punya data kampus khusus untuk ${target}. Gunakan checklist ini agar kamu tidak mendapat rekomendasi yang dibuat-buat.`} />
      <StudyRegionComparison />
      <div className="grid gap-3 md:grid-cols-2">{steps.map(([title, text], index) => <article key={title} className="rounded-2xl border border-ink/10 p-5"><span className="tag">Langkah {index + 1}</span><h3 className="mt-3 text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-ink/60">{text}</p><DetailButton target={target} grade={grade} section="Riset kampus" title={title} summary={text} /></article>)}</div>
    </section>
  );
}

function ScholarshipsSection({ career, target, grade }: { career: Career | null; target: string; grade: Grade }) {
  const scholarships = career?.scholarships ?? allScholarships;
  const indonesiaScholarships = scholarships.filter((item) => item.country === "Indonesia");
  const overseasScholarships = scholarships.filter((item) => item.country !== "Indonesia");

  return (
    <section id="beasiswa" className="section-card">
      <SectionHeading eyebrow="03 · Dukungan biaya" title="Beasiswa yang bisa kamu cari" description="Mulai dari nama programnya, lalu baca kembali ketentuan tahun pendaftaranmu di sumber resmi." />
      <div className="grid gap-3 md:grid-cols-2">
        <RegionDialogButton
          label="🇮🇩 Dalam Negeri"
          description={`${indonesiaScholarships.length} opsi beasiswa Indonesia untuk kamu cek lebih lanjut.`}
          dialogTitle="🇮🇩 Beasiswa Dalam Negeri"
          dialogDescription="Mulai dari nama programnya, lalu cek ulang jadwal, sasaran penerima, dan dokumen wajib di website resmi."
        >
          <ScholarshipGroup scholarships={indonesiaScholarships} target={target} grade={grade} />
        </RegionDialogButton>
        <RegionDialogButton
          label="🌍 Luar Negeri"
          description={`${overseasScholarships.length} opsi funding luar negeri untuk riset awal.`}
          dialogTitle="🌍 Beasiswa Luar Negeri"
          dialogDescription="Bandingkan negara, kampus, cakupan biaya, persyaratan bahasa, dan deadline dari sumber resmi tiap program."
        >
          <ScholarshipGroup scholarships={overseasScholarships} target={target} grade={grade} />
        </RegionDialogButton>
      </div>
      <p className="mt-5 text-sm font-semibold text-coral">Periksa informasi terbaru di website resmi.</p>
    </section>
  );
}

function ScholarshipGroup({ scholarships, target, grade }: { scholarships: Scholarship[]; target: string; grade: Grade }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {scholarships.map((item) => (
        <article key={item.name} className="flex flex-col rounded-2xl border border-ink/10 p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-forest">{item.country} · {item.studyLevel}</p>
          <h4 className="mt-2 text-lg font-bold">{item.name}</h4>
          <p className="mt-2 text-sm font-semibold text-ink/70">{item.coverage}</p>
          <p className="mt-2 flex-1 text-sm leading-6 text-ink/55">{item.shortDescription}</p>
          <a href={item.officialSource} target="_blank" rel="noreferrer" className="focusable mt-4 inline-flex items-center gap-1.5 self-start rounded-lg text-sm font-bold text-forest hover:underline">Sumber resmi <span aria-hidden="true">↗</span></a>
          <p className="mt-2 text-[10px] text-ink/35">Terakhir diverifikasi: {item.lastVerified}</p>
          <DetailButton
            target={target}
            grade={grade}
            section={item.country === "Indonesia" ? "Beasiswa dalam negeri" : "Beasiswa luar negeri"}
            title={item.name}
            summary={`${item.coverage}. ${item.shortDescription}`}
            bullets={[item.country, item.studyLevel, item.officialSource]}
          />
        </article>
      ))}
    </div>
  );
}

function roadmapFor(grade: Grade, target: string): GuidanceRoadmapStage[] {
  if (grade === "10") return [
    { title: "Sekarang — Kelas 10", subtitle: "Kenali arah dan bangun fondasi", actions: [`Pelajari aktivitas sehari-hari seorang ${target}`, "Perkuat pelajaran dasar yang relevan", "Tingkatkan bahasa Inggris sedikit demi sedikit", "Pilih 1–2 kegiatan yang benar-benar kamu minati", "Mulai satu proyek kecil"] },
    { title: "Kelas 11", subtitle: "Buat pengalamanmu lebih dalam", actions: ["Kembangkan portfolio", "Ambil peran dalam organisasi atau kompetisi", "Riset jurusan dan kampus", "Mulai daftar beasiswa potensial", "Pelajari kebutuhan IELTS/TOEFL bila ingin ke luar negeri"] },
    { title: "Kelas 12", subtitle: "Siapkan dan kirim pendaftaran", actions: ["Susun strategi SNBP/SNBT dan seleksi lain", "Rapikan CV dan portfolio", "Tulis esai dengan jujur", "Minta rekomendasi lebih awal", "Pantau pendaftaran kampus dan beasiswa"] },
  ];
  if (grade === "11") return [
    { title: "Yang bisa kamu lakukan sekarang", subtitle: "Mulai dari posisi kamu hari ini", actions: [`Kenali jalur menuju ${target}`, "Pilih 2–3 jurusan untuk dibandingkan", "Mulai satu proyek portfolio", "Bangun kebiasaan belajar dan bahasa Inggris"] },
    { title: "6–12 bulan ke depan", subtitle: "Kumpulkan bukti minat dan kemampuan", actions: ["Ikuti kegiatan secara konsisten", "Ambil tanggung jawab kecil", "Buat shortlist kampus", "Riset beasiswa dan persyaratan bahasa", "Mulai draft CV"] },
    { title: "Menjelang pendaftaran kuliah", subtitle: "Ubah riset menjadi rencana", actions: ["Susun kalender pendaftaran", "Siapkan SNBP/SNBT atau tes relevan", "Rapikan portfolio dan esai", "Hubungi pemberi rekomendasi", "Cek ulang semua sumber resmi"] },
  ];
  return [
    { title: "Bulan ini", subtitle: "Masih ada hal yang bisa kamu mulai sekarang", actions: ["Tentukan 3–5 opsi realistis", "Catat semua tenggat pada kalender", "Cek syarat tiap jalur", "Mulai berkas CV dan portfolio"] },
    { title: "3 bulan ke depan", subtitle: "Kerjakan yang paling menentukan", actions: ["Fokus persiapan tes yang relevan", "Selesaikan esai dan minta masukan", "Minta surat rekomendasi", "Kirim aplikasi sebelum tenggat"] },
    { title: "Sebelum pendaftaran", subtitle: "Periksa, jangan panik", actions: ["Cocokkan dokumen dengan checklist resmi", "Pastikan nama dan data konsisten", "Siapkan opsi utama dan cadangan", "Simpan bukti pendaftaran"] },
    { title: "Setelah mendapat offer / hasil seleksi", subtitle: "Bandingkan dengan kepala dingin", actions: ["Baca semua ketentuan", "Bandingkan biaya total dan bantuan", "Cek jadwal daftar ulang", "Minta bantuan orang dewasa tepercaya sebelum membayar"] },
  ];
}

function RoadmapSection({ grade, target, stages }: { grade: Grade; target: string; stages?: GuidanceRoadmapStage[] }) {
  const roadmap = stages ?? roadmapFor(grade, target);
  return (
    <section id="roadmap" className="section-card overflow-hidden">
      <SectionHeading eyebrow="04 · Roadmap" title="Roadmap kamu mulai sekarang" description={grade === "12" ? "Kamu tidak terlambat. Fokus pada hal yang paling dekat dan paling bisa kamu kendalikan." : "Tidak perlu mengerjakan semuanya sekaligus. Gunakan ini sebagai arah, lalu ambil satu langkah kecil."} />
      <div className="relative grid gap-4 md:grid-cols-3">
        {roadmap.map((stage, index) => (
          <article key={stage.title} className={`relative rounded-2xl p-5 ${index === 0 ? "bg-ink text-white" : "border border-ink/10 bg-[#fcfdfb]"}`}>
            <span className={`grid h-8 w-8 place-items-center rounded-full text-sm font-bold ${index === 0 ? "bg-mint text-forest" : "bg-mint text-forest"}`}>{index + 1}</span>
            <h3 className="mt-4 text-lg font-bold">{stage.title}</h3>
            <p className={`mt-1 text-xs font-semibold ${index === 0 ? "text-white/55" : "text-forest"}`}>{stage.subtitle}</p>
            <ul className={`mt-4 space-y-2.5 text-sm leading-5 ${index === 0 ? "text-white/75" : "text-ink/65"}`}>{stage.actions.map((action) => <li key={action} className="flex gap-2"><span className={index === 0 ? "text-[#bae6fd]" : "text-forest"}>✓</span>{action}</li>)}</ul>
            <DetailButton target={target} grade={grade} section="Roadmap" title={stage.title} summary={stage.subtitle} bullets={stage.actions} />
          </article>
        ))}
      </div>
    </section>
  );
}

function SkillsSection({ career, generatedSkills, target, grade }: { career: Career | null; generatedSkills?: Skill[]; target: string; grade: Grade }) {
  const skills = generatedSkills ?? career?.skills ?? genericSkills;
  return (
    <section id="skills" className="section-card">
      <SectionHeading eyebrow="05 · Skills" title="Skill yang perlu kamu bangun" description="Pilih satu dulu. Skill tumbuh karena latihan kecil yang diulang, bukan karena belajar semuanya dalam sehari." />
      <div className="grid gap-6 lg:grid-cols-2">
        {(["Hard Skill", "Soft Skill"] as const).map((kind) => (
          <div key={kind}>
            <h3 className="mb-3 text-lg font-bold">{kind === "Hard Skill" ? "🧰" : "🤝"} {kind}</h3>
            <div className="space-y-3">
              {skills.filter((skill) => skill.kind === kind).map((skill) => (
                <article key={skill.name} className="rounded-2xl border border-ink/10 p-5">
                  <h4 className="font-bold">{skill.name}</h4>
                  <p className="mt-1 text-sm leading-6 text-ink/55">{skill.why}</p>
                  <div className="mt-3 rounded-xl bg-mint/40 p-3 text-sm leading-5 text-ink/70"><strong className="text-forest">Mulai minggu ini:</strong> {skill.activity}</div>
                  <DetailButton
                    target={target}
                    grade={grade}
                    section={skill.kind}
                    title={skill.name}
                    summary={skill.why}
                    bullets={[skill.activity]}
                  />
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PortfolioSection({ career, target, grade, generatedIdeas }: { career: Career | null; target: string; grade: Grade; generatedIdeas?: string[] }) {
  const ideas = generatedIdeas ?? career?.portfolioIdeas ?? genericPortfolio;
  return (
    <section id="portfolio" className="section-card">
      <SectionHeading eyebrow="06 · Bukti karya" title="Portfolio yang bisa kamu mulai dari SMA" description={`Portfolio untuk ${target} tidak harus terlihat profesional. Yang penting menunjukkan proses, rasa ingin tahu, dan apa yang kamu pelajari.`} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ideas.map((idea, index) => <article key={idea} className="rounded-2xl border border-ink/10 bg-[#fcfdfb] p-5"><span className="font-display text-3xl font-bold text-forest/25">0{index + 1}</span><h3 className="mt-3 font-bold leading-6">{idea}</h3><p className="mt-2 text-sm leading-6 text-ink/50">Mulai kecil, simpan prosesnya, lalu catat apa yang ingin kamu perbaiki.</p><DetailButton target={target} grade={grade} section="Portfolio" title={idea} summary="Mulai kecil, simpan prosesnya, lalu catat apa yang ingin kamu perbaiki." /></article>)}
      </div>
    </section>
  );
}

function CvSection({ career, target, grade, generatedSuggestions }: { career: Career | null; target: string; grade: Grade; generatedSuggestions?: string[] }) {
  const cvSections = ["Nama dan kontak", "Pendidikan", "Prestasi Akademik", "Organisasi & Leadership", "Volunteer / Community Service", "Projects", "Competitions", "Skills", "Languages", "Certifications / Courses"];
  const targets = generatedSuggestions ?? career?.cvSuggestions ?? ["2 proyek bermakna", "1–2 kegiatan yang diikuti konsisten", "1 pengalaman memegang tanggung jawab", "Pengalaman komunitas atau volunteer", "Skill yang relevan"];
  return (
    <section id="cv" className="section-card">
      <SectionHeading eyebrow="07 · Ceritamu" title="CV kamu nanti harus berisi apa?" description="CV pelajar adalah ringkasan perjalanan belajar—bukan daftar hal yang dibuat terdengar hebat." />
      <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
        <div className="rounded-2xl border border-ink/10 bg-[#fcfdfb] p-5 sm:p-6">
          <p className="mb-4 text-xs font-bold uppercase tracking-wider text-forest">Struktur CV siswa SMA</p>
          <ol className="grid gap-2 sm:grid-cols-2">{cvSections.map((item, index) => <li key={item} className="flex items-center gap-3 rounded-xl bg-white px-3 py-2.5 text-sm font-semibold"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-mint text-[10px] font-bold text-forest">{index + 1}</span>{item}</li>)}</ol>
        </div>
        <div className="rounded-2xl bg-ink p-5 text-white sm:p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-[#bae6fd]">Contoh target sebelum lulus</p>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-white/75">{targets.map((item) => <li key={item} className="flex gap-2"><span className="text-[#bae6fd]">✓</span>{item}</li>)}</ul>
          <p className="mt-5 border-t border-white/10 pt-5 text-sm leading-6 text-white/65">Ini contoh, bukan syarat wajib. Jangan pernah mengarang pencapaian hanya agar CV terlihat penuh.</p>
        </div>
      </div>
      <blockquote className="mt-6 rounded-2xl border-l-4 border-coral bg-cream p-5 font-display text-lg font-bold leading-7 text-ink/75">“CV yang baik bukan CV yang paling panjang. Yang penting adalah menunjukkan apa yang sudah kamu lakukan, pelajari, dan kontribusikan.”</blockquote>
    </section>
  );
}

function ThisWeekSection({ career, target, grade, generatedActions }: { career: Career | null; target: string; grade: Grade; generatedActions?: WeeklyAction[] }) {
  const [started, setStarted] = useState(false);
  const skill = career?.skills[0];
  const actions = generatedActions ?? [
    { title: "Cari tahu jurusan yang paling dekat", text: career ? `Luangkan 30 menit membandingkan ${career.possibleMajors.slice(0, 3).join(", ")}.` : `Cari tiga jurusan yang mungkin mengarah ke ${target}, lalu baca kurikulumnya.` },
    { title: "Mulai satu skill", text: skill ? skill.activity : "Selesaikan satu materi pengantar, lalu tulis tiga hal yang kamu pelajari." },
    { title: "Buat folder “Future Me”", text: "Simpan CV, sertifikat, proyek, riset kampus, dan riset beasiswamu di satu tempat." },
  ];
  return (
    <section className="relative overflow-hidden rounded-[30px] bg-[#fb923c] p-6 shadow-card sm:p-10">
      <div aria-hidden="true" className="dot-grid absolute -bottom-10 -right-10 h-60 w-60 opacity-35" />
      <div className="relative">
        <p className="eyebrow text-ink/60">08 · Mulai bergerak</p>
        <h2 className="section-title max-w-none lg:whitespace-nowrap">🎯 3 hal yang bisa kamu lakukan minggu ini</h2>
        <div className="mt-7 grid gap-3 md:grid-cols-3">
          {actions.map((action, index) => (
            <article key={action.title} className="rounded-2xl bg-white/85 p-5 backdrop-blur">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-sm font-bold text-white">{index + 1}</span>
              <h3 className="mt-4 font-bold">{action.title}</h3>
              <p className="mt-2 text-sm leading-6 text-ink/60">{action.text}</p>
              <DetailButton target={target} grade={grade} section="Aksi minggu ini" title={action.title} summary={action.text} />
            </article>
          ))}
        </div>
        <button onClick={() => setStarted(true)} className="primary-button relative mt-6" disabled={started}>{started ? "Langkah pertama sudah dipilih ✓" : "Mulai Langkah Pertamaku"}{!started && <Arrow />}</button>
        {started && <p role="status" className="relative mt-3 text-sm font-bold text-ink/65">Bagus. Mulai dari kartu nomor 1—30 menit saja sudah cukup untuk hari ini.</p>}
      </div>
    </section>
  );
}

function FeedbackSection({ contained = false, context }: { contained?: boolean; context?: { dream?: string; grade?: Grade; page?: string } }) {
  const [category, setCategory] = useState<FeedbackCategory>("feature");
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const [minimized, setMinimized] = useState(true);

  async function handleFeedbackSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanMessage = message.trim();
    if (cleanMessage.length < 5 || status === "sending") return;
    setStatus("sending");
    setError("");

    try {
      const response = await fetch("/api/citacitaku/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          message: cleanMessage,
          contact: contact.trim() || undefined,
          context,
        }),
      });
      const payload = await response.json() as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) throw new Error(payload.error || "Masukan belum bisa dikirim.");
      setMessage("");
      setContact("");
      setCategory("feature");
      setStatus("sent");
    } catch (feedbackError) {
      setStatus("error");
      setError(feedbackError instanceof Error ? feedbackError.message : "Masukan belum bisa dikirim.");
    }
  }

  const content = (
    <section className="mx-auto w-full max-w-3xl rounded-2xl border border-ink/10 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-forest">Feedback</p>
          <h2 className="mt-1 font-display text-xl font-bold text-ink">Punya ide fitur baru?</h2>
          {!minimized && <p className="mt-1 text-sm leading-6 text-ink/55">Tulis masukan singkat supaya Citacitaku bisa makin berguna.</p>}
        </div>
        <button
          type="button"
          onClick={() => setMinimized((value) => !value)}
          aria-expanded={!minimized}
          className="focusable inline-flex min-h-10 items-center justify-center rounded-xl bg-mint px-4 py-2 text-sm font-bold text-forest transition hover:bg-forest hover:text-white"
        >
          {minimized ? "Maximize" : "Minimize"}
        </button>
      </div>

      {!minimized && (
        <form onSubmit={handleFeedbackSubmit} className="mt-4 grid gap-3">
          <div>
            <label htmlFor="feedback-category" className="mb-1.5 block text-xs font-bold text-ink/70">Jenis masukan</label>
            <select
              id="feedback-category"
              value={category}
              onChange={(event) => setCategory(event.target.value as FeedbackCategory)}
              className="focusable min-h-11 w-full rounded-xl border border-ink/15 bg-[#fcfdfb] px-3 text-sm font-semibold text-ink"
            >
              <option value="feature">Fitur baru</option>
              <option value="career">Tambah data cita-cita/karier</option>
              <option value="bug">Ada yang error</option>
              <option value="other">Lainnya</option>
            </select>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-ink/70">Masukan</span>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="focusable min-h-24 w-full resize-y rounded-xl border border-ink/15 bg-[#fcfdfb] px-3 py-2.5 text-sm leading-6 text-ink placeholder:text-ink/35"
              placeholder="Contoh: Tambahkan fitur simpan hasil roadmap."
              maxLength={1000}
              required
            />
            <span className="mt-1 block text-right text-xs font-semibold text-ink/40">{message.length}/1000</span>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-ink/70">Kontak opsional</span>
            <input
              value={contact}
              onChange={(event) => setContact(event.target.value)}
              className="focusable min-h-11 w-full rounded-xl border border-ink/15 bg-[#fcfdfb] px-3 text-sm text-ink placeholder:text-ink/35"
              placeholder="Email atau Instagram"
              maxLength={120}
            />
          </label>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button type="submit" className="primary-button min-h-11 min-w-36 rounded-xl px-4 py-2 text-sm" disabled={status === "sending" || message.trim().length < 5}>
              {status === "sending" ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Mengirim...</> : "Kirim"}
            </button>
            {status === "sent" && <p role="status" className="text-sm font-bold text-forest">Terima kasih, masukannya sudah tercatat.</p>}
            {status === "error" && <p role="alert" className="text-sm font-bold text-coral">{error}</p>}
          </div>
        </form>
      )}
    </section>
  );

  if (contained) return <div className="mt-8 sm:mt-12">{content}</div>;
  return <section className="shell mt-8 mb-12 sm:mt-12 sm:mb-16">{content}</section>;
}

function Disclaimer() {
  return (
    <footer className="mt-8 rounded-2xl border border-ink/10 bg-white/60 p-5 text-xs leading-5 text-ink/50 sm:mt-12">
      <strong className="text-ink/70">Catatan penting:</strong> Informasi universitas, beasiswa, persyaratan, dan jadwal dapat berubah. Selalu verifikasi informasi terbaru melalui website resmi universitas atau penyedia beasiswa. Website ini adalah panduan edukasi, bukan portal penerimaan resmi atau kalkulator peluang masuk.
    </footer>
  );
}

function UnsureResult({ name, grade, onReset }: { name: string; grade: Grade; onReset: () => void }) {
  const [selected, setSelected] = useState<(typeof explorationAreas)[number] | null>(null);
  return (
    <div className="citacitaku min-h-screen pb-16">
      <ResultHeader onReset={onReset} />
      <div className="shell pt-8 sm:pt-14">
        <section className="animate-rise mx-auto max-w-5xl text-center">
          <span className="inline-flex rounded-full bg-mint px-4 py-2 text-sm font-bold text-forest">Hai {name} · Kelas {grade}</span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-tight sm:text-6xl">Tidak apa-apa kalau kamu <span className="text-forest">belum tahu.</span></h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-ink/60 sm:text-lg">Banyak orang menemukan arah setelah mencoba beberapa hal. Kamu tidak perlu memilih profesi hari ini—mulai dengan mengenali area yang membuatmu penasaran.</p>
        </section>

        <section className="section-card mx-auto mt-10 max-w-5xl">
          <SectionHeading eyebrow="Mulai eksplorasi" title="Area mana yang ingin kamu intip dulu?" description="Klik satu kartu. Ini bukan tes kepribadian dan tidak akan mengunci pilihanmu." />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {explorationAreas.map((area) => (
              <button key={area.title} onClick={() => setSelected(area)} aria-pressed={selected?.title === area.title} className={`focusable rounded-2xl border p-5 text-left transition hover:-translate-y-0.5 ${selected?.title === area.title ? "border-forest bg-mint/60 shadow-md" : "border-ink/10 bg-[#fcfdfb] hover:border-forest/30"}`}>
                <span className="text-3xl">{area.icon}</span><h3 className="mt-4 text-lg font-bold">{area.title}</h3><p className="mt-2 text-sm leading-6 text-ink/55">{area.description}</p>
              </button>
            ))}
          </div>
          {selected && (
            <div className="animate-rise mt-6 rounded-2xl bg-ink p-5 text-left text-white sm:p-6">
              <p className="text-sm font-bold text-[#bae6fd]">Eksperimen kecil untuk {selected.title}</p>
              <h3 className="mt-2 text-xl font-bold">Coba selama 7 hari, lalu lihat bagaimana rasanya.</h3>
              <ol className="mt-4 grid gap-3 text-sm text-white/70 sm:grid-cols-3"><li>1. Tonton satu pengantar profesi.</li><li>2. Buat satu proyek mini.</li><li>3. Catat: tertarik, netral, atau tidak cocok?</li></ol>
            </div>
          )}
        </section>

        <section className="mx-auto mt-8 max-w-5xl rounded-[28px] bg-cream p-6 sm:p-8">
          <h2 className="text-2xl font-bold">Tiga langkahmu minggu ini</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {["Pilih satu area di atas", "Coba satu aktivitas selama 30 menit", "Tulis apa yang kamu suka dan tidak suka"].map((item, index) => <div key={item} className="rounded-2xl bg-white p-4 text-sm font-semibold"><span className="mr-2 text-forest">0{index + 1}</span>{item}</div>)}
          </div>
        </section>
        <FeedbackSection contained context={{ grade, page: "unsure-result" }} />
        <Disclaimer />
      </div>
    </div>
  );
}
