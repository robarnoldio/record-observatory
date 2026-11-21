## Development

Open work lives in `BACKLOG.md`: check it first and tick items off in the same commit as the work.

```
astro dev --background     # start the dev server (manage with `astro dev stop|status|logs`)
node --test src/lib/albums.test.js
npm run build
```

There is no `npm test` script. Tests and the build must pass before every commit.
The Astro dev toolbar is disabled in `astro.config.mjs`: its buttons add Tab stops ahead of the page,
which gets in the way of testing keyboard navigation.
Docs: https://docs.astro.build ([routing](https://docs.astro.build/en/guides/routing/),
[components](https://docs.astro.build/en/basics/astro-components/),
[styling](https://docs.astro.build/en/guides/styling/)). `README.md` is the design record
for the pages (URLs, grouping, flags, picker, truncation, keyboard); read it before changing them.

`CLAUDE.md` is a symlink to this file. Edit `AGENTS.md` and never write to `CLAUDE.md`: a write
through the symlink replaces this file.

## Data

- `data/collection/Robarnold-collection-*.csv`: the newest file (by filename) is used automatically.
- `data/artist-groups.json`: editorial artist groupings and short names (a group of one shortens a
  long credit). Unknown credits or duplicate assignments fail the build on purpose, as do
  unresolved URL collisions.
- `data/special-flags.json`: hand-written album-page flags keyed by Discogs `release_id`, for things
  the CSV can't say. An unknown `release_id` fails the build.
- `reference/*.json`: curated artist catalogs that drive the artists pages and completeness bars.

The CSV is not clean. `release_id` is not unique (about 20 repeats), so match records to album
copies by object identity (`hrefs` from `loadAlbumPages()`), never by `release_id`.
`loadLpCollection()` is cached so every consumer shares the same record objects; don't mutate them.

## Code layout

- Shared rules live in `src/lib/`, not in components: `albums.js` (grouping, URLs, copy links),
  `collection.js` (`isUpgradeCandidate`), `formats.js` (`copyFlags`, `isMono`), `catalog.js`
  (artist completeness, bars and the artist-index orderings), `text.js` (`shorten`, `shortenUnique`,
  `headingLine`), `frame.js` (frame helpers).
- `src/layouts/Shell.astro` is the page shell for every page with the main nav (head, viewport,
  body margin, navigation); `albumtextlayout.astro` wraps it for the album pages.
- Homepage widgets mostly take `collection` as a prop; the album components call `loadAlbumPages()`
  directly. Follow the neighbouring component.

## Look and feel

Monospace text with box-drawing frames, `[SELECTED]` brackets, and a 78-column frame
(`FRAME_WIDTH` in `src/lib/frame.js`; 74 usable columns for names). Phones shrink the root font so 78
columns fit (`src/styles/base.css`). Sparse `·` dots are decoration only: mark them `aria-hidden`.
Links are the browser's link blue with no underline and no visited color. Focus is an inverse-video
cursor. Vertical spacing on album pages is deliberately tight. Names are shortened at the first comma,
slash or paren; the width is a preference, so a title may run past it when shortening would make
sibling albums indistinguishable.

## Keyboard and links

Some browsers (Safari, Vivaldi) skip plain links on Tab, so links that should be reachable carry an
explicit `tabindex="0"`. Album pages take the main nav out of the tab order (`tabindex="-1"`); Tab runs
Discogs, prev, return to index, next. Pickers are one tab stop (roving tabindex) with arrow keys.

## Commits

Small and focused: one logical change per commit, with the build and tests passing so each
commit is deployable (`main` feeds `.github/workflows/daily-deploy.yml`). Keep unrelated edits
out. Don't push unless asked. Don't rewrite pushed history.
