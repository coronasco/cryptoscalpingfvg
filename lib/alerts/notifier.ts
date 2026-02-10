import webpush from "web-push";
import { eq } from "drizzle-orm";
import { Resend } from "resend";
import { env } from "../env";
import { alerts } from "../db/schema";
import { db } from "../db/client";
import { cacheGet, cacheSet } from "../cache/redis";

if (env.WEBPUSH_VAPID_PUBLIC_KEY && env.WEBPUSH_VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    "mailto:alerts@fvg.signals",
    env.WEBPUSH_VAPID_PUBLIC_KEY,
    env.WEBPUSH_VAPID_PRIVATE_KEY,
  );
}

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

type AlertPayload = {
  title: string;
  body: string;
  url?: string;
};

export async function sendWebPush(subscription: any, payload: AlertPayload) {
  if (!env.WEBPUSH_VAPID_PUBLIC_KEY || !env.WEBPUSH_VAPID_PRIVATE_KEY) return;
  await webpush.sendNotification(subscription, JSON.stringify(payload));
}

export async function sendEmail(to: string, payload: AlertPayload) {
  if (!resend) return;
  await resend.emails.send({
    from: "alerts@fvg-signals.ai",
    to,
    subject: payload.title,
    html: `<p>${payload.body}</p><p><a href="${payload.url ?? "#"}">Open setup</a></p>`,
  });
}

export async function dispatchAlerts(setupId: string, payload: AlertPayload) {
  const cacheKey = `alerts:${setupId}`;
  const recent = await cacheGet<number>(cacheKey);
  if (recent && Date.now() - recent < 5000) return; // debounce

  const entries =
    db &&
    (await db
      .select()
      .from(alerts)
      .where(eq(alerts.setupId, setupId)));

  if (!entries || !entries.length) return;

  for (const alert of entries) {
    if (!alert.enabled) continue;
    if (alert.channel === "WEBPUSH" && alert.destination) {
      await sendWebPush(alert.destination, payload);
    }
    if (alert.channel === "EMAIL" && alert.destination?.email) {
      await sendEmail(alert.destination.email as string, payload);
    }
  }

  await cacheSet(cacheKey, Date.now(), 30);
}
