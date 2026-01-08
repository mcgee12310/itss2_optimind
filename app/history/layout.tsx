import AppLayout from "@/components/app/AppLayout";

export default function HistoryLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <AppLayout>{children}</AppLayout>;
}
