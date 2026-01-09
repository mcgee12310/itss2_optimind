import { NextResponse } from "next/server";
import { getCurrentUser } from "@/utils/auth-server";
import { StreamClient } from "@stream-io/node-sdk";

// Cache để tránh tạo client nhiều lần
let cachedClient: StreamClient | null = null;

function getStreamClient(): StreamClient {
  if (cachedClient) return cachedClient;

  const apiKey = process.env.STREAM_API_KEY as string;
  const apiSecret = process.env.STREAM_API_SECRET as string;

  if (!apiKey || !apiSecret) {
    throw new Error("Stream credentials missing in env");
  }

  cachedClient = new StreamClient(apiKey, apiSecret);
  return cachedClient;
}

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      console.warn("No user found in token request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = getStreamClient();

    const exp = Math.round(new Date().getTime() / 1000) + 60 * 60; // 1 hour
    const iat = Math.floor(Date.now() / 1000) - 60;

    const token = client.generateUserToken({
      user_id: user.id,
      exp,
      iat,
    }) as string;

    // console.log("Token generated successfully for user:", user.id);

    return NextResponse.json(
      { token, user: { id: user.id, username: user.username } },
      {
        headers: {
          "Cache-Control": "private, max-age=3600",
        },
      }
    );
  } catch (error: any) {
    console.error("Token generation error:", error.message);
    return NextResponse.json(
      { error: "Failed to generate token - " + error.message },
      { status: 500 }
    );
  }
}
