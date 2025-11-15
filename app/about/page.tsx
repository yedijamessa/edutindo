"use client";

import { useState } from "react";
import Image from "next/image";

type Founder = {
  role: string;
  name: string;
  imageSrc: string;
  imageAlt: string;
  lines: string[];
};

const FOUNDERS: Founder[] = [
  {
    role: "Trustee",
    name: "U Siahaan",
    imageSrc: "/founders/ulbrits.jpeg",
    imageAlt: "U Siahaan",
    lines: [
      "Non-denominational evangelist and member of the Human Resources & Systems Commission at the Indonesian Bible Society (LAI).",
      "Independent business advisor and ex-COO of a leading national logistics startup (30+ years of experience).",
      "Serves as trustee in several educational foundations.",
      "BSc in Computer Engineering from ITB Polytechnic and BSc in Theology from Doulos Theological Seminary.",
    ],
  },
  {
    role: "Trustee",
    name: "Dr Pramudianto, PCC",
    imageSrc: "/founders/pram.jpeg",
    imageAlt: "Dr Pramudianto",
    lines: [
      "Chairman of the Business Development and Economics Centre at Atma Jaya Yogyakarta Catholic University and lecturer at leading Christian universities (15+ years of teaching).",
      "Founder of a human development consultancy serving corporate clients and education institutions; ex-CHRO of a national workforce sourcing company (20+ years of experience).",
      "Author of 17 books on leadership, character-building, and Christian values.",
      "PhD in Management Science from Satya Wacana Christian University.",
    ],
  },
  {
    role: "Supervisor",
    name: "A Martarina",
    imageSrc: "/founders/agustin.jpg",
    imageAlt: "A Martarina",
    lines: [
      "Education Quality Assurance and Development Specialist (Widyapradja) at the Education Quality Assurance Agency of East Nusa Tenggara (20+ years of experience).",
      "Regional NGO coordinator for education and community work in East Nusa Tenggara.",
      "Master of Accounting from the University of Indonesia.",
    ],
  },
  {
    role: "Executive – President",
    name: "Dr S C Nabilla",
    imageSrc: "/founders/sasza.jpeg",
    imageAlt: "Dr S C Nabilla",
    lines: [
      "Research associate at Imperial College London.",
      "DPhil in Materials Science from the University of Oxford.",
      "Active UK STEAM ambassador connecting science and education.",
    ],
  },
  {
    role: "Executive – Treasurer",
    name: "Y M S Pramudito",
    imageSrc: "/founders/messa.jpeg",
    imageAlt: "Y M S Pramudito",
    lines: [
      "MSc in Data Science from the University of Manchester.",
      "Regional lead of Indonesian church diaspora in the UK.",
      "MBA candidate with a focus on education and social impact.",
    ],
  },
  {
    role: "Executive – Secretary",
    name: "A Aribowo, CGMA",
    imageSrc: "/founders/andre.jpeg",
    imageAlt: "A Aribowo",
    lines: [
      "Endowment accountant at a college within the University of Oxford; ex-Corporate Finance manager at an infrastructure private equity firm.",
      "MSc in Local Economic Development from the London School of Economics.",
      "Chartered Global Management Accountant (CGMA) and CAIA candidate.",
    ],
  },
];

function FounderDetail({ founder }: { founder: Founder }) {
  const { role, name, imageSrc, imageAlt, lines } = founder;
  return (
    <article
      style={{
        borderRadius: 24,
        padding: "22px 26px 24px",
        backgroundColor: "#ffffff",
        boxShadow: "0 18px 45px rgba(15, 23, 42, 0.07)",
        border: "1px solid rgba(148, 163, 184, 0.26)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        maxWidth: 1040,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
        }}
      >
        <div
          style={{
            width: 84,
            height: 84,
            borderRadius: "50%",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={168}
            height={168}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
        <div>
          <p
            style={{
              fontSize: "0.76rem",
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#64748b",
              margin: "0 0 4px",
            }}
          >
            {role}
          </p>
          <h3
            style={{
              margin: 0,
              fontSize: "1.15rem",
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            {name}
          </h3>
        </div>
      </div>

      <div
        style={{
          fontSize: "0.9rem",
          lineHeight: 1.7,
          color: "#334e68",
          marginTop: 4,
        }}
      >
        {lines.map((l, idx) => (
          <p
            key={idx}
            style={{
              margin: idx === lines.length - 1 ? "0" : "0 0 4px",
            }}
          >
            {l}
          </p>
        ))}
      </div>
    </article>
  );
}

export default function AboutPage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeFounder = FOUNDERS[activeIndex];

  return (
    <div
      style={{
        padding: "32px 0 64px",
        background:
          "radial-gradient(circle at top, #e0f2fe 0, #f8fafc 45%, #f1f5f9 100%)",
        minHeight: "calc(100vh - 64px)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1440,
          margin: "0 auto",
          padding: "0 16px",
          display: "flex",
          flexDirection: "column",
          gap: 40,
        }}
      >
        {/* Vision / Intro */}
        <section
          style={{
            width: "100%",
            maxWidth: 1160,
            margin: "0 auto",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "4px 10px",
              borderRadius: 999,
              backgroundColor: "rgba(37, 99, 235, 0.06)",
              border: "1px solid rgba(59, 130, 246, 0.2)",
              marginBottom: 14,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background:
                  "conic-gradient(from 180deg at 50% 50%, #0ea5e9, #22c55e, #f97316, #0ea5e9)",
              }}
            />
            <span
              style={{
                fontSize: "0.78rem",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#1d4ed8",
              }}
            >
              About Edukasi Terang Indonesia
            </span>
          </div>

          <h1
            style={{
              fontSize: "2.4rem",
              lineHeight: 1.15,
              fontWeight: 800,
              color: "#0f172a",
              margin: "0 0 10px",
            }}
          >
            Shaping a generation of{" "}
            <span style={{ color: "#2563eb" }}>bright Indonesian learners</span>
          </h1>

          <p
            style={{
              fontSize: "1rem",
              lineHeight: 1.8,
              color: "#475569",
              margin: "0 0 18px",
              maxWidth: 1160,
            }}
          >
            Edukasi Terang Indonesia exists to guide students to become{" "}
            <strong>faith-driven, innovative, and resilient</strong> learners.
            We want them to master STEAM knowledge, think critically and
            creatively, collaborate with others, and live out{" "}
            <strong>Christian values</strong> in every area of life—becoming a
            light and a blessing to their communities.
          </p>

          <div
            style={{
              borderLeft: "4px solid #2563eb",
              paddingLeft: 16,
              backgroundColor: "#eff6ff",
              borderRadius: 14,
              paddingTop: 14,
              paddingBottom: 14,
            }}
          >
            <p
              style={{
                fontSize: "0.96rem",
                lineHeight: 1.8,
                color: "#1e293b",
                margin: 0,
              }}
            >
              Our vision is to see Indonesian learners who combine{" "}
              <strong>academic excellence</strong> in STEAM,{" "}
              <strong>creative problem-solving</strong>, and{" "}
              <strong>Christ-like character</strong>—young people who can carry
              God’s light into classrooms, campuses, workplaces, and nations.
            </p>
          </div>
        </section>

        {/* Founders */}
        <section
          style={{
            borderRadius: 26,
            padding: "28px 20px 32px",
            background:
              "linear-gradient(135deg, #dbeafe 0%, #e0f2fe 35%, #f9fafb 100%)",
            border: "1px solid rgba(148, 163, 184, 0.35)",
            width: "100%",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 1320,
              margin: "0 auto",
            }}
          >
            <header
              style={{
                marginBottom: 22,
                textAlign: "center",
              }}
            >
              <h2
                style={{
                  fontSize: "1.9rem",
                  fontWeight: 700,
                  color: "#0f172a",
                  margin: "0 0 8px",
                }}
              >
                The Team Behind the Vision
              </h2>
              <p
                style={{
                  fontSize: "0.95rem",
                  lineHeight: 1.75,
                  color: "#334155",
                  margin: 0,
                  maxWidth: 960,
                  marginInline: "auto",
                }}
              >
                Meet the trustees and executives who steward the vision and
                values of Edukasi Terang Indonesia.
              </p>
            </header>

            {/* Selector row – centred, scrollable on mobile */}
            <div
              style={{
                marginBottom: 18,
                paddingBottom: 6,
                overflowX: "auto",
                WebkitOverflowScrolling: "touch",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 12,
                  minWidth: "max-content",
                  paddingInline: 4,
                }}
              >
                {FOUNDERS.map((f, index) => {
                  const isActive = index === activeIndex;
                  return (
                    <button
                      key={f.name}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 14px",
                        borderRadius: 999,
                        border: isActive
                          ? "2px solid #2563eb" // lebih tebal supaya nggak kelihatan putus
                          : "1px solid rgba(148, 163, 184, 0.6)",
                        backgroundColor: isActive
                          ? "linear-gradient(135deg, #dbeafe, #eff6ff)"
                          : "rgba(255, 255, 255, 0.98)",
                        boxShadow: isActive
                          ? "0 6px 18px rgba(37, 99, 235, 0.18)"
                          : "0 3px 10px rgba(148, 163, 184, 0.15)",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                        // tidak pakai minHeight & transform lagi supaya bentuknya bersih
                      }}
                    >
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          overflow: "hidden",
                          flexShrink: 0,
                        }}
                      >
                        <Image
                          src={f.imageSrc}
                          alt={f.imageAlt}
                          width={64}
                          height={64}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          lineHeight: 1.2,
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.7rem",
                            fontWeight: 500,
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            color: "#64748b",
                          }}
                        >
                          {f.role}
                        </span>
                        <span
                          style={{
                            fontSize: "0.86rem",
                            fontWeight: 600,
                            color: "#0f172a",
                          }}
                        >
                          {f.name}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>


            {/* Single detail card */}
            <FounderDetail founder={activeFounder} />
          </div>
        </section>
      </div>
    </div>
  );
}
