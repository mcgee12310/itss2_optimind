"use client";

import { ReactNode, useEffect, useState } from "react";
import {
  StreamVideoClient,
  StreamVideo,
} from "@stream-io/video-react-sdk";

interface StreamUser {
  id: string;
  email: string;
  username: string;
}

interface StreamVideoProviderProps {
  user: StreamUser;
  children: ReactNode;
}

export default function StreamVideoProvider({
  user,
  children,
}: StreamVideoProviderProps) {
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const initializeStream = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;

        if (!apiKey) {
          throw new Error("Stream API key missing. Check NEXT_PUBLIC_STREAM_API_KEY in .env");
        }

        // Get token from API endpoint
        const tokenResponse = await fetch("/api/auth/token", {
          method: "GET",
          credentials: "include",
        });

        if (!tokenResponse.ok) {
          const errorData = await tokenResponse.json();
          throw new Error(errorData.error || "Failed to fetch token");
        }

        const { token } = await tokenResponse.json();

        if (!token) {
          throw new Error("No token returned from server");
        }

        const streamClient = new StreamVideoClient({
          apiKey,
          user: {
            id: user.id,
            name: user.username,
          },
          token,
        });

        setClient(streamClient);
      } catch (err: any) {
        console.error("Stream initialization error:", err);
        setError(err.message || "Failed to initialize Stream");
      }
    };

    initializeStream();

    return () => {
      setClient((prevClient) => {
        if (prevClient) {
          prevClient.disconnectUser();
        }
        return null;
      });
    };
  }, [user.id, user.username]);

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  if (!client) {
    return <div className="text-center p-4">Loading Stream...</div>;
  }

  return <StreamVideo client={client}>{children}</StreamVideo>;
}
