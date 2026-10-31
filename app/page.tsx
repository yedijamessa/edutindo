import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Cross,
  Flag,
  GraduationCap,
  Handshake,
  Lightbulb,
  Target,
  UsersRound,
  Presentation,
} from "lucide-react";
import styles from "./home.module.css";
import { HeroPhotoCarousel } from "@/components/home/hero-photo-carousel";

const pathways = [
  {
    image: "engagement",
    alt: "Illustration of Indonesian students learning together with a teacher",
    icon: UsersRound,
    title: "School offers optimum",
    emphasis: "ENGAGEMENT",
    description:
      "Creating learning environments where students are active, curious, and supported to reach their full potential.",
    color: "orange",
    href: "/get-involved",
    linkLabel: "Explore school partnerships",
  },
  {
    image: "innovation",
    alt: "Illustration of students collaborating on a STEAM electronics project",
    icon: Lightbulb,
    title: "Critical need for local",
    emphasis: "INNOVATORS",
    description:
      "Equipping the next generation with real-world skills to solve local challenges and create lasting impact.",
    color: "cyan",
    href: "/about",
    linkLabel: "Learn about our STEAM vision",
  },
  {
    image: "transformation",
    alt: "Illustration of Indonesian students sharing a conversation by the sea",
    icon: Cross,
    title: "Encountering Jesus",
    emphasis: "brings TRANSFORMATION",
    description:
      "Nurturing character, purpose, and a heart to serve — so that education leads to lives and communities transformed.",
    color: "gold",
    href: "/about",
    linkLabel: "Discover our Christian values",
  },
] as const;

const buildingBlocks = [
  {
    title: "Partnership Model",
    text: "Strong collaboration with schools and communities",
    icon: Handshake,
    side: "left",
  },
  {
    title: "Empowering Teachers",
    text: "Equipping and inspiring educators for greater impact",
    icon: Presentation,
    side: "left",
  },
  {
    title: "Accessible Resources",
    text: "Tools, curriculum, and support for broader reach",
    icon: BookOpen,
    side: "left",
  },
  {
    title: "Curriculum 4.0",
    text: "Relevant, future-ready STEAM learning",
    icon: GraduationCap,
    side: "right",
  },
  {
    title: "Real World Experience",
    text: "Hands-on learning for real-life impact",
    icon: UsersRound,
    side: "right",
  },
  {
    title: "Transformative Character",
    text: "Christ-centered values that shape servant leaders",
    icon: Flag,
    side: "right",
  },
] as const;

function Foliage({ className }: { className: string }) {
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

export default function HomePage() {
  return (
    <div className={styles.home}>
      <section className={styles.hero} aria-labelledby="home-heading">
        <div className={`${styles.container} ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              Edukasi Terang Indonesia (Edutindo) Foundation
            </p>
            <h1 id="home-heading">
              Breaking Barriers
              <br />
              <span className={styles.gradient}>Building The Future</span>
            </h1>
            <p className={styles.intro}>
              A Christian STEAM education initiative for Indonesia&apos;s next
              generation of servant-hearted innovators.
            </p>
            <div className={styles.actions}>
              <Link href="/donate" className={styles.primaryButton}>
                Start Your Journey With Us{" "}
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link href="/about" className={styles.secondaryButton}>
                Learn About Us
              </Link>
            </div>
          </div>
          <div className={styles.heroArtwork}>
            <div className={styles.sunWash} aria-hidden="true" />
            <Foliage className={styles.heroLeaves} />
            <div className={styles.sunRays} aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </div>
            <div className={styles.heroPhoto}>
              <HeroPhotoCarousel />
            </div>
          </div>
        </div>
      </section>
      <section
        id="pathways"
        className={styles.vision}
        aria-labelledby="vision-heading"
      >
        <div className={styles.container}>
          <div className={styles.visionIntro}>
            <div>
              <p className={styles.eyebrow}>Our vision</p>
              <h2 id="vision-heading">
                Transforming Rural Indonesia
                <br />
                <span className={styles.gradient}>Through Education</span>
              </h2>
              <p className={styles.visionDescription}>
                Transforming rural Indonesia by unlocking STEAM learning
                opportunities through SCHOOL partnerships that empower teachers
                and families to raise a skilled and impact-driven generation,
                rooted in CHRISTIAN values and capable of driving INNOVATION
                that uplifts their local communities.
              </p>
            </div>
            <aside className={styles.approach}>
              <span className={styles.targetIcon}>
                <Target size={31} strokeWidth={1.6} aria-hidden="true" />
              </span>
              <div>
                <h3>Our approach</h3>
                <p>
                  We are committed to rigorous research and continuous
                  refinement to discover and implement the most effective
                  interventions for advancing science education delivery to the
                  unreached.
                </p>
              </div>
            </aside>
          </div>
          <div className={styles.pathways}>
            {pathways.map(
              ({
                image,
                alt,
                icon: Icon,
                title,
                emphasis,
                description,
                color,
                href,
                linkLabel,
              }) => (
                <article
                  className={`${styles.pathway} ${styles[color]}`}
                  key={title}
                >
                  <div className={styles.pathwayPhoto}>
                    <Image
                      src={`/homepage/redesign/${image}.webp`}
                      alt={alt}
                      fill
                      sizes="(min-width: 1400px) 375px, (min-width: 700px) 29vw, 90vw"
                      className={styles.cover}
                    />
                  </div>
                  <div className={styles.pathwayBody}>
                    <span className={styles.pathwayIcon}>
                      <Icon size={30} strokeWidth={1.8} aria-hidden="true" />
                    </span>
                    <h3>
                      {title}
                      <br />
                      <span>{emphasis}</span>
                    </h3>
                    <p>{description}</p>
                    <Link
                      href={href}
                      aria-label={linkLabel}
                      className={styles.cardLink}
                    >
                      <ArrowRight size={20} aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              ),
            )}
          </div>
        </div>
      </section>
      <section className={styles.building} aria-labelledby="building-heading">
        <div className={styles.container}>
          <div className={styles.buildingHeading}>
            <p className={styles.eyebrow}>Our building blocks</p>
            <h2 id="building-heading">Our Building Blocks</h2>
            <p>
              Six key elements working together to create lasting impact
              <br className={styles.desktopBreak} /> through Edutindo Christian
              STEAM School.
            </p>
          </div>
          <div className={styles.diagram}>
            <svg
              className={styles.connections}
              viewBox="0 0 1000 300"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <g fill="none" strokeWidth="1.5">
                <path
                  d="M280 48C370 48 343 118 430 118M280 150H430M280 252C370 252 343 182 430 182"
                  stroke="#209bff"
                />
                <path
                  d="M720 48C630 48 657 118 570 118M720 150H570M720 252C630 252 657 182 570 182"
                  stroke="#00b6cc"
                />
              </g>
              <g fill="#16acf0" stroke="white" strokeWidth="4">
                {[
                  [290, 48],
                  [290, 150],
                  [290, 252],
                  [710, 48],
                  [710, 150],
                  [710, 252],
                  [416, 150],
                  [584, 150],
                ].map(([cx, cy]) => (
                  <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="6" />
                ))}
              </g>
            </svg>
            <div className={styles.blockColumn}>
              {buildingBlocks
                .filter((b) => b.side === "left")
                .map(({ title, text, icon: Icon }) => (
                  <div className={styles.block} key={title}>
                    <span className={styles.blockIcon}>
                      <Icon size={39} strokeWidth={1.35} aria-hidden="true" />
                    </span>
                    <div>
                      <h3>{title}</h3>
                      <p>{text}</p>
                    </div>
                  </div>
                ))}
            </div>
            <div className={styles.schoolOrb}>
              <span>
                Edutindo
                <br />
                Christian
                <br />
                STEAM
                <br />
                School
              </span>
            </div>
            <div className={`${styles.blockColumn} ${styles.rightBlocks}`}>
              {buildingBlocks
                .filter((b) => b.side === "right")
                .map(({ title, text, icon: Icon }) => (
                  <div className={styles.block} key={title}>
                    <span className={styles.blockIcon}>
                      <Icon size={39} strokeWidth={1.35} aria-hidden="true" />
                    </span>
                    <div>
                      <h3>{title}</h3>
                      <p>{text}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
        <Foliage className={styles.buildingLeavesLeft} />
        <Foliage className={styles.buildingLeavesRight} />
      </section>
    </div>
  );
}
