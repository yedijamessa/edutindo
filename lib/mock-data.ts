import { Material, Quiz, Student, Teacher, Parent, CalendarEvent, Progress, Note } from '@/types/lms';

// Mock Students
export const mockStudents: Student[] = [
    {
        id: 'student-1',
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        avatar: '/avatars/student1.png',
        enrolledCourses: ['math-101', 'science-101'],
        parentId: 'parent-1',
    },
    {
        id: 'student-2',
        name: 'Michael Chen',
        email: 'michael@example.com',
        avatar: '/avatars/student2.png',
        enrolledCourses: ['math-101', 'english-101'],
        parentId: 'parent-2',
    },
];

// Mock Teachers
export const mockTeachers: Teacher[] = [
    {
        id: 'teacher-1',
        name: 'Dr. Emily Watson',
        email: 'emily@edutindo.org',
        avatar: '/avatars/teacher1.png',
        subjects: ['Mathematics', 'Physics'],
    },
];

// Mock Parents
export const mockParents: Parent[] = [
    {
        id: 'parent-1',
        name: 'Robert Johnson',
        email: 'robert@example.com',
        children: ['student-1'],
    },
    {
        id: 'parent-2',
        name: 'Lisa Chen',
        email: 'lisa@example.com',
        children: ['student-2'],
    },
];

// Mock Materials
export const mockMaterials: Material[] = [
    {
        id: 'math-101',
        title: 'Introduction to Algebra',
        description: 'Learn the fundamentals of algebraic expressions and equations.',
        subject: 'Mathematics',
        content: `# Introduction to Algebra

## What is Algebra?

Algebra is a branch of mathematics that uses symbols and letters to represent numbers and quantities in formulas and equations.

## Key Concepts

1. **Variables**: Letters that represent unknown values
2. **Expressions**: Combinations of variables and numbers
3. **Equations**: Mathematical statements that two expressions are equal

## Example

If x + 5 = 10, what is x?

Solution: x = 5`,
        attachments: [
            {
                id: 'att-1',
                name: 'Algebra Worksheet.pdf',
                url: '/materials/algebra-worksheet.pdf',
                type: 'pdf',
                size: 245000,
            },
        ],
        createdBy: 'teacher-1',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        published: true,
    },
    {
        id: 'science-101',
        title: 'The Scientific Method',
        description: 'Understanding how scientists investigate the natural world.',
        subject: 'Science',
        content: `# The Scientific Method

## Steps of the Scientific Method

1. **Ask a Question**
2. **Do Background Research**
3. **Construct a Hypothesis**
4. **Test with an Experiment**
5. **Analyze Data**
6. **Draw Conclusions**

## Example Experiment

Question: Does the amount of sunlight affect plant growth?`,
        createdBy: 'teacher-1',
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20'),
        published: true,
    },
    {
        id: 'english-101',
        title: 'Essay Writing Basics',
        description: 'Learn how to structure and write effective essays.',
        subject: 'English',
        content: `# Essay Writing Basics

## Essay Structure

1. **Introduction**: Hook, background, thesis statement
2. **Body Paragraphs**: Topic sentence, evidence, analysis
3. **Conclusion**: Restate thesis, summarize points, closing thought

## Tips for Success

- Start with an outline
- Use clear topic sentences
- Support claims with evidence
- Proofread carefully`,
        createdBy: 'teacher-1',
        createdAt: new Date('2024-01-25'),
        updatedAt: new Date('2024-01-25'),
        published: true,
    },
    {
        id: 'baca-101',
        title: 'Latihan Baca: Huruf dan Kata',
        description: 'Bilingual remedial reading for junior high with playful and formal lesson options.',
        subject: 'Literasi',
        content: `# Latihan Baca: Huruf dan Kata

## Overview / Gambaran
EN: A bilingual remedial reading lesson for junior high learners who need to strengthen decoding and word recognition.
ID: Pelajaran membaca bilingual untuk siswa SMP yang perlu menguatkan kemampuan mengeja dan mengenali kata.

## Learning Goals / Tujuan
EN: Identify vowel and consonant sounds, blend syllables, and read short words smoothly.
ID: Mengenali bunyi vokal dan konsonan, menggabungkan suku kata, dan membaca kata pendek dengan lancar.

## Duration / Durasi
EN: 30-45 minutes
ID: 30-45 menit

## Materials / Perlengkapan
EN: Letter cards, word strips, whiteboard, timer.
ID: Kartu huruf, kartu kata, papan tulis, timer.

## Option A: Playful Lesson / Opsi A: Bermain
EN: Warm-up (5 min): Letter hunt. Students race to find a target letter in a short paragraph.
ID: Pemanasan (5 menit): Berburu huruf. Siswa mencari huruf target di paragraf pendek.
EN: Syllable hop (10 min): Step on floor cards to read ba-bi-bu-be-bo, then blend into words.
ID: Lompat suku kata (10 menit): Lompat di kartu lantai ba-bi-bu-be-bo lalu gabungkan jadi kata.
EN: Word builder (10 min): Combine syllable cards to form words (ba+ta=bata, me+ja=meja).
ID: Pembentuk kata (10 menit): Gabungkan kartu suku kata menjadi kata.
EN: Mini story (10 min): Read a 4-6 sentence story, then underline words with target syllables.
ID: Cerita mini (10 menit): Baca cerita 4-6 kalimat, garis bawahi kata dengan suku kata target.
EN: Exit ticket (5 min): Read 5 target words aloud with correct pacing.
ID: Tiket keluar (5 menit): Baca 5 kata target dengan tempo yang tepat.

## Option B: Formal Lesson / Opsi B: Formal
EN: Phonics review (8 min): Direct instruction on vowel-consonant patterns and blending rules.
ID: Review fonik (8 menit): Instruksi langsung pola vokal-konsonan dan aturan blending.
EN: Guided practice (12 min): Teacher models, students read in unison, then individually.
ID: Latihan terbimbing (12 menit): Guru memberi contoh, siswa membaca bersama, lalu mandiri.
EN: Controlled text (15 min): Read a short passage with 70% familiar patterns; note errors.
ID: Teks terkontrol (15 menit): Baca teks pendek dengan pola familiar; catat kesalahan.
EN: Fluency check (5 min): 60-second timed reading, record accuracy and pace.
ID: Cek kelancaran (5 menit): Membaca 60 detik, catat akurasi dan tempo.

## Assessment / Penilaian
EN: Accuracy (0-10), pacing (0-5), blending skills (0-5).
ID: Akurasi (0-10), tempo (0-5), kemampuan blending (0-5).`,
        createdBy: 'teacher-1',
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01'),
        published: true,
    },
    {
        id: 'menulis-101',
        title: 'Latihan Menulis: Bentuk Huruf',
        description: 'Bilingual writing practice for junior high with playful and formal lesson options.',
        subject: 'Literasi',
        content: `# Latihan Menulis: Bentuk Huruf

## Overview / Gambaran
EN: Bilingual remedial writing to improve letter formation, spacing, and legibility.
ID: Latihan menulis bilingual untuk memperbaiki bentuk huruf, spasi, dan kerapian.

## Learning Goals / Tujuan
EN: Write clear uppercase and lowercase letters, copy words, and compose short sentences.
ID: Menulis huruf besar dan kecil dengan jelas, menyalin kata, dan menyusun kalimat pendek.

## Duration / Durasi
EN: 40-60 minutes
ID: 40-60 menit

## Materials / Perlengkapan
EN: Lined paper, pencil, letter guides, eraser.
ID: Kertas bergaris, pensil, panduan huruf, penghapus.

## Option A: Playful Lesson / Opsi A: Bermain
EN: Warm-up (5 min): Air writing of tricky letters (b, d, p, q).
ID: Pemanasan (5 menit): Menulis di udara untuk huruf yang sering tertukar.
EN: Trace and draw (10 min): Trace letters, then draw a quick icon for each word.
ID: Tebalkan dan gambar (10 menit): Tebalkan huruf lalu gambar ikon sederhana.
EN: Word relay (10 min): Teams copy words on the board as neatly as possible.
ID: Estafet kata (10 menit): Tim menyalin kata dengan rapi.
EN: Sentence craft (10 min): Build a sentence from 3 given words, then copy it neatly.
ID: Merangkai kalimat (10 menit): Susun kalimat dari 3 kata lalu salin rapi.
EN: Gallery walk (5 min): Share neatest writing and discuss spacing.
ID: Galeri (5 menit): Pajang tulisan terbaik dan bahas spasi.

## Option B: Formal Lesson / Opsi B: Formal
EN: Letter formation (10 min): Stroke order and consistent height for a, e, m, n.
ID: Bentuk huruf (10 menit): Urutan goresan dan tinggi huruf yang konsisten.
EN: Copywork (15 min): Copy a model paragraph with focus on spacing and alignment.
ID: Copywork (15 menit): Salin paragraf model dengan fokus spasi dan garis.
EN: Dictation (10 min): Teacher reads, students write 2-3 short sentences.
ID: Dikte (10 menit): Guru membacakan, siswa menulis 2-3 kalimat.
EN: Self-check (5 min): Use a checklist: spacing, size, clarity, punctuation.
ID: Cek mandiri (5 menit): Gunakan daftar cek: spasi, ukuran, kejelasan, tanda baca.

## Assessment / Penilaian
EN: Legibility (0-10), spacing (0-5), accuracy (0-5).
ID: Keterbacaan (0-10), spasi (0-5), akurasi (0-5).`,
        createdBy: 'teacher-1',
        createdAt: new Date('2024-02-02'),
        updatedAt: new Date('2024-02-02'),
        published: true,
    },
    {
        id: 'hitung-101',
        title: 'Latihan Menghitung: 1-20',
        description: 'Bilingual counting and basic operations for junior high with playful and formal lesson options.',
        subject: 'Numerasi',
        content: `# Latihan Menghitung: 1-20

## Overview / Gambaran
EN: Remedial numeracy for junior high focusing on number sense 1-20.
ID: Numerasi remedial untuk siswa SMP dengan fokus konsep bilangan 1-20.

## Learning Goals / Tujuan
EN: Recognize numbers, count objects, and add/subtract within 20.
ID: Mengenali angka, menghitung benda, dan operasi tambah/kurang sampai 20.

## Duration / Durasi
EN: 35-50 minutes
ID: 35-50 menit

## Materials / Perlengkapan
EN: Counters, number line, dice, worksheet.
ID: Kancing penghitung, garis bilangan, dadu, lembar kerja.

## Option A: Playful Lesson / Opsi A: Bermain
EN: Warm-up (5 min): Number hop on a floor number line 1-20.
ID: Pemanasan (5 menit): Lompat angka di garis bilangan lantai.
EN: Dice pairs (10 min): Roll two dice, add, and find the result on the number line.
ID: Pasangan dadu (10 menit): Lempar dua dadu, jumlahkan, cari hasilnya.
EN: Object match (10 min): Count counters, match to number card.
ID: Cocokkan benda (10 menit): Hitung kancing, cocokkan dengan kartu angka.
EN: Mini challenge (10 min): Solve 5 addition/subtraction word problems.
ID: Tantangan mini (10 menit): Kerjakan 5 soal cerita tambah/kurang.

## Option B: Formal Lesson / Opsi B: Formal
EN: Direct instruction (10 min): One-to-one correspondence and number representation.
ID: Instruksi langsung (10 menit): Korespondensi satu-satu dan representasi angka.
EN: Guided practice (15 min): Solve structured problems with teacher feedback.
ID: Latihan terbimbing (15 menit): Kerjakan soal terstruktur dengan umpan balik.
EN: Independent practice (10 min): 10 mixed problems within 20.
ID: Latihan mandiri (10 menit): 10 soal campuran sampai 20.

## Assessment / Penilaian
EN: Accuracy (0-10), strategy use (0-5), number sense (0-5).
ID: Akurasi (0-10), strategi (0-5), pemahaman bilangan (0-5).`,
        createdBy: 'teacher-1',
        createdAt: new Date('2024-02-03'),
        updatedAt: new Date('2024-02-03'),
        published: true,
    },
    {
        id: 'numeracy-101',
        title: 'Numerasi Dasar: Pola dan Perbandingan',
        description: 'Bilingual numeracy foundations for patterns, order, and comparisons with playful and formal options.',
        subject: 'Numerasi',
        content: `# Numerasi Dasar: Pola dan Perbandingan

## Overview / Gambaran
EN: Build foundational numeracy skills on patterns and comparisons for junior high remedial learners.
ID: Menguatkan numerasi dasar tentang pola dan perbandingan untuk siswa SMP remedial.

## Learning Goals / Tujuan
EN: Identify patterns, order numbers, and compare quantities using symbols.
ID: Mengenali pola, mengurutkan angka, dan membandingkan banyaknya dengan simbol.

## Duration / Durasi
EN: 40-55 minutes
ID: 40-55 menit

## Materials / Perlengkapan
EN: Pattern cards, number line, colored beads.
ID: Kartu pola, garis bilangan, manik warna.

## Option A: Playful Lesson / Opsi A: Bermain
EN: Pattern lab (10 min): Continue color and number patterns with beads.
ID: Lab pola (10 menit): Lanjutkan pola warna dan angka dengan manik.
EN: Order race (10 min): Teams arrange mixed number cards from smallest to largest.
ID: Balapan urut (10 menit): Tim mengurutkan kartu angka dari kecil ke besar.
EN: More or less (10 min): Use snacks or counters to compare and say >, <, =.
ID: Lebih atau kurang (10 menit): Bandingkan jumlah dan gunakan >, <, =.
EN: Puzzle wrap (5 min): Solve a quick pattern puzzle as exit ticket.
ID: Penutup (5 menit): Selesaikan teka-teki pola singkat.

## Option B: Formal Lesson / Opsi B: Formal
EN: Concept teaching (10 min): Define pattern, sequence, and comparison symbols.
ID: Penjelasan konsep (10 menit): Definisi pola, urutan, simbol perbandingan.
EN: Guided examples (15 min): Work through 6 problems with teacher modeling.
ID: Contoh terbimbing (15 menit): Kerjakan 6 soal dengan contoh guru.
EN: Independent practice (10 min): Complete a worksheet on patterns and ordering.
ID: Latihan mandiri (10 menit): Kerjakan lembar kerja pola dan urutan.

## Assessment / Penilaian
EN: Pattern accuracy (0-10), comparison accuracy (0-5), reasoning (0-5).
ID: Akurasi pola (0-10), akurasi perbandingan (0-5), penalaran (0-5).`,
        createdBy: 'teacher-1',
        createdAt: new Date('2024-02-04'),
        updatedAt: new Date('2024-02-04'),
        published: true,
    },
    {
        id: 'literature-101',
        title: 'Literatur Anak: Cerita Pendek',
        description: 'Bilingual short story reading and comprehension for junior high with playful and formal options.',
        subject: 'Literature',
        content: `# Literatur Anak: Cerita Pendek

## Overview / Gambaran
EN: Bilingual reading of short stories to build comprehension and reflection.
ID: Membaca cerita pendek bilingual untuk membangun pemahaman dan refleksi.

## Learning Goals / Tujuan
EN: Identify characters, setting, and moral; summarize and infer meaning.
ID: Mengidentifikasi tokoh, latar, pesan; merangkum dan menyimpulkan makna.

## Duration / Durasi
EN: 45-60 minutes
ID: 45-60 menit

## Materials / Perlengkapan
EN: Short story printout, highlighters, discussion cards.
ID: Teks cerita, stabilo, kartu diskusi.

## Story / Cerita
EN: A short fable about a rabbit and a turtle who learn about persistence.
ID: Fabel pendek tentang kelinci dan kura-kura yang belajar ketekunan.

## Option A: Playful Lesson / Opsi A: Bermain
EN: Story circle (10 min): Read aloud with roles (narrator, rabbit, turtle).
ID: Lingkar cerita (10 menit): Baca bergantian dengan peran.
EN: Freeze frame (10 min): Act out a scene and guess the setting.
ID: Freeze frame (10 menit): Peragakan adegan, tebak latar.
EN: Draw and tell (10 min): Draw the favorite scene and explain why.
ID: Gambar dan cerita (10 menit): Gambar adegan favorit dan jelaskan alasannya.
EN: Quick quiz (5 min): Answer 3 comprehension questions orally.
ID: Kuis cepat (5 menit): Jawab 3 pertanyaan pemahaman lisan.

## Option B: Formal Lesson / Opsi B: Formal
EN: Close reading (15 min): Highlight characters, setting, problem, solution.
ID: Membaca cermat (15 menit): Stabilo tokoh, latar, masalah, solusi.
EN: Text evidence (10 min): Write 2 sentences using quotes or paraphrases.
ID: Bukti teks (10 menit): Tulis 2 kalimat dengan kutipan atau parafrasa.
EN: Summary (10 min): Write a 3-4 sentence summary with the moral.
ID: Ringkasan (10 menit): Tulis ringkasan 3-4 kalimat beserta pesan.

## Assessment / Penilaian
EN: Comprehension (0-10), evidence use (0-5), summary clarity (0-5).
ID: Pemahaman (0-10), bukti teks (0-5), kejelasan ringkasan (0-5).`,
        createdBy: 'teacher-1',
        createdAt: new Date('2024-02-05'),
        updatedAt: new Date('2024-02-05'),
        published: true,
    },
];

// Mock Quizzes
export const mockQuizzes: Quiz[] = [
    {
        id: 'quiz-1',
        materialId: 'math-101',
        title: 'Algebra Basics Quiz',
        description: 'Test your understanding of basic algebra concepts.',
        questions: [
            {
                id: 'q1',
                question: 'What is x if x + 7 = 15?',
                type: 'multiple-choice',
                options: ['6', '7', '8', '9'],
                correctAnswer: 2,
                points: 10,
            },
            {
                id: 'q2',
                question: 'Algebra uses letters to represent unknown values.',
                type: 'true-false',
                options: ['True', 'False'],
                correctAnswer: 0,
                points: 5,
            },
            {
                id: 'q3',
                question: 'Solve: 2x = 10',
                type: 'short-answer',
                correctAnswer: '5',
                points: 10,
            },
        ],
        timeLimit: 15,
        passingScore: 70,
        createdBy: 'teacher-1',
        createdAt: new Date('2024-01-16'),
    },
];

// Mock Progress
export const mockProgress: Progress[] = [
    {
        studentId: 'student-1',
        materialId: 'math-101',
        completed: true,
        progress: 100,
        lastAccessed: new Date('2024-01-20'),
        timeSpent: 45,
    },
    {
        studentId: 'student-1',
        materialId: 'science-101',
        completed: false,
        progress: 60,
        lastAccessed: new Date('2024-01-22'),
        timeSpent: 30,
    },
    {
        studentId: 'student-2',
        materialId: 'math-101',
        completed: false,
        progress: 75,
        lastAccessed: new Date('2024-01-21'),
        timeSpent: 35,
    },
];

// Mock Calendar Events
export const mockCalendarEvents: CalendarEvent[] = [
    {
        id: 'event-1',
        title: 'Math Class - Algebra',
        description: 'Weekly algebra lesson',
        type: 'class',
        startTime: new Date('2024-01-25T10:00:00'),
        endTime: new Date('2024-01-25T11:00:00'),
        participants: ['student-1', 'student-2', 'teacher-1'],
        meetingLink: 'https://meet.example.com/math-class',
        createdBy: 'teacher-1',
    },
    {
        id: 'event-2',
        title: 'Science Project Deadline',
        description: 'Submit your scientific method project',
        type: 'deadline',
        startTime: new Date('2024-01-30T23:59:00'),
        endTime: new Date('2024-01-30T23:59:00'),
        participants: ['student-1'],
        createdBy: 'teacher-1',
    },
    {
        id: 'event-3',
        title: 'Parent-Teacher Meeting',
        description: 'Discuss student progress',
        type: 'meeting',
        startTime: new Date('2024-01-28T14:00:00'),
        endTime: new Date('2024-01-28T14:30:00'),
        participants: ['parent-1', 'teacher-1'],
        meetingLink: 'https://meet.example.com/parent-teacher',
        createdBy: 'teacher-1',
    },
];

// Mock Notes
export const mockNotes: Note[] = [
    {
        id: 'note-1',
        title: 'Algebra Key Points',
        content: 'Remember: always isolate the variable on one side of the equation.',
        materialId: 'math-101',
        createdBy: 'student-1',
        createdAt: new Date('2024-01-18'),
        updatedAt: new Date('2024-01-18'),
        tags: ['algebra', 'math'],
    },
    {
        id: 'note-2',
        title: 'Scientific Method Steps',
        content: 'The 6 steps: Question, Research, Hypothesis, Experiment, Analysis, Conclusion',
        materialId: 'science-101',
        createdBy: 'student-1',
        createdAt: new Date('2024-01-22'),
        updatedAt: new Date('2024-01-22'),
        tags: ['science', 'method'],
    },
];

// Helper functions
export function getMaterialById(id: string): Material | undefined {
    return mockMaterials.find(m => m.id === id);
}

export function getStudentProgress(studentId: string): Progress[] {
    return mockProgress.filter(p => p.studentId === studentId);
}

export function getStudentEvents(studentId: string): CalendarEvent[] {
    return mockCalendarEvents.filter(e => e.participants.includes(studentId));
}

export function getStudentNotes(studentId: string): Note[] {
    return mockNotes.filter(n => n.createdBy === studentId);
}
