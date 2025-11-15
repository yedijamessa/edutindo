import Image from "next/image";

type FounderProps = {
  role: string;
  name: string;
  imageSrc: string;
  imageAlt: string;
  lines: string[];
};

function FounderCard({ role, name, imageSrc, imageAlt, lines }: FounderProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 12,
        maxWidth: 320,
      }}
    >
      <div
        style={{
          width: 140,
          height: 140,
          borderRadius: "50%",
          overflow: "hidden",
        }}
      >
        {/* TODO: replace placeholder paths with real photos */}
        <Image
          src={imageSrc}
          alt={imageAlt}
          width={280}
          height={280}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
      <div style={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: 0.4 }}>
        {role.toUpperCase()}
      </div>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{name}</div>
      <div
        style={{
          fontSize: "0.88rem",
          lineHeight: 1.6,
          color: "#334e68",
        }}
      >
        {lines.map((l, idx) => (
          <p key={idx} style={{ margin: idx === 0 ? "0 0 4px" : "0 0 4px" }}>
            {l}
          </p>
        ))}
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div style={{ padding: "32px 0 64px", display: "flex", flexDirection: "column", gap: 40 }}>
      {/* Vision section */}
      <section style={{ maxWidth: 900, margin: "0 auto 8px" }}>
        <h1
          style={{
            fontSize: "2.1rem",
            fontWeight: 700,
            color: "#102a43",
            marginBottom: 16,
          }}
        >
          About Edukasi Terang Indonesia
        </h1>
        <div
          style={{
            borderLeft: "4px solid #2f7cc4",
            paddingLeft: 16,
            backgroundColor: "#f7fafc",
            borderRadius: 12,
            paddingTop: 14,
            paddingBottom: 14,
          }}
        >
          <p
            style={{
              fontSize: "1rem",
              lineHeight: 1.8,
              color: "#243b53",
            }}
          >
            The vision of Edukasi Terang Indonesia is to see a generation of
            Indonesian learners who are <strong>faith-driven, innovative, and resilient</strong>.
            We want students to master STEAM knowledge, think critically and
            creatively, collaborate effectively, and live out <strong>Christian values</strong> in
            every area of life, becoming light and blessing to their communities.
          </p>
        </div>
      </section>

      {/* Founders */}
      <section
        style={{
          backgroundColor: "#d9ecf5",
          borderRadius: 24,
          padding: "28px 24px 32px",
        }}
      >
        <div style={{ maxWidth: 1050, margin: "0 auto" }}>
          <h2
            style={{
              fontSize: "1.6rem",
              fontWeight: 700,
              letterSpacing: 1,
              color: "#102a43",
              marginBottom: 8,
            }}
          >
            FOUNDERS
          </h2>
          <p
            style={{
              fontSize: "0.96rem",
              lineHeight: 1.7,
              color: "#334e68",
              marginBottom: 28,
            }}
          >
            Edukasi Terang Indonesia is founded by passionate educators and Christian
            leaders committed to transforming Indonesian education. Our diverse team
            brings together expertise in STEAM curriculum development, educational
            technology, and Christian-value formation.
          </p>

          {/* Top row: 3 founders */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 32,
              rowGap: 40,
              marginBottom: 40,
              justifyContent: "flex-start",
            }}
          >
            <FounderCard
              role="Trustee (Chair?)"
              name="U Siahaan"
              imageSrc="/founders/u-siahaan.jpg"
              imageAlt="U Siahaan"
              lines={[
                "Non-denominational Evangelist and Member of the Human Resources & Systems Commission at the Indonesian Bible Society (LAI).",
                "Independent business advisor and ex-COO of a leading national logistics startup (total 30+ years of experience).",
                "Trustee roles in other educational foundations.",
                "BSc in Computer Engineering from Bandung Institute of Technology Polytechnic, and BSc in Theology from Doulos Theological Seminary.",
              ]}
            />

            <FounderCard
              role="Trustee (Chair?)"
              name="Dr Pramudianto, PCC"
              imageSrc="/founders/pramudianto.jpg"
              imageAlt="Dr Pramudianto"
              lines={[
                "Chairman of Business Development and Economics Centre at Atma Jaya Yogyakarta Catholic University and lecturer at leading Christian universities (total 15+ years of teaching experience).",
                "Founder of a human development consultancy serving corporate and education institutions, and ex-CHRO of a national workforce sourcing company (total 20+ years of experience).",
                "Writer of 17 books in leadership, character-building and Christian values.",
                "PhD in Management Science from Satya Wacana Christian University.",
              ]}
            />

            <FounderCard
              role="Supervisor"
              name="A Martarina"
              imageSrc="/founders/martarina.jpg"
              imageAlt="A Martarina"
              lines={[
                "Education Quality Assurance and Development Specialist (Widyapradja) at the Education Quality Assurance Agency of East Nusa Tenggara (total 20+ years of experience).",
                "Regional NGO coordinator in East Nusa Tenggara.",
                "Master of Accounting from University of Indonesia.",
              ]}
            />
          </div>

          {/* Bottom row: 3 executives */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 32,
              rowGap: 40,
              justifyContent: "flex-start",
            }}
          >
            <FounderCard
              role="Executive (President)"
              name="Dr S C Nabilla"
              imageSrc="/founders/nabilla.jpg"
              imageAlt="Dr S C Nabilla"
              lines={[
                "Research associate at Imperial College.",
                "DPhil in Material Science from Oxford University.",
                "UK STEAM ambassador.",
              ]}
            />

            <FounderCard
              role="Executive (Treasurer)"
              name="Y M S Pramudito"
              imageSrc="/founders/yms-pramudito.jpg"
              imageAlt="Y M S Pramudito"
              lines={[
                "MSc in Data Science from University of Manchester.",
                "Regional lead of Indonesian church diaspora in the UK.",
                "MBA candidate.",
              ]}
            />

            <FounderCard
              role="Executive (Secretary)"
              name="A Aribowo, CGMA"
              imageSrc="/founders/aribowo.jpg"
              imageAlt="A Aribowo"
              lines={[
                "Endowment accountant at a college in the University of Oxford and ex-Corporate Finance manager at an infrastructure private equity firm.",
                "MSc in Local Economic Development from LSE.",
                "CAIA candidate.",
              ]}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
