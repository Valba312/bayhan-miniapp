import { Router } from "express";
import { z } from "zod";
import { validateBody } from "../middlewares/validate";
import { ApiError } from "../middlewares/error";
import { signJwt } from "../auth/jwt";
import { upsertUserFromInitData, verifyTelegramInitData } from "../auth/telegram";
import { prisma } from "../db/prisma";

const router = Router();

router.post(
  "/telegram/verify",
  validateBody(z.object({ initData: z.string().optional() })),
  async (req, res, next) => {
    try {
      const { initData } = (req as any).data as { initData?: string };
      const botToken = process.env.BOT_TOKEN!;
      const devUserId = process.env.DEV_TG_USER_ID;

      if (!initData && devUserId) {
        const user = await prisma.user.findFirst({ where: { tgId: String(devUserId) } });
        if (!user) throw new ApiError(400, "DEV_TG_USER_ID user not found; run seed");
        const token = signJwt({ uid: user.id, role: user.role });
        return res.json({ ok: true, token, user });
      }

      if (!initData || !botToken) throw new ApiError(400, "initData required");

      const { ok } = verifyTelegramInitData(initData, botToken);
      if (!ok) throw new ApiError(401, "Invalid initData HMAC");

      const { dbUser, token } = await upsertUserFromInitData(initData);
      res.json({ ok: true, token, user: dbUser });
    } catch (e) { next(e); }
  }
);

export default router;