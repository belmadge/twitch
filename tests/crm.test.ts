import test from "node:test";
import assert from "node:assert/strict";
import { crm } from "../src/crm.js";

test("crm acumula pontos e ordena ranking", () => {
  const channel = `canal_${Date.now()}`;

  crm.registerMessage(channel, "alice");
  crm.registerMessage(channel, "alice");
  crm.registerMessage(channel, "bob");

  const viewers = crm.listViewers(channel);

  assert.equal(viewers.length, 2);
  assert.equal(viewers[0]?.username, "alice");
  assert.ok(viewers[0]?.points > viewers[1]?.points);
});
