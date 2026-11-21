export const FRAME_WIDTH = 78;

export function frameHeader(
  label,
  options,
  selected = options[0],
  width = FRAME_WIDTH
) {
  const renderedOptions = options.map((option) =>
    option === selected
      ? `[${option}]`
      : ` ${option} `
  );
  const content =
    `${label} ══${renderedOptions.join("═")}`;

  const left = `╔════ ${content} `;
  const fill = "═".repeat(
    Math.max(0, width - left.length - 1)
  );

  return `${left}${fill}╗`;
}

export function frameFooter(
  width = FRAME_WIDTH
) {

  const left = "╚";
  const fill = "═".repeat(
    Math.max(0, width - left.length - 1)
  );
  return `${left}${fill}╝`;
}  

export function fillTo(
  left,
  right,
  width,
  fill = '.'
) {
  let available =
    width -
    left.length -
    right.length;

  if (available <= 0) {
    left = left.slice(
      0,
      width - right.length - 1
    );

    available =
      width -
      left.length -
      right.length;
  }

  const repeated = fill.repeat(
    Math.ceil(available / fill.length)
  );

  return (
    left +
    repeated.slice(0, available) +
    right
  );
}

// Rows for a stats block: text lines float in a sparse `·` lattice, each indented two
// columns more than the last. Dots fill the top, bottom and middle rows only.
export function statsFieldRows(lines, frameWidth = FRAME_WIDTH, firstStart = 11, indent = 2) {
  const width = Math.max(frameWidth, ...lines.map((text, i) => firstStart + indent * i + text.length + 4));
  const lattice = offset => Array.from({ length: width }, (_, col) => (col % 4 === offset ? '·' : ' '));
  const dotRow = lattice(3).join('').trimEnd();
  const middle = Math.floor(lines.length / 2);
  const rows = lines.map((text, i) => {
    const start = firstStart + indent * i;
    const end = start + text.length;
    const cells = lattice(1);
    if (i !== middle) cells.fill(' ');
    cells.fill(' ', start - 1, end + 1); // a clear space on both sides of the text
    return { text, lead: cells.slice(0, start).join(''), trail: cells.slice(end).join('').trimEnd() };
  });
  return { dotRow, rows };
}
