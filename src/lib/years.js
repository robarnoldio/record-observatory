// Grouping the album index by year for the year picker. An album's year is the oldest year among
// its owned copies (see buildAlbumPages), so "1965" means "my oldest copy is from 1965".

export const decadeOf = year => Math.floor(year / 10) * 10;

// Albums grouped by year, ascending, with undated albums last. Order within a year is preserved
// (the album list is already sorted by artist).
export function groupByYear(albums) {
  const groups = new Map();
  for (const album of albums) {
    const key = album.year == null ? 'unknown' : String(album.year);
    if (!groups.has(key)) groups.set(key, { key, year: album.year ?? null, decade: album.year == null ? null : decadeOf(album.year), albums: [] });
    groups.get(key).albums.push(album);
  }
  return [...groups.values()].sort((a, b) => (a.year ?? Infinity) - (b.year ?? Infinity));
}

// What the year picker needs: how many albums each year has, and how many have no year.
export function yearCounts(groups) {
  return {
    counts: Object.fromEntries(groups.filter(group => group.year !== null).map(group => [group.year, group.albums.length])),
    unknown: groups.find(group => group.year === null)?.albums.length ?? 0,
  };
}
