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
