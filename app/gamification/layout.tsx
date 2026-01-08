import AppLayout from "@/components/app/AppLayout";

export default function GamificationLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <AppLayout>{children}</AppLayout>;
}
