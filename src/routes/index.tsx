import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import Intro from "@/components/Intro";
import Reveal from "@/components/Reveal";

const ParticleField = lazy(() => import("@/components/ParticleField"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "aevill — designer, developer, generalist" },
      {
        name: "description",
        content:
          "Portfolio of aevill: interface design, front-end engineering and motion work, presented on a living 3D field.",
      },
      { property: "og:title", content: "aevill — designer, developer, generalist" },
      {
        property: "og:description",
        content:
          "Selected work across design, code and motion. A quiet interface with a moving 3D background.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const PROJECTS = [
  {
    n: "01",
    title: "Halcyon",
    tags: ["Product design", "Front-end"],
    year: "2026",
    body: "A focus tool that hides everything but the one thing you said mattered today. Designed, built and shipped solo — from the type scale to the sync layer.",
    link: "#",
  },
  {
    n: "02",
    title: "Nullform",
    tags: ["WebGL", "Motion"],
    year: "2025",
    body: "Generative identity system for a small studio. Every visitor gets a different rendering of the same logo, seeded from the time they arrive.",
    link: "#",
  },
  {
    n: "03",
    title: "Casette",
    tags: ["Brand", "Audio"],
    year: "2025",
    body: "A record label micro-site with a player built around tape mechanics — spooling progress, wow and flutter on scrub, no album art until you press play.",
    link: "#",
  },
  {
    n: "04",
    title: "Field Notes",
    tags: ["Editorial", "Writing"],
    year: "2024",
    body: "Long-form writing on interfaces that get out of the way. Typography-first, no images, reads the same on a phone at 2am.",
    link: "#",
  },
];

const DISCIPLINES = [
  { head: "Design", items: ["Interface design", "Design systems", "Brand & identity", "Typography"] },
  { head: "Build", items: ["React / TypeScript", "WebGL & shaders", "Design engineering", "Performance"] },
  { head: "Motion", items: ["Interaction design", "Micro-animation", "Title sequences", "Sound-led motion"] },
];

function Index() {
  const [introDone, setIntroDone] = useState(true);

  useEffect(() => {
    if (sessionStorage.getItem("aevill-intro") !== "seen") setIntroDone(false);
  }, []);

  const finishIntro = useCallback(() => {
    sessionStorage.setItem("aevill-intro", "seen");
    setIntroDone(true);
  }, []);

  return (
    <div className="relative min-h-screen">
      <ClientOnly fallback={null}>
        <Suspense fallback={null}>
          <ParticleField />
        </Suspense>
        {!introDone && <Intro onDone={finishIntro} />}
      </ClientOnly>

      {/* vignette so type always stays readable over the field */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(120% 70% at 50% 0%, transparent 35%, color-mix(in oklab, var(--background) 78%, transparent) 100%)",
        }}
      />

      <div className="relative z-10">
        <header className="fixed top-0 right-0 left-0 z-20 flex items-center justify-between px-6 py-6 mix-blend-difference md:px-12">
          <span className="text-display text-lg tracking-tight">aevill</span>
          <nav className="flex gap-6">
            <a href="#work" className="label-mono link-underline text-foreground/80">
              Work
            </a>
            <a href="#skills" className="label-mono link-underline text-foreground/80">
              Skills
            </a>
            <a href="#contact" className="label-mono link-underline text-foreground/80">
              Contact
            </a>
          </nav>
        </header>

        {/* HERO */}
        <section className="flex min-h-screen flex-col justify-between px-6 pt-32 pb-10 md:px-12">
          <div />
          <div className="fade-up" style={{ animationDelay: introDone ? "0ms" : "900ms" }}>
            <h1 className="text-display text-[22vw] leading-[0.82] md:text-[16vw]">aevill</h1>
            <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
              <p className="max-w-md text-lg leading-snug text-muted-foreground md:text-xl">
                I&apos;ve done a bit of everything — design, code, motion, sound. These days I put
                them in the same room and see what happens.
              </p>
              <span className="label-mono">Independent · Available for work</span>
            </div>
          </div>
          <div className="mt-16 flex items-center gap-3">
            <span className="label-mono">Scroll</span>
            <span className="h-px w-16 bg-primary" />
          </div>
        </section>

        {/* ABOUT */}
        <section className="hairline-t px-6 py-28 md:px-12" id="about">
          <div className="grid gap-12 md:grid-cols-12">
            <Reveal className="md:col-span-3">
              <span className="label-mono">About</span>
            </Reveal>
            <Reveal delay={80} className="md:col-span-6">
              <p className="text-display text-3xl leading-tight md:text-4xl">
                I build quiet interfaces with something moving underneath.
              </p>
              <p className="mt-6 max-w-xl leading-relaxed text-muted-foreground">
                I started in graphic design, drifted into front-end, got distracted by shaders, and
                somewhere along the way learned to score my own animations. I like work that looks
                restrained standing still and feels alive the moment you touch it.
              </p>
            </Reveal>
            <Reveal delay={160} className="md:col-span-3">
              <dl className="space-y-6">
                <div>
                  <dt className="label-mono">Currently</dt>
                  <dd className="mt-2 text-sm">Independent design engineer</dd>
                </div>
                <div>
                  <dt className="label-mono">Previously</dt>
                  <dd className="mt-2 text-sm leading-relaxed">
                    Studio work, in-house product teams, a few things that never shipped
                  </dd>
                </div>
                <div>
                  <dt className="label-mono">Based</dt>
                  <dd className="mt-2 text-sm">Everywhere / online</dd>
                </div>
              </dl>
            </Reveal>
          </div>
        </section>

        {/* WORK */}
        <section className="hairline-t px-6 py-28 md:px-12" id="work">
          <Reveal>
            <span className="label-mono">Selected work</span>
          </Reveal>
          <ul className="mt-12">
            {PROJECTS.map((p, i) => (
              <Reveal key={p.n} delay={i * 70}>
                <ProjectRow {...p} />
              </Reveal>
            ))}
          </ul>
        </section>

        {/* SKILLS */}
        <section className="hairline-t px-6 py-28 md:px-12" id="skills">
          <Reveal>
            <span className="label-mono">What I do</span>
          </Reveal>
          <div className="mt-12 grid gap-12 md:grid-cols-3">
            {DISCIPLINES.map((d, i) => (
              <Reveal key={d.head} delay={i * 90}>
                <h3 className="text-display text-2xl">{d.head}</h3>
                <ul className="mt-5 space-y-3">
                  {d.items.map((it) => (
                    <li key={it} className="text-sm text-muted-foreground">
                      {it}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </section>

        {/* CONTACT */}
        <section className="hairline-t px-6 py-28 md:px-12" id="contact">
          <Reveal>
            <span className="label-mono">Contact</span>
            <a
              href="mailto:hello@aevill.com"
              className="text-display mt-8 block text-[11vw] leading-none transition-colors duration-500 hover:text-primary md:text-[7vw]"
            >
              hello@aevill.com
            </a>
          </Reveal>
          <Reveal delay={120}>
            <div className="hairline-t mt-20 flex flex-wrap items-center justify-between gap-6 pt-6">
              <div className="flex gap-6">
                {["Instagram", "GitHub", "Read.cv", "X"].map((s) => (
                  <a key={s} href="#" className="label-mono link-underline">
                    {s}
                  </a>
                ))}
              </div>
              <span className="label-mono">© {new Date().getFullYear()} aevill</span>
            </div>
          </Reveal>
        </section>
      </div>
    </div>
  );
}

function ProjectRow({
  n,
  title,
  tags,
  year,
  body,
}: {
  n: string;
  title: string;
  tags: string[];
  year: string;
  body: string;
  link: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <li className="hairline-t">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="group grid w-full grid-cols-12 items-baseline gap-4 py-7 text-left transition-[padding,color] duration-500 hover:pl-3 hover:text-primary"
      >
        <span className="label-mono col-span-2 md:col-span-1">{n}</span>
        <span className="text-display col-span-8 text-3xl md:col-span-6 md:text-5xl">{title}</span>
        <span className="col-span-12 hidden gap-3 md:col-span-3 md:flex">
          {tags.map((t) => (
            <span key={t} className="label-mono">
              {t}
            </span>
          ))}
        </span>
        <span className="label-mono col-span-2 text-right md:col-span-2">{year}</span>
      </button>
      <div
        className="grid transition-all duration-700"
        style={{ gridTemplateRows: open ? "1fr" : "0fr", opacity: open ? 1 : 0 }}
      >
        <div className="overflow-hidden">
          <div className="grid grid-cols-12 gap-4 pb-9">
            <p className="col-span-12 max-w-xl leading-relaxed text-muted-foreground md:col-span-6 md:col-start-2">
              {body}
              <span className="mt-4 block">
                <a href="#" className="link-underline text-foreground">
                  View project
                </a>
              </span>
            </p>
          </div>
        </div>
      </div>
    </li>
  );
}
