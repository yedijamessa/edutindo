"use client";

import type { ReactNode } from "react";
import Image from "next/image";

type InfoCardProps = {
  title: string;
  children: ReactNode;
};

function InfoCard({ title, children }: InfoCardProps) {
  return (
    <div
      style={{
        borderRadius: 18,
        padding: "18px 20px 20px",
        background: "var(--eti-card-bg)",
        boxShadow: "0 14px 30px rgba(15, 23, 42, 0.06)",
        border: "1px solid var(--eti-border-subtle)",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 2,
        }}
      >
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background:
              "conic-gradient(from 180deg at 50% 50%, #0ea5e9, #22c55e, #f97316, #0ea5e9)",
            boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.15)",
          }}
        />
        <h3
          style={{
            fontSize: "1.02rem",
            fontWeight: 600,
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
          lineHeight: 1.65,
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
};

function CurriculumCard({ title, children }: CurriculumCardProps) {
  return (
    <div
      style={{
        borderRadius: 18,
        padding: "18px 20px 20px",
        background:
          "linear-gradient(135deg, rgba(219, 234, 254, 0.9), rgba(224, 242, 254, 0.9))",
        border: "1px solid rgba(148, 163, 184, 0.4)",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <h3
        style={{
          fontSize: "1.02rem",
          fontWeight: 600,
          margin: 0,
          color: "var(--eti-text-main)",
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: "0.92rem",
          lineHeight: 1.65,
          color: "var(--eti-text-muted)",
          margin: 0,
        }}
      >
        {children}
      </p>
    </div>
  );
}

export default function HomePage() {
  return (
    <div
      style={{
        padding: "32px 0 64px",
        background: "var(--eti-page-bg)",
      }}
    >
      {/* Outer container for consistent width on large screens */}
      <div
        style={{
          width: "100%",
          maxWidth: 1440,
          margin: "0 auto",
          padding: "0 16px",
          display: "flex",
          flexDirection: "column",
          gap: 56,
        }}
      >
        {/* Hero: Logo + Mission */}
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
              flex: "0 0 260px",
              maxWidth: 320,
              background:
                "radial-gradient(circle at top left, #fef3c7 0, #fdf5ec 50%, #fefce8 100%)",
              borderRadius: 28,
              padding: 22,
              boxShadow: "0 18px 40px rgba(15, 23, 42, 0.06)",
              border: "1px solid rgba(251, 191, 36, 0.25)",
            }}
          >
            <Image
              src="/eti-logo.png"
              alt="Edukasi Terang Indonesia Logo"
              width={400}
              height={400}
              style={{
                width: "100%",
                height: "auto",
                borderRadius: 18,
              }}
            />
          </div>

          <div style={{ flex: "1 1 280px", minWidth: 280 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "4px 10px",
                borderRadius: 999,
                backgroundColor: "rgba(37, 99, 235, 0.06)",
                border: "1px solid rgba(59, 130, 246, 0.2)",
                marginBottom: 12,
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
                Edukasi Terang Indonesia
              </span>
            </div>

            <h1
              style={{
                fontSize: "2.35rem",
                lineHeight: 1.18,
                fontWeight: 800,
                color: "var(--eti-text-main)",
                margin: "0 0 10px",
              }}
            >
              Nurturing{" "}
              <span style={{ color: "#2563eb" }}>bright Indonesian learners</span>{" "}
              through STEAM &amp; character.
            </h1>

            <div
              style={{
                borderLeft: "3px solid #2f7cc4",
                paddingLeft: 16,
                maxWidth: 720,
              }}
            >
              <p
                style={{
                  fontSize: "0.98rem",
                  lineHeight: 1.8,
                  color: "var(--eti-text-muted)",
                  margin: 0,
                }}
              >
                Edukasi Terang Indonesia is redefining school curriculum in
                Indonesia through STEAM-focused learning with strong character
                formation. Our mission is to foster holistic development through
                an integrated approach combining{" "}
                <strong>
                  Science, Technology, Engineering, Arts, Mathematics
                </strong>{" "}
                (STEAM), and{" "}
                <strong>character-based education rooted in Christian values</strong>.
              </p>
            </div>
          </div>
        </section>

        {/* Why It's Urgently Needed */}
        <section
          style={{
            borderRadius: 28,
            padding: "30px 24px 34px",
            background:
              "linear-gradient(135deg, rgba(219, 234, 254, 0.95), rgba(224, 242, 254, 1))",
            border: "1px solid rgba(148, 163, 184, 0.35)",
          }}
        >
          <header
            style={{
              marginBottom: 22,
              maxWidth: 760,
            }}
          >
            <h2
              style={{
                fontSize: "1.72rem",
                fontWeight: 700,
                color: "var(--eti-text-main)",
                margin: "0 0 6px",
              }}
            >
              Why It&apos;s Urgently Needed
            </h2>
            <p
              style={{
                fontSize: "0.96rem",
                lineHeight: 1.7,
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

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 18,
            }}
          >
            <InfoCard title="When Talent Isn’t Enough">
              Indonesia is home to countless talented students with innovative
              ideas. Yet a lack of confidence to think critically and speak
              boldly creates barriers that hinder the next generation of
              innovators. Traditional methods often suppress creativity instead
              of nurturing it.
            </InfoCard>

            <InfoCard title="Outdated Educational Focus">
              Education today often focuses on &quot;what to teach&quot; and
              &quot;how to teach&quot;, emphasising rote memorisation and
              standardised testing. Students get limited chances to think deeply
              about real-world phenomena and solve authentic problems.
            </InfoCard>

            <InfoCard title="Digital Generation Without Direction">
              Young people are highly connected and digitally proficient. Without
              a strong moral compass, their immense potential risks being
              misdirected or underused in ways that don&apos;t build the common
              good.
            </InfoCard>

            <InfoCard title="Global Competition Demands More">
              The world now expects not only technical excellence but also
              ethical leadership, cultural sensitivity, and value-driven
              decisions. Indonesian students must be ready to compete globally
              while staying rooted in identity and integrity.
            </InfoCard>

            <InfoCard title="Tackling Income Inequality">
              Empowering young innovators to raise local productivity, design
              solutions for community needs, and create meaningful jobs helps
              narrow both inter- and intra-regional gaps across Indonesia.
            </InfoCard>
          </div>
        </section>

        {/* STEAM-C++ Concept */}
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
              src="/steam-concept.png"
              alt="STEAM-C++ Concept Illustration"
              width={500}
              height={500}
              style={{
                width: "100%",
                height: "auto",
                borderRadius: 20,
                boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
              }}
            />
          </div>

          <div style={{ flex: "1 1 280px", minWidth: 280 }}>
            <h2
              style={{
                fontSize: "1.7rem",
                fontWeight: 700,
                color: "var(--eti-text-main)",
                margin: "0 0 6px",
              }}
            >
              Introducing the New Concept
            </h2>
            <h3
              style={{
                fontSize: "2.2rem",
                fontWeight: 800,
                color: "#135c7d",
                margin: "0 0 14px",
              }}
            >
              STEAM–C++
            </h3>
            <p
              style={{
                fontSize: "0.98rem",
                lineHeight: 1.7,
                color: "var(--eti-text-muted)",
                margin: "0 0 14px",
              }}
            >
              Our educational framework integrates traditional STEAM disciplines
              with enhanced character development. STEAM–C++ stands for:
            </p>
            <ul
              style={{
                paddingLeft: 18,
                fontSize: "0.95rem",
                lineHeight: 1.7,
                color: "var(--eti-text-muted)",
                margin: "0 0 14px",
              }}
            >
              <li>
                <strong>Science</strong> – Inquiry-based learning and scientific
                methodology
              </li>
              <li>
                <strong>Technology</strong> – Digital literacy and computational
                thinking
              </li>
              <li>
                <strong>Engineering</strong> – Design thinking and
                problem-solving
              </li>
              <li>
                <strong>Arts</strong> – Creative expression and cultural
                appreciation
              </li>
              <li>
                <strong>Mathematics</strong> – Analytical reasoning and
                quantitative skills
              </li>
              <li>
                <strong>Character</strong> – Christian values and ethical
                leadership
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

        {/* Curriculum Reform */}
        <section
          style={{
            borderRadius: 28,
            padding: "30px 24px 34px",
            background:
              "linear-gradient(135deg, rgba(219, 234, 254, 0.95), rgba(224, 242, 254, 1))",
            border: "1px solid rgba(148, 163, 184, 0.35)",
            display: "flex",
            flexWrap: "wrap",
            gap: 28,
            alignItems: "stretch",
          }}
        >
          <div
            style={{
              flex: "1 1 280px",
              minWidth: 280,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <h2
              style={{
                fontSize: "1.7rem",
                fontWeight: 700,
                color: "var(--eti-text-main)",
                margin: "0 0 6px",
              }}
            >
              From Learning to Innovation: Curriculum Reform
            </h2>

            <CurriculumCard title="Deep Learning">
              Moving beyond surface-level memorisation to profound
              understanding. Students approach concepts from multiple
              perspectives, connect ideas across disciplines, and develop
              transferable knowledge that applies to real-world contexts.
            </CurriculumCard>

            <CurriculumCard title="Challenge-Based Learning">
              Students tackle authentic, complex problems that mirror real-world
              challenges. Through collaborative investigation and solution
              development, they apply STEAM knowledge while building critical
              thinking, communication, and teamwork skills.
            </CurriculumCard>

            <CurriculumCard title="Christian-Based Character">
              Character development is woven throughout the curriculum, not
              bolted on. Students explore how Christian values shape ethical
              decision-making, guide the use of knowledge and skills, and
              inspire them to serve others and care for God&apos;s creation.
            </CurriculumCard>

            <CurriculumCard title="Affordable Education">
              By optimising resources and integrating our STEAM–C++ framework,
              we aim to make high-quality education accessible to more
              Indonesian families, so that advanced learning and character
              formation are not out of reach.
            </CurriculumCard>
          </div>

          <div
            style={{
              flex: "0 0 280px",
              maxWidth: 380,
              marginLeft: "auto",
            }}
          >
            <Image
              src="/curriculum-reform.png"
              alt="Curriculum Reform Illustration"
              width={500}
              height={500}
              style={{
                width: "100%",
                height: "auto",
                borderRadius: 22,
                boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
              }}
            />
          </div>
        </section>

        {/* Graduate Profile Dimensions */}
        <section
          style={{
            borderRadius: 28,
            padding: "30px 24px 34px",
            background:
              "linear-gradient(135deg, rgba(219, 234, 254, 0.92), rgba(226, 232, 240, 0.95))",
            border: "1px solid rgba(148, 163, 184, 0.35)",
          }}
        >
          <h2
            style={{
              fontSize: "1.7rem",
              fontWeight: 700,
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
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.9rem",
                minWidth: 720,
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                borderRadius: 18,
                overflow: "hidden",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#f0f4f8" }}>
                  <th
                    style={{
                      padding: "10px 8px",
                      border: "1px solid #cbd2e1",
                      textAlign: "left",
                      width: "14%",
                    }}
                  >
                    NPDL 6C
                  </th>
                  <th
                    style={{
                      padding: "10px 8px",
                      border: "1px solid #cbd2e1",
                      textAlign: "left",
                      width: "18%",
                    }}
                  >
                    Edukasi Terang Indonesia Dimension
                  </th>
                  <th
                    style={{
                      padding: "10px 8px",
                      border: "1px solid #cbd2e1",
                      textAlign: "left",
                      width: "38%",
                    }}
                  >
                    Description / What Students Can Do
                  </th>
                  <th
                    style={{
                      padding: "10px 8px",
                      border: "1px solid #cbd2e1",
                      textAlign: "left",
                      width: "30%",
                    }}
                  >
                    Measurement Process
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td
                    style={{
                      padding: "10px 8px",
                      border: "1px solid #cbd2e1",
                      backgroundColor: "#f7fafc",
                    }}
                  >
                    CRITICAL LEARNING (+ CBL)
                  </td>
                  <td
                    style={{ padding: "10px 8px", border: "1px solid #cbd2e1" }}
                  >
                    Deep Understanding, Critical Thinking &amp; STEAM
                  </td>
                  <td
                    style={{ padding: "10px 8px", border: "1px solid #cbd2e1" }}
                  >
                    Students understand core concepts deeply, analyse, evaluate,
                    and transfer knowledge across disciplines. They integrate
                    STEAM to solve complex, real-world problems and reflect on
                    their learning.
                  </td>
                  <td
                    style={{ padding: "10px 8px", border: "1px solid #cbd2e1" }}
                  >
                    • Quiz / exam
                    <br />
                    • STEAM project (model, mentor, real-world application)
                  </td>
                </tr>

                <tr>
                  <td
                    style={{
                      padding: "10px 8px",
                      border: "1px solid #cbd2e1",
                      backgroundColor: "#f7fafc",
                    }}
                  >
                    CHARACTER
                  </td>
                  <td
                    style={{ padding: "10px 8px", border: "1px solid #cbd2e1" }}
                  >
                    Self-Regulated, Intentional Learners
                  </td>
                  <td
                    style={{ padding: "10px 8px", border: "1px solid #cbd2e1" }}
                  >
                    Students take ownership of learning: set goals, monitor
                    progress, persist through difficulty, seek feedback, and
                    apply STEAM knowledge purposefully.
                  </td>
                  <td
                    style={{ padding: "10px 8px", border: "1px solid #cbd2e1" }}
                  >
                    • Learning platform / LMS data
                    <br />
                    • Reflection questions
                    <br />
                    • Teacher feedback
                  </td>
                </tr>

                <tr>
                  <td
                    style={{
                      padding: "10px 8px",
                      border: "1px solid #cbd2e1",
                      backgroundColor: "#f7fafc",
                    }}
                  >
                    CITIZENSHIP
                  </td>
                  <td
                    style={{ padding: "10px 8px", border: "1px solid #cbd2e1" }}
                  >
                    Service &amp; Real-World Problem Awareness
                  </td>
                  <td
                    style={{ padding: "10px 8px", border: "1px solid #cbd2e1" }}
                  >
                    Students understand local and global issues, act
                    responsibly, and use STEAM solutions for community and
                    environmental challenges.
                  </td>
                  <td
                    style={{ padding: "10px 8px", border: "1px solid #cbd2e1" }}
                  >
                    • Presentations
                    <br />
                    • Post-project evaluation
                  </td>
                </tr>

                <tr>
                  <td
                    style={{
                      padding: "10px 8px",
                      border: "1px solid #cbd2e1",
                      backgroundColor: "#f7fafc",
                    }}
                  >
                    CHARACTER
                  </td>
                  <td
                    style={{ padding: "10px 8px", border: "1px solid #cbd2e1" }}
                  >
                    Faith &amp; Character (Christian Values)
                  </td>
                  <td
                    style={{ padding: "10px 8px", border: "1px solid #cbd2e1" }}
                  >
                    Students live out Christian values: integrity, compassion,
                    humility, service, stewardship, love of neighbour, and moral
                    discernment. Faith guides STEAM solution design and ethical
                    decision-making.
                  </td>
                  <td
                    style={{ padding: "10px 8px", border: "1px solid #cbd2e1" }}
                  >
                    • Feedback from teachers, peers, and parents
                  </td>
                </tr>

                <tr>
                  <td
                    style={{
                      padding: "10px 8px",
                      border: "1px solid #cbd2e1",
                      backgroundColor: "#f7fafc",
                    }}
                  >
                    COMMUNICATION &amp; COLLABORATION
                  </td>
                  <td
                    style={{ padding: "10px 8px", border: "1px solid #cbd2e1" }}
                  >
                    Communication &amp; Collaboration
                  </td>
                  <td
                    style={{ padding: "10px 8px", border: "1px solid #cbd2e1" }}
                  >
                    Students communicate effectively (oral, written, digital,
                    artistic), work in diverse teams, and present STEAM
                    solutions to multiple audiences.
                  </td>
                  <td
                    style={{ padding: "10px 8px", border: "1px solid #cbd2e1" }}
                  >
                    • Presentations
                    <br />
                    • STEAM projects
                    <br />
                    • Feedback system
                  </td>
                </tr>

                <tr>
                  <td
                    style={{
                      padding: "10px 8px",
                      border: "1px solid #cbd2e1",
                      backgroundColor: "#f7fafc",
                    }}
                  >
                    CHARACTER
                  </td>
                  <td
                    style={{ padding: "10px 8px", border: "1px solid #cbd2e1" }}
                  >
                    Resilience, Perseverance &amp; Growth Mindset
                  </td>
                  <td
                    style={{ padding: "10px 8px", border: "1px solid #cbd2e1" }}
                  >
                    Students persist through challenges, view failures as
                    learning opportunities, reflect, and improve their STEAM
                    projects and personal character.
                  </td>
                  <td
                    style={{ padding: "10px 8px", border: "1px solid #cbd2e1" }}
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
    </div>
  );
}
