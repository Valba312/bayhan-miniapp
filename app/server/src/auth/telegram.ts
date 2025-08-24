import crypto from "crypto";
import { prisma } from "../db/prisma";
import { signJwt } from "./jwt";

export function verifyTelegramInitData(initData: string, botToken: string): { ok: boolean; data?: any } {
  const url = new URLSearchParams(initData);
  const hash = url.get("hash");
  if (!hash) return { ok: false };

  const entries: string[] = [];
  url.forEach((value, key) => {
    if (key === "hash") return;
    entries.push(`${key}=${value}`);
  });
  entries.sort();
  const dataCheckString = entries.join("\n");

  const secretKey = crypto.createHash("sha256").update(botToken).digest();
  const hmac = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

  return { ok: hmac === hash, data: Object.fromEntries(url.entries()) };
}

export async function upsertUserFromInitData(initData: string) {
  const url = new URLSearchParams(initData);
  const userJson = url.get("user");
  if (!userJson) throw new Error("No user in initData");
  const user = JSON.parse(decodeURIComponent(userJson));

  const dbUser = await prisma.user.upsert({
    where: { tgId: String(user.id) },
    update: {
      firstName: user.first_name,
      lastName: user.last_name,
      username: user.username,
      language: user.language_code
    },
    create: {
      tgId: String(user.id),
      firstName: user.first_name,
      lastName: user.last_name,
      username: user.username,
      language: user.language_code,
      role: "OWNER"
    }
  });

  const token = signJwt({ uid: dbUser.id, role: dbUser.role });
  return { dbUser, token };
}