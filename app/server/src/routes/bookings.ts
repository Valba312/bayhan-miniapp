import { Router } from "express";
import { z } from "zod";
import { validateBody } from "../middlewares/validate";
import { requireAuth, requireRole } from "../auth/jwt";
import { moderateBooking, requestBooking } from "../services/bookingService";
import { prisma } from "../db/prisma";

const router = Router();

router.post(
  "/:slotId/request",
  requireAuth,
  validateBody(z.object({ note: z.string().max(500).optional() })),
  async (req, res, next) => {
    try {
      const userId = (req as any).user.uid as number;
      const slotId = Number(req.params.slotId);
      const booking = await requestBooking(userId, slotId, (req as any).data.note);
      res.json({ ok: true, data: booking });
    } catch (e) { next(e); }
  }
);

router.get("/history", requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).user.uid as number;
    const type = String(req.query.type || "all");
    const where = { userId } as any;
    if (type === "bookings") {
      const bookings = await prisma.booking.findMany({
        where,
        include: { slot: { include: { property: true } } },
        orderBy: { createdAt: "desc" }
      });
      return res.json({ ok: true, data: bookings });
    } else {
      const ex = await prisma.exchangeRequest.findMany({
        where: { OR: [{ fromUserId: userId }, { toUserId: userId }] },
        include: { fromBooking: { include: { slot: true } }, toSlot: true },
        orderBy: { createdAt: "desc" }
      });
      return res.json({ ok: true, data: ex });
    }
  } catch (e) { next(e); }
});

router.get("/profile", requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).user.uid as number;
    const user = await prisma.user.findUnique({ where: { id: userId }, include: { ownerships: { include: { property: true } } } });
    res.json({ ok: true, data: user });
  } catch (e) { next(e); }
});

router.patch(
  "/profile",
  requireAuth,
  validateBody(z.object({ firstName: z.string().optional(), lastName: z.string().optional(), phone: z.string().optional(), email: z.string().email().optional(), language: z.string().optional() })),
  async (req, res, next) => {
    try {
      const userId = (req as any).user.uid as number;
      const data = (req as any).data;
      const user = await prisma.user.update({ where: { id: userId }, data });
      res.json({ ok: true, data: user });
    } catch (e) { next(e); }
  }
);

router.post("/admin/:id/confirm", requireAuth, requireRole("ADMIN"), async (req, res, next) => {
  try { const id = Number(req.params.id); const updated = await moderateBooking(id, "CONFIRM"); res.json({ ok: true, data: updated }); }
  catch (e) { next(e); }
});

router.post("/admin/:id/decline", requireAuth, requireRole("ADMIN"), async (req, res, next) => {
  try { const id = Number(req.params.id); const updated = await moderateBooking(id, "DECLINE"); res.json({ ok: true, data: updated }); }
  catch (e) { next(e); }
});

export default router;