import {
  createCipheriv,
  createECDH,
  createHmac,
  createPrivateKey,
  randomBytes,
  sign,
} from "node:crypto";

/**
 * Minimal Web Push sender (RFC 8030 + VAPID RFC 8292 + aes128gcm encryption RFC 8291),
 * built on node:crypto so it needs no extra package.
 */

export interface PushSubscriptionRecord {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface VapidKeys {
  /** Public key: 65 bytes, uncompressed, base64url. Also given to browsers. */
  publicKey: string;
  /** Private scalar: 32 bytes, base64url. */
  privateKey: string;
  /** mailto: or https: contact for the push services. */
  subject: string;
}

export const b64u = {
  encode: (buf: Buffer | Uint8Array) => Buffer.from(buf).toString("base64url"),
  decode: (s: string) => Buffer.from(s, "base64url"),
};

function hkdfExtract(salt: Buffer, ikm: Buffer): Buffer {
  return createHmac("sha256", salt).update(ikm).digest();
}

function hkdfExpand(prk: Buffer, info: Buffer, length: number): Buffer {
  // One block is enough: every length used here is at most 32 bytes.
  return createHmac("sha256", prk)
    .update(Buffer.concat([info, Buffer.from([1])]))
    .digest()
    .subarray(0, length);
}

/** Encrypts a payload for one subscription (aes128gcm content coding). */
export function encryptPayload(
  payload: Buffer,
  sub: { p256dh: string; auth: string },
  fixed?: { salt?: Buffer; ephemeral?: ReturnType<typeof createECDH> },
): Buffer {
  const uaPublic = b64u.decode(sub.p256dh);
  const authSecret = b64u.decode(sub.auth);

  const ecdh = fixed?.ephemeral ?? createECDH("prime256v1");
  if (!fixed?.ephemeral) ecdh.generateKeys();
  const asPublic = ecdh.getPublicKey();
  const shared = ecdh.computeSecret(uaPublic);

  const prkKey = hkdfExtract(authSecret, shared);
  const keyInfo = Buffer.concat([Buffer.from("WebPush: info\0"), uaPublic, asPublic]);
  const ikm = hkdfExpand(prkKey, keyInfo, 32);

  const salt = fixed?.salt ?? randomBytes(16);
  const prk = hkdfExtract(salt, ikm);
  const cek = hkdfExpand(prk, Buffer.from("Content-Encoding: aes128gcm\0"), 16);
  const nonce = hkdfExpand(prk, Buffer.from("Content-Encoding: nonce\0"), 12);

  const cipher = createCipheriv("aes-128-gcm", cek, nonce);
  // 0x02 marks the last (only) record.
  const encrypted = Buffer.concat([cipher.update(Buffer.concat([payload, Buffer.from([2])])), cipher.final(), cipher.getAuthTag()]);

  const header = Buffer.alloc(16 + 4 + 1);
  salt.copy(header, 0);
  header.writeUInt32BE(4096, 16);
  header.writeUInt8(asPublic.length, 20);
  return Buffer.concat([header, asPublic, encrypted]);
}

/** Signs the VAPID JWT for a push service origin. */
export function vapidJwt(audience: string, keys: VapidKeys, now = Date.now()): string {
  const header = b64u.encode(Buffer.from(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const claims = b64u.encode(
    Buffer.from(JSON.stringify({ aud: audience, exp: Math.floor(now / 1000) + 12 * 3600, sub: keys.subject })),
  );
  const pub = b64u.decode(keys.publicKey);
  const key = createPrivateKey({
    key: {
      kty: "EC",
      crv: "P-256",
      x: b64u.encode(pub.subarray(1, 33)),
      y: b64u.encode(pub.subarray(33, 65)),
      d: keys.privateKey,
    },
    format: "jwk",
  });
  const data = `${header}.${claims}`;
  const signature = sign("sha256", Buffer.from(data), { key, dsaEncoding: "ieee-p1363" });
  return `${data}.${b64u.encode(signature)}`;
}

export type PushResult = "sent" | "gone" | "failed";

/** Sends one notification. "gone" means the device unsubscribed: delete it. */
export async function sendPush(
  sub: PushSubscriptionRecord,
  message: { title: string; body: string; url?: string; image?: string },
  keys: VapidKeys,
): Promise<PushResult> {
  try {
    const audience = new URL(sub.endpoint).origin;
    const body = encryptPayload(Buffer.from(JSON.stringify(message)), sub);
    const res = await fetch(sub.endpoint, {
      method: "POST",
      headers: {
        Authorization: `vapid t=${vapidJwt(audience, keys)}, k=${keys.publicKey}`,
        "Content-Encoding": "aes128gcm",
        "Content-Type": "application/octet-stream",
        TTL: String(24 * 3600),
        Urgency: "normal",
      },
      body: new Uint8Array(body),
    });
    if (res.status === 404 || res.status === 410) return "gone";
    return res.ok ? "sent" : "failed";
  } catch {
    return "failed";
  }
}

/** Reads the VAPID keys from the environment; null until they are set. */
export function vapidKeysFromEnv(): VapidKeys | null {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return null;
  return { publicKey, privateKey, subject: process.env.VAPID_SUBJECT ?? "mailto:hello@liky.club" };
}

/**
 * No messages from Friday afternoon until Saturday night (Israel time), so nothing
 * buzzes on Shabbat. Holidays are not covered: leave those to the person sending.
 */
export function isShabbat(now = new Date()): boolean {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Jerusalem",
    weekday: "short",
    hour: "numeric",
    hour12: false,
  }).formatToParts(now);
  const weekday = parts.find((p) => p.type === "weekday")?.value;
  const hour = Number(parts.find((p) => p.type === "hour")?.value) % 24;
  return (weekday === "Fri" && hour >= 14) || (weekday === "Sat" && hour < 21);
}
