
import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import * as schema from '../db/schema';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Use sql directly to avoid pool config issues during scripting, or rely on POSTGRES_URL env var auto-pickup
const db = drizzle(sql, { schema });

async function seed() {
    console.log('🚀 Seeding Postgres...');

    try {
        // --- Users ---
        console.log('👤 Seeding Users...');
        await db.insert(schema.users).values([
            { id: 'user-001', name: 'Sarah Johnson', email: 'sarah@example.com', role: 'student', avatar: '/avatars/student1.png' },
            { id: 'user-002', name: 'Dr. Emily Watson', email: 'emily@edutindo.org', role: 'teacher', avatar: '/avatars/teacher1.png' },
            { id: 'user-003', name: 'Robert Johnson', email: 'robert@example.com', role: 'parent', avatar: '/avatars/parent1.png' }
        ]).onConflictDoNothing();

        // --- Materials ---
        console.log('📚 Seeding Materials...');
        const materials = [
            // === Computer Science Track ===
            {
                id: 'cs-101',
                title: 'Intro to Computational Thinking',
                subject: 'Computer Science',
                description: 'Understand how computers solve problems.',
                content: '# Computational Thinking\n\nDecomposition, Pattern Recognition, Abstraction, and Algorithms.',
                type: 'video',
                url: 'https://www.youtube.com/watch?v=vfliJFqjjoA',
                prerequisites: [],
                published: true,
                createdBy: 'user-002'
            },
            {
                id: 'cs-102',
                title: 'Python Basics: Variables & Loops',
                subject: 'Computer Science',
                description: 'Write your first Python program.',
                content: '# Python Basics\n\n```python\nprint("Hello World")\n```',
                type: 'document',
                prerequisites: [{ materialId: 'cs-101', requiredQuizScore: 80 }],
                published: true,
                createdBy: 'user-002'
            },
            {
                id: 'cs-103',
                title: 'Data Structures: Arrays & Lists',
                subject: 'Computer Science',
                description: 'Organizing data efficiently.',
                content: '# Data Structures\n\nLists are ordered collections...',
                type: 'pdf',
                prerequisites: [{ materialId: 'cs-102', requiredQuizScore: 75 }],
                published: true,
                createdBy: 'user-002'
            },
            // === Mathematics Track ===
            {
                id: 'math-101',
                title: 'Algebra: Linear Equations',
                subject: 'Mathematics',
                description: 'Solving for X in one variable.',
                content: '# Linear Equations\n\nBalance the equation.',
                type: 'document',
                prerequisites: [],
                published: true,
                createdBy: 'user-002'
            },
            {
                id: 'math-102',
                title: 'Geometry: Triangles & Circles',
                subject: 'Mathematics',
                description: 'Properties of shapes and calculating area.',
                content: '# Geometry\n\nPythagorean theorem.',
                type: 'pdf',
                prerequisites: [{ materialId: 'math-101', requiredQuizScore: 60 }],
                published: true,
                createdBy: 'user-002'
            },
            // === Early Literacy & Numeracy Track ===
            {
                id: 'baca-101',
                title: 'Latihan Baca: Huruf dan Kata',
                subject: 'Literasi',
                description: 'Bilingual remedial reading for junior high with playful and formal lesson options.',
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
                type: 'document',
                prerequisites: [],
                published: true,
                createdBy: 'user-002'
            },
            {
                id: 'menulis-101',
                title: 'Latihan Menulis: Bentuk Huruf',
                subject: 'Literasi',
                description: 'Bilingual writing practice for junior high with playful and formal lesson options.',
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
                type: 'document',
                prerequisites: [],
                published: true,
                createdBy: 'user-002'
            },
            {
                id: 'hitung-101',
                title: 'Latihan Menghitung: 1-20',
                subject: 'Numerasi',
                description: 'Bilingual counting and basic operations for junior high with playful and formal lesson options.',
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
                type: 'document',
                prerequisites: [],
                published: true,
                createdBy: 'user-002'
            },
            {
                id: 'numeracy-101',
                title: 'Numerasi Dasar: Pola dan Perbandingan',
                subject: 'Numerasi',
                description: 'Bilingual numeracy foundations for patterns, order, and comparisons with playful and formal options.',
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
                type: 'document',
                prerequisites: [],
                published: true,
                createdBy: 'user-002'
            },
            {
                id: 'literature-101',
                title: 'Literatur Anak: Cerita Pendek',
                subject: 'Literature',
                description: 'Bilingual short story reading and comprehension for junior high with playful and formal options.',
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
                type: 'document',
                prerequisites: [],
                published: true,
                createdBy: 'user-002'
            }
        ];

        for (const m of materials) {
            const { id, ...update } = m;
            await db.insert(schema.materials).values(m).onConflictDoUpdate({
                target: schema.materials.id,
                set: { ...update, updatedAt: new Date() }
            });
        }

        // --- Quizzes ---
        console.log('📝 Seeding Quizzes...');
        const quizzes = [
            {
                id: 'quiz-cs-101',
                materialId: 'cs-101',
                title: 'Computational Thinking Check',
                description: 'Assessment for Computational Thinking',
                questions: [
                    { id: 'q1', type: 'multiple-choice', question: 'Which is NOT a pillar of computational thinking?', options: ['Decomposition', 'Abstraction', 'Memorization', 'Pattern Recognition'], correctAnswer: 2, points: 10 },
                    { id: 'q2', type: 'true-false', question: 'Abstraction means hiding complex details.', options: ['True', 'False'], correctAnswer: 0, points: 10 }
                ],
                passingScore: 80,
                createdBy: 'user-002'
            },
            {
                id: 'quiz-math-101',
                materialId: 'math-101',
                title: 'Algebra Basics',
                description: 'Assessment for Algebra',
                questions: [
                    { id: 'q1', type: 'multiple-choice', question: 'Solve: 2x = 10', options: ['2', '5', '8', '20'], correctAnswer: 1, points: 10 }
                ],
                passingScore: 60,
                createdBy: 'user-002'
            },
            {
                id: 'quiz-baca-101-playful',
                materialId: 'baca-101',
                title: 'Latihan Baca (Playful Quiz)',
                description: 'Bilingual playful quiz for reading practice.',
                timeLimit: 15,
                questions: [
                    { id: 'q1', type: 'multiple-choice', question: 'EN: Blend "ba" + "ta" = ? ID: Gabungkan "ba" + "ta" = ?', options: ['bata', 'batu', 'buta', 'beta'], correctAnswer: 0, points: 10 },
                    { id: 'q2', type: 'multiple-choice', question: 'EN: Which word starts with "me"? ID: Kata mana yang diawali "me"?', options: ['buku', 'meja', 'bola', 'sapu'], correctAnswer: 1, points: 10 },
                    { id: 'q3', type: 'true-false', question: 'EN: "bi" is a syllable. ID: "bi" adalah suku kata.', options: ['True', 'False'], correctAnswer: 0, points: 5 },
                    { id: 'q4', type: 'multiple-choice', question: 'EN: Read the word for the picture of a ball. ID: Baca kata untuk gambar bola.', options: ['bola', 'bala', 'bila', 'bulo'], correctAnswer: 0, points: 10 },
                    { id: 'q5', type: 'short-answer', question: 'EN: Write one word using "ba". ID: Tulis satu kata dengan "ba".', correctAnswer: 'baju', points: 10 }
                ],
                passingScore: 70,
                createdBy: 'user-002'
            },
            {
                id: 'quiz-baca-101-formal',
                materialId: 'baca-101',
                title: 'Latihan Baca (Formal Quiz)',
                description: 'Bilingual formal quiz for decoding and fluency.',
                timeLimit: 15,
                questions: [
                    { id: 'q1', type: 'multiple-choice', question: 'EN: Choose the correct blend for "ba + ni". ID: Pilih gabungan yang benar "ba + ni".', options: ['bani', 'bina', 'buna', 'bena'], correctAnswer: 0, points: 10 },
                    { id: 'q2', type: 'multiple-choice', question: 'EN: Which word is correctly spelled? ID: Kata yang ejaannya benar?', options: ['mjea', 'meja', 'mejae', 'mejaa'], correctAnswer: 1, points: 10 },
                    { id: 'q3', type: 'true-false', question: 'EN: "bo" is a vowel. ID: "bo" adalah vokal.', options: ['True', 'False'], correctAnswer: 1, points: 5 },
                    { id: 'q4', type: 'short-answer', question: 'EN: Read this word aloud: "buku". ID: Baca kata ini: "buku".', correctAnswer: 'buku', points: 10 },
                    { id: 'q5', type: 'short-answer', question: 'EN: Write a word with "me". ID: Tulis kata dengan "me".', correctAnswer: 'meja', points: 10 }
                ],
                passingScore: 70,
                createdBy: 'user-002'
            },
            {
                id: 'quiz-menulis-101-playful',
                materialId: 'menulis-101',
                title: 'Latihan Menulis (Playful Quiz)',
                description: 'Playful writing quiz focusing on spacing and letter form.',
                timeLimit: 15,
                questions: [
                    { id: 'q1', type: 'multiple-choice', question: 'EN: Which word has correct spacing? ID: Kata dengan spasi yang benar?', options: ['bu ku', 'b uku', 'buku', 'bu kuu'], correctAnswer: 2, points: 10 },
                    { id: 'q2', type: 'multiple-choice', question: 'EN: Choose the neatest version. ID: Pilih versi paling rapi.', options: ['b o l a', 'bola', 'bo la', 'bol a'], correctAnswer: 1, points: 10 },
                    { id: 'q3', type: 'true-false', question: 'EN: Capital letters start a sentence. ID: Huruf kapital mengawali kalimat.', options: ['True', 'False'], correctAnswer: 0, points: 5 },
                    { id: 'q4', type: 'short-answer', question: 'EN: Rewrite neatly: "saya suka buku." ID: Tulis rapi: "saya suka buku."', correctAnswer: 'Saya suka buku.', points: 10 }
                ],
                passingScore: 70,
                createdBy: 'user-002'
            },
            {
                id: 'quiz-menulis-101-formal',
                materialId: 'menulis-101',
                title: 'Latihan Menulis (Formal Quiz)',
                description: 'Formal writing quiz focusing on structure and accuracy.',
                timeLimit: 15,
                questions: [
                    { id: 'q1', type: 'multiple-choice', question: 'EN: Choose the correctly capitalized sentence. ID: Pilih kalimat dengan kapital yang benar.', options: ['dia pergi ke sekolah.', 'Dia pergi ke sekolah.', 'dia Pergi ke Sekolah.', 'Dia pergi Ke sekolah.'], correctAnswer: 1, points: 10 },
                    { id: 'q2', type: 'multiple-choice', question: 'EN: Which sentence has proper punctuation? ID: Kalimat dengan tanda baca benar?', options: ['Saya membaca buku', 'Saya membaca buku.', 'Saya membaca buku,', 'Saya membaca buku!'], correctAnswer: 1, points: 10 },
                    { id: 'q3', type: 'short-answer', question: 'EN: Write one clear sentence about school. ID: Tulis satu kalimat jelas tentang sekolah.', correctAnswer: 'Saya belajar di sekolah.', points: 10 },
                    { id: 'q4', type: 'true-false', question: 'EN: Spacing between words improves readability. ID: Spasi antar kata membuat tulisan lebih mudah dibaca.', options: ['True', 'False'], correctAnswer: 0, points: 5 }
                ],
                passingScore: 70,
                createdBy: 'user-002'
            },
            {
                id: 'quiz-hitung-101-playful',
                materialId: 'hitung-101',
                title: 'Latihan Menghitung (Playful Quiz)',
                description: 'Playful numeracy quiz within 20.',
                timeLimit: 15,
                questions: [
                    { id: 'q1', type: 'multiple-choice', question: 'EN: 7 + 5 = ? ID: 7 + 5 = ?', options: ['10', '11', '12', '13'], correctAnswer: 2, points: 10 },
                    { id: 'q2', type: 'multiple-choice', question: 'EN: 14 - 6 = ? ID: 14 - 6 = ?', options: ['6', '7', '8', '9'], correctAnswer: 2, points: 10 },
                    { id: 'q3', type: 'true-false', question: 'EN: 9 is greater than 12. ID: 9 lebih besar dari 12.', options: ['True', 'False'], correctAnswer: 1, points: 5 },
                    { id: 'q4', type: 'short-answer', question: 'EN: Count: 3 apples + 4 apples = ? ID: Hitung: 3 apel + 4 apel = ?', correctAnswer: '7', points: 10 }
                ],
                passingScore: 70,
                createdBy: 'user-002'
            },
            {
                id: 'quiz-hitung-101-formal',
                materialId: 'hitung-101',
                title: 'Latihan Menghitung (Formal Quiz)',
                description: 'Formal numeracy quiz within 20.',
                timeLimit: 15,
                questions: [
                    { id: 'q1', type: 'multiple-choice', question: 'EN: Which number is the smallest? ID: Angka paling kecil?', options: ['18', '12', '9', '15'], correctAnswer: 2, points: 10 },
                    { id: 'q2', type: 'multiple-choice', question: 'EN: 16 - 9 = ? ID: 16 - 9 = ?', options: ['6', '7', '8', '9'], correctAnswer: 1, points: 10 },
                    { id: 'q3', type: 'short-answer', question: 'EN: Write the number after 13. ID: Tulis angka setelah 13.', correctAnswer: '14', points: 10 },
                    { id: 'q4', type: 'true-false', question: 'EN: 5 + 8 = 13. ID: 5 + 8 = 13.', options: ['True', 'False'], correctAnswer: 0, points: 5 }
                ],
                passingScore: 70,
                createdBy: 'user-002'
            },
            {
                id: 'quiz-numeracy-101-playful',
                materialId: 'numeracy-101',
                title: 'Numerasi Dasar (Playful Quiz)',
                description: 'Playful quiz on patterns and comparisons.',
                timeLimit: 15,
                questions: [
                    { id: 'q1', type: 'multiple-choice', question: 'EN: Complete the pattern: 2, 4, 6, __ ID: Lengkapi pola: 2, 4, 6, __', options: ['7', '8', '9', '10'], correctAnswer: 1, points: 10 },
                    { id: 'q2', type: 'multiple-choice', question: 'EN: Choose the correct sign: 9 __ 11 ID: Pilih tanda: 9 __ 11', options: ['>', '<', '='], correctAnswer: 1, points: 10 },
                    { id: 'q3', type: 'true-false', question: 'EN: 5, 10, 15 is a pattern of +5. ID: 5, 10, 15 adalah pola +5.', options: ['True', 'False'], correctAnswer: 0, points: 5 },
                    { id: 'q4', type: 'short-answer', question: 'EN: Order these: 7, 3, 9 (small to large). ID: Urutkan: 7, 3, 9 (kecil ke besar).', correctAnswer: '3, 7, 9', points: 10 }
                ],
                passingScore: 70,
                createdBy: 'user-002'
            },
            {
                id: 'quiz-numeracy-101-formal',
                materialId: 'numeracy-101',
                title: 'Numerasi Dasar (Formal Quiz)',
                description: 'Formal quiz on patterns and comparisons.',
                timeLimit: 15,
                questions: [
                    { id: 'q1', type: 'multiple-choice', question: 'EN: Next number: 1, 3, 5, __ ID: Angka berikutnya: 1, 3, 5, __', options: ['6', '7', '8', '9'], correctAnswer: 1, points: 10 },
                    { id: 'q2', type: 'multiple-choice', question: 'EN: 12 __ 12 ID: 12 __ 12', options: ['>', '<', '='], correctAnswer: 2, points: 10 },
                    { id: 'q3', type: 'short-answer', question: 'EN: Put in order: 14, 2, 9. ID: Urutkan: 14, 2, 9.', correctAnswer: '2, 9, 14', points: 10 },
                    { id: 'q4', type: 'true-false', question: 'EN: A pattern can increase or decrease. ID: Pola bisa naik atau turun.', options: ['True', 'False'], correctAnswer: 0, points: 5 }
                ],
                passingScore: 70,
                createdBy: 'user-002'
            },
            {
                id: 'quiz-literature-101-playful',
                materialId: 'literature-101',
                title: 'Literatur Anak (Playful Quiz)',
                description: 'Playful comprehension quiz.',
                timeLimit: 15,
                questions: [
                    { id: 'q1', type: 'multiple-choice', question: 'EN: Who are the main characters? ID: Siapa tokoh utama?', options: ['Rabbit and Turtle', 'Cat and Dog', 'Lion and Deer', 'Bird and Fish'], correctAnswer: 0, points: 10 },
                    { id: 'q2', type: 'multiple-choice', question: 'EN: The moral is about __. ID: Pesan cerita tentang __.', options: ['Speed only', 'Persistence', 'Luck', 'Silence'], correctAnswer: 1, points: 10 },
                    { id: 'q3', type: 'true-false', question: 'EN: The turtle wins by being consistent. ID: Kura-kura menang karena konsisten.', options: ['True', 'False'], correctAnswer: 0, points: 5 },
                    { id: 'q4', type: 'short-answer', question: 'EN: Write one lesson from the story. ID: Tulis satu pelajaran dari cerita.', correctAnswer: 'Jangan menyerah.', points: 10 }
                ],
                passingScore: 70,
                createdBy: 'user-002'
            },
            {
                id: 'quiz-literature-101-formal',
                materialId: 'literature-101',
                title: 'Literatur Anak (Formal Quiz)',
                description: 'Formal comprehension quiz.',
                timeLimit: 15,
                questions: [
                    { id: 'q1', type: 'multiple-choice', question: 'EN: Identify the setting. ID: Identifikasi latar cerita.', options: ['Forest track', 'City market', 'Beach', 'Mountain'], correctAnswer: 0, points: 10 },
                    { id: 'q2', type: 'multiple-choice', question: 'EN: The conflict is __. ID: Konflik cerita adalah __.', options: ['A race', 'A storm', 'A missing item', 'A festival'], correctAnswer: 0, points: 10 },
                    { id: 'q3', type: 'short-answer', question: 'EN: Summarize the story in one sentence. ID: Ringkas cerita dalam satu kalimat.', correctAnswer: 'Kelinci dan kura-kura berlomba, kura-kura menang karena tekun.', points: 10 },
                    { id: 'q4', type: 'true-false', question: 'EN: The rabbit shows good sportsmanship. ID: Kelinci menunjukkan sportivitas.', options: ['True', 'False'], correctAnswer: 1, points: 5 }
                ],
                passingScore: 70,
                createdBy: 'user-002'
            }
        ];

        for (const q of quizzes) {
            const { id, ...update } = q;
            await db.insert(schema.quizzes).values(q).onConflictDoUpdate({
                target: schema.quizzes.id,
                set: update
            });
        }

        // --- Progress ---
        console.log('📈 Seeding Progress...');
        const progressData = [
            {
                studentId: 'user-001',
                materialId: 'cs-101',
                completed: true,
                progress: 100,
                quizScores: [{ quizId: 'quiz-cs-101', score: 100, attempts: 1, lastAttempt: new Date() }],
                timeSpent: 45
            },
            {
                studentId: 'user-001',
                materialId: 'math-101',
                completed: true,
                progress: 100,
                quizScores: [{ quizId: 'quiz-math-101', score: 100, attempts: 1, lastAttempt: new Date() }],
                timeSpent: 30
            }
        ];

        for (const p of progressData) {
            await db.insert(schema.progress).values(p).onConflictDoNothing();
        }

        // --- Mindmaps ---
        console.log('🧠 Seeding Mindmaps...');
        await db.insert(schema.mindmaps).values({
            id: 'mm-cs-1',
            title: 'My Coding Journey',
            subject: 'Computer Science',
            nodes: {
                root: { id: 'root', text: 'Programming', x: 500, y: 300, color: 'bg-blue-600', children: ['n1', 'n2'] },
                n1: { id: 'n1', text: 'Frontend', x: 300, y: 200, color: 'bg-pink-500', children: ['n3'] },
                n2: { id: 'n2', text: 'Backend', x: 700, y: 200, color: 'bg-purple-500', children: [] },
                n3: { id: 'n3', text: 'React', x: 200, y: 100, color: 'bg-cyan-500', children: [] }
            },
            createdBy: 'user-001'
        }).onConflictDoNothing();

        console.log('✨ Seed complete!');
    } catch (error) {
        console.error('❌ Error seeding:', error);
        process.exit(1);
    }
}

seed().then(() => process.exit(0));
