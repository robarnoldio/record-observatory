import assert from 'node:assert/strict';
import test from 'node:test';
import { artistInitial, buildAlbumPages, displayArtist, latestAcquisitions, loadAlbumPages } from './albums.js';
import { copyFlags, fitFlags, formatIndicators, isMono, validateSpecialFlags, valueOrUnknown } from './formats.js';
import { loadLpCollection } from './collection.js';
import { statsFieldRows } from './frame.js';
import { albumCompletion, buildCatalog, completionBar } from './catalog.js';

const copy = (Artist, Title, extra = {}) => ({ Artist, Title, release_id: '123', ...extra });

test('groups copies and exact artist aliases without reference JSON', () => {
  const records = [copy('A', 'Album'), copy('Alias', 'Album', { Released: '2020' }), copy('B', 'Album')];
  const albums = buildAlbumPages(records, { Group: ['A', 'Alias'] });
  assert.equal(albums.length, 2);
  const grouped = albums.find(album => album.artist === 'Group');
  assert.deepEqual(grouped.copies, records.slice(0, 2));
  assert.equal(grouped.href, '/albums/group/album/');
  assert.equal(buildAlbumPages([records[0]], { Short: ['A'] })[0].artistSlug, 'short');
});

test('normalizes before truncating and safely handles Unicode-only titles', () => {
  const albums = buildAlbumPages([
    copy('Björk', 'É'.repeat(45)), copy('Björk', '東京'), copy('Björk', '大阪'),
    copy('Björk', 'A / B? #100%'),
  ]);
  assert.equal(albums.find(album => album.title.startsWith('É')).albumSlug, 'e'.repeat(40));
  assert.equal(new Set(albums.map(album => album.href)).size, 4);
  for (const album of albums) assert.match(album.href, /^\/albums\/bjork\/[a-z0-9-]+\/$/);
});

test('suffixes normalization, truncation and artist collisions independently of row order', () => {
  const records = [
    copy('A', 'Quiet Village (Sounds)'), copy('A', 'Quiet Village - Sounds'),
    copy('A', `${'long-title-'.repeat(5)}one`), copy('A', `${'long-title-'.repeat(5)}two`),
    copy('Á', 'Other'),
  ];
  const albums = buildAlbumPages(records);
  const reversed = buildAlbumPages([...records].reverse());
  assert.deepEqual(albums.map(album => album.href), reversed.map(album => album.href));
  assert.equal(new Set(albums.map(album => album.href)).size, records.length);
  assert.ok(albums.every(album => album.albumSlug.length <= 40));
  assert.equal(albums[0].copies.length, 1);
});

test('rejects unknown and conflicting artist group assignments and missing identity', () => {
  const records = [copy('A', 'Album')];
  assert.throws(() => buildAlbumPages(records, { Group: ['Missing'] }), /Unknown CSV artist/);
  assert.throws(() => buildAlbumPages(records, { One: ['A'], Two: ['A'] }), /assigned more than once/);
  assert.throws(() => buildAlbumPages(records, { Group: [] }), /Invalid artist group/);
  assert.throws(() => buildAlbumPages([copy('A', ' ')]), /Missing artist or title/);
});

test('sorts without leading The and lets explicit grouping retain it in URLs', () => {
  const records = [copy('The Beatles', 'Revolver'), copy('Abba', 'Arrival'), copy('Cream', 'Fresh Cream')];
  const albums = buildAlbumPages(records);
  assert.deepEqual(albums.map(album => album.artist), ['Abba', 'The Beatles', 'Cream']);
  assert.equal(albums[1].href, '/albums/beatles/revolver/');
  assert.equal(buildAlbumPages(records, { 'The Beatles': ['The Beatles'] })[1].artistSlug, 'the-beatles');
});

test('hides numeric artist disambiguators without merging distinct identities', () => {
  const records = [copy('The Band (2)', 'Album'), copy('The Band (3)', 'Album')];
  const albums = buildAlbumPages(records);
  assert.deepEqual(albums.map(album => album.artist), ['The Band', 'The Band']);
  assert.equal(new Set(albums.map(album => album.href)).size, 2);
  assert.ok(albums.every(album => !/-[23](?:-|$)/.test(album.artistSlug)));
  assert.equal(albums[0].copies[0].Artist, 'The Band (2)');
  assert.equal(displayArtist('Artist (12), Orchestra (3) (Live)'), 'Artist, Orchestra (Live)');
});

test('expands combined format tokens and retains unfamiliar descriptions', () => {
  assert.deepEqual(formatIndicators('2xLP, Album, RE + Box, 180, Gat, Ter'), [
    '2 LP records', 'Album', 'Reissue', 'Box set', '180 gram vinyl', 'Gatefold sleeve', 'Terre Haute pressing',
  ]);
  assert.deepEqual(formatIndicators('LP, Blu + RSD, Unfamiliar detail'), [
    'LP record', 'Blue vinyl', 'Record Store Day', 'Unfamiliar detail',
  ]);
  assert.deepEqual(formatIndicators(' , '), []);
  assert.equal(valueOrUnknown('  '), 'unknown');
  assert.equal(valueOrUnknown(undefined), 'unknown');
  assert.equal(valueOrUnknown(' Shelf 2 '), 'Shelf 2');
});

test('orders albums by oldest owned release year without splitting copies', () => {
  const records = [
    copy('Artist', 'Blue', { Released: '2020' }),
    copy('Artist', 'Later album', { Released: '1980' }),
    copy('Artist', 'Blue', { Released: '1975' }),
    copy('Artist', 'Unknown album', { Released: '0' }),
    copy('Artist', 'Invalid year', { Released: 'not a year' }),
    copy('Artist', 'Blue', { Released: '' }),
    copy('Artist', 'Same year', { Released: '1975' }),
  ];
  const albums = buildAlbumPages(records);
  assert.deepEqual(albums.map(album => [album.title, album.year]), [
    ['Blue', 1975], ['Same year', 1975], ['Later album', 1980],
    ['Invalid year', null], ['Unknown album', null],
  ]);
  assert.deepEqual(albums[0].copies.map(record => record.Released), ['2020', '1975', '']);
  assert.deepEqual(
    buildAlbumPages([...records].reverse()).map(album => [album.href, album.year]),
    albums.map(album => [album.href, album.year]),
  );
});

test('latest acquisitions ranks copies by date, caps results and skips undated rows', () => {
  const records = Array.from({ length: 25 }, (_, index) => copy('Artist', 'Album', {
    release_id: String(index),
    'Date Added': `2026-11-${String(index + 1).padStart(2, '0')} 12:00:00`,
  }));
  records.push(copy('Artist', 'Undated'), copy('Artist', 'Invalid', { 'Date Added': 'invalid' }));
  const albums = buildAlbumPages(records);
  const latest = latestAcquisitions(albums);
  assert.equal(latest.length, 20);
  assert.deepEqual(latest.map(entry => entry.copy.release_id), Array.from({ length: 20 }, (_, index) => String(24 - index)));
  assert.equal(latestAcquisitions(albums, 5).length, 5);
  assert.equal(new Set(latest.map(entry => entry.album.href)).size, 1);
  assert.equal(latest[0].copyIndex, 24);
  assert.equal(albums.find(album => album.title === 'Album').copies[0].release_id, '0');
  assert.deepEqual(latestAcquisitions([]), []);
});

test('latest export gives every LP row exactly one place and unique reachable URLs', () => {
  const { lpCollection } = loadLpCollection();
  const { albums } = loadAlbumPages();
  assert.equal(albums.reduce((count, album) => count + album.copies.length, 0), lpCollection.length);
  const actual = albums.flatMap(album => album.copies);
  assert.deepEqual(new Set(actual.map(row => JSON.stringify(row))), new Set(lpCollection.map(row => JSON.stringify(row))));
  assert.equal(new Set(albums.map(album => album.href)).size, albums.length);
  assert.ok(albums.some(album => album.copies.length > 1));
});

test('copyFlags lists notable traits in priority order', () => {
  assert.deepEqual(copyFlags({ Format: 'LP, Album' }), []);
  assert.deepEqual(
    copyFlags({ Format: 'LP, Red, 180, Ltd, Mono', 'Collection Media Condition': 'Good (G)' }),
    ['UPGRADE CANDIDATE', 'RED VINYL', 'AUDIOPHILE PRESSING', 'LIMITED EDITION']);
  assert.equal(copyFlags({ Format: 'LP, Mono' }).includes('MONO'), false);
  assert.ok(isMono('LP, Album, Mono') && !isMono('LP, Stereo') && !isMono(undefined));
  assert.deepEqual(copyFlags({ Format: 'LP, RSD, Num' }), ['LIMITED EDITION']);
  assert.deepEqual(copyFlags({ Format: '10xLP, Album' }), ['BOX SET']);
  assert.deepEqual(copyFlags({ Format: 'LP, Comp + Box' }), ['BOX SET']);
  assert.deepEqual(copyFlags({ Format: '2xLP, Album' }), []);
  assert.deepEqual(copyFlags({ release_id: '1', Format: 'LP, Comp + Box' }, { 1: ['85 LPS + BOOK'] }), ['85 LPS + BOOK', 'BOX SET']);
  assert.deepEqual(copyFlags({}), []);
});

test('special flags must name real releases and hold non-empty text', () => {
  const records = [{ release_id: '1' }];
  validateSpecialFlags(records, { 1: ['BIG'] });
  assert.throws(() => validateSpecialFlags(records, { 2: ['BIG'] }), /Unknown release_id/);
  assert.throws(() => validateSpecialFlags(records, { 1: [] }), /Invalid flags/);
  assert.throws(() => validateSpecialFlags(records, { 1: [' '] }), /Invalid flags/);
  assert.throws(() => validateSpecialFlags(records, { 1: 'BIG' }), /Invalid flags/);
  validateSpecialFlags(loadLpCollection().lpCollection); // the real file matches the real export
});

test('fitFlags drops the lowest priority flags that overflow', () => {
  const flags = ['UPGRADE CANDIDATE', 'RED VINYL', 'LIMITED EDITION'];
  assert.deepEqual(fitFlags(flags, 76).shown, flags);
  assert.equal(fitFlags(flags, 76).text, `${' '.repeat(7)}UPGRADE CANDIDATE · RED VINYL · LIMITED EDITION`);
  assert.deepEqual(fitFlags(flags, 30).shown, ['UPGRADE CANDIDATE']);
  assert.deepEqual(fitFlags(flags, 10), { shown: [], text: '' });
  assert.deepEqual(fitFlags([], 76), { shown: [], text: '' });
});

test('statsFieldRows indents text lines and keeps dots on the outer and middle rows', () => {
  const { dotRow, rows } = statsFieldRows(['one', 'two', 'three']);
  assert.match(dotRow, /^ {3}·( {3}·)+$/);
  assert.deepEqual(rows.map(row => row.lead.length), [11, 13, 15]);
  assert.equal(rows[0].lead.trim(), '');
  assert.equal(rows[2].lead.trim(), '');
  assert.match(rows[1].lead, /·/);
  assert.match(rows[1].trail, /·/);
  assert.ok(dotRow.length <= 78 && rows.every(row => (row.lead + row.text + row.trail).length <= 78));
});

test('every LP record has an album copy link', () => {
  const { hrefs } = loadAlbumPages();
  const { lpCollection } = loadLpCollection();
  assert.equal(hrefs.size, lpCollection.length);
  assert.ok(lpCollection.every(record => /^\/albums\/.+\/#copy-[1-9]\d*$/.test(hrefs.get(record))));
});

test('artistInitial ignores a leading The and accents, and buckets non-letters', () => {
  assert.equal(artistInitial('The Beatles'), 'B');
  assert.equal(artistInitial('Édith Piaf'), 'E');
  assert.equal(artistInitial('miles davis'), 'M');
  assert.equal(artistInitial('10cc'), '#');
  assert.equal(artistInitial(''), '#');
});

test('albumCompletion counts owned reference albums and completionBar draws them', () => {
  const reference = [
    { title: 'One', year: 1970, section: 'Albums' }, { title: 'Two', year: 1971, section: 'Albums' },
    { title: 'Live', year: 1972, section: 'Live' }, { title: 'Out', year: 1973, section: '_omit' },
  ];
  const catalog = buildCatalog(reference, [{ Title: 'one' }, { Title: 'Live' }]);
  assert.deepEqual(albumCompletion(catalog), { owned: 1, total: 2, percent: 50 });
  assert.deepEqual(albumCompletion([]), { owned: 0, total: 0, percent: 0 });
  const bar = (owned, total, percent, row) => completionBar({ owned, total, percent }, 10, row);
  assert.deepEqual(bar(4, 10, 40, 0), { inverse: '  40', dots: '·.·.·.' }); // row 0 ends with .
  assert.deepEqual(bar(4, 10, 40, 1), { inverse: '  40', dots: '.·.·.·' }); // row 1 ends with ·
  assert.deepEqual(bar(10, 10, 100, 0), { inverse: '       100', dots: '' });
  assert.deepEqual(bar(15, 18, 83, 0), { inverse: '      83', dots: '·.' }); // 8 cells
  assert.deepEqual(bar(12, 98, 12, 0), { inverse: '12', dots: '·.·.·.·.' }); // widened to fit the number
  assert.deepEqual(bar(1, 100, 1, 0), { inverse: '1', dots: '.·.·.·.·.' }); // owning any shows a cell
  assert.equal(bar(99, 100, 99, 0).inverse.length, 9); // only complete fills the bar
  assert.deepEqual(bar(0, 5, 0, 0), { inverse: '0', dots: '.·.·.·.·.' });
});

test('completionBar defaults to 20 cells', () => {
  const { inverse, dots } = completionBar({ owned: 8, total: 16, percent: 50 });
  assert.equal(inverse.length + dots.length, 20);
  assert.equal(inverse.length, 10);
  assert.equal(completionBar({ owned: 19, total: 19, percent: 100 }).inverse.length, 20);
  assert.equal(completionBar({ owned: 12, total: 98, percent: 12 }).inverse.length, 2); // 12% rounds to 2 cells
});
