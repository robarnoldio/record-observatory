import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse/sync';

export function loadLpCollection() {
  const collectionDir = path.resolve('data/collection');

  const csvFiles = fs
    .readdirSync(collectionDir)
    .filter(name => /^Robarnold-collection-.*\.csv$/.test(name))
    .sort();

  if (csvFiles.length === 0) {
    throw new Error('No Discogs collection CSV found');
  }

  const csvFilename = csvFiles.at(-1);
  const csvPath = path.join(collectionDir, csvFilename);

  const csvText = fs.readFileSync(csvPath, 'utf8');

  const collection = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
  });

  const lpCollection = collection.filter(record =>
    record.Format?.split(',').some(
      x => /^\d*xLP$|^LP$/.test(x.trim())
    )
  );
// date of the export file for humans to enjoy
const exportTimestamp =
  csvFilename.match(/(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})/);

const exportDate = exportTimestamp
  ? new Date(
      Number(exportTimestamp[1]),
      Number(exportTimestamp[2]) - 1,
      Number(exportTimestamp[3]),
      Number(exportTimestamp[4]),
      Number(exportTimestamp[5])
    )
  : null;

const exportDateString = exportDate
  ? exportDate.toLocaleString()
  : 'Unknown';


  return {
    csvFilename,
    collection,
    lpCollection,
    exportDateString
  };
}
 // these helpers sort arrays 
export function sortByCount(entries) {
  return [...entries].sort(([, a], [, b]) => b - a);
}

export function sortByNumKey(entries) {
  return [...entries].sort(([a], [b]) => Number(a) - Number(b));
}

export function sortByDateKey(entries) {
  return [...entries].sort(
    ([a], [b]) => new Date(a) - new Date(b)
  );

}