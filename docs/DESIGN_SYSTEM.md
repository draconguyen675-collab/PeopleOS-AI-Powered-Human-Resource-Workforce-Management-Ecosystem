# Design system

PeopleOS uses green accents, warm neutral surfaces, restrained borders, compact data typography and a system sans-serif stack. The mark and abstract people graphics are local SVG/CSS. No external fonts, remote avatars or tracking assets are required.

Semantic CSS variables: `--background`, `--surface`, `--sidebar`, `--text`, `--muted`, `--border`, `--primary`, `--primary-hover`, `--soft-green`, `--input`, `--subtle`, `--shadow`. Tailwind v4 uses CSS-first `@theme inline`; there is no legacy Tailwind config. Light/dark/system appearance persists only the theme preference in localStorage.

The Button primitive follows the shadcn/ui composition pattern with Radix Slot and class-variance-authority. Radix Dialog supplies drawer focus trapping and Escape dismissal. Forms use explicit labels and visible validation; async feedback uses status/alert roles. React Hook Form and Zod separate form state and validation; server errors remain authoritative.

Use 8px spacing increments, 7–12px component radii, subtle backgrounds, visible focus outlines and reduced-motion support. Charts are accompanied by a textual data description. Mobile directory rows become cards; do not hide essential work information behind desktop-only hover controls. This is a foundation design system, not a claim that every component in the full product brief has shipped.
