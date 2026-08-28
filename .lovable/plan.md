# aevill — portfolio with a living 3D background

A single-page, very clean personal site for aevill: a multi-disciplinary maker ("did everything at one point"). The personality comes from motion and depth, not clutter — near-monochrome surface, one accent, and a slow-moving 3D field behind everything.

## The look

- Deep near-black canvas (`#08080a`), soft off-white text, one cold accent (electric ice-blue) used sparingly for links, cursor and active states.
- Big confident display type with tight tracking for headings, clean grotesque for body. Generous whitespace, thin hairline dividers, no boxes or drop shadows.
- Everything is a design token in `src/styles.css` — colors, accent glow, type scale, motion easings.

## The 3D background

A full-viewport WebGL layer sitting behind the content, fixed, never scrolling away:

- A drifting particle/point field in 3D space that slowly rotates on its own.
- Reacts to the cursor: the field parallaxes and tilts toward the pointer, with smooth damping so it feels weighty, not twitchy.
- Reacts to scroll: camera pushes deeper through the field as you move down the page, so each section feels like a different depth.
- Subtle accent-tinted depth fog so far particles fade into the background instead of forming a hard edge.
- Reduced-motion and mobile fallbacks: fewer particles, no pointer tracking, static gradient if WebGL is unavailable.

## The loading sequence

A full-screen intro that runs while the 3D scene compiles:

1. Black screen, a thin progress line and a counter climbing 0 → 100.
2. "aevill" letters resolve into place as the count finishes.
3. The overlay wipes away and the hero content staggers up as the particle field settles into view.

Shown once per session so navigating back doesn't replay it.

## Page sections

1. **Hero** — oversized "aevill" wordmark, one-line positioning statement, scroll hint.
2. **About** — short first-person paragraph plus a compact "currently / previously" list.
3. **Work** — selected projects as a large editorial list: index number, title, discipline tags, year. Hovering a row raises it and shifts the background field; rows expand in place to reveal a description and links.
4. **Skills / services** — disciplines grouped into a few columns (design, code, motion, whatever else), typographic only, no icon soup.
5. **Contact** — big mailto line, social links, minimal footer.

Content ships with clearly-written placeholders you can swap for real projects, bio and links.

## Technical notes

- Add `three`, `@react-three/fiber@^9`, `@react-three/drei@^10` (React 19 compatible), plus `@types/three`.
- Background lives in a client-only component; the route is set to render the canvas after hydration so server rendering never touches WebGL.
- All animation uses frame-delta timing and exponential damping so it's smooth at any framerate; particle count and pixel ratio are capped for mobile.
- Content sections are plain React + Tailwind, fully readable and crawlable — the 3D layer is decorative only.
- Route metadata: unique title, description and social tags for the portfolio.

## Not included

No CMS, database or contact form backend — the contact section is a mailto link. Say the word if you'd rather have a real form.
