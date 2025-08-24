import { Router } from "express";
import { z } from "zod";
import { requireAuth, requireRole } from "../auth/jwt";
import { prisma } from "../db/prisma";
import { validateBody } from "../middlewares/validate";

const router = Router();
router.use(requireAuth, requireRole("ADMIN"));

router.get("/users", async (_req, res) => {
  const users = await prisma.user.findMany({ orderBy: { id: "asc" }, include: { ownerships: true } });
  res.json({ ok: true, data: users });
});

router.get("/properties", async (_req, res) => {
  const props = await prisma.property.findMany({ orderBy: { id: "asc" } });
  res.json({ ok: true, data: props.map((p) => ({ ...p, images: JSON.parse(p.images || '[]') })) });
});

router.post(
  "/properties",
  validateBody(z.object({ name: z.string(), description: z.string().optional(), location: z.string().optional(), images: z.array(z.string()).default([]), rooms: z.number().int().optional(), areaM2: z.number().int().optional(), fractionText: z.string().optional() })),
  async (req, res) => {
    const d = (req as any).data;
    const p = await prisma.property.create({ data: { ...d, images: JSON.stringify(d.images) } });
    res.json({ ok: true, data: { ...p, images: JSON.parse(p.images) } });
  }
);

router.patch(
  "/properties/:id",
  validateBody(z.object({ name: z.string().optional(), description: z.string().optional(), location: z.string().optional(), images: z.array(z.string()).optional(), rooms: z.number().int().optional(), areaM2: z.number().int().optional(), fractionText: z.string().optional() })),
  async (req, res) => {
    const id = Number(req.params.id);
    const d = (req as any).data;
    const p = await prisma.property.update({
      where: { id },
      data: { ...d, images: d.images ? JSON.stringify(d.images) : undefined }
    });
    res.json({ ok: true, data: { ...p, images: JSON.parse(p.images) } });
  }
);

router.delete("/properties/:id", async (req, res) => {
  const id = Number(req.params.id);
  await prisma.property.delete({ where: { id } });
  res.json({ ok: true });
});

router.post(
  "/properties/:id/slots",
  validateBody(z.object({ startDate: z.string(), endDate: z.string(), slotType: z.enum(["REGULAR", "HOLIDAY", "BLOCKED"]).default("REGULAR"), isOpen: z.boolean().default(true) })),
  async (req, res) => {
    const propertyId = Number(req.params.id);
    const { startDate, endDate, slotType, isOpen } = (req as any).data;
    const slot = await prisma.bookingSlot.create({ data: { propertyId, startDate: new Date(startDate), endDate: new Date(endDate), slotType, isOpen } });
    res.json({ ok: true, data: slot });
  }
);

router.post(
  "/holidays",
  validateBody(z.object({ date: z.string(), name: z.string() })),
  async (req, res) => {
    const { date, name } = (req as any).data;
    const h = await prisma.holiday.upsert({ where: { date: new Date(date) }, update: { name }, create: { date: new Date(date), name } });
    res.json({ ok: true, data: h });
  }
);

export default router;