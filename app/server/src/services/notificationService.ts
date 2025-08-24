import TelegramBot from "node-telegram-bot-api";
import { prisma } from "../db/prisma";

let bot: TelegramBot | null = null;
export function setBotInstance(b: TelegramBot) { bot = b; }

export async function notifyUser(userId: number, text: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.chatId || !bot) return;
  try { await bot.sendMessage(user.chatId, text, { parse_mode: "HTML" }); } catch {}
}

export async function notifyAdmins(text: string) {
  const admins = await prisma.user.findMany({ where: { role: "ADMIN", chatId: { not: null } } });
  for (const a of admins) if (a.chatId && bot) await bot.sendMessage(a.chatId, text, { parse_mode: "HTML" });
}