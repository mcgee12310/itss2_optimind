import AppLayout from "@/components/app/AppLayout";

export default function StudyLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <AppLayout>{children}</AppLayout>;
}
