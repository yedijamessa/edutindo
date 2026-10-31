"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BriefcaseBusiness,
  Check,
  GraduationCap,
  Heart,
  Mail,
} from "lucide-react";
import styles from "./about.module.css";

type Founder = {
  role: string;
  name: string;
  imageSrc?: string;
  imageAlt: string;
  imagePosition?: string;
  imageScale?: number;
  lines: string[];
};

const FOUNDERS: Founder[] = [
  {
    role: "Advisory - Chair",
    name: "Ulbrits Siahaan",
    imageSrc: "/founders/ulbrits.jpeg",
    imageAlt: "Ulbrits Siahaan",
    imagePosition: "center 62%",
    lines: [
      "BSc in Computer Science, Bandung Institute of Technology + Bachelor in Theology, Doulos Theological Seminary Jakarta",
      "Non-denominational Evangelist",
      "Independent Business Advisor",
      "COO / VP in Logistics Background",
    ],
  },
  {
    role: "Advisory",
    name: "Dr Pramudianto",
    imageSrc: "/founders/pram.jpeg",
    imageAlt: "Dr Pramudianto",
    imagePosition: "center -30%",
    imageScale: 1.9,
    lines: [
      "PhD in Human Resources Management and Services, Satya Wacana Christian University",
      "Director of Professional Business Center FBE Atma Jaya University - Yogyakarta",
      "Certified Trainer for Teachers Professional Development",
      "Author",
    ],
  },
  {
    role: "Supervisory - Chair",
    name: "Agustin Martarina",
    imageSrc: "/founders/agustin.jpg",
    imageAlt: "Agustin Martarina",
    lines: [
      "MSc in Accounting, University of Indonesia",
      "Local Curriculum Expert",
      "School Rating Examiner from Central Government",
      "Regional Edu-NGO Coordinator",
    ],
  },
  {
    role: "President/Chair",
    name: "Dr Sasza Nabilla",
    imageSrc: "/founders/sasza.jpeg",
    imageAlt: "Dr Sasza Chyntara Nabilla",
    lines: [
      "DPhil in Material Science, University of Oxford",
      "Research Associate & Tutor at Imperial College London",
      "UK STEAM Ambassador",
    ],
  },
  {
    role: "Treasurer",
    name: "Yedija Messa",
    imageSrc: "/founders/messa.jpeg",
    imageAlt: "Yedija Messa",
    lines: [
      "MSc in Data Science, University of Manchester",
      "MBA Candidate",
      "Teaching Experience",
      "Banking/Financial Services Background",
    ],
  },
  {
    role: "Secretary",
    name: "Andre Aribowo",
    imageSrc: "/founders/andre.jpeg",
    imageAlt: "Andre Aribowo",
    lines: [
      "MSc in Local Economic Development, LSE",
      "CIMA Qualified",
      "CAIA Candidate",
      "Endowment / Corp Finance Background",
    ],
  },
  {
    role: "Curriculum",
    name: "Vanessa Caitlin",
    imageSrc: "/founders/vanessa-caitlin.jpeg",
    imageAlt: "Vanessa Caitlin",
    lines: [
      "MA in International Education, University of Manchester (Candidate)",
      "English Language Learner (ELL) Teacher for IB Primary Years Programme",
      "IB & TES Certified",
      "Private Tutor (English)",
    ],
  },
  {
    role: "Legal",
    name: "Grace Panggo",
    imageSrc: "/founders/grace-panggo.jpeg",
    imageAlt: "Grace Panggo",
    imagePosition: "center 6%",
    imageScale: 1.35,
    lines: [
      "BSc in Law, University of Indonesia",
      "2+ years as Corporate Lawyer / Cross-border Legal Advisor",
    ],
  },
];

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
}

function FounderAvatar({
  founder,
  large = false,
}: {
  founder: Founder;
  large?: boolean;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  return (
    <div className={large ? styles.largeAvatar : styles.avatar}>
      {founder.imageSrc && !imageFailed ? (
        <Image
          src={founder.imageSrc}
          alt={founder.imageAlt}
          fill
          sizes={large ? "(min-width: 760px) 300px, 230px" : "100px"}
          className={styles.portrait}
          onError={() => setImageFailed(true)}
          style={{
            objectPosition: founder.imagePosition ?? "center",
            transform: `scale(${founder.imageScale ?? 1})`,
          }}
        />
      ) : (
        <span className={styles.initials}>{getInitials(founder.name)}</span>
      )}
    </div>
  );
}

function Leaves({ className }: { className: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 240"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M20 235C32 162 70 98 91 12"
        stroke="currentColor"
        strokeWidth="2"
      />
      <g fill="currentColor" opacity=".72">
        <path d="M84 42C61 22 78 6 93 0c8 19 2 29-9 42ZM78 63C88 30 110 29 118 29c-7 23-17 30-40 34ZM70 87C43 62 52 44 61 32c15 12 21 32 9 55ZM60 115C76 81 96 78 111 81c-12 25-28 34-51 34ZM50 141C24 117 30 98 39 85c16 13 21 34 11 56ZM40 167C54 136 76 130 93 133c-11 23-31 34-53 34ZM29 199C9 181 8 159 15 145c17 14 21 32 14 54ZM23 220C39 191 56 185 73 188c-8 21-26 31-50 32Z" />
      </g>
    </svg>
  );
}

export default function AboutPage() {
  const [activeIndex, setActiveIndex] = useState(FOUNDERS.length - 1);
  const detailRef = useRef<HTMLElement>(null);
  const activeFounder = FOUNDERS[activeIndex];

  const selectFounder = (index: number) => {
    setActiveIndex(index);
    if (window.matchMedia("(max-width: 759px)").matches) {
      requestAnimationFrame(() =>
        detailRef.current?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "auto"
            : "smooth",
          block: "start",
        }),
      );
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.scenery} aria-hidden="true" />
      <div className={styles.sunWash} aria-hidden="true" />
      <div className={styles.headingDots} aria-hidden="true" />
      <Leaves className={styles.headingLeaves} />
      <div className={styles.container}>
        <section className={styles.intro} aria-labelledby="about-heading">
          <p className={styles.eyebrow}>Our people</p>
          <h1 id="about-heading">The Serving Team</h1>
          <div className={styles.heartDivider} aria-hidden="true">
            <span />
            <Heart size={21} strokeWidth={1.8} />
            <span />
          </div>
          <p className={styles.subtitle}>
            Dedicated professionals and educators serving with heart and
            purpose.
          </p>
        </section>

        <div
          className={styles.teamGrid}
          role="group"
          aria-label="Meet the Edutindo team"
        >
          {FOUNDERS.map((founder, index) => {
            const selected = index === activeIndex;
            return (
              <button
                key={founder.name}
                type="button"
                onClick={() => selectFounder(index)}
                className={`${styles.memberCard} ${selected ? styles.selected : ""}`}
                aria-pressed={selected}
                aria-controls="team-profile"
              >
                {selected && (
                  <span className={styles.selectedBadge}>
                    <Check size={16} strokeWidth={3} aria-hidden="true" />
                  </span>
                )}
                <FounderAvatar founder={founder} />
                <span className={styles.memberRole}>{founder.role}</span>
                <h2 translate="no" className="notranslate">
                  {founder.name}
                </h2>
                <span className={styles.cardUnderline} aria-hidden="true" />
              </button>
            );
          })}
        </div>

        <section
          id="team-profile"
          ref={detailRef}
          className={styles.detail}
          aria-labelledby="profile-name"
        >
          <div className={styles.detailDots} aria-hidden="true" />
          <Leaves className={styles.detailLeavesLeft} />
          <Leaves className={styles.detailLeavesRight} />
          <div key={activeFounder.name} className={styles.detailGrid}>
            <div className={styles.profileVisual}>
              <FounderAvatar founder={activeFounder} large />
              <p className={styles.roleBadge}>{activeFounder.role}</p>
            </div>
            <div
              className={styles.profileContent}
              aria-live="polite"
              aria-atomic="true"
            >
              <h2 id="profile-name" translate="no" className="notranslate">
                {activeFounder.name}
              </h2>
              <ul className={styles.credentials}>
                {activeFounder.lines.map((line, index) => {
                  const Icon = index === 0 ? GraduationCap : BriefcaseBusiness;
                  return (
                    <li key={line}>
                      <span className={styles.credentialIcon}>
                        <Icon size={25} strokeWidth={1.7} aria-hidden="true" />
                      </span>
                      <p>{line}</p>
                    </li>
                  );
                })}
              </ul>
              <div className={styles.contactRow}>
                <Link href="/contact" className={styles.contactLink}>
                  <Mail size={21} aria-hidden="true" /> Get in Touch
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
