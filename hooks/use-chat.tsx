// Hook to start a chat with a friend
import { useState } from "react";

interface UseChatReturn {
  startChat: (friendId: string) => Promise<string | null>;
  loading: boolean;
  error: string | null;
}

export function useChat(): UseChatReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startChat = async (friendId: string): Promise<string | null> => {
    setLoading(true);
    setError(null);

    try {
      // Create or get existing 1-1 chat room
      const res = await fetch("/api/messages/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberIds: [friendId],
          isGroup: false,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create chat");
      }

      const data = await res.json();
      return data.id; // Return room ID
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start chat");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { startChat, loading, error };
}
