import type { ReactNode } from "react";

interface AuthLayoutProps {
	leftSide: ReactNode;
	rightSide: ReactNode;
}

export function AuthLayout({ leftSide, rightSide }: AuthLayoutProps) {
	return (
		<div className="min-h-screen bg-black text-white flex">
			{/* left side */}
			<div className="flex-1 flex flex-col justify-between p-8 lg:p-16">
				{leftSide}
			</div>
			{/* right side */}
			<div className="flex-1 flex flex-col justify-between p-8 lg:p-16">
				{rightSide}
			</div>
		</div>
	);
}
