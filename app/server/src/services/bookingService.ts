import { prisma } from "../db/prisma";
import { ApiError } from "../middlewares/error";
import { ensureOwnership, rotateQueueAfterConfirm } from "./queueService";
import { notifyAdmins, notifyUser } from "./notificationService";

const rateMap = new Map<number, number[]>();
function checkRateLimit(userId: number) {
  const now = Date.now();
  const arr = rateMap.get(userId) || [];
  const lastMin = arr.filter((t) => now - t < 60000);
  lastMin.push(now);
  rateMap.set(userId, lastMin);
  if (lastMin.length > 5) throw new ApiError(429, "Too many booking requests, try later");
}

export async function listProperties() {
  return prisma.property.findMany({ include: { ownerships: true } });
}

export async function listSlots(propertyId: number, from?: Date, to?: Date) {
  return prisma.bookingSlot.findMany({
    where: {
      propertyId,
      startDate: from ? { gte: from } : undefined,
      endDate: to ? { lte: to } : undefined
    },
    include: { bookings: { where: { status: { in: ["CONFIRMED", "PENDING"] } } } },
    orderBy: { startDate: "asc" }
  });
}

export async function requestBooking(userId: number, slotId: number, note?: string) {
  checkRateLimit(userId);

  const slot = await prisma.bookingSlot.findUnique({ where: { id: slotId } });
  if (!slot || slot.slotType === "BLOCKED") throw new ApiError(400, "Slot unavailable");
  if (!slot.isOpen) {
    const existing = await prisma.booking.findFirst({ where: { slotId, status: { in: ["CONFIRMED", "PENDING"] } } });
    if (existing) throw new ApiError(409, "Slot already reserved");
  }
  const owns = await ensureOwnership(userId, slot.propertyId);
  if (!owns) throw new ApiError(403, "You don't own a share in this property");

  const existingActive = await prisma.booking.findFirst({ where: { userId, slotId, status: { in: ["PENDING", "CONFIRMED"] } } });
  if (existingActive) throw new ApiError(409, "You already have a booking for this slot");

  const booking = await prisma.booking.create({ data: { userId, slotId, note, status: "PENDING" } });
  await notifyAdmins(`🆕 Новая заявка на бронь #${booking.id}`);
  return booking;
}

export async function moderateBooking(bookingId: number, action: "CONFIRM" | "DECLINE") {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { slot: true } });
  if (!booking) throw new ApiError(404, "Booking not found");
  if (booking.status !== "PENDING") throw new ApiError(400, "Booking already moderated");

  if (action === "DECLINE") {
    const declined = await prisma.booking.update({ where: { id: bookingId }, data: { status: "DECLINED" } });
    await notifyUser(declined.userId, `❌ Ваша заявка #${declined.id} отклонена`);
    return declined;
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.bookingSlot.update({ where: { id: booking.slotId }, data: { isOpen: false } });
    const confirmed = await tx.booking.update({ where: { id: booking.id }, data: { status: "CONFIRMED" } });
    await rotateQueueAfterConfirm(confirmed.userId, booking.slot);
    return confirmed;
  });

  await notifyUser(result.userId, `✅ Ваша бронь #${result.id} подтверждена`);
  return result;
}