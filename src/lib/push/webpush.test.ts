import { test } from "node:test";
import assert from "node:assert/strict";
import { createDecipheriv, createECDH, createHmac, generateKeyPairSync, verify } from "node:crypto";
import { b64u, encryptPayload, isShabbat, vapidJwt } from "./webpush.ts";

function hkdf(salt: Buffer, ikm: Buffer, info: Buffer, len: number) {
  const prk = createHmac("sha256", salt).update(ikm).digest();
  return createHmac("sha256", prk).update(Buffer.concat([info, Buffer.from([1])])).digest().subarray(0, len);
}

test("a payload encrypted for a device can be decrypted by that device", () => {
  const device = createECDH("prime256v1");
  device.generateKeys();
  const auth = Buffer.from("0123456789abcdef");
  const sub = { p256dh: b64u.encode(device.getPublicKey()), auth: b64u.encode(auth) };
  const text = JSON.stringify({ title: "הטבה חדשה", body: "20% הנחה" });

  const body = encryptPayload(Buffer.from(text), sub);
  const salt = body.subarray(0, 16);
  assert.equal(body.readUInt32BE(16), 4096);
  const idLen = body.readUInt8(20);
  const asPublic = body.subarray(21, 21 + idLen);
  const cipherAndTag = body.subarray(21 + idLen);

  const shared = device.computeSecret(asPublic);
  const ikm = hkdf(auth, shared, Buffer.concat([Buffer.from("WebPush: info\0"), device.getPublicKey(), asPublic]), 32);
  const cek = hkdf(salt, ikm, Buffer.from("Content-Encoding: aes128gcm\0"), 16);
  const nonce = hkdf(salt, ikm, Buffer.from("Content-Encoding: nonce\0"), 12);
  const decipher = createDecipheriv("aes-128-gcm", cek, nonce);
  decipher.setAuthTag(cipherAndTag.subarray(cipherAndTag.length - 16));
  const plain = Buffer.concat([decipher.update(cipherAndTag.subarray(0, cipherAndTag.length - 16)), decipher.final()]);
  assert.equal(plain[plain.length - 1], 2);
  assert.equal(plain.subarray(0, plain.length - 1).toString(), text);
});

test("the VAPID token verifies with the public key", () => {
  const { privateKey, publicKey } = generateKeyPairSync("ec", { namedCurve: "prime256v1" });
  const jwk = privateKey.export({ format: "jwk" });
  const pubJwk = publicKey.export({ format: "jwk" });
  const pub = Buffer.concat([Buffer.from([4]), b64u.decode(pubJwk.x as string), b64u.decode(pubJwk.y as string)]);
  const keys = { publicKey: b64u.encode(pub), privateKey: jwk.d as string, subject: "mailto:a@b.co" };

  const token = vapidJwt("https://push.example", keys, 1_000_000);
  const [h, c, s] = token.split(".");
  const claims = JSON.parse(b64u.decode(c).toString());
  assert.equal(claims.aud, "https://push.example");
  assert.equal(claims.sub, "mailto:a@b.co");
  assert.ok(verify("sha256", Buffer.from(`${h}.${c}`), { key: publicKey, dsaEncoding: "ieee-p1363" }, b64u.decode(s)));
});

test("no sending from Friday afternoon to Saturday night in Israel", () => {
  assert.equal(isShabbat(new Date("2026-11-13T09:00:00Z")), false);
  assert.equal(isShabbat(new Date("2026-11-13T13:00:00Z")), true);
  assert.equal(isShabbat(new Date("2026-11-14T12:00:00Z")), true);
  assert.equal(isShabbat(new Date("2026-11-14T20:00:00Z")), false);
  assert.equal(isShabbat(new Date("2026-11-15T08:00:00Z")), false);
});
