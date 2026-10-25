/**
 * A tiny trend line for a stat card. Decorative: the card's number is the
 * information, so it is hidden from screen readers.
 */
export function Sparkline({ values }: { values: readonly number[] }) {
  const W = 100;
  const H = 32;
  const PAD = 3;
  const max = Math.max(...values, 0);
  const step = values.length > 1 ? W / (values.length - 1) : 0;
  const y = (v: number) =>
    max === 0 ? H - PAD : H - PAD - (v / max) * (H - PAD * 2);

  const line = values
    .map(
      (v, i) =>
        `${i === 0 ? "M" : "L"}${(i * step).toFixed(2)} ${y(v).toFixed(2)}`,
    )
    .join(" ");
  const area = `${line} L${((values.length - 1) * step).toFixed(2)} ${H} L0 ${H} Z`;

  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="h-8 w-full"
    >
      <path d={area} fill="#2db7ff" fillOpacity="0.1" />
      <path
        d={line}
        fill="none"
        stroke="#2db7ff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
