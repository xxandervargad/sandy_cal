import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  userId?: string;
  phone?: string;
  name?: string;
  isAuthenticated: boolean;
}

export const sessionOptions = {
  password: process.env.SESSION_SECRET || "5Ljg01t9ypWivnxuWghsJCGfKGJ0ciXa",
  cookieName: "sandy_cal_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "strict" as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function createSession(user: {
  id: string;
  phone: string;
  name: string | null;
}) {
  const session = await getSession();
  session.userId = user.id;
  session.phone = user.phone;
  session.name = user.name || undefined;
  session.isAuthenticated = true;
  await session.save();
  return session;
}

export async function destroySession() {
  const session = await getSession();
  session.destroy();
}

export async function isAuthenticated() {
  const session = await getSession();
  return session.isAuthenticated === true && session.userId;
}
