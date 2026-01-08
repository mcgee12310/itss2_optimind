import type { Metadata } from "next";
import "./globals.css";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
	title: "Optimind",
	description: "An AI-powered platform to optimize your mind and boost productivity.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`antialiased`} suppressHydrationWarning>
				{/* <AuthProvider> */}
				{children}
				{/* </AuthProvider> */}
				<Toaster position="top-right" richColors />
			</body>
		</html>
	);
}
