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