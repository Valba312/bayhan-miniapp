import { describe, it, expect } from "vitest";
import crypto from "crypto";
import { verifyTelegramInitData } from "../src/auth/telegram";

function buildInitData(botToken: string, payload: Record<string, string>) {
  const url = new URLSearchParams(payload);
  const entries: string[] = [];
  url.forEach((value, key) => entries.push(`${key}=${value}`));
  entries.sort();
  const dataCheck = entries.join("\n");
  const secret = crypto.createHash("sha256").update(botToken).digest();
  const hash = crypto.createHmac("sha256", secret).update(dataCheck).digest("hex");
  url.set("hash", hash);
  return url.toString();
}

describe("Telegram initData verify", () => {
  it("accepts valid HMAC", () => {
    const botToken = "12345:TEST";
    const user = encodeURIComponent(JSON.stringify({ id: 777, first_name: "Test" }));
    const initData = buildInitData(botToken, { user });
    const { ok } = verifyTelegramInitData(initData, botToken);
    expect(ok).toBe(true);
  });

  it("rejects invalid HMAC", () => {
    const botToken = "12345:TEST";
    const user = encodeURIComponent(JSON.stringify({ id: 777, first_name: "Test" }));
    const url = new URLSearchParams({ user });
    url.set("hash", "deadbeef");
    const { ok } = verifyTelegramInitData(url.toString(), botToken);
    expect(ok).toBe(false);
  });
});