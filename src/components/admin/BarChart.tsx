/**
 * Daily visits as a single-series bar chart. Plain SVG, no chart library.
 * Each bar has a native tooltip and the numbers are also listed in a table for screen readers.
 */
export interface DailyPoint {
  day: string;
  page_views: number;
  visitors: number;
}

const W = 720;
const H = 200;
const PAD_TOP = 12;
const PAD_BOTTOM = 24;

function shortDate(day: string) {
  const [, m, d] = day.split("-");
  return `${Number(d)}.${Number(m)}`;
}

export function BarChart({ data }: { data: DailyPoint[] }) {
  const max = Math.max(1, ...data.map((d) => d.visitors));
  const slot = W / Math.max(1, data.length);
  const bar = Math.max(2, Math.min(28, slot - 2));
  const plotH = H - PAD_TOP - PAD_BOTTOM;
  const labelEvery = Math.ceil(data.length / 8);
  const ticks = [0, Math.round(max / 2), max];

  return (
    <figure className="space-y-2">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label="מבקרות לפי יום"
      >
        {ticks.map((t) => {
          const y = PAD_TOP + plotH - (t / max) * plotH;
          return (
            <g key={t}>
              <line x1={0} x2={W} y1={y} y2={y} stroke="var(--color-line)" strokeWidth={1} />
              <text x={W - 2} y={y - 3} textAnchor="end" fontSize={11} fill="var(--color-ink-soft)">
                {t.toLocaleString("he-IL")}
              </text>
            </g>
          );
        })}
        {data.map((d, i) => {
          const h = (d.visitors / max) * plotH;
          // right-to-left: the newest day is on the left
          const x = W - (i + 1) * slot + (slot - bar) / 2;
          const y = PAD_TOP + plotH - h;
          return (
            <g key={d.day}>
              <rect x={x - 1} y={PAD_TOP} width={bar + 2} height={plotH} fill="transparent">
                <title>{`${shortDate(d.day)}: ${d.visitors} מבקרות, ${d.page_views} צפיות בעמודים`}</title>
              </rect>
              {h > 0 && (
                <rect
                  x={x}
                  y={y}
                  width={bar}
                  height={h}
                  rx={Math.min(4, bar / 2)}
                  fill="var(--color-accent)"
                  pointerEvents="none"
                />
              )}
              {i % labelEvery === 0 && (
                <text
                  x={x + bar / 2}
                  y={H - 6}
                  textAnchor="middle"
                  fontSize={11}
                  fill="var(--color-ink-soft)"
                >
                  {shortDate(d.day)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <table className="sr-only">
        <caption>מבקרות וצפיות לפי יום</caption>
        <thead>
          <tr>
            <th>יום</th>
            <th>מבקרות</th>
            <th>צפיות</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.day}>
              <td>{d.day}</td>
              <td>{d.visitors}</td>
              <td>{d.page_views}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
