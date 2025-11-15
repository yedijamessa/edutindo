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
        border: "1px solid #d4dbe3",
        borderRadius: 12,
        padding: "18px 20px",
        backgroundColor: "#ffffff",
      }}
    >
      <h3
        style={{
          fontSize: "1.05rem",
          fontWeight: 600,
          marginBottom: 8,
          color: "#102a43",
        }}
      >
        {title}
      </h3>
      <p style={{ fontSize: "0.92rem", lineHeight: 1.6, color: "#334e68" }}>
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
        borderRadius: 12,
        padding: "18px 20px",
        backgroundColor: "#e5f2fa",
      }}
    >
      <h3
        style={{
          fontSize: "1.05rem",
          fontWeight: 600,
          marginBottom: 8,
          color: "#102a43",
        }}
      >
        {title}
      </h3>
      <p style={{ fontSize: "0.92rem", lineHeight: 1.6, color: "#334e68" }}>
        {children}
      </p>
    </div>
  );
}

export default function HomePage() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 64,
        padding: "32px 0 64px",
      }}
    >
      {/* Hero: Logo + Mission */}
      <section
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 40,
          alignItems: "center",
        }}
      >
        <div
          style={{
            flex: "0 0 260px",
            maxWidth: 320,
            backgroundColor: "#fdf5ec",
            borderRadius: 24,
            padding: 24,
          }}
        >
          {/* TODO: replace /eti-logo.png with your real logo path */}
          <Image
            src="/eti-logo.png"
            alt="Edukasi Terang Indonesia Logo"
            width={400}
            height={400}
            style={{ width: "100%", height: "auto", borderRadius: 16 }}
          />
        </div>

        <div style={{ flex: "1 1 280px", minWidth: 280 }}>
          <h1
            style={{
              fontSize: "2.2rem",
              lineHeight: 1.2,
              fontWeight: 700,
              color: "#102a43",
              marginBottom: 16,
            }}
          >
            Edukasi Terang Indonesia
          </h1>
          <div
            style={{
              borderLeft: "3px solid #2f7cc4",
              paddingLeft: 16,
              maxWidth: 640,
            }}
          >
            <p style={{ fontSize: "0.98rem", lineHeight: 1.75, color: "#334e68" }}>
              Edukasi Terang Indonesia is redefining school curriculum in
              Indonesia through STEAM-focused learning with strong character
              formation. Our mission is to foster holistic development through
              an integrated approach combining{" "}
              <strong>
                Science, Technology, Engineering, Arts, Mathematics
              </strong>{" "}
              (STEAM), and <strong>character-based education</strong> rooted in
              Christian values.
            </p>
          </div>
        </div>
      </section>

      {/* Why It's Urgently Needed */}
      <section
        style={{
          backgroundColor: "#d9ecf5",
          borderRadius: 24,
          padding: "32px 28px 36px",
        }}
      >
        <h2
          style={{
            fontSize: "1.7rem",
            fontWeight: 700,
            color: "#102a43",
            marginBottom: 24,
          }}
        >
          Why It&apos;s Urgently Needed
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          <InfoCard title="When Talent Isn’t Enough">
            Indonesia is home to countless talented and brilliant students with
            innovative ideas. However, a lack of understanding and confidence to
            think critically and speak boldly creates barriers that hinder the
            cultivation of the next generation of innovators and entrepreneurs.
            Traditional educational methods often suppress creative thinking
            instead of nurturing it.
          </InfoCard>

          <InfoCard title="Outdated Educational Focus">
            Education today often focuses on &quot;what to teach&quot; and
            &quot;how to teach&quot;, emphasising rote memorisation and
            standardised testing. This provides limited opportunities for
            students to engage in deep, critical thinking triggered by real-world
            phenomena and authentic problem-solving experiences.
          </InfoCard>

          <InfoCard title="Digital Generation Without Direction">
            The next generation is highly connected and digitally proficient,
            growing up with technology at their fingertips. Without a strong
            moral compass and ethical foundation, their immense potential risks
            being misdirected or underutilised in ways that do not contribute to
            the common good.
          </InfoCard>

          <InfoCard title="Global Competition Demands More">
            Global competition increasingly demands not only technical
            innovation and academic excellence but also strong ethical
            leadership, cultural sensitivity, and value-driven decision-making.
            Indonesian students must be prepared to compete and lead on the
            world stage while maintaining their cultural identity and moral
            integrity.
          </InfoCard>

          <InfoCard title="Tackling Income Inequality">
            Empowering young innovators to boost local productivity, build
            solutions for real community needs, and create skilled jobs helps
            narrow both inter- and intra-regional gaps, contributing to more
            equal opportunities across Indonesia.
          </InfoCard>
        </div>
      </section>

      {/* STEAM-C++ Concept */}
      <section
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 40,
          alignItems: "center",
        }}
      >
        <div
          style={{
            flex: "0 0 280px",
            maxWidth: 360,
          }}
        >
          {/* TODO: replace /steam-concept.png with your real illustration */}
          <Image
            src="/steam-concept.png"
            alt="STEAM-C++ Concept Illustration"
            width={500}
            height={500}
            style={{ width: "100%", height: "auto", borderRadius: 16 }}
          />
        </div>

        <div style={{ flex: "1 1 280px", minWidth: 280 }}>
          <h2
            style={{
              fontSize: "1.7rem",
              fontWeight: 700,
              color: "#102a43",
              marginBottom: 8,
            }}
          >
            Introducing the New Concept
          </h2>
          <h3
            style={{
              fontSize: "2.3rem",
              fontWeight: 700,
              color: "#135c7d",
              marginBottom: 16,
            }}
          >
            STEAM–C++
          </h3>
          <p
            style={{
              fontSize: "0.98rem",
              lineHeight: 1.7,
              color: "#334e68",
              marginBottom: 16,
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
              color: "#334e68",
              marginBottom: 16,
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
              color: "#334e68",
            }}
          >
            This integrated approach prepares students not just academically,
            but spiritually and morally for meaningful contribution to society.
          </p>
        </div>
      </section>

      {/* Curriculum Reform */}
      <section
        style={{
          backgroundColor: "#d9ecf5",
          borderRadius: 24,
          padding: "32px 28px 36px",
          display: "flex",
          flexWrap: "wrap",
          gap: 32,
          alignItems: "stretch",
        }}
      >
        <div style={{ flex: "1 1 280px", minWidth: 280, display: "flex", flexDirection: "column", gap: 16 }}>
          <h2
            style={{
              fontSize: "1.7rem",
              fontWeight: 700,
              color: "#102a43",
              marginBottom: 8,
            }}
          >
            From Learning to Innovation: Curriculum Reform
          </h2>

          <CurriculumCard title="Deep Learning">
            Moving beyond surface-level memorisation to profound understanding.
            Students engage with concepts through multiple perspectives, make
            connections across disciplines, and develop transferable knowledge
            that applies to real-world contexts.
          </CurriculumCard>

          <CurriculumCard title="Challenge-Based Learning">
            Students tackle authentic, complex problems that mirror real-world
            challenges. Through collaborative investigation and solution
            development, they apply STEAM knowledge while building critical
            thinking, communication, and teamwork skills.
          </CurriculumCard>

          <CurriculumCard title="Christian-Based Character">
            Character development is woven throughout the curriculum, not taught
            in isolation. Students explore how Christian values shape ethical
            decision-making, guide the use of knowledge and skills, and inspire
            them to serve others and care for God&apos;s creation.
          </CurriculumCard>

          <CurriculumCard title="Affordable Education">
            By optimising resources and integrating our STEAM–C++ framework, we
            aim to make high-quality education accessible to more Indonesian
            families, ensuring that advanced learning and character formation
            are not out of reach.
          </CurriculumCard>
        </div>

        <div
          style={{
            flex: "0 0 280px",
            maxWidth: 380,
            marginLeft: "auto",
          }}
        >
          {/* TODO: replace /curriculum-reform.png with your real illustration */}
          <Image
            src="/curriculum-reform.png"
            alt="Curriculum Reform Illustration"
            width={500}
            height={500}
            style={{ width: "100%", height: "auto", borderRadius: 16 }}
          />
        </div>
      </section>

      {/* Graduate Profile Dimensions */}
      <section
        style={{
          backgroundColor: "#d9ecf5",
          borderRadius: 24,
          padding: "32px 28px 36px",
        }}
      >
        <h2
          style={{
            fontSize: "1.7rem",
            fontWeight: 700,
            color: "#102a43",
            marginBottom: 12,
          }}
        >
          Graduate Profile Dimensions
        </h2>

        <p
          style={{
            fontSize: "0.96rem",
            lineHeight: 1.7,
            color: "#334e68",
            marginBottom: 16,
          }}
        >
          <strong>Vision:</strong> Graduates are faith-driven, innovative, and
          resilient learners who apply STEAM knowledge to real-world challenges,
          think critically and creatively, collaborate effectively, and live out
          Christian values in service to God and His creation.
        </p>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.9rem",
              minWidth: 720,
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
                <td style={{ padding: "10px 8px", border: "1px solid #cbd2e1", backgroundColor: "#f7fafc" }}>
                  CRITICAL LEARNING (+ CBL)
                </td>
                <td style={{ padding: "10px 8px", border: "1px solid #cbd2e1" }}>
                  Deep Understanding, Critical Thinking &amp; STEAM
                </td>
                <td style={{ padding: "10px 8px", border: "1px solid #cbd2e1" }}>
                  Students understand core concepts deeply, analyse, evaluate,
                  and transfer knowledge across disciplines. They integrate
                  STEAM to solve complex, real-world problems and reflect on
                  their learning.
                </td>
                <td style={{ padding: "10px 8px", border: "1px solid #cbd2e1" }}>
                  • Quiz / exam
                  <br />
                  • STEAM project (model, mentor, real-world application)
                </td>
              </tr>

              <tr>
                <td style={{ padding: "10px 8px", border: "1px solid #cbd2e1", backgroundColor: "#f7fafc" }}>
                  CHARACTER
                </td>
                <td style={{ padding: "10px 8px", border: "1px solid #cbd2e1" }}>
                  Self-Regulated, Intentional Learners
                </td>
                <td style={{ padding: "10px 8px", border: "1px solid #cbd2e1" }}>
                  Students take ownership of learning: set goals, monitor
                  progress, persist through difficulty, seek feedback, and apply
                  STEAM knowledge purposefully.
                </td>
                <td style={{ padding: "10px 8px", border: "1px solid #cbd2e1" }}>
                  • Learning platform / LMS data
                  <br />
                  • Reflection questions
                  <br />
                  • Teacher feedback
                </td>
              </tr>

              <tr>
                <td style={{ padding: "10px 8px", border: "1px solid #cbd2e1", backgroundColor: "#f7fafc" }}>
                  CITIZENSHIP
                </td>
                <td style={{ padding: "10px 8px", border: "1px solid #cbd2e1" }}>
                  Service &amp; Real-World Problem Awareness
                </td>
                <td style={{ padding: "10px 8px", border: "1px solid #cbd2e1" }}>
                  Students understand local and global issues, act responsibly,
                  and use STEAM solutions for community and environmental
                  challenges.
                </td>
                <td style={{ padding: "10px 8px", border: "1px solid #cbd2e1" }}>
                  • Presentations
                  <br />
                  • Post-project evaluation
                </td>
              </tr>

              <tr>
                <td style={{ padding: "10px 8px", border: "1px solid #cbd2e1", backgroundColor: "#f7fafc" }}>
                  CHARACTER
                </td>
                <td style={{ padding: "10px 8px", border: "1px solid #cbd2e1" }}>
                  Faith &amp; Character (Christian Values)
                </td>
                <td style={{ padding: "10px 8px", border: "1px solid #cbd2e1" }}>
                  Students live out Christian values: integrity, compassion,
                  humility, service, stewardship, love of neighbour, and moral
                  discernment. Faith guides STEAM solution design and ethical
                  decision-making.
                </td>
                <td style={{ padding: "10px 8px", border: "1px solid #cbd2e1" }}>
                  • Feedback from teachers, peers, and parents
                </td>
              </tr>

              <tr>
                <td style={{ padding: "10px 8px", border: "1px solid #cbd2e1", backgroundColor: "#f7fafc" }}>
                  COMMUNICATION &amp; COLLABORATION
                </td>
                <td style={{ padding: "10px 8px", border: "1px solid #cbd2e1" }}>
                  Communication &amp; Collaboration
                </td>
                <td style={{ padding: "10px 8px", border: "1px solid #cbd2e1" }}>
                  Students communicate effectively (oral, written, digital,
                  artistic), work in diverse teams, and present STEAM solutions
                  to multiple audiences.
                </td>
                <td style={{ padding: "10px 8px", border: "1px solid #cbd2e1" }}>
                  • Presentations
                  <br />
                  • STEAM projects
                  <br />
                  • Feedback system
                </td>
              </tr>

              <tr>
                <td style={{ padding: "10px 8px", border: "1px solid #cbd2e1", backgroundColor: "#f7fafc" }}>
                  CHARACTER
                </td>
                <td style={{ padding: "10px 8px", border: "1px solid #cbd2e1" }}>
                  Resilience, Perseverance &amp; Growth Mindset
                </td>
                <td style={{ padding: "10px 8px", border: "1px solid #cbd2e1" }}>
                  Students persist through challenges, view failures as learning
                  opportunities, reflect, and improve their STEAM projects and
                  personal character.
                </td>
                <td style={{ padding: "10px 8px", border: "1px solid #cbd2e1" }}>
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
  );
}
