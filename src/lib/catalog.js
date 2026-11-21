// Matching a curated artist reference (reference/*.json) against owned LP records.

export function normalizeTitle(title) {
  return (title || '').toLowerCase().trim();
}

export function matchesReference(record, reference) {
  if (normalizeTitle(record.Title) !== normalizeTitle(reference.title)) return false;
  if (record['Collection dedupe']) return Number(record.Released) === Number(reference.year);
  return true;
}

export function buildCatalog(reference, records) {
  return reference.map(entry => {
    const copies = records.filter(record => matchesReference(record, entry));
    return { ...entry, owned: copies.length > 0, copies };
  });
}

// Completeness of the "Albums" section: how many reference albums are owned.
export function albumCompletion(catalog) {
  const albums = catalog.filter(entry => entry.section?.toLowerCase() === 'albums');
  const owned = albums.filter(entry => entry.copies?.length > 0).length;
  const total = albums.length;
  return { owned, total, percent: total ? Math.round((owned / total) * 100) : 0 };
}

// A progress bar of `width` cells. The completed part is drawn as inverse video with the percent
// written in it (right-aligned), followed by sparse dots. The dots form a fixed lattice that
// flips on alternate `row`s, so the last cell is '.' on even rows and '·' on odd rows.
// Owning anything shows at least one cell and only a complete section fills the bar. A number
// wider than its cells (e.g. 12 in one cell) widens the inverse part to fit.
export function completionBar({ owned, total, percent }, width = 20, row = 0) {
  const number = String(percent);
  let filled = Math.round((percent / 100) * width);
  if (owned > 0) filled = Math.max(filled, 1);
  if (owned < total) filled = Math.min(filled, width - 1);
  filled = Math.min(width, Math.max(filled, number.length));
  const dots = Array.from({ length: width - filled }, (_, i) => ((filled + i + row) % 2 === 0 ? '·' : '.')).join('');
  return { inverse: number.padStart(filled), dots };
}
