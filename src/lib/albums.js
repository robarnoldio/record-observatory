import { createHash } from 'node:crypto';
import groups from '../../data/artist-groups.json' with { type: 'json' };
import { loadLpCollection } from './collection.js';

function fingerprint(value) {
  return createHash('sha256').update(value).digest('hex').slice(0, 10);
}

function slug(value, limit = Infinity) {
  const normalized = value.normalize('NFKD').toLowerCase()
    .replace(/\p{M}/gu, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return (normalized || `untitled-${fingerprint(value)}`).slice(0, limit).replace(/-+$/g, '');
}

export function displayArtist(artist) {
  return artist.replace(/\s*\(\d+\)/g, '').replace(/\s+/g, ' ').trim();
}

function artistSortKey(artist) {
  return artist.replace(/^the\s+/i, '');
}

export function buildAlbumPages(records, groups = {}) {
  const assignments = new Map();
  const credits = new Set(records.map(record => record.Artist));
  if (!groups || typeof groups !== 'object' || Array.isArray(groups)) {
    throw new Error('Artist groups must be an object mapping display names to CSV artist arrays');
  }
  for (const [name, members] of Object.entries(groups)) {
    if (!name.trim() || !Array.isArray(members) || !members.length) {
      throw new Error(`Invalid artist group: ${name}`);
    }
    for (const credit of members) {
      if (!credits.has(credit)) throw new Error(`Unknown CSV artist in group ${name}: ${credit}`);
      if (assignments.has(credit)) throw new Error(`Artist assigned more than once: ${credit}`);
      assignments.set(credit, name);
    }
  }

  const albums = new Map();
  for (const record of records) {
    if (!record.Artist?.trim() || !record.Title?.trim()) {
      throw new Error(`Missing artist or title for Discogs release ${record.release_id}`);
    }
    const artistKey = assignments.get(record.Artist) ?? record.Artist;
    const artist = displayArtist(artistKey);
    const identity = JSON.stringify([artistKey, record.Title]);
    if (!albums.has(identity)) {
      albums.set(identity, {
        identity, artistKey, artist, title: record.Title,
        artistSlug: slug(assignments.has(record.Artist) ? artist : artistSortKey(artist)),
        albumSlug: slug(record.Title, 40), copies: [],
      });
    }
    albums.get(identity).copies.push(record);
  }

  for (const album of albums.values()) {
    const years = album.copies.map(copy => copy.Released?.trim())
      .filter(year => /^\d{4}$/.test(year ?? '') && Number(year) > 0)
      .map(Number);
    album.year = years.length ? Math.min(...years) : null;
  }

  const artistsBySlug = new Map();
  for (const album of albums.values()) {
    const names = artistsBySlug.get(album.artistSlug) ?? new Set();
    names.add(album.artistKey);
    artistsBySlug.set(album.artistSlug, names);
  }
  for (const album of albums.values()) {
    if (artistsBySlug.get(album.artistSlug).size > 1) {
      album.artistSlug += `-${fingerprint(album.artistKey)}`;
    }
  }

  const routes = new Map();
  for (const album of albums.values()) {
    const route = `${album.artistSlug}/${album.albumSlug}`;
    routes.set(route, (routes.get(route) ?? 0) + 1);
  }
  const finalRoutes = new Set();
  for (const album of albums.values()) {
    if (routes.get(`${album.artistSlug}/${album.albumSlug}`) > 1) {
      album.albumSlug = `${album.albumSlug.slice(0, 29).replace(/-+$/g, '')}-${fingerprint(album.identity)}`;
    }
    album.href = `/albums/${album.artistSlug}/${album.albumSlug}/`;
    // Also guard against a generated suffix matching another title's natural slug.
    if (finalRoutes.has(album.href)) throw new Error(`Unresolved album URL collision: ${album.href}`);
    finalRoutes.add(album.href);
  }
  return [...albums.values()].sort((a, b) =>
    artistSortKey(a.artist).localeCompare(artistSortKey(b.artist)) ||
    a.artistKey.localeCompare(b.artistKey) ||
    (a.year ?? Infinity) - (b.year ?? Infinity) || a.title.localeCompare(b.title));
}

export function latestAcquisitions(albums, limit = 20) {
  return albums.flatMap(album => album.copies.map((copy, copyIndex) => {
    const dateAdded = copy['Date Added']?.trim() ?? '';
    const timestamp = Date.parse(dateAdded.replace(' ', 'T'));
    return { album, copy, copyIndex, dateAdded, timestamp };
  }))
    .filter(entry => Number.isFinite(entry.timestamp))
    .sort((a, b) => b.timestamp - a.timestamp ||
      a.album.identity.localeCompare(b.album.identity) ||
      (a.copy.release_id ?? '').localeCompare(b.copy.release_id ?? ''))
    .slice(0, limit);
}

let collection;
export function loadAlbumPages() {
  if (!collection) {
    const { lpCollection, exportDateString } = loadLpCollection();
    const albums = buildAlbumPages(lpCollection, groups);
    collection = {
      albums, exportDateString,
      artistCount: new Set(albums.map(album => album.artistKey)).size,
      copyCount: lpCollection.length,
    };
  }
  return collection;
}
