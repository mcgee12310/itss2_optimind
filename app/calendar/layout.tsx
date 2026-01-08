import AppLayout from "@/components/app/AppLayout";

export default function CalendarLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <AppLayout>{children}</AppLayout>;
}
