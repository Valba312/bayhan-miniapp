import { Router } from "express";
import { requireAuth } from "../auth/jwt";
import { listProperties, listSlots } from "../services/bookingService";

const router = Router();

router.get("/", requireAuth, async (_req, res, next) => {
  try { const props = await listProperties(); res.json({ ok: true, data: props }); }
  catch (e) { next(e); }
});

router.get("/:id/slots", requireAuth, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const from = req.query.from ? new Date(String(req.query.from)) : undefined;
    const to = req.query.to ? new Date(String(req.query.to)) : undefined;
    const slots = await listSlots(id, from, to);
    res.json({ ok: true, data: slots });
  } catch (e) { next(e); }
});

export default router;