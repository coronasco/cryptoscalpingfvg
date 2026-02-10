import EventEmitter from "events";
import WebSocket from "ws";
import { env } from "../env";
import { Candle } from "../engine/types";

export type BybitInterval = "1" | "3" | "5" | "15" | "60";

const WS_URL = env.BYBIT_WS_URL || "wss://stream.bybit.com/v5/public/linear";
const REST_URL = env.BYBIT_REST_URL || "https://api.bybit.com";

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

  const res = await fetch(url.toString(), { cache: "no-store" });
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
