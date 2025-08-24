import { prisma } from "../db/prisma";
import { ApiError } from "../middlewares/error";
import { notifyUser } from "./notificationService";

export async function searchExchange(propertyId?: number, from?: Date, to?: Date) {
  return prisma.bookingSlot.findMany({
    where: {
      ...(propertyId ? { propertyId } : {}),
      isOpen: true,
      startDate: from ? { gte: from } : undefined,
      endDate: to ? { lte: to } : undefined
    },
    include: { property: true },
    orderBy: { startDate: "asc" }
  });
}

export async function createExchangeRequest(params: { fromUserId: number; fromBookingId: number; toSlotId?: number; message?: string; }) {
  const { fromUserId, fromBookingId, toSlotId, message } = params;
  const fromBooking = await prisma.booking.findUnique({ where: { id: fromBookingId }, include: { slot: true } });
  if (!fromBooking || fromBooking.userId !== fromUserId || fromBooking.status !== "CONFIRMED") {
    throw new ApiError(400, "Only CONFIRMED bookings can be offered for exchange");
  }

  let toUserId: number | undefined = undefined;
  if (toSlotId) {
    const toSlot = await prisma.bookingSlot.findUnique({ where: { id: toSlotId }, include: { bookings: { where: { status: "CONFIRMED" } } } });
    if (!toSlot) throw new ApiError(404, "Target slot not found");
    const otherBooking = toSlot.bookings[0];
    if (otherBooking) toUserId = otherBooking.userId;
  }

  const ex = await prisma.exchangeRequest.create({
    data: { fromUserId, toUserId, fromBookingId, toSlotId, status: "PENDING" }
  });

  if (message) {
    await prisma.exchangeMessage.create({ data: { exchangeRequestId: ex.id, senderId: fromUserId, content: message } });
  }

  if (toUserId) await notifyUser(toUserId, `🔁 Вам поступил запрос на обмен #${ex.id}`);
  return ex;
}

export async function acceptExchange(exchangeId: number, actorUserId: number) {
  const ex = await prisma.exchangeRequest.findUnique({
    where: { id: exchangeId },
    include: { fromBooking: { include: { slot: true } }, toSlot: { include: { bookings: { where: { status: "CONFIRMED" } } } } }
  });
  if (!ex) throw new ApiError(404, "Exchange not found");
  if (ex.status !== "PENDING") throw new ApiError(400, "Already processed");

  const otherBooking = ex.toSlot?.bookings?.[0];
  if (otherBooking && otherBooking.userId !== actorUserId) throw new ApiError(403, "Only the target booking owner can accept this exchange");

  const result = await prisma.$transaction(async (tx) => {
    if (otherBooking) {
      await tx.booking.update({ where: { id: ex.fromBookingId }, data: { slotId: otherBooking.slotId, status: "SWAPPED" } });
      await tx.booking.update({ where: { id: otherBooking.id }, data: { slotId: ex.fromBooking.slotId, status: "SWAPPED" } });
    } else if (ex.toSlot) {
      await tx.bookingSlot.update({ where: { id: ex.toSlot.id }, data: { isOpen: false } });
      await tx.bookingSlot.update({ where: { id: ex.fromBooking.slotId }, data: { isOpen: true } });
      await tx.booking.update({ where: { id: ex.fromBookingId }, data: { slotId: ex.toSlot.id } });
    } else {
      throw new ApiError(400, "No target to exchange with");
    }
    return tx.exchangeRequest.update({ where: { id: ex.id }, data: { status: "CONFIRMED" } });
  });

  await notifyUser(ex.fromBooking.userId, `✅ Обмен #${ex.id} подтверждён`);
  if (otherBooking) await notifyUser(otherBooking.userId, `✅ Обмен #${ex.id} подтверждён`);
  return result;
}

export async function declineExchange(exchangeId: number, actorUserId: number) {
  const ex = await prisma.exchangeRequest.findUnique({ where: { id: exchangeId } });
  if (!ex) throw new ApiError(404, "Exchange not found");
  if (ex.fromUserId !== actorUserId && ex.toUserId !== actorUserId) throw new ApiError(403, "Not allowed");
  const updated = await prisma.exchangeRequest.update({ where: { id: ex.id }, data: { status: "DECLINED" } });
  await notifyUser(ex.fromUserId, `❌ Обмен #${ex.id} отклонён`);
  if (ex.toUserId) await notifyUser(ex.toUserId, `❌ Обмен #${ex.id} отклонён`);
  return updated;
}