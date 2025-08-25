import { Router } from "express";
import { z } from "zod";
import { validateBody } from "../middlewares/validate";
import { ApiError } from "../middlewares/error";
import { requireAuth } from "../auth/jwt";
import { upsertUserFromInitData, verifyTelegramInitData } from "../auth/telegram";
import { prisma } from "../db/prisma";
import { devAuth } from "../auth/dev";

const router = Router();

router.post(
  "/telegram",
  validateBody(z.object({ initData: z.string() })),
  async (req, res, next) => {
    try {
      const { initData } = (req as any).data as { initData: string };
      const botToken = process.env.BOT_TOKEN!;
      if (!botToken) throw new ApiError(400, "BOT_TOKEN missing");

      const { ok } = verifyTelegramInitData(initData, botToken);
      if (!ok) throw new ApiError(401, "Invalid initData HMAC");

      const { dbUser, token } = await upsertUserFromInitData(initData);
      res.json({ ok: true, token, user: dbUser });
    } catch (e) { next(e); }
  }
);

router.get("/verify", requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: (req as any).user.uid } });
    if (!user) throw new ApiError(401, "User not found");
    res.json({ ok: true, user });
  } catch (e) {
    next(e);
  }
});

router.post(
  "/dev",
  validateBody(z.object({ user_id: z.string().optional(), role: z.string().optional() })),
  async (req, res, next) => {
    try {
      if (process.env.NODE_ENV === "production" || process.env.ALLOW_DEV_AUTH !== "1") {
        return res.status(403).json({ error: "Dev auth disabled" });
      }
      const { user_id, role } = (req as any).data as { user_id?: string; role?: string };
      const uid = user_id || process.env.DEV_TG_USER_ID;
      if (!uid) throw new ApiError(400, "user_id required");
      const { user, token } = await devAuth(uid, role);
      res.json({ ok: true, token, user });
    } catch (e) {
      next(e);
    }
  }
);

export default router;