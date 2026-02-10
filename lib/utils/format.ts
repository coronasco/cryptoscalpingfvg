import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export function formatPrice(n: number | undefined, digits = 4) {
  if (n === undefined) return "–";
  const precision = Math.abs(n) > 100 ? 2 : digits;
  return n.toFixed(precision);
}

export function formatAgeMinutes(ts: number) {
  return dayjs(ts).fromNow(true);
}

export function formatRR(entry: number, sl: number, tp: number) {
  if (!entry || !sl || !tp) return "–";
  const risk = Math.abs(entry - sl);
  const reward = Math.abs(tp - entry);
  if (risk === 0) return "∞";
  return (reward / risk).toFixed(2);
}
