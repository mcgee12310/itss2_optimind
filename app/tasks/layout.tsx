import AppLayout from "@/components/app/AppLayout";

export default function TasksLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <AppLayout>{children}</AppLayout>;
}
