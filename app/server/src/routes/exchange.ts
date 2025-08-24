import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../auth/jwt";
import { validateBody } from "../middlewares/validate";
import { acceptExchange, createExchangeRequest, declineExchange, searchExchange } from "../services/exchangeService";

const router = Router();

router.get("/search", requireAuth, async (req, res, next) => {
  try {
    const propertyId = req.query.propertyId ? Number(req.query.propertyId) : undefined;
    const from = req.query.from ? new Date(String(req.query.from)) : undefined;
    const to = req.query.to ? new Date(String(req.query.to)) : undefined;
    const result = await searchExchange(propertyId, from, to);
    res.json({ ok: true, data: result });
  } catch (e) { next(e); }
});

router.post(
  "/request",
  requireAuth,
  validateBody(z.object({ fromBookingId: z.number().int(), toSlotId: z.number().int().optional(), message: z.string().max(500).optional() })),
  async (req, res, next) => {
    try {
      const { fromBookingId, toSlotId, message } = (req as any).data as { fromBookingId: number; toSlotId?: number; message?: string; };
      const fromUserId = (req as any).user.uid as number;
      const ex = await createExchangeRequest({ fromUserId, fromBookingId, toSlotId, message });
      res.json({ ok: true, data: ex });
    } catch (e) { next(e); }
  }
);

router.post("/:id/accept", requireAuth, async (req, res, next) => {
  try { const actor = (req as any).user.uid as number; const id = Number(req.params.id); const result = await acceptExchange(id, actor); res.json({ ok: true, data: result }); }
  catch (e) { next(e); }
});

router.post("/:id/decline", requireAuth, async (req, res, next) => {
  try { const actor = (req as any).user.uid as number; const id = Number(req.params.id); const result = await declineExchange(id, actor); res.json({ ok: true, data: result }); }
  catch (e) { next(e); }
});

export default router;