import { NextResponse } from "next/server";

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_REDIRECT_URI = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/auth/google/callback`;

// Google OAuth authorization URL
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

export async function GET() {
    // Check if Google OAuth is configured
    if (!GOOGLE_CLIENT_ID) {
        return NextResponse.json(
            { error: "Google OAuth is not configured. Please set GOOGLE_CLIENT_ID in your environment variables." },
            { status: 500 }
        );
    }

    // Build the authorization URL
    const params = new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: GOOGLE_REDIRECT_URI,
        response_type: "code",
        scope: "openid email profile",
        access_type: "offline",
        prompt: "consent",
    });

    const authUrl = `${GOOGLE_AUTH_URL}?${params.toString()}`;

    // Redirect to Google's OAuth consent screen
    return NextResponse.redirect(authUrl);
}
