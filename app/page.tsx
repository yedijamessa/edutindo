"use client";

import type { ReactNode } from "react";
import Image from "next/image";

type InfoCardTheme = "orange" | "teal" | "pink" | "purple" | "blue";

type InfoCardProps = {
  title: string;
  children: ReactNode;
  theme?: InfoCardTheme;
};

function InfoCard({ title, children, theme = "blue" }: InfoCardProps) {
  const palette: Record<InfoCardTheme, { bg: string; border: string; chip: string }> = {
    orange: {
      bg: "linear-gradient(135deg,#ffedd5,#fed7aa)",
      border: "rgba(248,153,72,0.7)",
      chip: "#f97316",
    },
    teal: {
      bg: "linear-gradient(135deg,#ccfbf1,#a5f3fc)",
      border: "rgba(45,212,191,0.7)",
      chip: "#06b6d4",
    },
    pink: {
      bg: "linear-gradient(135deg,#ffe4e6,#fecaca)",
      border: "rgba(244,114,182,0.7)",
      chip: "#ec4899",
    },
    purple: {
      bg: "linear-gradient(135deg,#e9d5ff,#ddd6fe)",
      border: "rgba(139,92,246,0.7)",
      chip: "#8b5cf6",
    },
    blue: {
      bg: "linear-gradient(135deg,#dbeafe,#bfdbfe)",
      border: "rgba(59,130,246,0.7)",
      chip: "#2563eb",
    },
  };

  const { bg, border, chip } = palette[theme];

  return (
    <div
      className="eti-card eti-info-card"
      style={{
        borderRadius: 22,
        padding: "18px 18px 20px",
        background: bg,
        boxShadow: "0 18px 40px rgba(15,23,42,0.10)",
        border: `1px solid ${border}`,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        minWidth: 260,
        maxWidth: 320,
        flex: "0 0 280px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 2,
        }}
      >
        <span
          style={{
            width: 14,
            height: 14,
            borderRadius: "50%",
            background:
              "conic-gradient(from 180deg at 50% 50%, #22c55e, #0ea5e9, #f97316, #22c55e)",
            boxShadow: `0 0 0 4px ${border}`,
          }}
        />
        <h3
          style={{
            fontSize: "1.02rem",
            fontWeight: 800,
            color: "var(--eti-text-main)",
            margin: 0,
          }}
        >
          {title}
        </h3>
      </div>
      <p
        style={{
          fontSize: "0.92rem",
          lineHeight: 1.7,
          color: "var(--eti-text-muted)",
          margin: 0,
        }}
      >
        {children}
      </p>
    </div>
  );
}


type CurriculumCardProps = {
  title: string;
  children: ReactNode;
  icon?: string;
  badge?: string;
  accent?: "orange" | "teal" | "pink" | "indigo";
};

function CurriculumCard({
  title,
  children,
  icon = "🎓",
  badge,
  accent = "indigo",
}: CurriculumCardProps) {
  const palette: Record<
    NonNullable<CurriculumCardProps["accent"]>,
    { bg: string; border: string; chipBg: string }
  > = {
    orange: {
      bg: "linear-gradient(135deg,#fffbeb,#ffedd5)",
      border: "rgba(245,158,11,0.7)",
      chipBg: "rgba(251,191,36,0.9)",
    },
    teal: {
      bg: "linear-gradient(135deg,#ecfeff,#cffafe)",
      border: "rgba(34,211,238,0.7)",
      chipBg: "rgba(45,212,191,0.95)",
    },
    pink: {
      bg: "linear-gradient(135deg,#fdf2f8,#ffe4e6)",
      border: "rgba(236,72,153,0.7)",
      chipBg: "rgba(244,114,182,0.95)",
    },
    indigo: {
      bg: "linear-gradient(135deg,#eef2ff,#e0f2fe)",
      border: "rgba(79,70,229,0.7)",
      chipBg: "rgba(59,130,246,0.95)",
    },
  };

  const { bg, border, chipBg } = palette[accent];

  return (
    <div
      className="eti-card eti-curriculum-card"
      style={{
        borderRadius: 22,
        padding: "16px 18px 18px",
        background: bg,
        border: `1px solid ${border}`,
        display: "flex",
        alignItems: "flex-start",
        gap: 14,
      }}
    >
      {/* icon bubble */}
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: "999px",
          background: chipBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.35rem",
          boxShadow: "0 10px 22px rgba(15,23,42,0.18)",
          flexShrink: 0,
        }}
      >
        <span aria-hidden="true">{icon}</span>
      </div>

      {/* text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {badge && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "2px 9px",
              borderRadius: 999,
              fontSize: "0.7rem",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#0f172a",
              background: "rgba(255,255,255,0.7)",
              marginBottom: 4,
            }}
          >
            {badge}
          </div>
        )}
        <h3
          style={{
            fontSize: "1.02rem",
            fontWeight: 800,
            margin: "0 0 4px",
            color: "var(--eti-text-main)",
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: "0.92rem",
            lineHeight: 1.7,
            color: "var(--eti-text-muted)",
            margin: 0,
          }}
        >
          {children}
        </p>
      </div>
    </div>
  );
}


export default function HomePage() {
  return (
    <div
      className="eti-page"
      style={{
        padding: "32px 0 72px",
        background:
          "linear-gradient(180deg, #eff6ff 0%, #f9fafb 45%, #ffffff 100%)",
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
          gap: 64,
        }}
      >
        {/* ===================== HERO / FIRST VIEW ===================== */}
        <section
          className="eti-hero-section"
          style={{
            position: "relative",
            borderRadius: 32,
            padding: "32px 24px 30px",
            background:
              "linear-gradient(135deg, #2563eb 0%, #4f46e5 40%, #0ea5e9 100%)",
            color: "#ffffff",
            overflow: "hidden",
          }}
        >
          {/* Decorative shapes */}
          <div
            style={{
              position: "absolute",
              right: -120,
              top: -80,
              width: 420,
              height: 420,
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 30% 30%, #facc15, #f97316 55%, #fb923c 100%)",
              opacity: 0.9,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: -80,
              bottom: -120,
              width: 260,
              height: 260,
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 40% 40%, rgba(96,165,250,0.9), rgba(59,130,246,0.3))",
              opacity: 0.6,
            }}
          />

          <div
            style={{
              position: "relative",
              display: "flex",
              flexWrap: "wrap",
              gap: 32,
              alignItems: "center",
            }}
          >
            {/* Left: tagline + copy + role cards */}
            <div
              style={{
                minWidth: 260,
                flex: "1 1 320px",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "5px 11px",
                  borderRadius: 999,
                  backgroundColor: "rgba(15,23,42,0.25)",
                  border: "1px solid rgba(191,219,254,0.6)",
                  marginBottom: 12,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#22c55e",
                  }}
                />
                <span
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                  }}
                >
                  EDUKASI TERANG INDONESIA
                </span>
              </div>

              <h1
                style={{
                  fontSize: "2.6rem",
                  lineHeight: 1.1,
                  fontWeight: 800,
                  margin: "0 0 8px",
                }}
              >
                Building Futures,
                <br />
                <span style={{ color: "#facc15" }}>Breaking Barriers</span>
              </h1>

              <p
                style={{
                  fontSize: "1rem",
                  lineHeight: 1.8,
                  maxWidth: 540,
                  margin: "0 0 18px",
                }}
              >
                A Christian STEAM education initiative for Indonesia&apos;s next
                generation of innovators, leaders, and servant-hearted citizens.
                We partner with schools, teachers, parents, and learners to
                bring bright, values-driven learning to life.
              </p>

              <p
                style={{
                  fontSize: "0.9rem",
                  letterSpacing: "0.13em",
                  textTransform: "uppercase",
                  margin: "0 0 10px",
                  opacity: 0.9,
                }}
              >
                Start your journey
              </p>

              {/* Role selection cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 14,
                }}
              >
                <a
                  href="#for-educators"
                  className="eti-hero-card"
                  style={{
                    textDecoration: "none",
                    borderRadius: 18,
                    padding: "14px 14px 16px",
                    background: "#f97316",
                    boxShadow: "0 12px 30px rgba(15,23,42,0.28)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      opacity: 0.9,
                    }}
                  >
                    For educators &amp; partners
                  </span>
                  <span
                    style={{
                      fontSize: "1.02rem",
                      fontWeight: 800,
                    }}
                  >
                    I&apos;m an Educator
                  </span>
                  <span
                    style={{
                      fontSize: "0.86rem",
                      lineHeight: 1.5,
                      opacity: 0.95,
                    }}
                  >
                    Principal, teacher, or school owner seeking curriculum
                    reform and training.
                  </span>
                </a>

                <a
                  href="#for-learners"
                  className="eti-hero-card"
                  style={{
                    textDecoration: "none",
                    borderRadius: 18,
                    padding: "14px 14px 16px",
                    background: "rgba(15,23,42,0.32)",
                    border: "1px solid rgba(191,219,254,0.7)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      opacity: 0.9,
                    }}
                  >
                    For students &amp; parents
                  </span>
                  <span
                    style={{
                      fontSize: "1.02rem",
                      fontWeight: 800,
                    }}
                  >
                    I&apos;m a Learner
                  </span>
                  <span
                    style={{
                      fontSize: "0.86rem",
                      lineHeight: 1.5,
                      opacity: 0.95,
                    }}
                  >
                    Parent or student looking for a joyful, future-ready
                    learning experience.
                  </span>
                </a>
              </div>
            </div>

            {/* Right: hero image card */}
            <div
              style={{
                minWidth: 260,
                flex: "1 1 320px",
              }}
            >
              <div
                className="eti-hero-image-card"
                style={{
                  borderRadius: 26,
                  padding: 18,
                  background: "rgba(248,250,252,0.98)",
                  boxShadow: "0 18px 40px rgba(15,23,42,0.45)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    borderRadius: 20,
                    overflow: "hidden",
                    backgroundColor: "#0f172a",
                  }}
                >
                  <Image
                    src="/homepage/eti-hero-classroom.jpg"
                    alt="Teacher and children learning joyfully"
                    width={640}
                    height={430}
                    style={{
                      width: "100%",
                      height: "auto",
                      objectFit: "cover",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: "0.78rem",
                        letterSpacing: "0.13em",
                        textTransform: "uppercase",
                        color: "#6b7280",
                        margin: "0 0 3px",
                      }}
                    >
                      A new Christian STEAM concept
                    </p>
                    <p
                      style={{
                        fontSize: "0.96rem",
                        fontWeight: 700,
                        color: "#0f172a",
                        margin: 0,
                      }}
                    >
                      STEAM–C++: Faith-filled minds, future-ready skills.
                    </p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background:
                          "conic-gradient(from 180deg at 50% 50%, #22c55e,#0ea5e9,#f97316,#22c55e)",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "0.82rem",
                        color: "#4b5563",
                      }}
                    >
                      For Indonesian schools, communities, and families.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== QUICK PATHWAYS / 3 COLOURFUL CARDS ===================== */}
        <section
          id="for-educators"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 18,
          }}
        >
          <div
            className="eti-card etipill"
            style={{
              borderRadius: 24,
              padding: "20px 18px 22px",
              background: "#f97316",
              color: "#ffffff",
              boxShadow: "0 18px 40px rgba(248,113,113,0.4)",
            }}
          >
            <h3
              style={{
                fontSize: "1.18rem",
                fontWeight: 800,
                margin: "0 0 6px",
              }}
            >
              School Partnership
            </h3>
            <p
              style={{
                fontSize: "0.92rem",
                lineHeight: 1.7,
                margin: "0 0 14px",
              }}
            >
              Collaborate with us to redesign your curriculum using our
              STEAM–C++ framework, training, and mentoring.
            </p>
            <button
              style={{
                borderRadius: 999,
                border: "none",
                padding: "8px 14px",
                fontSize: "0.85rem",
                fontWeight: 600,
                background: "#ffffff",
                color: "#f97316",
                cursor: "pointer",
              }}
            >
              For Principals &amp; Owners
            </button>
          </div>

          <div
            className="eti-card etipill"
            style={{
              borderRadius: 24,
              padding: "20px 18px 22px",
              background: "#06b6d4",
              color: "#ffffff",
              boxShadow: "0 18px 40px rgba(8,47,73,0.35)",
            }}
          >
            <h3
              style={{
                fontSize: "1.18rem",
                fontWeight: 800,
                margin: "0 0 6px",
              }}
            >
              Teacher Growth
            </h3>
            <p
              style={{
                fontSize: "0.92rem",
                lineHeight: 1.7,
                margin: "0 0 14px",
              }}
            >
              Workshops, coaching, and ready-to-use lesson designs that make
              STEAM &amp; character-building practical in the classroom.
            </p>
            <button
              style={{
                borderRadius: 999,
                border: "none",
                padding: "8px 14px",
                fontSize: "0.85rem",
                fontWeight: 600,
                background: "#ffffff",
                color: "#06b6d4",
                cursor: "pointer",
              }}
            >
              For Teachers
            </button>
          </div>

          <div
            id="for-learners"
            className="eti-card etipill"
            style={{
              borderRadius: 24,
              padding: "20px 18px 22px",
              background: "#facc15",
              color: "#1f2933",
              boxShadow: "0 18px 40px rgba(251,191,36,0.55)",
            }}
          >
            <h3
              style={{
                fontSize: "1.18rem",
                fontWeight: 800,
                margin: "0 0 6px",
              }}
            >
              Learner Experience
            </h3>
            <p
              style={{
                fontSize: "0.92rem",
                lineHeight: 1.7,
                margin: "0 0 14px",
              }}
            >
              Joyful projects, clubs, and programs where students explore
              science, tech, arts, and faith in everyday life.
            </p>
            <button
              style={{
                borderRadius: 999,
                border: "none",
                padding: "8px 14px",
                fontSize: "0.85rem",
                fontWeight: 600,
                background: "#1f2933",
                color: "#facc15",
                cursor: "pointer",
              }}
            >
              For Parents &amp; Students
            </button>
          </div>
        </section>

                {/* ===================== WHY IT'S NEEDED ===================== */}
        <section
          className="eti-section-soft"
          style={{
            borderRadius: 28,
            padding: "30px 24px 34px",
            background:
              "radial-gradient(circle at top left, #e0f2fe 0%, #dbeafe 40%, #eff6ff 100%)",
            border: "1px solid rgba(148,163,184,0.35)",
          }}
        >
          <header
            style={{
              marginBottom: 18,
              maxWidth: 780,
            }}
          >
            <h2
              style={{
                fontSize: "1.8rem",
                fontWeight: 800,
                color: "var(--eti-text-main)",
                margin: "0 0 6px",
              }}
            >
              Why Indonesia Needs This Now
            </h2>
            <p
              style={{
                fontSize: "0.96rem",
                lineHeight: 1.8,
                color: "var(--eti-text-muted)",
                margin: 0,
              }}
            >
              Indonesia has world-class potential in its young people. But gaps
              in critical thinking, confidence, and character formation mean
              many students never fully grow into the innovators and leaders
              they could be.
            </p>
          </header>

          {/* one colourful row with horizontal scroll on small screens */}
          <div
            style={{
              display: "flex",
              gap: 16,
              overflowX: "auto",
              paddingBottom: 6,
              marginTop: 8,
              scrollbarWidth: "thin",
            }}
          >
            <InfoCard theme="orange" title="When Talent Isn’t Enough">
              Indonesia is home to countless talented students with innovative
              ideas. Yet a lack of confidence to think critically and speak
              boldly creates barriers that hinder the next generation of
              innovators. Traditional methods often suppress creativity instead
              of nurturing it.
            </InfoCard>

            <InfoCard theme="teal" title="Outdated Educational Focus">
              Education today often focuses on &quot;what to teach&quot; and
              &quot;how to teach&quot;, emphasising rote memorisation and
              standardised testing. Students get limited chances to think deeply
              about real-world phenomena and solve authentic problems.
            </InfoCard>

            <InfoCard theme="pink" title="Digital Generation Without Direction">
              Young people are highly connected and digitally proficient.
              Without a strong moral compass, their immense potential risks
              being misdirected or underused in ways that don&apos;t build the
              common good.
            </InfoCard>

            <InfoCard theme="purple" title="Global Competition Demands More">
              The world now expects not only technical excellence but also
              ethical leadership, cultural sensitivity, and value-driven
              decisions. Indonesian students must be ready to compete globally
              while staying rooted in identity and integrity.
            </InfoCard>

            <InfoCard theme="blue" title="Tackling Income Inequality">
              Empowering young innovators to raise local productivity, design
              solutions for community needs, and create meaningful jobs helps
              narrow both inter- and intra-regional gaps across Indonesia.
            </InfoCard>
          </div>
        </section>


        {/* ===================== STEAM–C++ CONCEPT ===================== */}
        <section
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 32,
            alignItems: "center",
          }}
        >
          <div
            style={{
              flex: "0 0 280px",
              maxWidth: 360,
            }}
          >
            <Image
              src="/homepage/eti-steam-lab.png"
              alt="Children exploring STEAM projects"
              width={500}
              height={500}
              style={{
                width: "100%",
                height: "auto",
                borderRadius: 24,
                boxShadow: "0 18px 40px rgba(15,23,42,0.12)",
                objectFit: "cover",
              }}
            />
          </div>

          <div style={{ flex: "1 1 280px", minWidth: 280 }}>
            <h2
              style={{
                fontSize: "1.7rem",
                fontWeight: 800,
                color: "var(--eti-text-main)",
                margin: "0 0 6px",
              }}
            >
              Introducing the New Concept
            </h2>
            <h3
              style={{
                fontSize: "2.1rem",
                fontWeight: 800,
                color: "#0f766e",
                margin: "0 0 14px",
              }}
            >
              STEAM–C++
            </h3>
            <p
              style={{
                fontSize: "0.98rem",
                lineHeight: 1.8,
                color: "var(--eti-text-muted)",
                margin: "0 0 14px",
              }}
            >
              Our educational framework integrates traditional STEAM disciplines
              with enhanced character development. STEAM–C++ stands for:
            </p>
            <ul
              style={{
                paddingLeft: 20,
                fontSize: "0.95rem",
                lineHeight: 1.7,
                color: "var(--eti-text-muted)",
                margin: "0 0 14px",
              }}
            >
              <li>
                <strong>Science</strong> – Inquiry-based learning and scientific
                methodology.
              </li>
              <li>
                <strong>Technology</strong> – Digital literacy and
                computational thinking.
              </li>
              <li>
                <strong>Engineering</strong> – Design thinking and
                problem-solving.
              </li>
              <li>
                <strong>Arts</strong> – Creative expression and cultural
                appreciation.
              </li>
              <li>
                <strong>Mathematics</strong> – Analytical reasoning and
                quantitative skills.
              </li>
              <li>
                <strong>Character</strong> – Christian values and ethical
                leadership.
              </li>
            </ul>
            <p
              style={{
                fontSize: "0.95rem",
                lineHeight: 1.7,
                color: "var(--eti-text-muted)",
                margin: 0,
              }}
            >
              This integrated approach prepares students not only academically,
              but spiritually and morally, for meaningful contribution to
              society.
            </p>
          </div>
        </section>

                {/* ===================== CURRICULUM REFORM ===================== */}
        <section
          className="eti-section-soft"
          style={{
            borderRadius: 28,
            padding: "30px 24px 34px",
            background:
              "radial-gradient(circle at top left, #e0f2fe 0%, #dbeafe 40%, #eff6ff 100%)",
            border: "1px solid rgba(148,163,184,0.35)",
            display: "flex",
            flexWrap: "wrap",
            gap: 28,
            alignItems: "stretch",
          }}
        >
          {/* Left: colourful step cards */}
          <div
            style={{
              flex: "1 1 280px",
              minWidth: 280,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <h2
              style={{
                fontSize: "1.7rem",
                fontWeight: 800,
                color: "var(--eti-text-main)",
                margin: "0 0 10px",
              }}
            >
              From Learning to Innovation: Curriculum Reform
            </h2>

            <CurriculumCard
              title="Deep Learning"
              icon="🧠"
              badge="Step 1 · Think Deeply"
              accent="orange"
            >
              Moving beyond surface-level memorisation to profound
              understanding. Students approach concepts from multiple
              perspectives, connect ideas across disciplines, and develop
              transferable knowledge that applies to real-world contexts.
            </CurriculumCard>

            <CurriculumCard
              title="Challenge-Based Learning"
              icon="🛠️"
              badge="Step 2 · Solve Real Problems"
              accent="teal"
            >
              Students tackle authentic, complex problems that mirror real-world
              challenges. Through collaborative investigation and solution
              development, they apply STEAM knowledge while building critical
              thinking, communication, and teamwork skills.
            </CurriculumCard>

            <CurriculumCard
              title="Christian-Based Character"
              icon="✝️"
              badge="Step 3 · Shape the Heart"
              accent="pink"
            >
              Character development is woven throughout the curriculum, not
              bolted on. Students explore how Christian values shape ethical
              decision-making, guide the use of knowledge and skills, and
              inspire them to serve others and care for God&apos;s creation.
            </CurriculumCard>

            <CurriculumCard
              title="Affordable Education"
              icon="🤝"
              badge="Step 4 · Reach More Families"
              accent="indigo"
            >
              By optimising resources and integrating our STEAM–C++ framework,
              we aim to make high-quality education accessible to more
              Indonesian families, so that advanced learning and character
              formation are not out of reach.
            </CurriculumCard>
          </div>

          {/* Right: photo */}
          <div
            style={{
              flex: "0 0 280px",
              maxWidth: 380,
              marginLeft: "auto",
            }}
          >
            <Image
              src="/homepage/eti-group-project.png"
              alt="Students collaborating on a group project"
              width={500}
              height={500}
              style={{
                width: "100%",
                height: "auto",
                borderRadius: 24,
                boxShadow: "0 18px 40px rgba(15,23,42,0.12)",
                objectFit: "cover",
              }}
            />
          </div>
        </section>


        {/* ===================== DAILY LEARNING ACTIVITY (PHOTO GRID) ===================== */}
        <section
          className="eti-section-soft"
          style={{
            borderRadius: 28,
            padding: "30px 24px 34px",
            background:
              "radial-gradient(circle at top left, #eff6ff 0%, #e0f2fe 45%, #ffffff 100%)",
            border: "1px solid rgba(226,232,240,0.9)",
          }}
        >
          <h2
            style={{
              fontSize: "1.7rem",
              fontWeight: 800,
              color: "var(--eti-text-main)",
              margin: "0 0 4px",
            }}
          >
            Daily Learning in Action
          </h2>
          <p
            style={{
              fontSize: "0.96rem",
              lineHeight: 1.7,
              color: "var(--eti-text-muted)",
              margin: "0 0 18px",
            }}
          >
            A glimpse of how STEAM–C++, play, and faith come together in
            everyday learning moments.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 12,
            }}
          >
            {[
              {
                src: "/homepage/eti-activity-robotics.png",
                alt: "Children building simple robots",
              },
              {
                src: "/homepage/eti-activity-science.png",
                alt: "Student doing a science experiment",
              },
              {
                src: "/homepage/eti-activity-art.png",
                alt: "Children painting in an art corner",
              },
              {
                src: "/homepage/eti-activity-bible.png",
                alt: "Small group reading the Bible together",
              },
              {
                src: "/homepage/eti-activity-outdoor.png",
                alt: "Outdoor learning and nature exploration",
              },
              {
                src: "/homepage/eti-activity-music.png",
                alt: "Children playing music instruments",
              },
            ].map((item) => (
              <div
                key={item.src}
                className="eti-activity-photo"
                style={{
                  borderRadius: 18,
                  overflow: "hidden",
                  boxShadow: "0 12px 30px rgba(15,23,42,0.12)",
                }}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  width={320}
                  height={220}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
            ))}
          </div>
        </section>

                {/* ===================== GRADUATE PROFILE TABLE ===================== */}
        <section
          className="eti-section-soft"
          style={{
            borderRadius: 28,
            padding: "30px 24px 34px",
            background:
              "radial-gradient(circle at top left, #e0f2fe 0%, #dbeafe 40%, #eff6ff 100%)",
            border: "1px solid rgba(148,163,184,0.35)",
          }}
        >
          <h2
            style={{
              fontSize: "1.7rem",
              fontWeight: 800,
              color: "var(--eti-text-main)",
              margin: "0 0 10px",
            }}
          >
            Graduate Profile Dimensions
          </h2>

          <p
            style={{
              fontSize: "0.96rem",
              lineHeight: 1.7,
              color: "var(--eti-text-muted)",
              margin: "0 0 16px",
            }}
          >
            <strong>Vision:</strong> Graduates are faith-driven, innovative, and
            resilient learners who apply STEAM knowledge to real-world
            challenges, think critically and creatively, collaborate
            effectively, and live out Christian values in service to God and His
            creation.
          </p>

          <div style={{ overflowX: "auto" }}>
            <table
              className="eti-grad-table"
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.9rem",
                minWidth: 720,
                backgroundColor: "rgba(255,255,255,0.9)",
                borderRadius: 18,
                overflow: "hidden",
              }}
            >
              <thead>
                <tr
                  style={{
                    background:
                      "linear-gradient(90deg,#1d4ed8,#2563eb,#38bdf8)",
                    color: "#f9fafb",
                  }}
                >
                  <th
                    style={{
                      padding: "10px 8px",
                      border: "1px solid rgba(191,219,254,0.7)",
                      textAlign: "left",
                      width: "16%",
                    }}
                  >
                    NPDL 6C
                  </th>
                  <th
                    style={{
                      padding: "10px 8px",
                      border: "1px solid rgba(191,219,254,0.7)",
                      textAlign: "left",
                      width: "20%",
                    }}
                  >
                    Edukasi Terang Indonesia Dimension
                  </th>
                  <th
                    style={{
                      padding: "10px 8px",
                      border: "1px solid rgba(191,219,254,0.7)",
                      textAlign: "left",
                      width: "38%",
                    }}
                  >
                    Description / What Students Can Do
                  </th>
                  <th
                    style={{
                      padding: "10px 8px",
                      border: "1px solid rgba(191,219,254,0.7)",
                      textAlign: "left",
                      width: "26%",
                    }}
                  >
                    Measurement Process
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Row 1 */}
                <tr className="eti-grad-row">
                  <td
                    style={{
                      padding: "10px 8px",
                      border: "1px solid #cbd2e1",
                      backgroundColor: "#e0f2fe",
                    }}
                  >
                    <div className="eti-grad-label">
                      <span className="eti-grad-icon">🧠</span>
                      <div>
                        <div className="eti-grad-main">CRITICAL LEARNING (+ CBL)</div>
                        <div className="eti-grad-tag">Deep thinking</div>
                      </div>
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "10px 8px",
                      border: "1px solid #cbd2e1",
                    }}
                  >
                    Deep Understanding, Critical Thinking &amp; STEAM
                  </td>
                  <td
                    style={{
                      padding: "10px 8px",
                      border: "1px solid #cbd2e1",
                    }}
                  >
                    Students understand core concepts deeply, analyse, evaluate,
                    and transfer knowledge across disciplines. They integrate
                    STEAM to solve complex, real-world problems and reflect on
                    their learning.
                  </td>
                  <td
                    style={{
                      padding: "10px 8px",
                      border: "1px solid #cbd2e1",
                    }}
                  >
                    • Quiz / exam
                    <br />
                    • STEAM project (model, mentor, real-world application)
                  </td>
                </tr>

                {/* Row 2 */}
                <tr className="eti-grad-row">
                  <td
                    style={{
                      padding: "10px 8px",
                      border: "1px solid #cbd2e1",
                      backgroundColor: "#e0f2fe",
                    }}
                  >
                    <div className="eti-grad-label">
                      <span className="eti-grad-icon">🌱</span>
                      <div>
                        <div className="eti-grad-main">CHARACTER</div>
                        <div className="eti-grad-tag">Self-leadership</div>
                      </div>
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "10px 8px",
                      border: "1px solid #cbd2e1",
                    }}
                  >
                    Self-Regulated, Intentional Learners
                  </td>
                  <td
                    style={{
                      padding: "10px 8px",
                      border: "1px solid #cbd2e1",
                    }}
                  >
                    Students take ownership of learning: set goals, monitor
                    progress, persist through difficulty, seek feedback, and
                    apply STEAM knowledge purposefully.
                  </td>
                  <td
                    style={{
                      padding: "10px 8px",
                      border: "1px solid #cbd2e1",
                    }}
                  >
                    • Learning platform / LMS data
                    <br />
                    • Reflection questions
                    <br />
                    • Teacher feedback
                  </td>
                </tr>

                {/* Row 3 */}
                <tr className="eti-grad-row">
                  <td
                    style={{
                      padding: "10px 8px",
                      border: "1px solid #cbd2e1",
                      backgroundColor: "#e0f2fe",
                    }}
                  >
                    <div className="eti-grad-label">
                      <span className="eti-grad-icon">🌍</span>
                      <div>
                        <div className="eti-grad-main">CITIZENSHIP</div>
                        <div className="eti-grad-tag">Serving others</div>
                      </div>
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "10px 8px",
                      border: "1px solid #cbd2e1",
                    }}
                  >
                    Service &amp; Real-World Problem Awareness
                  </td>
                  <td
                    style={{
                      padding: "10px 8px",
                      border: "1px solid #cbd2e1",
                    }}
                  >
                    Students understand local and global issues, act
                    responsibly, and use STEAM solutions for community and
                    environmental challenges.
                  </td>
                  <td
                    style={{
                      padding: "10px 8px",
                      border: "1px solid #cbd2e1",
                    }}
                  >
                    • Presentations
                    <br />
                    • Post-project evaluation
                  </td>
                </tr>

                {/* Row 4 */}
                <tr className="eti-grad-row">
                  <td
                    style={{
                      padding: "10px 8px",
                      border: "1px solid #cbd2e1",
                      backgroundColor: "#e0f2fe",
                    }}
                  >
                    <div className="eti-grad-label">
                      <span className="eti-grad-icon">✝️</span>
                      <div>
                        <div className="eti-grad-main">CHARACTER</div>
                        <div className="eti-grad-tag">Faith &amp; values</div>
                      </div>
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "10px 8px",
                      border: "1px solid #cbd2e1",
                    }}
                  >
                    Faith &amp; Character (Christian Values)
                  </td>
                  <td
                    style={{
                      padding: "10px 8px",
                      border: "1px solid #cbd2e1",
                    }}
                  >
                    Students live out Christian values: integrity, compassion,
                    humility, service, stewardship, love of neighbour, and moral
                    discernment. Faith guides STEAM solution design and ethical
                    decision-making.
                  </td>
                  <td
                    style={{
                      padding: "10px 8px",
                      border: "1px solid #cbd2e1",
                    }}
                  >
                    • Feedback from teachers, peers, and parents
                  </td>
                </tr>

                {/* Row 5 */}
                <tr className="eti-grad-row">
                  <td
                    style={{
                      padding: "10px 8px",
                      border: "1px solid #cbd2e1",
                      backgroundColor: "#e0f2fe",
                    }}
                  >
                    <div className="eti-grad-label">
                      <span className="eti-grad-icon">💬</span>
                      <div>
                        <div className="eti-grad-main">
                          COMMUNICATION &amp; COLLABORATION
                        </div>
                        <div className="eti-grad-tag">Working together</div>
                      </div>
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "10px 8px",
                      border: "1px solid #cbd2e1",
                    }}
                  >
                    Communication &amp; Collaboration
                  </td>
                  <td
                    style={{
                      padding: "10px 8px",
                      border: "1px solid #cbd2e1",
                    }}
                  >
                    Students communicate effectively (oral, written, digital,
                    artistic), work in diverse teams, and present STEAM
                    solutions to multiple audiences.
                  </td>
                  <td
                    style={{
                      padding: "10px 8px",
                      border: "1px solid #cbd2e1",
                    }}
                  >
                    • Presentations
                    <br />
                    • STEAM projects
                    <br />
                    • Feedback system
                  </td>
                </tr>

                {/* Row 6 */}
                <tr className="eti-grad-row">
                  <td
                    style={{
                      padding: "10px 8px",
                      border: "1px solid #cbd2e1",
                      backgroundColor: "#e0f2fe",
                    }}
                  >
                    <div className="eti-grad-label">
                      <span className="eti-grad-icon">💪</span>
                      <div>
                        <div className="eti-grad-main">CHARACTER</div>
                        <div className="eti-grad-tag">Resilience</div>
                      </div>
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "10px 8px",
                      border: "1px solid #cbd2e1",
                    }}
                  >
                    Resilience, Perseverance &amp; Growth Mindset
                  </td>
                  <td
                    style={{
                      padding: "10px 8px",
                      border: "1px solid #cbd2e1",
                    }}
                  >
                    Students persist through challenges, view failures as
                    learning opportunities, reflect, and improve their STEAM
                    projects and personal character.
                  </td>
                  <td
                    style={{
                      padding: "10px 8px",
                      border: "1px solid #cbd2e1",
                    }}
                  >
                    • Individual STEAM project
                    <br />
                    • Teacher feedback
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

      </div>

      {/* Local styles for hover animations + dark mode */}
      <style jsx>{`
  /* ---------- Shared card animations ---------- */
  .eti-info-card,
  .eti-curriculum-card,
  .eti-activity-photo,
  .eti-grad-row,
  .eti-hero-card,
  .eti-hero-image-card,
  .etipill {
    transition: transform 0.22s ease, box-shadow 0.22s ease,
      background-color 0.22s ease, border-color 0.22s ease;
  }

  .eti-info-card,
  .eti-curriculum-card {
    position: relative;
    overflow: hidden;
  }

  .eti-info-card::before,
  .eti-curriculum-card::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 22px;
    background: radial-gradient(
      circle at top left,
      rgba(59, 130, 246, 0.18),
      transparent 60%
    );
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.25s ease;
  }

  .eti-info-card:hover,
  .eti-curriculum-card:hover,
  .eti-hero-card:hover,
  .eti-hero-image-card:hover,
  .etipill:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 45px rgba(15, 23, 42, 0.18);
  }

  .eti-info-card:hover::before,
  .eti-curriculum-card:hover::before {
    opacity: 1;
  }

  .eti-activity-photo:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 50px rgba(15, 23, 42, 0.22);
  }

  /* ---------- Graduate profile table extras ---------- */
  .eti-grad-label {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .eti-grad-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 999px;
    background: #ffffff;
    box-shadow: 0 6px 14px rgba(15, 23, 42, 0.18);
    font-size: 1.2rem;
  }

  .eti-grad-main {
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0.03em;
  }

  .eti-grad-tag {
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #1d4ed8;
  }

  .eti-grad-row {
    cursor: default;
  }

  .eti-grad-row:hover {
    transform: translateY(-2px);
    box-shadow: 0 14px 32px rgba(15, 23, 42, 0.16);
  }

  .eti-grad-row:hover td {
    background: linear-gradient(
      90deg,
      rgba(219, 234, 254, 0.9),
      rgba(239, 246, 255, 0.96)
    );
  }

  /* ---------- mobile tweaks ---------- */
  @media (max-width: 768px) {
    .eti-hero-section {
      padding: 24px 18px 26px;
    }
  }

  /* ---------- dark mode ---------- */
  @media (prefers-color-scheme: dark) {
    .eti-page {
      background: radial-gradient(
        circle at top,
        #020617,
        #020617 40%,
        #0b1120 100%
      );
    }

    .eti-section-soft {
      background: radial-gradient(
        circle at top left,
        #020617,
        #020617 40%,
        #020617 100%
      ) !important;
      border-color: #1f2937 !important;
    }

    .eti-card {
      background: rgba(15, 23, 42, 0.98) !important;
      border-color: #1f2937 !important;
      color: #e5e7eb;
    }

    .eti-card p {
      color: #cbd5f5 !important;
    }

    .eti-grad-table {
      background: rgba(15, 23, 42, 0.96);
    }

    .eti-grad-row td {
      border-color: #1f2937 !important;
    }

    .eti-grad-row:nth-child(odd) td {
      background-color: rgba(15, 23, 42, 0.98);
    }

    .eti-grad-row:nth-child(even) td {
      background-color: rgba(15, 23, 42, 0.92);
    }

    .eti-grad-row:hover td {
      background: linear-gradient(
        90deg,
        rgba(30, 64, 175, 0.85),
        rgba(15, 23, 42, 0.98)
      );
    }

    .eti-grad-icon {
      background: #020617;
      box-shadow: 0 6px 14px rgba(0, 0, 0, 0.6);
    }

    .eti-grad-tag {
      color: #93c5fd;
    }
  }
`}</style>

    </div>
  );
}
