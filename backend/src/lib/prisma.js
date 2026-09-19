import { PrismaClient } from "@prisma/client";

// Một instance PrismaClient dùng chung cho cả app, tránh mở quá nhiều connection.
export const prisma = new PrismaClient();
