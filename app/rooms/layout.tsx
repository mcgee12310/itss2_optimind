"use server";

import AppLayout from "@/components/app/AppLayout";
import StreamWrapper from "@/components/rooms/stream-wrapper";
import { getCurrentUser } from "@/utils/auth-server";
import React from "react";

const StudyRoomLayout = async ({ children }: { children: React.ReactNode }) => {
	const user = await getCurrentUser();

	return (
		<AppLayout>
			<StreamWrapper user={user}>{children}</StreamWrapper>
		</AppLayout>
	);
};

export default StudyRoomLayout;
