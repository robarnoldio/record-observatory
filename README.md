# Record Observatory

## CSV-driven LP album pages

Visit `/albums/` (also linked from the homepage) to browse every owned LP album.
Pages at `/albums/[artist]/[album]/` use the latest collection CSV selected by
`loadLpCollection()`, with its existing LP-only format filter. Each exact full
title within an artist/group gets one page; all matching owned rows appear as
separate copy sections. No reference JSON, artwork, API, or database is required.
The existing curated artist catalogs are unchanged.

`data/artist-groups.json` optionally maps a display name to exact CSV Artist values:

```json
{
  "Short display name": ["Exact CSV artist credit", "Another exact credit"]
}
```

Leave it `{}` to use original artist credits. A group of one can shorten a long
credit (the 46 credits over 70 characters each have one, named so related records sort together); a group of many combines related credits. Each copy shows its own artist
credit, with numeric Discogs disambiguators suppressed. Unknown credits or duplicate assignments fail the build. Grouping
does not create a curated artist page. Identical full titles within a group merge;
case and punctuation differences remain separate albums.

The initial grouping pass combines recurring classical composer credits across
performers, solo artists with their named ensembles, and a few clearly equivalent
collaboration credits. Mixed-composer records and most co-equal collaborations
remain separate. These are explicit editorial assignments, not automatic matching;
review or refine the exact member arrays in `data/artist-groups.json` as needed.
The dev preview tracks this JSON as a module dependency, so saving grouping edits
refreshes the album index and related pages without restarting the server.

URLs normalize accents and punctuation to lowercase ASCII hyphenated slugs. Title
slugs are capped at 40 characters after normalization. Empty normalized names use
a deterministic hash fallback. Collisions get deterministic hash suffixes (within
the title's 40-character cap), never silent merges. Changing names/grouping can
change URLs; there is no redirect registry. Artist sorting ignores a leading
"The"; automatic artist slugs omit it too. An explicit grouping name controls its
slug, so mapping `"The Beatles": ["The Beatles"]` retains `the-beatles`. Numeric
Discogs artist suffixes such as `(2)` are hidden in displayed credits and slugs,
but original CSV identities are retained internally to prevent accidental merges.

The LP index and detail pages use compact monospace text (1.15 line-height), connected navigation boxes,
and a five-row library statistics header: a sparse `·` dot lattice with three
indented text lines (artists, albums and LP copies, export date). The dots are
decoration and hidden from assistive tech. Brackets identify the selected LP ALBUMS navigation
section. Artist groups place their upper rule before the album list and their
count-bearing lower rule after it. Each album line starts with its oldest valid
owned release year, and albums sort chronologically within each artist (unknown
years last, titles breaking ties). This year is derived from owned copies, not
assumed to be the album's original release date. Copies remain together and keep
their individual years on the detail page. Only multiple-copy albums show a count
after the title. Album details use dashboard-sized monospace text, with a plain
single-line `artist :: title` heading instead of an H1. Long headings scroll
horizontally rather than wrapping.

The album index has a QWERTY-shaped letter picker under the heading. The selected
letter is bracketed and none is selected by default; clicking it again clears the
filter. Selecting a letter hides every artist group whose display name (ignoring a
leading "The" and accents) starts with another letter. The `*` key after M selects names that don't start with A-Z (like "Weird Al" Yankovic). Vertical
spacing on the album pages is deliberately tight; keep new blocks compact.

Links are the browser's link blue with no underline and no visited color (`src/styles/base.css`).

A two-tier year picker sits to the right of the letter picker (the decade row `? 50s … 20s`,
and, once a decade is chosen, a second row of its two-digit years). Choosing a decade or year
regroups the index by year (oldest owned copy's year, undated albums under `?`), filtered to it,
with rows shown as `artist :: title` in artist order; choosing again clears. The two pickers are
mutually exclusive: using one clears the other. The year list is rendered at build time (hidden
until used) from `groupByYear()` in `src/lib/years.js`.

Keyboard: Tab and Shift-Tab step through nav, the letter picker and every album link in order.
The focused element is an inverse-video cursor (`:focus-visible`, global), album links carry an
explicit `tabindex="0"` so Safari includes them, and the picker is one tab stop (roving
tabindex): the arrow keys, Home and End move between keys and Space or Enter selects.

Names are fitted to the 78-column frame (74 usable columns, indented 2 on each side).
`shorten()` in `src/lib/text.js` cuts a too-long title or artist at its first comma,
slash or paren (leaving at least 8 characters) and adds `…`; with no such marker it
cuts hard at the limit. The album-page heading is `artist :: title` in 74 columns,
shortening the title first and the artist only if the title would get under 12
columns. Album-index rows allow 66 columns for the title (after the year column) and
divider names allow 70. The width is a preference, not a hard rule: if shortening would
make two of an artist's albums read the same, `shortenUnique()` cuts at the first
marker that tells them apart even past the limit, and keeps the whole title when
only the ending does (Volume I vs Volume II). The full text stays available: the copy's `Title` row, a
link's accessible name, and hidden text next to a shortened heading.

Each copy always shows media condition, sleeve condition, and
location (`CollectionFolder`), using `unknown` for missing values. Formats expand
common Discogs abbreviations, multiple-LP counts, and comma/plus-separated tokens;
unrecognized details remain verbatim rather than guessing their meaning.
A `Source` row (`Collection Source`) appears only when populated, and Mono copies
add a `++ in glorious mono ++` line below the listing.

Each copy's divider gains a framed flag line when any of these apply, in priority
order (lowest priorities are dropped if the line would overflow): hand-written
flags from `data/special-flags.json`, `UPGRADE CANDIDATE` (media condition VG or
worse, the same rule as the homepage widget), `BOX SET` (a `Box` token or 3+
discs), vinyl color, `AUDIOPHILE PRESSING` (180 g, Quad, DMM), and
`LIMITED EDITION` (Ltd, Num, RSD). `data/special-flags.json` maps a Discogs
`release_id` to custom flags for details the CSV lacks, such as an 85 LP set
whose Format is only `LP, Comp`; an unknown `release_id` fails the build.

`Collection dedupe` is not interpreted
by these pages yet: its existing reference-matching behavior is unchanged, and a
future album-identity marker convention remains to be defined.

The homepage, artist index, and album pages share `navigation.astro`; only the
active navigation section is bracketed and marked with `aria-current`.

The homepage ends with `latestacquisitions.astro`: the 20 most recently acquired
LP copies by CSV `Date Added`, with LAST 20 / LAST 5 controls. Each acquisition
counts separately, including additional copies of an existing album. Undated or
invalid-date entries are excluded. Each entry links to that copy's section on its
album page. Entries display titles only within a 78-character-wide widget; long
titles wrap. Controls are scoped to this component, independent of other dashboard
filters. Deferred UI work is tracked in [BACKLOG.md](BACKLOG.md).

Record of the day and Upgrade candidates link each record to its owned copy's
section on its album page. Records are matched to copies by object identity
(`copyHrefs()`), because Discogs `release_id` values repeat in the CSV. The
aggregate widgets (labels, months, years, source/condition, top artists) have no
single album to link to.

Validate with `node --test src/lib/albums.test.js` and `npm run build`.


