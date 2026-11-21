// Fitting long names into the 78-column frame (74 usable columns with a 2-column indent each side).
export const SLOT = 74;

const MARKER = /[,/(]/g;
const MIN_BEFORE_MARKER = 8; // a marker this early would leave too little to read

// Shorten `text` to at most `max` characters. A long name is cut at its first comma, slash or
// paren (that fits and leaves something readable) and gets a trailing "…"; with no such marker
// it is cut hard at `max`. Text that already fits is returned unchanged.
export function shorten(text, max) {
  if (text.length <= max) return text;
  for (const { index } of text.matchAll(MARKER)) {
    const head = text.slice(0, index).trimEnd();
    if (head.length >= MIN_BEFORE_MARKER && head.length + 1 <= max) return `${head}…`;
  }
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

// Like shorten(), but the width is a preference, not a hard rule. If cutting `title` would make it
// read the same as one of `siblings`, cut instead at the first comma, slash or paren that leaves
// text no sibling starts with, even past `max`; if no cut tells them apart (Volume I and
// Volume II of a set, whose last characters are the only difference) keep the whole title.
export function shortenUnique(title, siblings, max) {
  const short = shorten(title, max);
  if (short === title) return title;
  const others = siblings.filter(other => other !== title);
  if (!others.some(other => shorten(other, max) === short)) return short;
  for (const { index } of title.matchAll(MARKER)) {
    const head = title.slice(0, index).trimEnd();
    if (head.length >= MIN_BEFORE_MARKER && !others.some(other => other.startsWith(head))) return `${head}…`;
  }
  return title;
}

// "artist :: title" within `max` columns: the title gives way first; an artist that would leave
// the title under 12 columns is shortened too. `siblingTitles` (same artist) keep headings from
// becoming identical; see shortenUnique. Returns the line to show, the full line, and whether
// it differs from the full line.
export function headingLine(artist, title, siblingTitles = [], max = SLOT) {
  const full = `${artist} :: ${title}`;
  if (full.length <= max) return { text: full, full, shortened: false, artistText: artist, titleText: title };
  const artistText = shorten(artist, max - 4 - 12);
  const titleText = shortenUnique(title, siblingTitles, max - artistText.length - 4);
  const text = `${artistText} :: ${titleText}`;
  return { text, full, shortened: text !== full, artistText, titleText };
}

// The gap between a left-justified and a right-justified piece on one line: a dot leader with a
// space at each end (" .·.·.· "), sized so the two pieces plus the gap fill `width`. The gap is at
// least 4 columns, so a line that is already too full simply runs a little past `width`.
export function leaderGap(used, width = SLOT) {
  const size = Math.max(4, width - used);
  return ` ${'.·'.repeat(Math.ceil((size - 2) / 2)).slice(0, size - 2)} `;
}
