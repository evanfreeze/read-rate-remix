import bycrypt from "bcrypt";
import { createCookieSessionStorage, redirect } from "remix";
import { prisma } from "./db.server";

type LoginForm = {
    email: string;
    password: string;
};

type SignUpForm = {
    email: string;
    password: string;
};

export async function signUp({ email, password }: SignUpForm) {
    const passwordHash = await bycrypt.hash(password, 10);
    return prisma.user.create({
        data: { email, passwordHash },
    });
}

export async function login({ email, password }: LoginForm) {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) return null;

    const isCorrectPassword = await bycrypt.compare(password, user.passwordHash);

    if (isCorrectPassword) {
        return user;
    }

    return null;
}

const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
    throw new Error("SESSION_SECRET must be set");
}

const storage = createCookieSessionStorage({
    cookie: {
        name: "rr_app_session",
        secure: process.env.VERCEL_ENV === "development" ? false : true,
        secrets: [sessionSecret],
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // roughly a week
        httpOnly: true,
    },
});

export async function createUserSession(userId: string, redirectTo: string) {
    const session = await storage.getSession();
    session.set("userId", userId);
    return redirect(redirectTo, {
        headers: {
            "Set-Cookie": await storage.commitSession(session),
        },
    });
}

export async function getUserSession(request: Request) {
    return storage.getSession(request.headers.get("Cookie"));
}

export async function getUserId(request: Request) {
    const session = await getUserSession(request);
    const userId = session.get("userId");
    if (!userId || typeof userId !== "string") return null;
    return userId;
}

export async function requireUserId(request: Request, redirectTo: string = new URL(request.url).pathname) {
    const session = await getUserSession(request);
    const userId = session.get("userId");
    if (!userId || typeof userId !== "string") {
        const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
        throw redirect(`/login?${searchParams}`);
    }
    return userId;
}

export async function getUser(request: Request) {
    const userId = await getUserId(request);
    if (typeof userId !== "string") {
        return null;
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        return user;
    } catch {
        throw logout(request);
    }
}

export async function logout(request: Request) {
    const session = await storage.getSession(request.headers.get("Cookie"));
    return redirect("/login", {
        headers: {
            "Set-Cookie": await storage.destroySession(session),
        },
    });
}
