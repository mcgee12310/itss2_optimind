"use server";
import { getCurrentUser } from "@/utils/auth-server";

/**
 * Generate a short-lived Stream token for a given user.
 * Calls the API endpoint to get token from server.
 * Returns a Promise that resolves to the token string.
 */
export const tokenProvider = async (): Promise<string> => {
	try {
		const user = await getCurrentUser();
		if (!user) {
			throw new Error("User is not logged in");
		}

		const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
		const response = await fetch(`${baseUrl}/api/auth/token`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
			// Include cookies for authentication
			credentials: "include",
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || "Failed to generate token");
		}

		const data = await response.json();
		return data.token as string;
	} catch (error: any) {
		console.error("Token provider error:", error);
		throw error;
	}
};

export default tokenProvider;
