import { BookingSlot } from "@prisma/client";
import { prisma } from "../db/prisma";

export async function rotateQueueAfterConfirm(userId: number, slot: BookingSlot) {
  const ownership = await prisma.ownership.findFirst({ where: { userId, propertyId: slot.propertyId } });
  if (!ownership) return;

  if (slot.slotType === "HOLIDAY") {
    const max = await prisma.ownership.aggregate({ _max: { holidayQueueIndex: true }, where: { propertyId: slot.propertyId } });
    await prisma.ownership.update({ where: { id: ownership.id }, data: { holidayQueueIndex: (max._max.holidayQueueIndex || 0) + 1 } });
  } else {
    const max = await prisma.ownership.aggregate({ _max: { queueIndex: true }, where: { propertyId: slot.propertyId } });
    await prisma.ownership.update({ where: { id: ownership.id }, data: { queueIndex: (max._max.queueIndex || 0) + 1 } });
  }
}

export async function ensureOwnership(userId: number, propertyId: number) {
  const own = await prisma.ownership.findFirst({ where: { userId, propertyId } });
  return !!own;
}