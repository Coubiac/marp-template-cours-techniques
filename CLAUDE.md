# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

A reusable Marp presentation template for technical courses (Microsoft 365, Azure, networking, Terraform, etc.). Content is authored in Markdown, variables are substituted at render time, and output is exported to HTML/PDF via Marp CLI.

## Commands

```bash
npm install          # Install @marp-team/marp-cli dependency
npm run render       # Substitute variables and write build/ from examples/ and slides/
npm run preview      # render + start Marp live-preview server on build/
npm run export:html  # render + export build/template-demo.md to dist/ as HTML
npm run export:pdf   # render + export build/template-demo.md to dist/ as PDF
npm run export:all   # Both HTML and PDF export
```

There are no lint or test commands — this is a content template project.

## Architecture

### Pipeline

```
course.config.json  →  scripts/render.mjs  →  build/  →  Marp CLI  →  dist/
(variables)            (substitution)         (rendered)              (HTML/PDF)
```

1. `course.config.json` defines `{{VARIABLE}}` tokens (values can reference other variables; circular refs are detected after 10 passes).
2. `scripts/render.mjs` reads all `.md` files from `examples/` and `slides/`, substitutes tokens, and writes results to `build/` preserving directory structure.
3. Marp CLI reads from `build/` using `themes/coubiac.css` and exports to `dist/`.

**Source dirs** (`examples/`, `slides/`) are never modified — only `build/` is written to.

### Key Files

| File | Role |
|------|------|
| `course.config.json` | Central metadata: author, title, year, header/footer text |
| `scripts/render.mjs` | Node.js ESM script — variable resolution + file copying |
| `themes/coubiac.css` | Custom Marp theme (~586 lines), drives all slide styling |
| `examples/template-demo.md` | Reference showing every slide type and CSS class |
| `.vscode/settings.json` | Enables Marp VS Code extension with `coubiac` theme |

### Theme System (`themes/coubiac.css`)

Slides use CSS classes on `<!-- _class: … -->` directives. Main layout classes:

| Class | Use |
|-------|-----|
| `cover` | Title slide — gradient bg, principal logo |
| `module` / `section` / `tp` / `demo` | Section-break slides with gradient accents |
| `objectives` / `summary` | 2-column card layouts |
| `two-columns` | Side-by-side text (CSS Grid) |
| `media-right` / `media-left` | Text + visual with `.visual-frame` |
| `text-table` / `full-table` | Table-focused layouts |
| `code` | Dark-background code block slide |
| `full-visual` | Full-width diagram/image |
| `screenshot-full` | Full-screen screenshot, no chrome |

Modifier classes: `compact`, `no-logo`, `no-footer`, `tight`, `code-small`, `media-wide`, `media-narrow`, `screenshot-wide`.

### Variable Substitution

Variables are defined in `course.config.json` and referenced as `{{VARIABLE_NAME}}` in Markdown files. Values can themselves reference other variables (e.g., `"FOOTER": "{{COURSE_TITLE}} | © {{YEAR}} {{AUTHOR}}"`). Substitution happens only at render time — Marp itself never sees the raw tokens.

### `.gitignore` Notes

`build/` is excluded. `dist/` is excluded **except** `dist/template-demo.html` and `dist/template-demo.pdf`, which are committed as reference outputs.

## Adding Course Slides

1. Edit `course.config.json` with course-specific metadata.
2. Add `.md` files to `slides/` (or use `examples/` for demos).
3. Use `theme: coubiac` in YAML front matter.
4. Run `npm run render` then `npm run preview` to iterate.
5. Run `npm run export:all` to produce final HTML + PDF.

## Language

Course-facing documentation, comments, and slide content should be in French (fr-FR). Technical guidance files such as CLAUDE.md may be written in English for better compatibility with Claude Code. Variable names in `course.config.json` and code stay in English.

---

## Design Priorities

The template is **sober and functional**, not marketing. Every design decision should prioritise readability during live projection and on printed handouts.

- Content takes precedence over decoration. Maximise usable slide area.
- No gratuitous animations, shadows, or decorative elements beyond what already exists in the theme.
- Visuals (screenshots, diagrams) should always be as large as possible.
- Structural elements (header, footer, logo, pagination) must stay discreet and never compete with the content area.
- The design draws inspiration from clear, dense technical reference materials (structured layout, readable body size, generous visual space) without imitating any specific brand identity.

## Typography

The theme uses system-native fonts configured in `themes/coubiac.css`. Do not introduce web fonts or additional font stacks.

The table below lists current reference values. These are not frozen: if a change improves readability or visual balance, propose the adjustment with a rationale rather than treating these numbers as immutable.

| Element | Font | Current size | Notes |
|---------|------|-------------|-------|
| Body | Aptos / Segoe UI / Inter | 24 px | Default slide font |
| `h1` | Same | 34 px | `font-weight: 720`, `line-height: 1.06` |
| `h2` | Same | 26 px | |
| `h3` | Same | 21 px | |
| Cover `h1` | Same | 48 px | |
| Code / inline code | Cascadia Code / Fira Code / Consolas | 20 px (pre), 0.88 em (inline) | |
| Header / footer | Same | 10 px | `opacity: 0.42` |
| Pagination | Same | 10 px | `opacity: 0.4` |
| `.compact` body | Same | 20 px | Reduced spacing throughout |
| `.small` utility | Same | 19 px | |

- `strong` renders in `--bt-blue` (#1457b8). Do not change this to a decorative colour.
- `h1::after` adds a 70 px blue→cyan gradient underline on all content-type slides. This is structural; do not remove it.

## Header, Footer, Logo, and Pagination Rules

These elements are defined globally and must remain discreet (10 px, ≤ 42 % opacity). Do not increase their size, weight, or opacity.

| Element | Position | Visibility |
|---------|----------|------------|
| `header` | Top-right, `max-width: 620px` | All slides except section-break types where it fades to white |
| `footer` | Bottom-left, right edge stops before logo | All slides except `screenshot-full` and `no-footer` |
| Compact logo (`::before`) | Bottom-right, 32×16 px, 32 % opacity | All slides except `cover`, `no-logo`, `screenshot-full` |
| Pagination (`::after`) | Bottom-right, next to logo | All slides except `screenshot-full` and `no-footer` |
| Principal logo | Bottom-right of `cover`, 200×52 px on white pill | `cover` only |

- On `cover`, `module`, `section`, `tp`, `demo`: footer and `::after` switch to white with `rgba(255,255,255,0.78)`.
- `screenshot-full` hides header, footer, and pagination entirely — this is intentional for immersive screenshots.
- When adding a `no-footer` slide, both the footer element and the pagination `::after` pseudo-element are hidden.

## Screenshots and Diagrams

- **Never use `object-fit: cover`** for screenshots or diagrams. The global rule is `object-fit: contain`; preserve it unconditionally.
- Images must never be cropped. If a screenshot does not fit, choose a layout that gives it more space (`media-wide`, `screenshot-wide`, `full-visual`, or `screenshot-full`) rather than forcing it to fill the frame.
- Always wrap images inside `.visual-frame` on media slides. The frame provides `border`, `border-radius`, and `background`.
- Marp renders Markdown images as `<img>` wrapped in a `<p>` tag. `.visual-frame > p` is already styled to act as a full-size grid container — do not remove or change this rule.
- For side-by-side layouts, choose the column ratio modifier that gives the visual at least 50 % of slide width:
  - Default `media-right` / `media-left`: 1fr / 1fr
  - `media-wide`: text 0.8fr / visual 1.2fr
  - `screenshot-wide`: text 0.7fr / visual 1.3fr
  - `media-narrow`: use only when text genuinely needs more space than the visual

## `full-visual` and `screenshot-full` Rules

**`full-visual`** — Use when a diagram or schema is the primary content of the slide.

- Layout is `display: grid; grid-template-rows: auto minmax(0, 1fr)`. The `h1` takes its natural height; the `.visual-frame` fills the remainder.
- Do not add a fixed height to `.full-visual .visual-frame` or `.full-visual .grid`. The `minmax(0, 1fr)` row already handles this — a fixed height will cause the visual to overflow or be clipped.
- The `.visual-frame` uses `object-fit: contain` on the image. This is correct; never change it to `cover`.
- If combined with `.tight`, the reduced padding naturally enlarges the available content area.

**`screenshot-full`** — Use for full-bleed UI screenshots that need maximum resolution.

- No padding, white background, no header/footer/logo/pagination.
- The image should fill the 1280×720 px frame. Because `object-fit: contain` is applied globally, the image will letterbox rather than crop if its aspect ratio differs — this is the intended behaviour.
- Do not add any structural elements (`.visual-frame`, `.grid`, text) inside a `screenshot-full` slide; the screenshot is the entire slide.

## Code Block Rules

Code slides use the `code` or `code-small` class combined with a fenced code block.

```css
/* code */
section.code pre { max-height: 605px; overflow: hidden; font-size: 19px; }

/* code-small */
section.code-small pre { max-height: 605px; font-size: 16px; line-height: 1.32; white-space: pre; overflow: hidden; }
```

- `overflow: hidden` on `pre` is intentional in the theme to prevent scrollbars in HTML export. In PDF export this means lines beyond `max-height` are silently clipped — keep blocks short enough to fit.
- The theme sets `white-space: pre`, `word-break: normal`, `overflow-wrap: normal` and `tab-size: 2` on every `pre` and `pre code`, plus `display: block` on `pre code`. These declarations are required for Chromium-headless (Marp PDF) to render code horizontally; do not remove them.
- **Resolved template defect — `code-small` PDF rendering:** Earlier versions of the theme produced vertically compressed or stacked code lines in PDF export. Root cause: relying on browser-default `white-space: pre` for `<pre>`/`<code>` was unreliable under Chromium headless when combined with the syntax-highlighter's nested spans. Fix: explicit `white-space: pre` declarations on both `pre` and `pre code`, plus `display: block` on `pre code`. If the bug ever recurs, check (in order): (1) someone removed `white-space: pre` from `pre` or `pre code`; (2) a parent grid/flex container forces a width on `pre`; (3) the code block has more lines than `max-height` allows. As a last resort, split the code block across multiple slides rather than compressing the content.
- Always specify a language identifier on fenced code blocks (` ```powershell `, ` ```bash `, etc.) for syntax highlighting.
- Inline code in regular slides uses `:not(pre) > code` styling (light blue pill). Do not use block-level `pre` outside a `code` / `code-small` slide.

## Table Rules

Tables use `table-layout: fixed; width: 100%; font-size: 18px` by default.

- On standard content slides, tables share space with other elements and can overflow vertically if too many rows are added. Use `.compact` to reduce cell padding to `5px 7px` and font size to 16 px.
- Use `full-table` when the table is the only content on the slide — this sets `font-size: 17px` and gives the table the full width.
- Use `text-table` when pairing a short explanatory text (0.88fr) with a table (1.12fr).
- Column widths are governed by `table-layout: fixed`: distribute column widths explicitly with inline `style` or keep column count low (≤ 5 columns) to avoid illegible cell wrapping.
- Avoid merging cells (`colspan`, `rowspan`) — Marp's Markdown table parser does not support them.

---

## Claude Code Audit and Modification Workflow

When auditing or modifying this repository, follow these steps:

1. **Read before changing.** Always read `themes/coubiac.css` and the relevant slide source before proposing any CSS or Markdown change.
2. **One concern per change.** Fix one visual issue at a time. Do not refactor unrelated rules while fixing a specific bug.
3. **Prefer modifier classes over new rules.** If a layout adjustment is needed, check whether an existing modifier (`tight`, `compact`, `media-wide`, `screenshot-wide`, `no-logo`, `no-footer`) already covers the case before adding new CSS.
4. **Never add `object-fit: cover`.** If an image does not fill its frame, increase the frame size or choose a wider layout — do not change `object-fit`.
5. **Never remove `.visual-frame > p` rules.** Marp wraps Markdown images in `<p>` elements; these rules make the wrapper behave as a full-size transparent container. Removing them will break image sizing on all media slides.
6. **Test fixed heights carefully.** `section.two-columns .grid`, `section.media-right .grid`, `section.media-left .grid`, and `section.tight .grid` all use explicit pixel heights (595 px or 625 px). If you change padding or add elements, verify that the grid content still fits without overflow.
7. **Do not modify `build/` or `dist/` directly.** Both are generated artefacts. Edit source files in `examples/` or `slides/`, then re-run `npm run render`. `dist/template-demo.html` and `dist/template-demo.pdf` are intentionally versioned as reference renders; regenerate them with `npm run export:all` after any change that affects the demo output.

## Post-Modification Validation

After any change to `themes/coubiac.css` or Markdown source files, run the following commands and then perform the manual checks below.

**Command-line validation:**
```bash
npm run render      # must complete with no errors or unknown-variable warnings
npm run export:all  # must produce dist/ HTML and PDF without errors
```

**Manual checks** (open the generated files in a browser / PDF viewer):

- [ ] Images are not cropped: confirm `object-fit: contain` is preserved and images letterbox rather than crop.
- [ ] `.visual-frame > p` wrapper still acts as a transparent full-size container (image fills the frame).
- [ ] `full-visual` slides: the visual fills the row below the title without fixed-height overflow.
- [ ] `screenshot-full` slides: no header, footer, logo, or pagination visible.
- [ ] `code` and `code-small` slides: open the exported PDF — verify that code lines are horizontal and not stacked, compressed, or clipped mid-line.
- [ ] `header`, `footer`, and logo remain at 11 px / 50 % opacity on content slides.
- [ ] Section-break slides (`module`, `section`, `tp`, `demo`, `cover`) show white text with correct gradient backgrounds.
