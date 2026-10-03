# Kajal & Co. — Website

Static marketing site for Kajal & Co. — website design, SEO, and performance marketing.

Websites that convert. SEO that compounds. Ads that pay back.

---

## Running locally

No build step and no dependencies — it's plain HTML, CSS, and vanilla JS. Any static server works:

```bash
python -m http.server 4477
```

Then open <http://localhost:4477>.

---

## Structure

```
.
├── index.html          # Home
├── about.html          # About, principles, team, how we work, press, workshop
├── services.html       # Website Design, SEO, Performance Marketing + FAQ
├── portfolio.html      # Case studies with service/industry filters
├── contact.html        # Free growth audit form
└── assets/
    ├── css/style.css   # Design tokens + all components
    └── js/main.js      # Interactions
```

## Design system

Defined as custom properties at the top of `assets/css/style.css`.

**Type**
| Face | Used for |
| --- | --- |
| Bricolage Grotesque | Headings and body |
| Instrument Serif (italic) | `*asterisk*` emphasis in headings, outcome headlines |
| IBM Plex Mono | Tag rows, eyebrow labels, metadata |

Headings use fluid `clamp()` scales (`--fs-h0` … `--fs-h3`), so nothing needs per-breakpoint overrides.

**Colour** — dark UI on `#0a0a0a` with a neutral ramp (`--n1` … `--n12`) and lime `#d4ff70` as the brand accent. Per-section accents (purple, blue, amber, crimson, teal) are set with local `--card-accent` / `--p-accent` variables.

**Corners are square by design.** `--radius: 0` is applied globally via `*, *::before, *::after`. Change that single token to round the whole site.

## Components

Section head · subgrid track cards · snap sliders (work + process) · sticky stacking service cards · oversized counters · vertical testimonial marquee · segmented control · lime CTA band · filterable case-study rows.

## Interactions (`assets/js/main.js`)

Hero particle canvas · flicker-grid canvas · scroll reveals · counters · snap-slider controls · work filters · FAQ accordion · segmented tabs · seamless marquees (x and y) · hide-on-scroll header · off-canvas nav.

All animation respects `prefers-reduced-motion`.

---

## Before launch

- [ ] **Replace the mock client data.** Aarna Jewels, Northline Interiors, Veda Wellness, Studio Mehr, Kesari Foods, and Lumen Dental are placeholders, as are their metrics and testimonials.
- [ ] **Replace placeholder contact details** — `hello@kajalandco.com`, the `wa.me/910000000000` WhatsApp links, and the LinkedIn URL.
- [ ] **Confirm the pricing floors** quoted in the FAQs (₹1,20,000 websites, ₹40,000 retainers, ₹75,000 minimum ad spend).
- [ ] **Confirm team surnames** and swap the initials blocks for real photos.
- [ ] **Wire the forms.** They're front-end only — submitting shows a notice and posts nowhere.
- [ ] **Add real project imagery.** `.project__media` takes an `<img>` with no layout change; the CSS artwork is a stand-in.
- [ ] Update the announcement bar month, or remove the `has-announce` class from `<body>`.
- [ ] Add `/privacy` and `/terms`, currently linked as `#`.

## Not yet built

The copy deck specifies routes that are folded into the five pages above rather than standing alone: `/faq`, `/clients`, `/insights`, `/workshop`, `/audit/thanks`, the four service spoke pages, and the utility pages.
