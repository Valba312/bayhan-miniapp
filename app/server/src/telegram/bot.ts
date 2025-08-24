import TelegramBot from "node-telegram-bot-api";
import { prisma } from "../db/prisma";
import { setBotInstance } from "../services/notificationService";

export async function initBot() {
  const token = process.env.BOT_TOKEN;
  if (!token) { console.warn("BOT_TOKEN is not set; notifications disabled"); return; }
  const bot = new TelegramBot(token, { polling: true });
  setBotInstance(bot);

  bot.onText(/\/start(?:\s+(.+))?/, async (msg, match) => {
    const chatId = String(msg.chat.id);
    const tgId = String(msg.from?.id || "");
    const user = await prisma.user.upsert({
      where: { tgId },
      update: { chatId },
      create: { tgId, chatId, firstName: msg.from?.first_name, lastName: msg.from?.last_name, username: msg.from?.username, role: "OWNER" }
    });
    const deep = match?.[1] ? `\nDeepLink: ${match[1]}` : "";
    await bot.sendMessage(chatId, `Привет, ${user.firstName || "владелец"}! Чат связан ✅${deep}`);
  });

  console.log("[bot] started");
}