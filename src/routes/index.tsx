import { createFileRoute } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import Intro from "@/components/Intro";
import Reveal from "@/components/Reveal";
import Tilt3D from "@/components/Tilt3D";
import InfoWindow from "@/components/InfoWindow";

const ParticleField = lazy(() => import("@/components/ParticleField"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "aevill — developer, designer, server operator" },
      {
        name: "description",
        content:
          "aevill: full-stack developer, graphic designer and Minecraft server operator. Currently manager of Synergy FFA. Selling tankskill.xyz and balkantiers.xyz with their full website concepts.",
      },
      { property: "og:title", content: "aevill — developer, designer, server operator" },
      {
        property: "og:description",
        content:
          "Development, design and Minecraft network operations. Currently manager of Synergy FFA. Contact on Discord or Gmail.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Skill = { name: string; desc: string };

const SKILLS: { head: string; items: Skill[] }[] = [
  {
    head: "Development",
    items: [
      { name: "Java", desc: "Minecraft plugin and server-side development — custom gamemodes, anti-cheat hooks, permissions logic and performance-critical event handling." },
      { name: "JavaScript", desc: "The language I reach for most. Everything from small browser interactions to full app logic and automation scripts." },
      { name: "TypeScript", desc: "Typed JavaScript for anything that has to survive longer than a weekend — safer refactors, cleaner APIs, fewer runtime surprises." },
      { name: "HTML", desc: "Semantic, accessible markup as the base layer of every site I build. Structure first, styling after." },
      { name: "CSS", desc: "Layout, motion and design systems. Grid, flex, custom properties, transitions — most of the 'feel' of a site lives here." },
      { name: "React", desc: "Component architecture, state, hooks and reactive interfaces — the framework behind most of the front-ends I ship." },
      { name: "Next.js", desc: "Routing, server rendering and deployment for production React sites that need to be fast and indexable." },
      { name: "Node.js", desc: "Backends, bots, tooling and API layers. Discord bots, webhook handlers and glue services between game servers and websites." },
      { name: "Python", desc: "Scripting, automation and data wrangling — quick tools that save hours of manual work." },
      { name: "Git / GitHub", desc: "Version control, branching, pull requests and releases. Everything I build lives in a repo." },
      { name: "APIs", desc: "Designing and consuming REST endpoints, auth flows, rate limits and integrations between services." },
      { name: "Databases", desc: "Schema design, queries and data modelling for player stats, shops, punishments and site content." },
      { name: "Web development", desc: "End to end: concept, design, build, deploy. I can take a site from a blank page to a live domain on my own." },
    ],
  },
  {
    head: "Infrastructure",
    items: [
      { name: "Hosting", desc: "Provisioning and running game and web hosting — picking the right box, deploying, monitoring and keeping uptime respectable." },
      { name: "Cloudflare", desc: "Proxying, caching, WAF rules, page rules and DDoS mitigation in front of both websites and Minecraft networks." },
      { name: "DNS", desc: "Records, SRV setup for Minecraft, subdomains, propagation and domain migrations without downtime." },
      { name: "Server optimization", desc: "Timings analysis, tick-rate debugging, plugin auditing and config tuning to keep TPS at 20 under real player load." },
      { name: "Permissions", desc: "Rank trees, inheritance, staff scopes and per-world permission setups that don't accidentally hand out admin." },
      { name: "Anti-cheat", desc: "Configuring and tuning anti-cheat, tightening checks against false positives, and reviewing flagged clips." },
      { name: "Server security", desc: "Hardening access, protecting against exploits and leaks, backup strategy and locking down staff privileges." },
    ],
  },
  {
    head: "Design & Media",
    items: [
      { name: "Graphic design", desc: "Logos, banners, store graphics and full visual identities — mostly for gaming communities and servers." },
      { name: "UI design", desc: "Interface layout, type scale, spacing and interaction design before a single line of front-end code exists." },
      { name: "Video editing", desc: "Cutting montages, trailers and short-form content with pacing that actually holds attention." },
      { name: "Motion graphics", desc: "Animated intros, lower thirds, transitions and kinetic type for trailers and social content." },
      { name: "After Effects", desc: "My main motion tool — compositing, keyframing, effects and render pipelines." },
      { name: "Premiere Pro", desc: "Timeline editing, colour, audio balancing and export presets for YouTube and TikTok." },
      { name: "Photoshop", desc: "Compositing, retouching and every static graphic from thumbnails to full store layouts." },
      { name: "Thumbnails", desc: "Click-driven thumbnail design — readable at small sizes, high contrast, clear subject." },
      { name: "Resource-pack design", desc: "Custom Minecraft textures, GUIs, fonts and item models to give a server its own look." },
      { name: "Branding", desc: "Naming, palette, typography and the whole consistent look across a server, site and socials." },
    ],
  },
];

const SELLING = [
  {
    name: "tankskill.xyz",
    href: "https://tankskill.xyz",
    note: "Domain + full website concept",
    body: "The domain and the entire website concept built on it. Heads up: the site does not currently work as intended — parts of it are unfinished or broken and will need fixing by whoever picks it up.",
  },
  {
    name: "balkantiers.xyz",
    href: "https://balkantiers.xyz",
    note: "Domain + full website concept",
    body: "Sold as the domain plus the whole concept and build sitting on it. Same disclaimer: it does not currently function as intended and will need work before it's production-ready.",
  },
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
  { label: "YOUTUBE", href: "https://www.youtube.com/@AEvilIsHere" },
  { label: "TIKTOK", href: "https://www.tiktok.com/@aevilltaken" },
  { label: "GITHUB", href: "https://github.com/aevilldev" },
  { label: "DISCORD", href: "https://discord.com/users/aevill" },
];

function Index() {
  const [introDone, setIntroDone] = useState(true);
  const [active, setActive] = useState<{ group: string; skill: Skill } | null>(null);

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

      {active && (
        <InfoWindow kicker={active.group} title={active.skill.name} onClose={() => setActive(null)}>
          {active.skill.desc}
        </InfoWindow>
      )}

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
          <div>
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
              <Tilt3D strength={12} depth={40}>
                <div
                  className="border border-primary/50 px-6 py-5"
                  style={{
                    background: "color-mix(in oklab, var(--card) 55%, transparent)",
                    boxShadow: "var(--accent-glow)",
                  }}
                >
                  <span className="label-mono flex items-center gap-2">
                    <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                    Currently
                  </span>
                  <p className="text-display mt-3 text-3xl text-primary md:text-4xl">
                    Manager — Synergy FFA
                  </p>
                  <p className="label-mono mt-3">Also moderator · NovaTiers</p>
                </div>
              </Tilt3D>
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
                piece of branding attached to them. Right now I&apos;m{" "}
                <span className="text-primary">manager of Synergy FFA</span>, keeping the server,
                the staff team and the player experience running day to day.
              </p>
            </Reveal>
            <Reveal delay={160} className="md:col-span-3">
              <dl className="space-y-6">
                <div>
                  <dt className="label-mono">Current — main role</dt>
                  <dd className="text-display mt-2 text-xl text-primary">Manager, Synergy FFA</dd>
                </div>
                <div>
                  <dt className="label-mono">Current</dt>
                  <dd className="mt-2 text-sm">Moderator — NovaTiers</dd>
                </div>
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
            <span className="label-mono">What I do — click anything</span>
          </Reveal>
          <div className="mt-12 grid gap-12 md:grid-cols-3">
            {SKILLS.map((d, i) => (
              <Reveal key={d.head} delay={i * 90}>
                <Tilt3D strength={5} depth={14}>
                  <h3 className="text-display text-2xl">{d.head}</h3>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {d.items.map((it) => (
                      <li key={it.name}>
                        <button
                          type="button"
                          onClick={() => setActive({ group: d.head, skill: it })}
                          className="rounded-sm border border-hairline px-2.5 py-1 text-sm text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-primary hover:text-primary hover:shadow-[var(--accent-glow)]"
                        >
                          {it.name}
                        </button>
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
            <span className="label-mono">Currently selling — domain + website concept</span>
            <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
              These are sold as the domain <em>and</em> the entire website concept built on it. Both
              sites currently{" "}
              <span className="text-primary">do not work as intended and will need fixing</span> —
              you&apos;re buying the name and the concept, not a finished product.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {SELLING.map((s, i) => (
              <Reveal key={s.name} delay={i * 90}>
                <Tilt3D strength={9} depth={30}>
                  <div className="group relative overflow-hidden border border-hairline p-8 transition-colors duration-500 hover:border-primary">
                    <span className="label-mono">{s.note}</span>
                    <p className="text-display mt-6 text-3xl transition-colors duration-500 group-hover:text-primary md:text-4xl">
                      {s.name}
                    </p>
                    <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                    <p className="label-mono mt-5 text-destructive">
                      ⚠ Not fully functional — needs fixing
                    </p>
                    <div className="mt-8 flex flex-wrap gap-6">
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noreferrer"
                        className="label-mono link-underline text-primary"
                      >
                        Open website ↗
                      </a>
                      <a
                        href={`mailto:aevillcontact@gmail.com?subject=${encodeURIComponent(`Enquiry — ${s.name}`)}`}
                        className="label-mono link-underline text-foreground"
                      >
                        Enquire
                      </a>
                    </div>
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
              <div className="flex flex-wrap gap-8">
                {LINKS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="label-mono link-underline inline-block transition-all duration-300 hover:-translate-y-0.5 hover:text-primary"
                  >
                    {s.label}
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
