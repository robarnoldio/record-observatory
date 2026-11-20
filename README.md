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
credit; a group of many combines related credits. Each copy shows its own artist
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
and library statistics. Brackets identify the selected LP ALBUMS navigation
section. Artist groups place their upper rule before the album list and their
count-bearing lower rule after it. Each album line starts with its oldest valid
owned release year, and albums sort chronologically within each artist (unknown
years last, titles breaking ties). This year is derived from owned copies, not
assumed to be the album's original release date. Copies remain together and keep
their individual years on the detail page. Only multiple-copy albums show a count
after the title. Album details use dashboard-sized monospace text, with a plain
single-line `artist :: title` heading instead of an H1. Long headings scroll
horizontally rather than wrapping.

Each copy always shows media condition, sleeve condition, and
location (`CollectionFolder`), using `unknown` for missing values. Formats expand
common Discogs abbreviations, multiple-LP counts, and comma/plus-separated tokens;
unrecognized details remain verbatim rather than guessing their meaning.

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

Validate with `node --test src/lib/albums.test.js` and `npm run build`.

## Astro starter reference

```sh
npm create astro@latest -- --template minimal
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
