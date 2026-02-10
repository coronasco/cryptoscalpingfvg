import EventEmitter from "events";
import WebSocket from "ws";
import { env } from "../env";
import { Candle } from "../engine/types";

export type BybitInterval = "1" | "3" | "5" | "15" | "60";

const WS_URL = env.BYBIT_WS_URL || "wss://stream.bybit.com/v5/public/linear";
const REST_URL =
  env.BYBIT_PROXY_URL ||
  "https://crypto.daniel-zaharia-corona.workers.dev/bybit/v5/market/kline" ||
  env.BYBIT_REST_URL ||
  "https://api.bybit.com";
const BINANCE_PROXY =
  env.BINANCE_PROXY_URL ||
  "https://crypto.daniel-zaharia-corona.workers.dev/binance/api/v3/klines" ||
  process.env.BINANCE_PROXY_URL;

async function fetchBinanceKlines(params: {
  symbol: string;
  interval: BybitInterval;
  limit?: number;
}): Promise<Candle[]> {
  const map: Record<BybitInterval, string> = { "1": "1m", "3": "3m", "5": "5m", "15": "15m", "60": "1h" };
  const url = new URL("https://api.binance.com/api/v3/klines");
  url.searchParams.set("symbol", params.symbol);
  url.searchParams.set("interval", map[params.interval]);
  url.searchParams.set("limit", String(params.limit ?? 200));
  const res = await fetch(url.toString(), { headers: { "User-Agent": "cryptoscalp/1.0" } });
  if (!res.ok) throw new Error(`Binance REST failed: ${res.status}`);
  const data = (await res.json()) as any[];
  return data.map((row) => ({
    ts: Number(row[0]),
    open: Number(row[1]),
    high: Number(row[2]),
    low: Number(row[3]),
    close: Number(row[4]),
    volume: Number(row[5]),
    confirmed: true,
  }));
}

export async function fetchKlines(params: {
  symbol: string;
  interval: BybitInterval;
  limit?: number;
  start?: number;
  end?: number;
}): Promise<Candle[]> {
  const { symbol, interval, limit = 200, start, end } = params;
  const url = new URL("/v5/market/kline", REST_URL);
  url.searchParams.set("category", "linear");
  url.searchParams.set("symbol", symbol);
  url.searchParams.set("interval", interval);
  url.searchParams.set("limit", String(limit));
  if (start) url.searchParams.set("start", String(start));
  if (end) url.searchParams.set("end", String(end));

  try {
    const res = await fetch(url.toString(), { cache: "no-store", headers: { "User-Agent": "cryptoscalp/1.0" } });
    if (!res.ok) throw new Error(`Bybit REST failed: ${res.status}`);
    const json = await res.json();
    const list = json?.result?.list ?? [];
    return list
      .map((row: string[]) => {
        const [startTs, open, high, low, close, volume] = row;
        return {
          ts: Number(startTs),
          open: Number(open),
          high: Number(high),
          low: Number(low),
          close: Number(close),
          volume: Number(volume),
          confirmed: true,
        } as Candle;
      })
      .sort((a: Candle, b: Candle) => a.ts - b.ts);
  } catch (err) {
    // fallback to Binance public klines if Bybit blocks (e.g., 403 on some hosts)
    if (BINANCE_PROXY) {
      const map: Record<BybitInterval, string> = { "1": "1m", "3": "3m", "5": "5m", "15": "15m", "60": "1h" };
      const url = new URL(BINANCE_PROXY);
      url.searchParams.set("symbol", symbol);
      url.searchParams.set("interval", map[interval]);
      url.searchParams.set("limit", String(limit ?? 200));
      const res = await fetch(url.toString(), { headers: { "User-Agent": "cryptoscalp/1.0" } });
      if (!res.ok) throw new Error(`Binance REST failed: ${res.status}`);
      const data = (await res.json()) as any[];
      return data.map((row) => ({
        ts: Number(row[0]),
        open: Number(row[1]),
        high: Number(row[2]),
        low: Number(row[3]),
        close: Number(row[4]),
        volume: Number(row[5]),
        confirmed: true,
      }));
    }
    return fetchBinanceKlines({ symbol, interval, limit });
  }
}

type WsMessage =
  | { topic: string; data: { start: number; open: string; high: string; low: string; close: string; volume: string } }
  | { op: string; success: boolean; conn_id?: string };

export class BybitSocket extends EventEmitter {
  private ws: WebSocket | null = null;
  private reconnects = 0;
  private lastMessageAt = 0;
  private args: string[] = [];

  constructor() {
    super();
  }

  subscribeKline(symbol: string, interval: BybitInterval) {
    const topic = `kline.${interval}.${symbol}`;
    if (this.args.includes(topic)) return;
    this.args.push(topic);
    this.ensure();
    this.send({ op: "subscribe", args: [topic] });
  }

  health() {
    return {
      connected: this.ws?.readyState === WebSocket.OPEN,
      lastMessageAt: this.lastMessageAt,
      reconnects: this.reconnects,
      topics: this.args,
    };
  }

  private ensure() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) return;
    this.ws = new WebSocket(WS_URL);

    this.ws.on("open", () => {
      this.send({ op: "ping" });
      if (this.args.length) this.send({ op: "subscribe", args: this.args });
    });

    this.ws.on("message", (raw) => {
      this.lastMessageAt = Date.now();
      try {
        const parsed = JSON.parse(raw.toString()) as WsMessage;
        if ("topic" in parsed && parsed.topic.includes("kline")) {
          const payload = parsed as WsMessage;
          const d: any = (payload as any).data;
          const candle: Candle = {
            ts: Number(d.start),
            open: Number(d.open),
            high: Number(d.high),
            low: Number(d.low),
            close: Number(d.close),
            volume: Number(d.volume),
            confirmed: true,
          };
          this.emit("kline", { topic: parsed.topic, candle });
        }
      } catch (err) {
        this.emit("error", err);
      }
    });

    this.ws.on("close", () => {
      this.reconnects += 1;
      setTimeout(() => this.ensure(), 1000 * Math.min(this.reconnects, 5));
    });

    this.ws.on("error", () => {
      this.ws?.close();
    });
  }

  private send(payload: Record<string, unknown>) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify(payload));
  }
}

export const bybitSocket = new BybitSocket();
