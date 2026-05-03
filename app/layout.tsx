import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
	title: "Optimind - Deep Work",
	icons: {
		icon: "/icon.svg",
	},
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
				{children}
			</body>
		</html>
	);
}
