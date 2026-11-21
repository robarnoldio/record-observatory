import { isUpgradeCandidate } from './collection.js';
import specialFlags from '../../data/special-flags.json' with { type: 'json' };

const formatNames = {
  LP: 'LP record', Album: 'Album', Comp: 'Compilation', Box: 'Box set',
  RE: 'Reissue', RM: 'Remastered', Rem: 'Remastered', RP: 'Repress',
  RSD: 'Record Store Day', Ltd: 'Limited edition', Num: 'Numbered edition',
  Promo: 'Promotional copy', Unofficial: 'Unofficial release', Club: 'Club edition',
  Mono: 'Mono', Stereo: 'Stereo', Quad: 'Quadraphonic',
  Gat: 'Gatefold sleeve', Uni: 'Unipak sleeve', Dig: 'Digipak',
  Dlx: 'Deluxe edition', 'S/Edition': 'Special edition', 'S/Sided': 'Single-sided',
  'M/Print': 'Misprint', 'P/Mixed': 'Partially mixed', DMM: 'Direct metal mastering',
  Pic: 'Picture disc', Enh: 'Enhanced', Sli: 'Slipcase', Die: 'Die-cut sleeve',
  Lam: 'Laminated sleeve', Aut: 'Auto-coupled records', aut: 'Auto-coupled records',
  '180': '180 gram vinyl',
  Bla: 'Black vinyl', Blu: 'Blue vinyl', Gol: 'Gold vinyl', Cle: 'Clear vinyl',
  Red: 'Red vinyl', Yel: 'Yellow vinyl', Pin: 'Pink vinyl', Gre: 'Green vinyl',
  Ora: 'Orange vinyl', Vio: 'Violet vinyl', Whi: 'White vinyl', Sil: 'Silver vinyl',
  Glo: 'Gloversville pressing', Opa: 'Opaque vinyl',
  Jac: 'Jacksonville pressing', Cap: 'Capitol pressing',
  Pit: 'Pitman pressing', San: 'Santa Maria pressing', Ter: 'Terre Haute pressing',
  Win: 'Winchester pressing', Los: 'Los Angeles pressing', Hol: 'Hollywood pressing',
  Roc: 'Rockaway pressing', Ind: 'Indianapolis pressing', Mon: 'Monarch pressing',
  Spe: 'Specialty pressing', Scr: 'Scranton pressing', Car: 'Carrollton pressing',
  CSM: 'Columbia Santa Maria pressing', CTH: 'Columbia Terre Haute pressing',
  SRC: 'Specialty Records pressing', PRC: 'PRC pressing',
};

export function formatIndicators(format) {
  const tokens = (format ?? '').split(/[,+]/).map(token => token.trim()).filter(Boolean);
  return tokens.map(token => {
    const discs = token.match(/^(\d+)xLP$/);
    if (discs) return `${Number(discs[1])} LP records`;
    return formatNames[token] ?? token;
  });
}

export function valueOrUnknown(value) {
  return value?.trim() || 'unknown';
}

const COLOR_TOKENS = ['Red', 'Yel', 'Pin', 'Blu', 'Gol', 'Cle', 'Gre', 'Ora', 'Vio', 'Whi', 'Sil', 'Opa'];
const AUDIOPHILE_TOKENS = ['180', 'Quad', 'DMM'];
const LIMITED_TOKENS = ['Ltd', 'Num', 'RSD'];

export function isMono(format) {
  return (format ?? '').split(/[,+]/).some(token => token.trim() === 'Mono');
}

// Explicit Box token, or 3+ discs (a 10xLP set like Sun Bear Concerts has no Box token).
function isBoxSet(tokens) {
  return tokens.includes('Box') || tokens.some(token => Number(token.match(/^(\d+)xLP$/)?.[1]) >= 3);
}

// Short uppercase flags for the album-page divider, most important first (hand-written flags lead).
// `special` maps Discogs release_id to hand-written flags for things the CSV can't tell us.
export function copyFlags(copy, special = specialFlags) {
  const tokens = (copy.Format ?? '').split(/[,+]/).map(token => token.trim());
  const has = list => list.some(token => tokens.includes(token));
  const flags = [];
  flags.push(...(special[copy.release_id] ?? []));
  if (isUpgradeCandidate(copy)) flags.push('UPGRADE CANDIDATE');
  if (isBoxSet(tokens)) flags.push('BOX SET');
  for (const token of COLOR_TOKENS) {
    if (tokens.includes(token)) flags.push(formatNames[token].toUpperCase());
  }
  if (has(AUDIOPHILE_TOKENS)) flags.push('AUDIOPHILE PRESSING');
  if (has(LIMITED_TOKENS)) flags.push('LIMITED EDITION');
  return flags;
}

// Like artist groups, hand-written flags fail loudly instead of silently doing nothing.
export function validateSpecialFlags(records, special = specialFlags) {
  const ids = new Set(records.map(record => record.release_id));
  for (const [id, flags] of Object.entries(special)) {
    if (!ids.has(id)) throw new Error(`Unknown release_id in special-flags.json: ${id}`);
    if (!Array.isArray(flags) || !flags.length || flags.some(flag => typeof flag !== 'string' || !flag.trim())) {
      throw new Error(`Invalid flags for release_id ${id} in special-flags.json`);
    }
  }
}
