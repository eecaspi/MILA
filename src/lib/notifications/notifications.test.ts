import { afterEach, test } from "node:test";
import assert from "node:assert/strict";
import {
  notify,
  registerChannel,
  resetChannelsForTests,
  type NotificationChannel,
} from "./index.ts";

afterEach(() => resetChannelsForTests());

const event = { type: "points_awarded", userId: "u1", points: 50 } as const;

test("with no channels registered, nothing is sent", async () => {
  assert.deepEqual(await notify(event), { delivered: [] });
});

test("delivers only through channels that support the event", async () => {
  const sent: string[] = [];
  const email: NotificationChannel = {
    id: "email",
    supports: () => true,
    send: async () => {
      sent.push("email");
      return true;
    },
  };
  const whatsapp: NotificationChannel = {
    id: "whatsapp",
    supports: (e) => e.type === "announcement",
    send: async () => {
      sent.push("whatsapp");
      return true;
    },
  };
  registerChannel(email);
  registerChannel(whatsapp);
  assert.deepEqual(await notify(event), { delivered: ["email"] });
  assert.deepEqual(sent, ["email"]);
});

test("a channel that declines (not opted in) is not counted as delivered", async () => {
  registerChannel({ id: "sms", supports: () => true, send: async () => false });
  assert.deepEqual(await notify(event), { delivered: [] });
});

test("a failing channel never breaks the caller", async () => {
  registerChannel({
    id: "whatsapp",
    supports: () => true,
    send: async () => {
      throw new Error("provider down");
    },
  });
  const original = console.error;
  console.error = () => {};
  try {
    assert.deepEqual(await notify(event), { delivered: [] });
  } finally {
    console.error = original;
  }
});
