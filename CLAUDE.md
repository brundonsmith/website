# Development practices
- When a batch of changes has been made to TypeScript files, use `deno check`
  to verify your work
- When a batch of changes has been made to TypeScript and/or json files, use
  `deno fmt` to format the files after you're done
- In typescript code, prefer pure or functional patterns over imperative
  control-flow based patterns. Immutable array methods, etc. Do not use
  things like continue and break (except for switch statements) unless
  the code will be radically more complex without it.

# Design Philosophy & Style Guide

This section describes the design language of this site. It covers intent and
constraints, not implementation — the CSS already exists in the codebase. Read
this before making visual changes, and when adding anything new, use the
decision heuristics at the end.

---

## Core philosophy

The site is designed to look like a printed book rather than a web page. Set in the Fell types, with the
conventions of mid-20th-century technical publishing applied to code and
tabular matter.

This is not a skin or a filter. The design follows the *material logic* of
print — things look like ink on paper because they are composed the way ink on
paper is composed, and because digital elements are blended onto the background
the way ink is laid onto stock. Where a choice is available, prefer the option
that a printer working with metal type would have taken.

Two ideas underpin everything:

**Constraint is the design.** There is no bold weight in the body typeface. The
palette is monochrome. Each size in the type scale is a physically distinct
design that cannot be scaled freely. These are not limitations to work around —
they are the source of the site's character. When something feels hard because
of a constraint, the answer is almost always to find the period-correct
solution, not to break the constraint.

**Print conventions read as care.** The web's defaults are serviceable and
invisible. Print conventions are particular and slightly fussy, and that
particularity is what signals that a human made decisions. Fine-grained detail —
small caps for acronyms, hanging indents, figure numbering, correct quotation
marks — does more work than any single large gesture.

### Purpose of the site

A technical blog that also offers consulting services. The writing is the
primary content; the services are secondary but must never be buried. The design
signals craft; the copy signals competence. Both are required. **Aesthetics
never take precedence over the ability of a visitor to find the writing, learn
what services are offered, or make contact.**

---

## Typography

### The type system

The site uses the IM Fell family (Igino Marini's digitization of the Fell types
held by Oxford University Press) plus Courier Prime for code.

The critical property: **IM Fell is not one typeface with a size axis. It is
five separate cuts, each made for one physical size.** Each carries its intended
size in its metadata. Using a cut near its intended size is the whole point;
using one far from its intended size forfeits the reason it was chosen.

| Cut | Intended size | Role |
|---|---|---|
| DW Pica | 16.7px | Navigation, captions, small apparatus |
| English | 18px | Body text |
| Great Primer | 22.7px | h3 |
| Double Pica | 28px | h2, masthead (SC) |
| French Canon | 52px | h1 |

`English` was cut by Christoffel van Dijck; the others by Peter De Walpergen.
English has the best letterforms in the set and the largest x-height among the
text cuts, which is why it carries body text. DW Pica's x-height is too small
for sustained reading — it is for short scanned text only.

Every cut has a matching small-caps variant. These are true small caps and are
used heavily, because they are one of the few hierarchy tools available.

### Hierarchy without weight

**There is no bold.** Not in any Fell cut. This is historically correct — bold
as a category did not exist until the 19th century — and it means hierarchy must
be built from:

- **Size** (via the size-specific cuts, never by scaling one cut)
- **Small caps** (labels, headers, acronyms, figure/table numbers)
- **Italic** (emphasis, current-state indication, prefatory matter, captions)
- **Space** (asymmetric margins; see Layout)
- **Rules** (hairlines, derived from the ink color)

Font synthesis is disabled globally. If a bold or italic is requested where none
exists, it must fail visibly rather than render a smeared approximation. Never
re-enable synthesis to work around a missing weight.

Courier Prime *does* have real bold and italic. Those are available inside code
blocks and nowhere else.

### Spacing and metrics

Marini autospaced each cut with iKern for its intended size, so **letter-spacing
stays at zero** for running text. Wanting to adjust tracking usually means the
wrong cut is in use at the wrong size. The exception is small caps, which take
positive tracking as they always have in print.

Line-height is set explicitly everywhere. The fonts' own vertical metrics yield
roughly 1.25, which is book-tight and too dense for screens. Body sits near
1.55; display type compresses toward 1.15.

Display type carries substantial invisible space from its own ascent and descent
metrics — at 52px, French Canon has roughly 11px above the capitals and 13px
below the baseline before any margin applies. **Tune vertical spacing against
the rendered result, never against the numbers in the stylesheet.**

### Responsive type

On narrow screens, **swap down the scale rather than shrinking cuts.** h1 moves
from French Canon to Double Pica; h2 to Great Primer; h3 to English SC. Body
stays at English 18px. Every level continues to render at a size its punches
were cut for. This is what a printer would do for a smaller format.

### Figures (numerals) — a hard constraint

IM Fell's digits are **oldstyle and proportional**. Heights vary across roughly
0.2 em, several digits descend below the baseline, and widths range from 0.36 to
0.49 em. The fonts expose no `tnum` or `lnum` features, so there is **no CSS
route to tabular figures**. Numeric columns set in IM Fell will not align, and
this cannot be fixed.

Courier Prime is genuinely tabular (all digits identical width, lining, no
descenders). **Numeric columns in tables use Courier Prime.** Mixed faces in
tabular matter is standard technical-book practice.

Oldstyle figures in running prose are correct and desirable. Leave them.

---

## Color and material

The palette is a warm off-white paper and a warm near-black ink. Both are warm;
**never pair warm paper with neutral black or grey** — the mismatch is
immediately visible and is the commonest failure in paper-styled designs.

All rules, leaders, markers, and secondary text derive from the ink color by
transparency, never from an independent grey. Apparatus should read as lighter
ink, not as UI chrome.

A paper texture is multiplied over the background. Because multiply darkens,
color values were chosen for their *post-texture* appearance. If the texture
opacity changes, the base color must be re-derived.

### The accent color

The site is otherwise monochrome. **One accent color exists, and it is reserved
for the consulting call-to-action.** This follows the logic of rubrication:
in early printing, a second ink marked the structurally important thing, and
that is exactly its job here.

Rules for the accent:

- Used at most once per page
- Never on ordinary links, never on headings, never decoratively
- Muted toward oxide rather than saturated

Ordinary inline links carry no color. They are distinguished by a refined
underline, or by superscript markers with the reference set in the margin.

### No fills

Nothing on the site has a background fill — not code blocks, not tables, not
figures, not cards. Containment comes from rules and space. A filled box is the
single strongest "website" signal available, and it also occludes the paper
texture, breaking the illusion that everything is printed on the same stock.

Corners are square. There are no shadows, no gradients, no elevation.

---

## Layout and spacing

### The spread

Desktop is a two-column spread: navigation left, article right. **The navigation
is apparatus and must read as subordinate to the text.** It is set smaller (DW
Pica against English body), and is meaningfully narrower than the article
column. Near-parity in width makes the two read as equals, which is wrong.

The gutter between them is the gutter of a book spread. It should be generous.

### Asymmetric spacing

Space belongs to the *break*, and it goes **above** an element, not below.
Headings have generous space above and none below, which binds them to the text
they introduce rather than leaving them floating between two blocks. Lists sit
tight under the sentence that introduces them (a colon is a binding signal) and
have larger space after.

This asymmetry does as much hierarchical work as size does, which matters given
the absence of weight.

### Vertical rhythm

Spacing is expressed in multiples of the body line. This is a soft grid — code
blocks and figures break it, and that is acceptable. Do not add per-block
padding math to force variable-height elements back onto the grid; the fragility
costs more than the alignment gains.

### One indent position

Paragraphs are indented with no space between them, the book convention. The
first paragraph after any heading is flush left — the indent signals "new
paragraph," and after a heading that is redundant.

**The page should have one indent position, not several.** List markers, list
text, and paragraph first lines should resolve to the same left edge or a
deliberate relationship to it. Three unrelated left edges is the most common
regression in this layout.

Nothing hangs into the left margin of the text block. Outdented markers sit
within the list's own indent, never past the body's left edge.

### Justification

Body text is justified with hyphenation on wide screens and ragged on narrow
ones, because justification quality collapses at short measures. Browsers break
lines greedily rather than optimizing whole paragraphs, so the result is decent
but not book-quality; this is accepted.

Lists are justified to match body text. Code is never justified.

---

## Component conventions

### Code blocks

Contained by hairline rules above and below, no fill. Set in Courier Prime,
which x-height-matches English at the same nominal size. Tighter line-height
than prose.

**No syntactic color highlighting.** Conventional highlighting colors keywords
and strings regardless of relevance; mid-century technical books instead set the
block plainly and marked *the part under discussion*. Three registers only:

- Comments — italic, reduced ink
- Keywords — bold (Courier Prime has a real one)
- The line or expression being discussed — bold, optionally with a marginal mark

If a hue is ever introduced, it applies to one token category only and must not
match the CTA accent.

Code may break out wider than the prose measure. If it does, figures must too —
the site should not have two different maximum widths.

### Figures

Images are desaturated and composited with multiply blending, so the paper
texture shows through them and whites become paper. This is the same operation a
press performs. Framed with the same rules as code blocks.

Captions sit below, in DW Pica, with a small-caps figure number and em-dash
separator. Figures are numbered by CSS counter and referenced by number in prose.

`alt` and caption text are different things and must both be written. Alt is
replacement text for someone who cannot see the image; the caption is
supplementary text everyone reads. Duplicating them makes screen readers
announce the same sentence twice.

YouTube uses a facade pattern: a treated static thumbnail with a typographic
play affordance, with the iframe loaded only on click. At rest it is
indistinguishable from a figure. This also avoids loading several hundred KB of
third-party JavaScript and setting cookies before the visitor has consented.

### Tables

The booktabs model: three horizontal rules (heavier top and bottom, lighter
under the header), **no vertical rules**, and nothing between body rows. Columns
are defined by alignment and space.

No zebra striping — it is pure UI convention and occludes the texture. Separate
logical groups with added space instead.

Headers in small caps, not bold. Captions go *above* tables (unlike figures,
where they go below). Tables and figures use separate counters.

On narrow screens tables scroll horizontally. Stacked-card table layouts are not
used.

### Lists

Markers are em dashes or middots, never bullets. Hanging indent, with the marker
positioned back into the list's padding. Nested ordered lists change sequence
type (arabic → lettered → roman), the technical-book convention.

Markers are apparatus and are set in reduced ink.

Runs of consecutive one-line paragraphs are usually a list that has not been
marked up as one. Prefer fixing the markup over adjusting the indent.

### Navigation

A table of contents with dot leaders and right-aligned dates. Leaders are
rendered as controlled dot patterns and align vertically across entries. The
current entry is marked with italic, never with weight.

Sections carry small-caps labels with rules, in at least two registers: general
navigation and services. Services must be its own labeled block so the CTA is
not one undifferentiated link among four.

Site identity (name/masthead) appears at the top of the navigation column,
treated as title-page matter.

On mobile: identity as a masthead at the top, full contents as back matter at
the bottom, and a persistent running foot for contact. **No hamburger menu.**
If a persistent navigation affordance is needed, it is the word "Contents" —
books label things with words, not glyphs.

---

## Page types

Different kinds of matter in a book look different while sharing one system.
Constant across all pages: the cuts, the paper, the ink, the rule color, the
measure, the navigation treatment. Varying: alignment, density, which cuts are
used, and whether ornament appears.

**Home is a title page.** Mostly empty. Centered title block, large margins,
the largest type on the site, almost no content. The confidence of a nearly
empty page is the effect — resist filling it with post previews and bios. The
navigation column already supplies the contents.

**About is a preface.** First-person and discursive. Signed and dated at the
end, flush right, in italic. Prefaces explain why the work exists rather than
listing credentials, and the page should read that way.

**Consulting is a prospectus.** This is the densest and most *structured* page,
not the most artful. Print has excellent conventions for organized commercial
information: specifications, price lists, terms in tabular form. Services as a
hanging-indent list, engagement models as a table, rates stated plainly. Link
directly to two or three technical posts — this page may be someone's only entry
point, and it carries the credibility load alone.

**Articles are chapters.** The default reading treatment.

**The colophon is load-bearing.** A page describing the types, the size-specific
cuts, the metric decisions, and why they were made. It converts the design from
a matter of taste into demonstrated systematic thinking, which is precisely the
evidence a prospective client is looking for.

---

## Anti-patterns

Do not introduce:

- Hamburger menus, or icon-only navigation
- Horizontal top navigation bars
- Rounded corners, drop shadows, elevation, gradients
- Background fills on any element
- Zebra striping
- Syntax highlighting color themes
- Synthesized bold or italic
- Bullet-point markers
- Stacked-card mobile table layouts
- Ornament that repeats on every page (fleurons are for rare section breaks;
  repeated, they become wallpaper)
- A new visual conceit per page

That last one is the most important failure mode. If a page needs a new idea
rather than a redeployment of the existing system, the design has drifted into
costume. Book designers work under exactly this constraint, and it is why books
feel coherent.

**One specific drift risk:** warm cream backgrounds with high-contrast serifs
and hairline rules are also, independently, a generic template look. This site
arrived at its palette from measured font metrics and the material behavior of
ink on paper, and every value has a reason behind it. If future changes cannot
articulate the reason, they are drifting toward the generic version of this
aesthetic rather than deeper into the real one.

---

## Technical gotchas

Documented because they have already cost time:

- `font-display` is an `@font-face` **descriptor**, not a CSS property. It has
  no effect in a normal selector.
- Font preloads require `crossorigin` even when same-origin, or the resource
  downloads twice.
- `hyphens: auto` silently does nothing without a `lang` attribute on the
  document.
- `text-indent` inherits. Set on a container, it will propagate into list items
  and fight hanging indents.
- `::marker` accepts only a narrow set of properties — no margin, no
  positioning. Pseudo-element markers are used instead.
- `mix-blend-mode` blends against the stacking context's backdrop. A figure
  inside an element with its own background or reduced opacity will render as a
  grey box.
- `figure` carries a browser default horizontal margin that must be reset.
- Font loading behavior is invisible in local development. Throttle the network
  to observe it.
- CSS counters cannot be read back out, so cross-references ("as in Fig. 3")
  cannot be generated in CSS. They require the template layer.

---

## Decision heuristics

When adding something the guide does not cover:

1. **What is the book analogue?** Most web components have one — a card is a
   plate, a sidebar is marginalia, a footer is back matter, a tooltip is a gloss.
   Design toward the analogue rather than the web pattern.

2. **Is this content or apparatus?** Apparatus (navigation, captions, markers,
   folios, labels) is always subordinate: smaller, lighter, quieter. Content is
   never made to compete with it.

3. **Prefer the constraint to the workaround.** If something seems to require
   bold, or a second color, or a fill, the period-correct solution almost
   certainly exists and is better.

4. **Does it survive repetition?** Effects that delight once become noise at
   twenty occurrences. Spend ornament where it is rare.

5. **Would a printer have done this?** Not as a purity test, but as a useful
   filter. Printers optimized for legibility under real constraints, and their
   solutions generally hold up.

6. **Does it stay findable?** No aesthetic decision may make the writing, the
   services, or the contact route harder to reach. This overrides everything
   above.

### Accessibility floor

Non-negotiable regardless of aesthetics:

- Contrast is maintained comfortably above WCAG AA (the current palette has
  large headroom; do not spend it all)
- `alt` text is written for every image, distinct from its caption
- Keyboard focus is visible
- Semantic elements are used for their meaning (`figure`, `figcaption`, `abbr`,
  `dl`, real heading levels), not chosen for their default styling
- Reduced-motion preferences respected
- Link purpose is discernible without relying on color alone