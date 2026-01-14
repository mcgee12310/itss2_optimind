import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/auth/google/callback`;

// Google OAuth token endpoint
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

function generateToken(): string {
    return crypto.randomBytes(32).toString("hex");
}

interface GoogleUserInfo {
    id: string;
    email: string;
    name: string;
    picture: string;
    verified_email: boolean;
}

export async function GET(req: Request) {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");

    // Handle errors from Google
    if (error) {
        console.error("Google OAuth error:", error);
        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/login?error=oauth_denied`
        );
    }

    // Check if code is present
    if (!code) {
        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/login?error=no_code`
        );
    }

    // Check if OAuth is configured
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
        console.error("Google OAuth is not configured");
        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/login?error=oauth_not_configured`
        );
    }

    try {
        // Exchange authorization code for access token
        const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                code,
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                redirect_uri: GOOGLE_REDIRECT_URI,
                grant_type: "authorization_code",
            }),
        });

        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.text();
            console.error("Token exchange failed:", errorData);
            return NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/login?error=token_exchange_failed`
            );
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        // Fetch user info from Google
        const userInfoResponse = await fetch(GOOGLE_USERINFO_URL, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!userInfoResponse.ok) {
            console.error("Failed to fetch user info");
            return NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/login?error=userinfo_failed`
            );
        }

        const googleUser: GoogleUserInfo = await userInfoResponse.json();

        // Find or create user in database
        let user = await prisma.user.findUnique({
            where: { email: googleUser.email },
        });

        if (!user) {
            // Create new user
            const username = googleUser.email.split("@")[0] + "_" + Date.now().toString(36);
            user = await prisma.user.create({
                data: {
                    email: googleUser.email,
                    name: googleUser.name,
                    username: username,
                    avatarUrl: googleUser.picture,
                    passwordHash: "", // No password for OAuth users
                    level: 1,
                    exp: 0,
                    experience: 0,
                    coins: 0,
                },
            });
        }

        // Generate auth token
        const token = generateToken();

        // Prepare user data
        const userData = {
            id: user.id,
            email: user.email,
            name: user.name,
            username: user.username,
            avatar: user.avatar,
            avatarUrl: user.avatarUrl || googleUser.picture,
            level: user.level,
            exp: user.exp,
            experience: user.experience,
            coins: user.coins,
        };

        // Create redirect response with cookies
        const redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/study`;
        const res = NextResponse.redirect(redirectUrl);

        // Set auth cookies
        res.cookies.set("auth_token", token, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
        });

        res.cookies.set("user_data", JSON.stringify(userData), {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
        });

        return res;
    } catch (e) {
        console.error("Google OAuth callback error:", e);
        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/login?error=oauth_failed`
        );
    }
}
