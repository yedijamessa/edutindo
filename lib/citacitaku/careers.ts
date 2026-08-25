export type Scholarship = {
  name: string;
  country: string;
  studyLevel: string;
  coverage: string;
  shortDescription: string;
  officialSource: string;
  lastVerified: string;
};

export type University = {
  name: string;
  country: string;
  majors: string[];
  note: string;
  tags: string[];
  competitiveLevel?: "Very Competitive" | "Competitive" | "Explore";
};

export type StudyRegionSuggestion = {
  region: string;
  examples: string;
  note: string;
};

export type Skill = {
  name: string;
  kind: "Hard Skill" | "Soft Skill";
  why: string;
  activity: string;
};

export type Pathway = {
  icon: string;
  title: string;
  description: string;
  preparation: string[];
};

export type Career = {
  id: string;
  title: string;
  keywords: string[];
  description: string;
  possibleMajors: string[];
  indonesiaUniversities: University[];
  overseasUniversities: University[];
  scholarships: Scholarship[];
  skills: Skill[];
  portfolioIdeas: string[];
  pathways: Pathway[];
  cvSuggestions: string[];
};

const indonesiaScholarships: Scholarship[] = [
  {
    name: "KIP Kuliah",
    country: "Indonesia",
    studyLevel: "Sarjana / Diploma",
    coverage: "Bantuan pendidikan dan biaya hidup sesuai ketentuan program",
    shortDescription: "Dukungan bagi calon mahasiswa dengan keterbatasan ekonomi dan potensi akademik baik. Cek ketentuan tahun berjalan.",
    officialSource: "https://kip-kuliah.kemdiktisaintek.go.id/",
    lastVerified: "2026-08-19",
  },
  {
    name: "Beasiswa Unggulan",
    country: "Indonesia",
    studyLevel: "Sarjana (cek pembukaan tahun berjalan)",
    coverage: "Mengikuti panduan resmi periode pendaftaran",
    shortDescription: "Program pemerintah untuk pelajar berprestasi. Ketersediaan dan ketentuannya dapat berubah setiap tahun.",
    officialSource: "https://beasiswaunggulan.kemdikbud.go.id/",
    lastVerified: "2026-08-19",
  },
  {
    name: "Beasiswa mahasiswa baru universitas",
    country: "Indonesia",
    studyLevel: "Sarjana",
    coverage: "Berbeda di setiap universitas",
    shortDescription: "Sebagian kampus mengumumkan beasiswa mahasiswa baru melalui direktorat kemahasiswaannya. Cek status dan sasaran tiap program.",
    officialSource: "https://ditmawa.ugm.ac.id/category/beasiswa-mahasiswa-baru/",
    lastVerified: "2026-08-19",
  },
];

const overseasScholarships: Scholarship[] = [
  {
    name: "EducationUSA Financial Aid",
    country: "US",
    studyLevel: "Sarjana",
    coverage: "Parsial atau penuh, tergantung kampus dan program",
    shortDescription: "Gunakan database EducationUSA untuk mencari financial aid dan scholarship dari institusi resmi di Amerika Serikat.",
    officialSource: "https://educationusa.state.gov/financial-aid",
    lastVerified: "2026-08-22",
  },
  {
    name: "Study UK scholarships and funding",
    country: "UK",
    studyLevel: "Sarjana / pascasarjana",
    coverage: "Berbeda menurut universitas, program, dan penyandang dana",
    shortDescription: "Portal Study UK menjelaskan opsi funding untuk mahasiswa internasional, termasuk scholarship universitas dan pihak ketiga.",
    officialSource: "https://study-uk.britishcouncil.org/scholarships-funding",
    lastVerified: "2026-08-22",
  },
  {
    name: "Study in Europe scholarships and funding",
    country: "Eropa",
    studyLevel: "Sarjana / pascasarjana",
    coverage: "Berbeda menurut negara, universitas, dan skema pendanaan",
    shortDescription: "Portal European Education Area merangkum tempat mencari scholarship dan funding untuk studi di negara-negara Eropa.",
    officialSource: "https://education.ec.europa.eu/study-in-europe/planning-your-studies/scholarships-and-funding",
    lastVerified: "2026-08-22",
  },
  {
    name: "MEXT Undergraduate Scholarship",
    country: "Asia (Jepang)",
    studyLevel: "Sarjana",
    coverage: "Mengikuti pedoman resmi MEXT pada tahun pendaftaran",
    shortDescription: "Beasiswa pemerintah Jepang dengan jalur pendaftaran yang dijelaskan di portal resmi Study in Japan.",
    officialSource: "https://www.studyinjapan.go.jp/en/planning/scholarships/mext-scholarships/",
    lastVerified: "2026-08-19",
  },
  {
    name: "Global Korea Scholarship (GKS-U)",
    country: "Asia (Korea Selatan)",
    studyLevel: "Sarjana",
    coverage: "Mengikuti pedoman resmi GKS periode berjalan",
    shortDescription: "Program beasiswa pemerintah Korea untuk studi sarjana internasional. Selalu cek daftar kampus dan jurusan terbaru.",
    officialSource: "https://www.studyinkorea.go.kr/en/plan/scholarship.do?tab=gks-tab4",
    lastVerified: "2026-08-19",
  },
  {
    name: "Study Australia scholarships",
    country: "Australia",
    studyLevel: "Sarjana",
    coverage: "Berbeda menurut pemerintah, education provider, dan organisasi pemberi dana",
    shortDescription: "Study Australia merangkum scholarship, grant, dan bursary untuk mahasiswa internasional di Australia.",
    officialSource: "https://www.studyaustralia.gov.au/en/plan-your-studies/scholarships",
    lastVerified: "2026-08-22",
  },
];

export const ukAdmissionsNote = "Untuk UK, jalurnya tidak selalu harus lulus SMA lalu foundation. Bandingkan A-Level, IB Diploma, BTEC International Level 3, foundation tertentu yang dapat menerima kelas 11, International Year One, atau direct entry yang sangat tergantung universitas dan jurusan.";

export const studyRegionSuggestions: StudyRegionSuggestion[] = [
  {
    region: "US",
    examples: "Amerika Serikat",
    note: "Cari kampus yang kuat di bidang target, lalu cek requirement, AP/SAT/English test bila diminta, scholarship, dan total biaya.",
  },
  {
    region: "Australia",
    examples: "Australia",
    note: "Bandingkan bachelor, diploma/pathway, foundation, dan struktur professional accreditation untuk bidang teregulasi.",
  },
  {
    region: "Asia",
    examples: "Jepang, China, Korea, Singapore, Taiwan, Hong Kong",
    note: "Cek bahasa pengantar, beasiswa pemerintah/universitas, serta apakah programnya English-taught atau butuh bahasa lokal.",
  },
  {
    region: "UK",
    examples: "England, Scotland, Wales, Northern Ireland",
    note: ukAdmissionsNote,
  },
  {
    region: "Europe",
    examples: "Belanda, Jerman, Finlandia, Prancis, Italia, Irlandia",
    note: "Cari program English-taught, cek tuition untuk non-EU, residence permit, dan kesesuaian kurikulum dengan tujuan karier.",
  },
];

const local = (name: string, majors: string[], note: string, tags: string[]): University => ({
  name,
  country: "Indonesia",
  majors,
  note,
  tags,
});

const abroad = (
  name: string,
  country: string,
  majors: string[],
  note: string,
  competitiveLevel: University["competitiveLevel"],
): University => ({
  name,
  country,
  majors,
  note: country === "UK" && !note.includes(ukAdmissionsNote) ? `${note} ${ukAdmissionsNote}` : note,
  tags: ["International"],
  competitiveLevel,
});

const pathways = (regulated = false): Pathway[] => [
  {
    icon: "🇮🇩",
    title: "Kuliah di Indonesia",
    description: regulated
      ? "Ambil pendidikan formal dan tahapan profesi yang diwajibkan untuk bidang ini."
      : "Bangun fondasi lewat program studi yang relevan di PTN, PTS, atau politeknik.",
    preparation: ["Nilai sekolah", "SNBP/SNBT atau seleksi kampus", "Pemahaman jurusan", "Aktivitas yang konsisten"],
  },
  {
    icon: "🌏",
    title: "Kuliah di luar negeri",
    description: "Jelajahi beberapa negara dan bandingkan isi program, biaya, lingkungan, serta dukungan mahasiswa.",
    preparation: ["Shortlist US", "Shortlist Australia", "Shortlist Asia", "Shortlist UK", "Shortlist Europe"],
  },
  {
    icon: "🛠️",
    title: regulated ? "Pendidikan profesi" : "Jalur praktis & alternatif",
    description: regulated
      ? "Ikuti pendidikan profesi, lisensi, atau registrasi sesuai aturan—tidak ada jalan pintas untuk kualifikasi wajib."
      : "Pertimbangkan diploma, politeknik, sertifikasi, magang, atau belajar mandiri sebagai pelengkap.",
    preparation: ["Cek kualifikasi wajib", "Bandingkan kurikulum", "Cari pengalaman nyata", "Bangun bukti karya"],
  },
  {
    icon: "🚀",
    title: "Bangun pengalaman sejak dini",
    description: "Kamu tidak perlu menunggu kuliah untuk mulai mengenal dunia kerja dan membuat karya kecil.",
    preparation: ["Proyek pribadi", "Kompetisi atau organisasi", "Volunteer", "Jurnal belajar dan portfolio"],
  },
];

const baseSoftSkills: Skill[] = [
  { name: "Komunikasi", kind: "Soft Skill", why: "Membantu menyampaikan ide dengan jelas.", activity: "Jelaskan satu topik yang kamu pelajari dalam video 2 menit." },
  { name: "Problem solving", kind: "Soft Skill", why: "Membuatmu terbiasa memecah masalah besar.", activity: "Pilih satu masalah sekolah dan tulis tiga kemungkinan solusinya." },
  { name: "Bahasa Inggris", kind: "Soft Skill", why: "Membuka lebih banyak bahan belajar dan peluang.", activity: "Tonton satu video pendek berbahasa Inggris dan catat 5 istilah baru." },
];

type CareerSeed = Omit<Career, "scholarships" | "pathways" | "cvSuggestions"> & { regulated?: boolean };

const makeCareer = (seed: CareerSeed): Career => ({
  ...seed,
  scholarships: [...indonesiaScholarships, ...overseasScholarships],
  pathways: pathways(seed.regulated),
  cvSuggestions: ["Proyek yang relevan", "Kegiatan yang diikuti secara konsisten", "Tanggung jawab atau leadership", "Kursus dan skill yang benar-benar dikuasai"],
});

export const careers: Career[] = [
  makeCareer({
    id: "dokter", title: "Dokter", keywords: ["dokter", "doctor", "kedokteran", "medis"], regulated: true,
    description: "Dokter memadukan ilmu kesehatan, empati, dan pengambilan keputusan untuk merawat pasien.",
    possibleMajors: ["Kedokteran", "Pendidikan Dokter"],
    indonesiaUniversities: [local("Universitas Indonesia", ["Pendidikan Dokter"], "Lingkungan akademik dan rumah sakit pendidikan yang kuat.", ["PTN", "Research"]), local("Universitas Gadjah Mada", ["Kedokteran"], "Ekosistem kesehatan dan pengabdian masyarakat.", ["PTN", "Research"]), local("Universitas Airlangga", ["Kedokteran"], "Pilihan kuat dengan jaringan rumah sakit pendidikan.", ["PTN", "Health"]), local("Universitas Padjadjaran", ["Kedokteran"], "Program kesehatan yang dikenal luas.", ["PTN", "Health"]), local("Universitas Katolik Indonesia Atma Jaya", ["Kedokteran"], "Alternatif PTS dengan pendidikan klinis.", ["PTS", "Health"])],
    overseasUniversities: [abroad("University of Melbourne", "Australia", ["Biomedicine / MD pathway"], "Pelajari struktur jalur kedokterannya dengan teliti.", "Very Competitive"), abroad("University of Hong Kong", "Hong Kong", ["MBBS"], "Program medis internasional yang kompetitif.", "Very Competitive"), abroad("Monash University", "Australia", ["Medical Science and Medicine"], "Opsi Australia dengan jalur medis terintegrasi.", "Competitive"), abroad("University of Dundee", "UK", ["Medicine MBChB"], "Kampus dengan fokus pendidikan klinis.", "Explore")],
    skills: [{ name: "Biologi & kimia", kind: "Hard Skill", why: "Fondasi untuk memahami tubuh dan obat.", activity: "Buat peta konsep satu sistem tubuh manusia." }, { name: "Literasi sains", kind: "Hard Skill", why: "Membantu membedakan bukti dan opini.", activity: "Ringkas satu artikel kesehatan dari sumber tepercaya." }, ...baseSoftSkills],
    portfolioIdeas: ["Jurnal observasi sains", "Poster edukasi kesehatan", "Kegiatan PMR", "Volunteer komunitas", "Esai atau karya tulis ilmiah"],
  }),
  makeCareer({
    id: "software-engineer", title: "Software Engineer", keywords: ["software engineer", "programmer", "developer", "software developer", "coding", "web developer"],
    description: "Software engineer merancang dan membangun teknologi yang menyelesaikan masalah nyata.",
    possibleMajors: ["Informatika", "Ilmu Komputer", "Software Engineering", "Sistem Informasi"],
    indonesiaUniversities: [local("Institut Teknologi Bandung", ["Informatika"], "Fondasi komputasi dan rekayasa yang kuat.", ["PTN", "Technology"]), local("Universitas Indonesia", ["Ilmu Komputer", "Sistem Informasi"], "Pilihan program komputasi yang luas.", ["PTN", "Research"]), local("Institut Teknologi Sepuluh Nopember", ["Informatika", "Teknologi Informasi"], "Kental dengan proyek teknologi dan engineering.", ["PTN", "Technology"]), local("BINUS University", ["Computer Science", "Software Engineering"], "Koneksi industri dan pilihan program yang beragam.", ["PTS", "Technology"]), local("Telkom University", ["Informatika", "Rekayasa Perangkat Lunak"], "Ekosistem digital dan teknologi terapan.", ["PTS", "Technology"])],
    overseasUniversities: [abroad("National University of Singapore", "Singapura", ["Computer Science"], "Program kuat dan sangat selektif.", "Very Competitive"), abroad("University of Toronto", "Kanada", ["Computer Science"], "Ekosistem riset dan teknologi luas.", "Very Competitive"), abroad("University of Technology Sydney", "Australia", ["Computing Science"], "Pendekatan terapan dan koneksi industri.", "Competitive"), abroad("University of Twente", "Belanda", ["Technical Computer Science"], "Pilihan teknologi dengan proyek multidisiplin.", "Explore"), abroad("Ritsumeikan University", "Jepang", ["Information Systems Science and Engineering"], "Program internasional bidang informasi.", "Explore")],
    skills: [{ name: "Programming", kind: "Hard Skill", why: "Alat utama untuk menerjemahkan ide menjadi produk.", activity: "Buat kalkulator sederhana dengan Python atau JavaScript." }, { name: "Git", kind: "Hard Skill", why: "Mencatat perubahan dan memudahkan kolaborasi.", activity: "Simpan proyek pertamamu dalam satu repository GitHub." }, { name: "Computational thinking", kind: "Hard Skill", why: "Membantu menyusun solusi langkah demi langkah.", activity: "Tulis algoritma membuat mi instan sedetail mungkin." }, ...baseSoftSkills],
    portfolioIdeas: ["Website pribadi", "Aplikasi absensi sederhana", "Quiz website", "Game kecil", "Visualisasi data", "Profil GitHub"],
  }),
  makeCareer({
    id: "data-scientist", title: "Data Scientist", keywords: ["data scientist", "data analyst", "analis data", "machine learning", "ai engineer"],
    description: "Data scientist memakai statistik, kode, dan rasa ingin tahu untuk menemukan pola dan membuat keputusan.",
    possibleMajors: ["Sains Data", "Statistika", "Ilmu Komputer", "Matematika"],
    indonesiaUniversities: [local("Institut Teknologi Sepuluh Nopember", ["Sains Data", "Statistika"], "Kuat di analisis kuantitatif dan komputasi.", ["PTN", "Technology"]), local("Institut Pertanian Bogor", ["Statistika dan Sains Data"], "Pengalaman panjang di statistika terapan.", ["PTN", "Research"]), local("Universitas Airlangga", ["Teknologi Sains Data"], "Program khusus dengan konteks terapan.", ["PTN", "Technology"]), local("BINUS University", ["Data Science"], "Kurikulum digital dengan koneksi industri.", ["PTS", "Technology"])],
    overseasUniversities: [abroad("University of Waterloo", "Kanada", ["Data Science"], "Kuat di matematika, komputasi, dan co-op.", "Very Competitive"), abroad("Monash University", "Australia", ["Applied Data Science"], "Program terapan yang luas.", "Competitive"), abroad("University of Auckland", "Selandia Baru", ["Data Science"], "Pilihan eksplorasi di kawasan Asia Pasifik.", "Explore"), abroad("Tilburg University", "Belanda", ["Data Science"], "Menggabungkan data dengan konteks sosial dan bisnis.", "Explore")],
    skills: [{ name: "Statistika", kind: "Hard Skill", why: "Membantu membaca pola tanpa mudah terkecoh.", activity: "Analisis hasil survei kecil dari 20 teman." }, { name: "Python", kind: "Hard Skill", why: "Banyak dipakai untuk membersihkan dan menganalisis data.", activity: "Buka satu dataset publik dan hitung nilai rata-ratanya." }, ...baseSoftSkills],
    portfolioIdeas: ["Dashboard data sekolah", "Analisis tren sederhana", "Visualisasi data publik", "Survei kebiasaan belajar", "Notebook analisis di GitHub"],
  }),
  makeCareer({
    id: "guru", title: "Guru", keywords: ["guru", "teacher", "pengajar", "dosen"], regulated: true,
    description: "Guru membantu orang lain tumbuh lewat pengetahuan, keteladanan, dan cara belajar yang bermakna.",
    possibleMajors: ["Pendidikan sesuai bidang", "Pendidikan Guru", "Teknologi Pendidikan"],
    indonesiaUniversities: [local("Universitas Pendidikan Indonesia", ["Ilmu Pendidikan"], "Pilihan bidang pendidikan yang sangat beragam.", ["PTN", "Education"]), local("Universitas Negeri Yogyakarta", ["Pendidikan"], "Ekosistem kuat untuk calon pendidik.", ["PTN", "Education"]), local("Universitas Negeri Malang", ["Pendidikan"], "Tradisi pendidikan guru dan riset pembelajaran.", ["PTN", "Research"]), local("Universitas Sanata Dharma", ["Keguruan dan Ilmu Pendidikan"], "Alternatif PTS dengan fokus pendidikan.", ["PTS", "Education"])],
    overseasUniversities: [abroad("Monash University", "Australia", ["Education"], "Pilihan spesialisasi pendidikan yang luas.", "Competitive"), abroad("University of Helsinki", "Finlandia", ["Education"], "Terkenal untuk riset pendidikan.", "Very Competitive"), abroad("University of Nottingham", "UK", ["Education"], "Program pendidikan dalam konteks global.", "Competitive"), abroad("University of Tsukuba", "Jepang", ["Education"], "Opsi Asia dengan ekosistem riset.", "Explore")],
    skills: [{ name: "Merancang pembelajaran", kind: "Hard Skill", why: "Pelajaran yang baik punya tujuan dan alur jelas.", activity: "Buat rencana mengajar 15 menit untuk adik atau teman." }, { name: "Public speaking", kind: "Soft Skill", why: "Membantu kelas terasa jelas dan hidup.", activity: "Rekam penjelasan satu konsep dalam 3 menit." }, ...baseSoftSkills],
    portfolioIdeas: ["Video penjelasan pelajaran", "Modul belajar singkat", "Tutor sebaya", "Volunteer mengajar", "Media belajar kreatif"],
  }),
  makeCareer({
    id: "pengusaha", title: "Pengusaha", keywords: ["pengusaha", "entrepreneur", "business owner", "wirausaha", "bisnis"],
    description: "Pengusaha mengenali kebutuhan, mencoba solusi, dan membangun nilai bersama pelanggan serta tim.",
    possibleMajors: ["Manajemen", "Kewirausahaan", "Ekonomi", "Sistem Informasi"],
    indonesiaUniversities: [local("Universitas Gadjah Mada", ["Manajemen", "Ekonomika dan Bisnis"], "Ekosistem bisnis dan organisasi mahasiswa kuat.", ["PTN", "Business"]), local("Universitas Indonesia", ["Manajemen", "Ilmu Ekonomi"], "Fondasi bisnis dan jejaring luas.", ["PTN", "Business"]), local("Institut Teknologi Bandung", ["Kewirausahaan", "Manajemen"], "Menghubungkan bisnis, inovasi, dan teknologi.", ["PTN", "Business"]), local("Prasetiya Mulya", ["Business", "Entrepreneurship"], "Pembelajaran bisnis yang sangat terapan.", ["PTS", "Business"]), local("BINUS University", ["Business Creation"], "Lingkungan digital dan kewirausahaan.", ["PTS", "Business"])],
    overseasUniversities: [abroad("Babson College", "USA", ["Entrepreneurship"], "Sangat fokus pada kewirausahaan.", "Very Competitive"), abroad("University of Warwick", "UK", ["Management"], "Lingkungan bisnis internasional.", "Very Competitive"), abroad("Queensland University of Technology", "Australia", ["Business"], "Kuat pada pembelajaran terapan.", "Competitive"), abroad("Erasmus University Rotterdam", "Belanda", ["International Business"], "Opsi bisnis dalam konteks Eropa.", "Competitive")],
    skills: [{ name: "Validasi ide", kind: "Hard Skill", why: "Mencegah membangun sesuatu yang tidak dibutuhkan.", activity: "Wawancarai 5 orang tentang satu masalah sederhana." }, { name: "Keuangan dasar", kind: "Hard Skill", why: "Membantu memahami biaya, harga, dan arus kas.", activity: "Buat catatan untung-rugi untuk jualan kecil." }, ...baseSoftSkills],
    portfolioIdeas: ["Eksperimen jualan kecil", "Riset 10 calon pelanggan", "Proposal bisnis satu halaman", "Katalog produk", "Catatan pembelajaran usaha"],
  }),
  makeCareer({
    id: "arsitek", title: "Arsitek", keywords: ["arsitek", "architect", "arsitektur"], regulated: true,
    description: "Arsitek merancang ruang yang aman, berguna, dan bermakna bagi manusia serta lingkungan.",
    possibleMajors: ["Arsitektur", "Teknik Arsitektur", "Desain Lingkungan Binaan"],
    indonesiaUniversities: [local("Institut Teknologi Bandung", ["Arsitektur"], "Studio desain dan fondasi teknologi kuat.", ["PTN", "Design"]), local("Universitas Indonesia", ["Arsitektur"], "Pendekatan desain dan lingkungan binaan.", ["PTN", "Research"]), local("Universitas Gadjah Mada", ["Arsitektur"], "Konteks budaya dan keberlanjutan.", ["PTN", "Design"]), local("Universitas Katolik Parahyangan", ["Arsitektur"], "Tradisi studio arsitektur yang dikenal luas.", ["PTS", "Design"])],
    overseasUniversities: [abroad("TU Delft", "Belanda", ["Architecture"], "Kuat di desain, urbanisme, dan teknologi.", "Very Competitive"), abroad("University of Melbourne", "Australia", ["Design / Architecture pathway"], "Jalur desain menuju studi profesional.", "Competitive"), abroad("University of Sheffield", "UK", ["Architecture"], "Studio dengan konteks sosial dan lingkungan.", "Competitive"), abroad("Taylor's University", "Malaysia", ["Architecture"], "Opsi regional yang patut dieksplorasi.", "Explore")],
    skills: [{ name: "Visual thinking", kind: "Hard Skill", why: "Ide ruang perlu dikomunikasikan secara visual.", activity: "Sketsa ulang kamar tidur dari tiga sudut." }, { name: "Pemodelan 3D", kind: "Hard Skill", why: "Membantu menguji bentuk dan skala.", activity: "Buat model ruang sederhana di SketchUp atau dari kardus." }, ...baseSoftSkills],
    portfolioIdeas: ["Buku sketsa", "Model 3D ruang", "Redesain kamar", "Jurnal observasi bangunan", "Seri fotografi arsitektur"],
  }),
  makeCareer({
    id: "psikolog", title: "Psikolog", keywords: ["psikolog", "psychologist", "psikologi", "terapis"], regulated: true,
    description: "Psikolog menggunakan ilmu perilaku dan keterampilan mendengar untuk membantu manusia berkembang.",
    possibleMajors: ["Psikologi"],
    indonesiaUniversities: [local("Universitas Indonesia", ["Psikologi"], "Ekosistem riset dan bidang psikologi luas.", ["PTN", "Research"]), local("Universitas Gadjah Mada", ["Psikologi"], "Kuat di riset dan pengabdian masyarakat.", ["PTN", "Research"]), local("Universitas Airlangga", ["Psikologi"], "Pilihan bidang dan konteks kesehatan.", ["PTN", "Health"]), local("Universitas Katolik Indonesia Atma Jaya", ["Psikologi"], "Alternatif PTS dengan pendekatan humanis.", ["PTS", "Social"]), local("Universitas Padjadjaran", ["Psikologi"], "Program psikologi yang dikenal luas.", ["PTN", "Research"])],
    overseasUniversities: [abroad("University of Queensland", "Australia", ["Psychological Science"], "Kuat di riset psikologi.", "Very Competitive"), abroad("University of Amsterdam", "Belanda", ["Psychology"], "Pilihan internasional berbasis riset.", "Competitive"), abroad("University of Nottingham Malaysia", "Malaysia", ["Psychology"], "Opsi regional berbahasa Inggris.", "Explore"), abroad("University of Sussex", "UK", ["Psychology"], "Beragam area riset perilaku.", "Competitive")],
    skills: [{ name: "Literasi riset", kind: "Hard Skill", why: "Psikologi dibangun dari bukti, bukan tebakan.", activity: "Ringkas satu artikel psikologi populer dan cari sumber penelitiannya." }, { name: "Active listening", kind: "Soft Skill", why: "Mendengar dengan utuh adalah keterampilan penting.", activity: "Latih percakapan 10 menit tanpa memotong lawan bicara." }, ...baseSoftSkills],
    portfolioIdeas: ["Kampanye kesehatan mental", "Volunteer sebaya dengan supervisi", "Jurnal literasi psikologi", "Survei sederhana", "Poster anti-bullying"],
  }),
  makeCareer({
    id: "pengacara", title: "Lawyer / Pengacara", keywords: ["lawyer", "pengacara", "advokat", "hukum", "jaksa", "hakim"], regulated: true,
    description: "Profesional hukum menafsirkan aturan, menyusun argumen, dan membantu memperjuangkan keadilan.",
    possibleMajors: ["Ilmu Hukum", "Hukum Bisnis", "Hukum Internasional"],
    indonesiaUniversities: [local("Universitas Indonesia", ["Ilmu Hukum"], "Pilihan kajian hukum dan jejaring alumni luas.", ["PTN", "Law"]), local("Universitas Gadjah Mada", ["Hukum"], "Kuat dalam riset dan praktik hukum.", ["PTN", "Law"]), local("Universitas Airlangga", ["Ilmu Hukum"], "Program hukum dengan banyak peminatan.", ["PTN", "Law"]), local("Universitas Padjadjaran", ["Ilmu Hukum"], "Tradisi pendidikan hukum yang kuat.", ["PTN", "Law"]), local("Universitas Pelita Harapan", ["Hukum"], "Alternatif PTS dengan konteks bisnis.", ["PTS", "Law"])],
    overseasUniversities: [abroad("King's College London", "UK", ["Law"], "Program hukum sangat kompetitif.", "Very Competitive"), abroad("University of Sydney", "Australia", ["Law"], "Lingkungan hukum internasional.", "Very Competitive"), abroad("University of Leeds", "UK", ["Law"], "Program luas dengan berbagai fokus.", "Competitive"), abroad("University of Groningen", "Belanda", ["International and European Law"], "Opsi internasional untuk kajian lintas negara.", "Explore")],
    skills: [{ name: "Argumentasi", kind: "Hard Skill", why: "Argumen hukum harus logis dan berbasis bukti.", activity: "Tulis pro-kontra satu aturan sekolah dengan sumber." }, { name: "Membaca kritis", kind: "Hard Skill", why: "Teks hukum menuntut ketelitian.", activity: "Baca satu berita hukum dan pisahkan fakta dari opini." }, ...baseSoftSkills],
    portfolioIdeas: ["Klub debat", "Esai isu hukum", "Simulasi sidang", "Ringkasan kebijakan", "Volunteer advokasi komunitas"],
  }),
  makeCareer({
    id: "diplomat", title: "Diplomat", keywords: ["diplomat", "diplomasi", "foreign service", "hubungan internasional"], regulated: true,
    description: "Diplomat mewakili Indonesia, membangun hubungan, dan bekerja pada isu lintas negara.",
    possibleMajors: ["Hubungan Internasional", "Ilmu Politik", "Hukum", "Ekonomi", "Bahasa"],
    indonesiaUniversities: [local("Universitas Indonesia", ["Hubungan Internasional"], "Dekat dengan kajian kebijakan dan jejaring nasional.", ["PTN", "International"]), local("Universitas Gadjah Mada", ["Hubungan Internasional"], "Kuat di studi global dan organisasi mahasiswa.", ["PTN", "International"]), local("Universitas Padjadjaran", ["Hubungan Internasional"], "Program HI yang dikenal luas.", ["PTN", "International"]), local("Universitas Katolik Parahyangan", ["Hubungan Internasional"], "Alternatif PTS dengan perspektif global.", ["PTS", "International"])],
    overseasUniversities: [abroad("Australian National University", "Australia", ["International Relations"], "Dekat dengan ekosistem kebijakan publik.", "Very Competitive"), abroad("Leiden University", "Belanda", ["International Studies"], "Lingkungan internasional dan multibahasa.", "Competitive"), abroad("SOAS University of London", "UK", ["International Relations"], "Fokus kuat pada Asia, Afrika, dan Timur Tengah.", "Competitive"), abroad("Ritsumeikan Asia Pacific University", "Jepang", ["International Relations"], "Kampus multikultural di Asia.", "Explore")],
    skills: [{ name: "Wawasan global", kind: "Hard Skill", why: "Diplomasi perlu konteks sejarah, politik, dan ekonomi.", activity: "Buat ringkasan mingguan satu isu internasional." }, { name: "Negosiasi", kind: "Soft Skill", why: "Mencari titik temu tanpa kehilangan tujuan.", activity: "Ikuti simulasi Model United Nations atau debat." }, ...baseSoftSkills],
    portfolioIdeas: ["Model United Nations", "Buletin isu global", "Esai kebijakan", "Klub bahasa", "Kegiatan lintas budaya"],
  }),
  makeCareer({
    id: "accountant", title: "Accountant", keywords: ["accountant", "akuntan", "accounting", "akuntansi", "auditor"], regulated: true,
    description: "Akuntan membuat informasi keuangan rapi, dapat dipercaya, dan berguna untuk keputusan.",
    possibleMajors: ["Akuntansi", "Keuangan", "Perpajakan"],
    indonesiaUniversities: [local("Universitas Indonesia", ["Akuntansi"], "Fondasi bisnis dan akuntansi kuat.", ["PTN", "Business"]), local("Universitas Gadjah Mada", ["Akuntansi"], "Ekosistem akademik dan organisasi luas.", ["PTN", "Business"]), local("Universitas Airlangga", ["Akuntansi"], "Pilihan kuat di bidang ekonomi dan bisnis.", ["PTN", "Business"]), local("Universitas Trisakti", ["Akuntansi"], "Alternatif PTS dengan fokus profesional.", ["PTS", "Business"]), local("Universitas Katolik Widya Mandala", ["Akuntansi"], "Opsi PTS untuk akuntansi terapan.", ["PTS", "Business"])],
    overseasUniversities: [abroad("University of New South Wales", "Australia", ["Commerce / Accounting"], "Kuat di bisnis dan jejaring profesional.", "Very Competitive"), abroad("University of Manchester", "UK", ["Accounting"], "Program bisnis internasional.", "Very Competitive"), abroad("University of Auckland", "Selandia Baru", ["Accounting"], "Pilihan Asia Pasifik yang solid.", "Competitive"), abroad("Sunway University", "Malaysia", ["Accounting and Finance"], "Opsi regional dengan jalur profesional.", "Explore")],
    skills: [{ name: "Akuntansi dasar", kind: "Hard Skill", why: "Fondasi untuk membaca transaksi dan laporan.", activity: "Catat pemasukan dan pengeluaran pribadi selama 7 hari." }, { name: "Spreadsheet", kind: "Hard Skill", why: "Penting untuk mengolah data keuangan dengan teliti.", activity: "Buat tabel anggaran bulanan dengan rumus dasar." }, ...baseSoftSkills],
    portfolioIdeas: ["Anggaran acara kelas", "Simulasi laporan usaha kecil", "Dashboard keuangan sederhana", "Kursus spreadsheet", "Studi kasus bisnis"],
  }),
  makeCareer({
    id: "engineer", title: "Engineer", keywords: ["engineer", "insinyur", "teknik", "mechanical engineer", "civil engineer", "electrical engineer"], regulated: true,
    description: "Engineer menerapkan sains dan matematika untuk merancang sistem, bangunan, dan alat yang bekerja.",
    possibleMajors: ["Teknik Mesin", "Teknik Sipil", "Teknik Elektro", "Teknik Industri"],
    indonesiaUniversities: [local("Institut Teknologi Bandung", ["Berbagai program teknik"], "Ekosistem teknik dan sains yang luas.", ["PTN", "Engineering"]), local("Institut Teknologi Sepuluh Nopember", ["Berbagai program teknik"], "Kuat di engineering terapan dan proyek.", ["PTN", "Engineering"]), local("Universitas Gadjah Mada", ["Teknik"], "Pilihan disiplin teknik yang lengkap.", ["PTN", "Research"]), local("Universitas Diponegoro", ["Teknik"], "Program engineering dalam banyak bidang.", ["PTN", "Engineering"]), local("Universitas Telkom", ["Teknik Elektro", "Teknik Industri"], "Alternatif PTS dengan konteks teknologi.", ["PTS", "Technology"])],
    overseasUniversities: [abroad("Nanyang Technological University", "Singapura", ["Engineering"], "Kuat dan sangat kompetitif.", "Very Competitive"), abroad("University of Tokyo", "Jepang", ["Engineering"], "Ekosistem riset teknik kelas dunia.", "Very Competitive"), abroad("University of Queensland", "Australia", ["Engineering"], "Pilihan disiplin dan proyek terapan.", "Competitive"), abroad("Korea University of Technology and Education", "Korea Selatan", ["Engineering"], "Fokus teknologi dan praktik.", "Explore")],
    skills: [{ name: "Matematika & fisika", kind: "Hard Skill", why: "Bahasa dasar untuk memahami sistem teknik.", activity: "Buat eksperimen fisika sederhana dan catat hasilnya." }, { name: "Design process", kind: "Hard Skill", why: "Solusi teknik perlu diuji dan diperbaiki.", activity: "Rancang jembatan mini dari kertas dan uji bebannya." }, ...baseSoftSkills],
    portfolioIdeas: ["Prototipe alat sederhana", "Kompetisi robotik", "Model jembatan", "Catatan eksperimen", "Proyek Arduino"],
  }),
  makeCareer({
    id: "designer", title: "Designer", keywords: ["designer", "desainer", "graphic designer", "ui designer", "ux designer", "fashion designer"],
    description: "Designer memahami manusia dan mengubah ide menjadi pengalaman visual, produk, atau layanan.",
    possibleMajors: ["Desain Komunikasi Visual", "Desain Produk", "Desain Interior", "Fashion Design"],
    indonesiaUniversities: [local("Institut Teknologi Bandung", ["Desain Komunikasi Visual", "Desain Produk"], "Studio desain dengan fondasi konsep kuat.", ["PTN", "Design"]), local("Institut Seni Indonesia Yogyakarta", ["Desain"], "Lingkungan seni dan eksplorasi visual.", ["PTN", "Creative"]), local("Universitas Pelita Harapan", ["Visual Communication Design", "Product Design"], "Alternatif PTS dengan studio modern.", ["PTS", "Design"]), local("BINUS University", ["Visual Communication Design"], "Konteks desain digital dan industri.", ["PTS", "Technology"]), local("Universitas Multimedia Nusantara", ["Desain Komunikasi Visual"], "Fokus media dan desain digital.", ["PTS", "Creative"])],
    overseasUniversities: [abroad("University of the Arts London", "UK", ["Design"], "Sangat kuat di bidang kreatif dan kompetitif.", "Very Competitive"), abroad("RMIT University", "Australia", ["Communication Design"], "Pembelajaran studio dan industri.", "Competitive"), abroad("LASALLE College of the Arts", "Singapura", ["Design Communication"], "Opsi regional yang kreatif.", "Competitive"), abroad("Hong Kong Polytechnic University", "Hong Kong", ["Design"], "Menggabungkan desain dan teknologi.", "Explore")],
    skills: [{ name: "Prinsip desain", kind: "Hard Skill", why: "Hierarki, warna, dan tipografi membuat pesan mudah dipahami.", activity: "Redesain satu poster sekolah dengan hierarki lebih jelas." }, { name: "User research", kind: "Hard Skill", why: "Desain yang baik dimulai dari kebutuhan orang.", activity: "Minta 3 teman mencoba desainmu dan catat kebingungan mereka." }, ...baseSoftSkills],
    portfolioIdeas: ["Redesain poster sekolah", "Identitas visual usaha kecil", "Prototype aplikasi", "Zine digital", "Studi kasus proses desain", "Portfolio online"],
  }),
  makeCareer({
    id: "content-creator", title: "Content Creator", keywords: ["content creator", "youtuber", "influencer", "kreator", "tiktoker", "streamer"],
    description: "Content creator menggabungkan ide, storytelling, produksi, dan pemahaman audiens secara konsisten.",
    possibleMajors: ["Ilmu Komunikasi", "Film", "Desain Komunikasi Visual", "Marketing"],
    indonesiaUniversities: [local("Universitas Indonesia", ["Ilmu Komunikasi"], "Fondasi media, riset audiens, dan komunikasi.", ["PTN", "Social"]), local("Universitas Padjadjaran", ["Ilmu Komunikasi"], "Pilihan fokus media yang luas.", ["PTN", "Creative"]), local("Universitas Multimedia Nusantara", ["Digital Journalism", "Film", "Komunikasi"], "Ekosistem media dan produksi digital.", ["PTS", "Creative"]), local("BINUS University", ["Mass Communication", "Film"], "Konteks industri kreatif dan digital.", ["PTS", "Creative"]), local("Institut Kesenian Jakarta", ["Film dan Televisi"], "Lingkungan praktik seni dan produksi.", ["PTS", "Creative"])],
    overseasUniversities: [abroad("University of Southern California", "USA", ["Media Arts"], "Ekosistem media besar dan sangat kompetitif.", "Very Competitive"), abroad("RMIT University", "Australia", ["Media"], "Program kreatif yang terapan.", "Competitive"), abroad("University of Leeds", "UK", ["Digital Media"], "Menggabungkan teori dan praktik media.", "Competitive"), abroad("Taylor's University", "Malaysia", ["Mass Communication"], "Opsi regional untuk media kreatif.", "Explore")],
    skills: [{ name: "Storytelling", kind: "Hard Skill", why: "Membuat ide lebih mudah diingat.", activity: "Buat video 30 detik dengan awal, konflik, dan akhir." }, { name: "Produksi dasar", kind: "Hard Skill", why: "Audio, cahaya, dan editing meningkatkan kejelasan.", activity: "Edit satu video pendek hanya dengan ponsel." }, ...baseSoftSkills],
    portfolioIdeas: ["Serial video edukasi", "Podcast 3 episode", "Newsletter sekolah", "Kampanye sosial", "Kalender konten 30 hari", "Media kit sederhana"],
  }),
  makeCareer({
    id: "researcher", title: "Researcher / Scientist", keywords: ["researcher", "scientist", "peneliti", "ilmuwan", "research"],
    description: "Peneliti mengajukan pertanyaan, menguji ide, dan membangun pengetahuan lewat bukti.",
    possibleMajors: ["Biologi", "Kimia", "Fisika", "Matematika", "Sains sesuai minat"],
    indonesiaUniversities: [local("Institut Teknologi Bandung", ["Sains"], "Fondasi sains dan laboratorium riset.", ["PTN", "Research"]), local("Universitas Indonesia", ["MIPA"], "Bidang riset dan kolaborasi luas.", ["PTN", "Research"]), local("Universitas Gadjah Mada", ["Sains"], "Ekosistem riset multidisiplin.", ["PTN", "Research"]), local("Institut Pertanian Bogor", ["Sains Hayati", "Pangan", "Lingkungan"], "Kuat di riset hayati dan terapan.", ["PTN", "Research"]), local("Universitas Airlangga", ["Sains dan Teknologi"], "Konteks riset sains dan kesehatan.", ["PTN", "Research"])],
    overseasUniversities: [abroad("University of Tokyo", "Jepang", ["Natural Sciences"], "Ekosistem riset sangat kuat.", "Very Competitive"), abroad("University of British Columbia", "Kanada", ["Science"], "Banyak pilihan laboratorium dan bidang.", "Very Competitive"), abroad("University of Groningen", "Belanda", ["Science"], "Lingkungan riset internasional.", "Competitive"), abroad("University of Tsukuba", "Jepang", ["Life and Environmental Sciences"], "Pilihan eksplorasi riset di Asia.", "Explore")],
    skills: [{ name: "Metode ilmiah", kind: "Hard Skill", why: "Membantu menguji ide secara sistematis.", activity: "Rancang eksperimen kecil dengan variabel yang jelas." }, { name: "Analisis data", kind: "Hard Skill", why: "Hasil penelitian perlu dibaca dengan jujur.", activity: "Tampilkan hasil eksperimenmu dalam satu grafik." }, ...baseSoftSkills],
    portfolioIdeas: ["Karya tulis ilmiah", "Jurnal eksperimen", "Kompetisi sains", "Poster penelitian", "Proyek citizen science"],
  }),
  makeCareer({
    id: "pilot", title: "Pilot", keywords: ["pilot", "penerbang", "aviator"], regulated: true,
    description: "Pilot mengoperasikan pesawat dengan disiplin, ketelitian, komunikasi, dan standar keselamatan tinggi.",
    possibleMajors: ["Penerbang", "Operasi Pesawat Udara", "Teknik Penerbangan"],
    indonesiaUniversities: [local("Politeknik Penerbangan Indonesia Curug", ["Penerbang", "Teknik Penerbangan"], "Pendidikan vokasi penerbangan—cek seleksi dan ketentuan resmi.", ["Vokasi", "Aviation"]), local("Politeknik Penerbangan Surabaya", ["Operasi dan Teknik Penerbangan"], "Pilihan vokasi dalam ekosistem penerbangan.", ["Vokasi", "Aviation"]), local("Institut Teknologi Bandung", ["Teknik Dirgantara"], "Relevan untuk sisi rekayasa, bukan lisensi pilot.", ["PTN", "Engineering"]), local("Universitas Nurtanio", ["Teknik Penerbangan"], "Alternatif pendidikan terkait aviasi.", ["PTS", "Aviation"])],
    overseasUniversities: [abroad("Embry-Riddle Aeronautical University", "USA", ["Aeronautical Science"], "Program aviasi khusus; bandingkan biaya dan lisensi.", "Competitive"), abroad("University of New South Wales", "Australia", ["Aviation"], "Opsi universitas dalam bidang aviasi.", "Competitive"), abroad("Massey University", "Selandia Baru", ["Aviation"], "Program aviasi dengan konteks operasional.", "Explore"), abroad("Purdue University", "USA", ["Professional Flight"], "Program kuat dan kompetitif.", "Very Competitive")],
    skills: [{ name: "Matematika & fisika", kind: "Hard Skill", why: "Mendukung pemahaman navigasi dan prinsip terbang.", activity: "Pelajari gaya angkat lalu buat infografik singkat." }, { name: "Situational awareness", kind: "Soft Skill", why: "Keselamatan bergantung pada perhatian terhadap banyak informasi.", activity: "Latih checklist sebelum melakukan satu kegiatan kompleks." }, ...baseSoftSkills],
    portfolioIdeas: ["Jurnal belajar aviasi", "Model pesawat", "Klub aeromodelling", "Infografik keselamatan", "Kursus teori penerbangan dasar"],
  }),
];

export const unsureKeywords = ["belum tahu", "belum tau", "tidak tahu", "gak tahu", "nggak tahu", "bingung", "don't know", "belum punya cita-cita"];

export function matchCareer(input: string): Career | null {
  const normalized = input.trim().toLocaleLowerCase("id-ID");
  return careers.find((career) => career.keywords.some((keyword) => normalized.includes(keyword))) ?? null;
}

export function isUnsure(input: string): boolean {
  const normalized = input.trim().toLocaleLowerCase("id-ID");
  return unsureKeywords.some((keyword) => normalized.includes(keyword));
}

export const explorationAreas = [
  { icon: "🧪", title: "Science & Health", description: "Eksperimen, kesehatan, alam, dan cara kerja tubuh." },
  { icon: "💻", title: "Technology", description: "Kode, data, produk digital, dan pemecahan masalah." },
  { icon: "🎨", title: "Creative", description: "Visual, cerita, media, musik, dan pengalaman." },
  { icon: "📊", title: "Business", description: "Usaha, keuangan, strategi, dan kebutuhan pelanggan." },
  { icon: "🌏", title: "Social & Humanities", description: "Manusia, budaya, hukum, bahasa, dan masyarakat." },
  { icon: "🔧", title: "Engineering & Practical", description: "Mesin, bangunan, sistem, dan karya yang bisa diuji." },
];

export const allScholarships = [...indonesiaScholarships, ...overseasScholarships];
