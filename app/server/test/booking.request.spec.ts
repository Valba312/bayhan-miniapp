import { describe, it, expect } from "vitest";
import { PrismaClient } from "@prisma/client";
import { requestBooking } from "../src/services/bookingService";

const prisma = new PrismaClient();

describe("Booking request", () => {
  it("creates PENDING booking for open slot", async () => {
    const slot = await prisma.bookingSlot.findFirst({ where: { propertyId: 1, isOpen: true } });
    if (!slot) throw new Error("No open slot in seed");
    const user = await prisma.user.findFirst({ where: { tgId: "1001" } });
    if (!user) throw new Error("Seed user 1001 not found");

    const booking = await requestBooking(user.id, slot.id, "test");
    expect(booking.status).toBe("PENDING");
    await prisma.booking.delete({ where: { id: booking.id } });
  });
});