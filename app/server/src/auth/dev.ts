import { prisma } from "../db/prisma";
import { signJwt } from "./jwt";

export async function devAuth(userId: string, role?: string) {
  let user = await prisma.user.findFirst({ where: { tgId: String(userId) } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        tgId: String(userId),
        firstName: "Dev",
        lastName: "User",
        username: "dev",
        language: "ru",
        role: role || "OWNER"
      }
    });
  } else if (role && user.role !== role) {
    user = await prisma.user.update({ where: { id: user.id }, data: { role } });
  }
  const token = signJwt({ uid: user.id, role: user.role });
  return { user, token };
}
