import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "HR_MANAGER" | "EMPLOYEE";
  companyId: string | null;
  companyName?: string;
}

const JWT_SECRET = process.env.JWT_SECRET || "iqamatrack_jwt_secret_super_secure_key_2026_riyadh";
const COOKIE_NAME = "iqamatrack_session";

/**
 * Hash password securely
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Verify password against stored hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate JWT session token
 */
export function generateToken(payload: SessionUser): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

/**
 * Verify JWT session token
 */
export function verifyToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionUser;
  } catch {
    return null;
  }
}

/**
 * Get current session user in Next.js Server Components / Route Handlers
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded) return null;

    // Verify user in database if possible
    try {
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        include: { company: true },
      });

      if (user) {
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as "SUPER_ADMIN" | "HR_MANAGER" | "EMPLOYEE",
          companyId: user.companyId,
          companyName: user.company?.companyName,
        };
      }
    } catch {
      // In serverless cold starts or when DB connection is busy, trust verified token
    }

    return decoded;
  } catch {
    return null;
  }
}

/**
 * Check role authorization
 */
export function hasRequiredRole(
  userRole: string,
  allowedRoles: Array<"SUPER_ADMIN" | "HR_MANAGER" | "EMPLOYEE">
): boolean {
  return allowedRoles.includes(userRole as "SUPER_ADMIN" | "HR_MANAGER" | "EMPLOYEE");
}
