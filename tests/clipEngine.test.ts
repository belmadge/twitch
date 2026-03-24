import test from "node:test";
import assert from "node:assert/strict";
import { clipEngine } from "../src/clipEngine.js";

test("clipEngine gera sugestão quando há pico de eventos", () => {
  const channel = `canal_${Date.now()}`;
  const baseTime = Date.now();

  for (let i = 0; i < 4; i += 1) {
    clipEngine.recordEvent(channel, { type: "message", at: baseTime - 90_000 + i * 1000 });
  }

  let clip;
  for (let i = 0; i < 15; i += 1) {
    clip = clipEngine.recordEvent(channel, { type: "message", at: baseTime - 20_000 + i * 1000 });
  }

  assert.ok(clip, "esperava sugestão de clip");
  assert.equal(clip?.channel, channel);
  assert.ok(clip?.score && clip.score > 0);
});
