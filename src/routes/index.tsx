import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import Intro from "@/components/Intro";
import Reveal from "@/components/Reveal";
import Tilt3D from "@/components/Tilt3D";

const ParticleField = lazy(() => import("@/components/ParticleField"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "aevill — developer, designer, server owner" },
      {
        name: "description",
        content:
          "aevill: full-stack developer, graphic designer and Minecraft server operator. Rank 957 on mcpvp.com. Selling tankskill.xyz and balkantiers.xyz.",
      },
      { property: "og:title", content: "aevill — developer, designer, server owner" },
      {
        property: "og:description",
        content:
          "Development, design and Minecraft network operations. Staff on NovaTiers and Synergy FFA. Contact on Discord or Gmail.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const SKILLS = [
  {
    head: "Development",
    items: [
      "Java",
      "JavaScript",
      "TypeScript",
      "HTML",
      "CSS",
      "React",
      "Next.js",
      "Node.js",
      "Python",
      "Git / GitHub",
      "APIs",
      "Databases",
      "Web development",
    ],
  },
  {
    head: "Infrastructure",
    items: [
      "Hosting",
      "Cloudflare",
      "DNS",
      "Server optimization",
      "Permissions",
      "Anti-cheat",
      "Server security",
    ],
  },
  {
    head: "Design & Media",
    items: [
      "Graphic design",
      "UI design",
      "Video editing",
      "Motion graphics",
      "After Effects",
      "Premiere Pro",
      "Photoshop",
      "Thumbnails",
      "Resource-pack design",
      "Branding",
    ],
  },
];

const SELLING = [
  { name: "tankskill.xyz", note: "Domain — available now" },
  { name: "balkantiers.xyz", note: "Domain — available now" },
];

const ROLES = [
  { role: "Moderator", org: "NovaTiers", when: "Current" },
  { role: "Manager", org: "Synergy FFA", when: "Current" },
];

const HISTORY = [
  {
    n: "01",
    title: "Axe Designs",
    tags: ["Owner", "Discord"],
    year: "2018",
    body: "Design-focused Discord community that grew to 800 members. Ran the branding, the shop-front and every commission that came through the door.",
  },
  {
    n: "02",
    title: "Dark SMP",
    tags: ["Co-owner", "Bedrock realm"],
    year: "2020 — 2021",
    body: "Co-owned a Bedrock realm SMP. Handled the world setup, permissions, moderation team and the day-to-day of keeping players around.",
  },
  {
    n: "03",
    title: "Lunar Network",
    tags: ["Owner", "Network"],
    year: "2023",
    body: "Owned and operated a 3,000-member Minecraft network. Hosting, DNS, anti-cheat, server optimization, staff structure, branding and thumbnails — all of it in-house.",
  },
];

const LINKS = [
  { label: "YouTube", handle: "@AEvilIsHere", href: "https://www.youtube.com/@AEvilIsHere" },
  { label: "TikTok", handle: "@aevilltaken", href: "https://www.tiktok.com/@aevilltaken" },
  { label: "GitHub", handle: "aevilldev", href: "https://github.com/aevilldev" },
  { label: "Discord", handle: "aevill", href: "https://discord.com/users/aevill" },
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
          <nav className="hidden gap-6 sm:flex">
            <a href="#skills" className="label-mono link-underline text-foreground/80">
              Skills
            </a>
            <a href="#selling" className="label-mono link-underline text-foreground/80">
              Selling
            </a>
            <a href="#history" className="label-mono link-underline text-foreground/80">
              History
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
            <Tilt3D strength={9} depth={30}>
              <h1
                className="text-display text-[22vw] leading-[0.82] md:text-[16vw]"
                style={{
                  textShadow:
                    "0 1px 0 color-mix(in oklab, var(--primary) 45%, transparent), 0 0 60px color-mix(in oklab, var(--primary) 22%, transparent)",
                }}
              >
                aevill
              </h1>
            </Tilt3D>
            <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
              <p className="max-w-md text-lg leading-snug text-muted-foreground md:text-xl">
                Developer, designer and server operator. I&apos;ve done pretty much everything at
                one point — code, infrastructure, branding, motion, moderation.
              </p>
              <div className="flex flex-col gap-2">
                <span className="label-mono">Current rank · mcpvp.com</span>
                <span className="text-display text-5xl text-primary md:text-6xl">#957</span>
              </div>
            </div>
          </div>
          <div className="mt-16 flex items-center gap-3">
            <span className="label-mono">Scroll</span>
            <span className="h-px w-16 bg-primary" />
          </div>
        </section>

        {/* ABOUT / STATUS */}
        <section className="hairline-t px-6 py-28 md:px-12" id="about">
          <div className="grid gap-12 md:grid-cols-12">
            <Reveal className="md:col-span-3">
              <span className="label-mono">About</span>
            </Reveal>
            <Reveal delay={80} className="md:col-span-6">
              <p className="text-display text-3xl leading-tight md:text-4xl">
                I build the server, the site, and the thumbnail for it.
              </p>
              <p className="mt-6 max-w-xl leading-relaxed text-muted-foreground">
                Started in graphic design, moved into development, then ended up running whole
                Minecraft networks — hosting, DNS, anti-cheat, permissions, staff teams and every
                piece of branding attached to them. If a project needs it done, I&apos;ve probably
                done that part before.
              </p>
            </Reveal>
            <Reveal delay={160} className="md:col-span-3">
              <dl className="space-y-6">
                {ROLES.map((r) => (
                  <div key={r.org}>
                    <dt className="label-mono">{r.when}</dt>
                    <dd className="mt-2 text-sm">
                      {r.role} — <span className="text-primary">{r.org}</span>
                    </dd>
                  </div>
                ))}
                <div>
                  <dt className="label-mono">Contact via</dt>
                  <dd className="mt-2 text-sm">Discord or Gmail</dd>
                </div>
              </dl>
            </Reveal>
          </div>
        </section>

        {/* SKILLS */}
        <section className="hairline-t px-6 py-28 md:px-12" id="skills">
          <Reveal>
            <span className="label-mono">What I do</span>
          </Reveal>
          <div className="mt-12 grid gap-12 md:grid-cols-3">
            {SKILLS.map((d, i) => (
              <Reveal key={d.head} delay={i * 90}>
                <Tilt3D strength={5} depth={14}>
                  <h3 className="text-display text-2xl">{d.head}</h3>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {d.items.map((it) => (
                      <li
                        key={it}
                        className="rounded-sm border border-hairline px-2.5 py-1 text-sm text-muted-foreground transition-colors duration-300 hover:border-primary hover:text-primary"
                      >
                        {it}
                      </li>
                    ))}
                  </ul>
                </Tilt3D>
              </Reveal>
            ))}
          </div>
        </section>

        {/* SELLING */}
        <section className="hairline-t px-6 py-28 md:px-12" id="selling">
          <Reveal>
            <span className="label-mono">Currently selling</span>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {SELLING.map((s, i) => (
              <Reveal key={s.name} delay={i * 90}>
                <Tilt3D strength={7} depth={22}>
                  <div className="group relative overflow-hidden border border-hairline p-8 transition-colors duration-500 hover:border-primary">
                    <span className="label-mono">{s.note}</span>
                    <p className="text-display mt-6 text-3xl transition-colors duration-500 group-hover:text-primary md:text-4xl">
                      {s.name}
                    </p>
                    <a
                      href="mailto:aevillcontact@gmail.com?subject=Domain%20enquiry"
                      className="label-mono link-underline mt-8 inline-block text-foreground"
                    >
                      Enquire
                    </a>
                  </div>
                </Tilt3D>
              </Reveal>
            ))}
          </div>
        </section>

        {/* HISTORY */}
        <section className="hairline-t px-6 py-28 md:px-12" id="history">
          <Reveal>
            <span className="label-mono">Used to own / run</span>
          </Reveal>
          <ul className="mt-12">
            {HISTORY.map((p, i) => (
              <Reveal key={p.n} delay={i * 70}>
                <ProjectRow {...p} />
              </Reveal>
            ))}
          </ul>
        </section>

        {/* CONTACT */}
        <section className="hairline-t px-6 py-28 md:px-12" id="contact">
          <Reveal>
            <span className="label-mono">Contact — Discord or Gmail</span>
            <Tilt3D strength={6} depth={18}>
              <a
                href="mailto:aevillcontact@gmail.com"
                className="text-display mt-8 block text-[9vw] leading-none break-all transition-colors duration-500 hover:text-primary md:text-[5.5vw]"
              >
                aevillcontact@gmail.com
              </a>
            </Tilt3D>
            <p className="mt-6 text-lg text-muted-foreground">
              Discord — <span className="text-primary">aevill</span>
            </p>
          </Reveal>
          <Reveal delay={120}>
            <div className="hairline-t mt-20 flex flex-wrap items-center justify-between gap-6 pt-6">
              <div className="flex flex-wrap gap-6">
                {LINKS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="label-mono link-underline"
                  >
                    {s.label} · {s.handle}
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
        <span className="text-display col-span-8 text-3xl md:col-span-5 md:text-5xl">{title}</span>
        <span className="col-span-12 hidden gap-3 md:col-span-4 md:flex">
          {tags.map((t) => (
            <span key={t} className="label-mono">
              {t}
            </span>
          ))}
        </span>
        <span className="label-mono col-span-2 text-right">{year}</span>
      </button>
      <div
        className="grid transition-all duration-700"
        style={{ gridTemplateRows: open ? "1fr" : "0fr", opacity: open ? 1 : 0 }}
      >
        <div className="overflow-hidden">
          <div className="grid grid-cols-12 gap-4 pb-9">
            <p className="col-span-12 max-w-xl leading-relaxed text-muted-foreground md:col-span-6 md:col-start-2">
              {body}
            </p>
          </div>
        </div>
      </div>
    </li>
  );
}
