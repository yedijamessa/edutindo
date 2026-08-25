import type { Career, Pathway, Skill } from "@/lib/citacitaku/careers";

export type GuidanceProvider = "openai" | "gemini" | "local";

export type GuidanceRoadmapStage = {
  title: string;
  subtitle: string;
  actions: string[];
};

export type WeeklyAction = {
  title: string;
  text: string;
};

export type ResearchSource = {
  title: string;
  url: string;
};

export type AIGuidance = {
  provider: GuidanceProvider;
  generated: boolean;
  researched: boolean;
  sources: ResearchSource[];
  targetTitle: string;
  careerDescription: string;
  intro: string;
  possibleMajors: string[];
  pathways: Pathway[];
  roadmap: GuidanceRoadmapStage[];
  skills: Skill[];
  portfolioIdeas: string[];
  cvSuggestions: string[];
  weeklyActions: WeeklyAction[];
};

const stringArray = (minItems: number, maxItems: number) => ({
  type: "array",
  items: { type: "string" },
  minItems,
  maxItems,
});

export const guidanceJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    targetTitle: { type: "string" },
    careerDescription: { type: "string" },
    intro: { type: "string" },
    possibleMajors: stringArray(1, 6),
    pathways: {
      type: "array",
      minItems: 4,
      maxItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          icon: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          preparation: stringArray(3, 6),
        },
        required: ["icon", "title", "description", "preparation"],
      },
    },
    roadmap: {
      type: "array",
      minItems: 3,
      maxItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          subtitle: { type: "string" },
          actions: stringArray(3, 6),
        },
        required: ["title", "subtitle", "actions"],
      },
    },
    skills: {
      type: "array",
      minItems: 4,
      maxItems: 7,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          name: { type: "string" },
          kind: { type: "string", enum: ["Hard Skill", "Soft Skill"] },
          why: { type: "string" },
          activity: { type: "string" },
        },
        required: ["name", "kind", "why", "activity"],
      },
    },
    portfolioIdeas: stringArray(4, 6),
    cvSuggestions: stringArray(4, 6),
    weeklyActions: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          text: { type: "string" },
        },
        required: ["title", "text"],
      },
    },
  },
  required: [
    "targetTitle",
    "careerDescription",
    "intro",
    "possibleMajors",
    "pathways",
    "roadmap",
    "skills",
    "portfolioIdeas",
    "cvSuggestions",
    "weeklyActions",
  ],
} as const;

const genericPathways: Pathway[] = [
  { icon: "🔎", title: "Kenali profesinya", description: "Cari tahu aktivitas sehari-hari, lingkungan kerja, dan dampak profesi ini.", preparation: ["Wawancara praktisi", "Video day-in-the-life", "Catat hal yang menarik", "Catat hal yang belum jelas"] },
  { icon: "🎓", title: "Petakan pendidikan formal", description: "Temukan jurusan dan kualifikasi yang benar-benar diperlukan sebelum memilih kampus.", preparation: ["Nama jurusan terkait", "Kualifikasi wajib", "Durasi belajar", "Syarat masuk"] },
  { icon: "🌏", title: "Bandingkan beberapa pilihan", description: "Cari opsi di Indonesia dan luar negeri dari sumber resmi, bukan hanya satu kampus impian.", preparation: ["US", "Australia", "Asia", "UK", "Europe"] },
  { icon: "🌱", title: "Coba dari skala kecil", description: "Mulai aktivitas yang membantumu menguji apakah bidang ini cocok untukmu.", preparation: ["Proyek mini", "Komunitas", "Kursus pengantar", "Jurnal refleksi"] },
];

const genericSkills: Skill[] = [
  { name: "Riset informasi", kind: "Hard Skill", why: "Membantu menemukan jalur pendidikan yang benar.", activity: "Cari tiga deskripsi pekerjaan tepercaya dan bandingkan." },
  { name: "Literasi digital", kind: "Hard Skill", why: "Membantu menilai sumber dan menyimpan temuan dengan rapi.", activity: "Buat dokumen berisi tautan resmi jurusan, kampus, dan beasiswa." },
  { name: "Komunikasi", kind: "Soft Skill", why: "Berguna di hampir semua bidang dan saat mencari mentor.", activity: "Susun lima pertanyaan untuk seseorang yang bekerja di bidang ini." },
  { name: "Bahasa Inggris", kind: "Soft Skill", why: "Membuka bahan belajar dan pilihan pendidikan lebih luas.", activity: "Cari satu video pengantar profesi dalam bahasa Inggris." },
];

export function localRoadmap(grade: "10" | "11" | "12", target: string): GuidanceRoadmapStage[] {
  if (grade === "10") return [
    { title: "Sekarang — Kelas 10", subtitle: "Kenali arah dan bangun fondasi", actions: [`Pelajari aktivitas sehari-hari seorang ${target}`, "Perkuat pelajaran dasar yang relevan", "Tingkatkan bahasa Inggris", "Mulai satu proyek kecil"] },
    { title: "Kelas 11", subtitle: "Buat pengalamanmu lebih dalam", actions: ["Kembangkan portfolio", "Ambil peran dalam organisasi atau kompetisi", "Riset jurusan dan kampus", "Mulai daftar beasiswa potensial"] },
    { title: "Kelas 12", subtitle: "Siapkan dan kirim pendaftaran", actions: ["Susun strategi seleksi", "Rapikan CV dan portfolio", "Tulis esai dengan jujur", "Pantau pendaftaran kampus dan beasiswa"] },
  ];
  if (grade === "11") return [
    { title: "Yang bisa kamu lakukan sekarang", subtitle: "Mulai dari posisi kamu hari ini", actions: [`Kenali jalur menuju ${target}`, "Pilih 2–3 jurusan untuk dibandingkan", "Mulai satu proyek portfolio", "Bangun kebiasaan belajar"] },
    { title: "6–12 bulan ke depan", subtitle: "Kumpulkan bukti minat dan kemampuan", actions: ["Ikuti kegiatan secara konsisten", "Ambil tanggung jawab kecil", "Buat shortlist kampus", "Mulai draft CV"] },
    { title: "Menjelang pendaftaran kuliah", subtitle: "Ubah riset menjadi rencana", actions: ["Susun kalender pendaftaran", "Siapkan tes yang relevan", "Rapikan portfolio dan esai", "Cek ulang semua sumber resmi"] },
  ];
  return [
    { title: "Bulan ini", subtitle: "Masih ada hal yang bisa kamu mulai sekarang", actions: ["Tentukan 3–5 opsi realistis", "Catat semua tenggat", "Cek syarat tiap jalur", "Mulai berkas CV dan portfolio"] },
    { title: "3 bulan ke depan", subtitle: "Kerjakan yang paling menentukan", actions: ["Fokus persiapan tes", "Selesaikan esai", "Minta surat rekomendasi", "Kirim aplikasi sebelum tenggat"] },
    { title: "Sebelum pendaftaran", subtitle: "Periksa, jangan panik", actions: ["Cocokkan dokumen dengan checklist", "Pastikan data konsisten", "Siapkan opsi cadangan", "Simpan bukti pendaftaran"] },
    { title: "Setelah mendapat hasil", subtitle: "Bandingkan dengan kepala dingin", actions: ["Baca semua ketentuan", "Bandingkan biaya total", "Cek jadwal daftar ulang", "Diskusikan dengan orang dewasa tepercaya"] },
  ];
}

export function buildLocalGuidance(
  dream: string,
  grade: "10" | "11" | "12",
  career: Career | null,
): AIGuidance {
  const target = career?.title ?? dream;
  const firstSkill = career?.skills[0];
  return {
    provider: "local",
    generated: false,
    researched: false,
    sources: [],
    targetTitle: target,
    careerDescription: career?.description ?? "Mulai dengan memahami profesinya, kualifikasi yang dibutuhkan, dan beberapa jalur pendidikan yang mungkin.",
    intro: `Ini beberapa jalan yang bisa kamu mulai dari Kelas ${grade}.`,
    possibleMajors: career?.possibleMajors ?? ["Cari jurusan yang relevan dari sumber resmi"],
    pathways: career?.pathways ?? genericPathways,
    roadmap: localRoadmap(grade, target),
    skills: career?.skills ?? genericSkills,
    portfolioIdeas: career?.portfolioIdeas ?? ["Riset profesi", "Proyek kecil", "Wawancara praktisi", "Kursus pengantar", "Dokumentasi kegiatan relevan"],
    cvSuggestions: career?.cvSuggestions ?? ["Proyek yang relevan", "Kegiatan konsisten", "Pengalaman tanggung jawab", "Kursus dan skill yang dikuasai"],
    weeklyActions: [
      { title: "Cari tahu jurusan yang paling dekat", text: career ? `Bandingkan ${career.possibleMajors.slice(0, 3).join(", ")}.` : `Cari tiga jurusan yang mungkin mengarah ke ${target}.` },
      { title: "Mulai satu skill", text: firstSkill?.activity ?? "Selesaikan satu materi pengantar dan tulis tiga hal yang dipelajari." },
      { title: "Buat folder “Future Me”", text: "Simpan CV, sertifikat, proyek, riset kampus, dan riset beasiswamu di satu tempat." },
    ],
  };
}

function isStringArray(value: unknown, minimum = 1): value is string[] {
  return Array.isArray(value) && value.length >= minimum && value.every((item) => typeof item === "string" && item.trim().length > 0);
}

export function isValidGuidance(value: unknown): value is Omit<AIGuidance, "provider" | "generated" | "researched" | "sources"> {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  const isObject = (candidate: unknown): candidate is Record<string, unknown> => Boolean(candidate) && typeof candidate === "object";
  const validPathway = (candidate: unknown) => isObject(candidate)
    && typeof candidate.icon === "string"
    && typeof candidate.title === "string"
    && typeof candidate.description === "string"
    && isStringArray(candidate.preparation, 3);
  const validStage = (candidate: unknown) => isObject(candidate)
    && typeof candidate.title === "string"
    && typeof candidate.subtitle === "string"
    && isStringArray(candidate.actions, 3);
  const validSkill = (candidate: unknown) => isObject(candidate)
    && typeof candidate.name === "string"
    && (candidate.kind === "Hard Skill" || candidate.kind === "Soft Skill")
    && typeof candidate.why === "string"
    && typeof candidate.activity === "string";
  const validWeeklyAction = (candidate: unknown) => isObject(candidate)
    && typeof candidate.title === "string"
    && typeof candidate.text === "string";
  if (!["targetTitle", "careerDescription", "intro"].every((key) => typeof item[key] === "string")) return false;
  if (!isStringArray(item.possibleMajors) || !isStringArray(item.portfolioIdeas, 4) || !isStringArray(item.cvSuggestions, 4)) return false;
  if (!Array.isArray(item.pathways) || item.pathways.length !== 4 || !item.pathways.every(validPathway)) return false;
  if (!Array.isArray(item.roadmap) || item.roadmap.length < 3 || item.roadmap.length > 4 || !item.roadmap.every(validStage)) return false;
  if (!Array.isArray(item.skills) || item.skills.length < 4 || !item.skills.every(validSkill)) return false;
  if (!item.skills.some((skill) => skill.kind === "Hard Skill") || !item.skills.some((skill) => skill.kind === "Soft Skill")) return false;
  if (!Array.isArray(item.weeklyActions) || item.weeklyActions.length !== 3 || !item.weeklyActions.every(validWeeklyAction)) return false;
  return true;
}
