import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { LoginPage } from "#/ui/auth/section/LoginPage";
import { RegisterPage } from "#/ui/auth/section/RegisterPage";

export const Route = createFileRoute("/auth/")({
	component: RouteComponent,
});

function RouteComponent() {
	const [isLogin, setIsLogin] = useState(true);

	const handleToggle = () => {
		setIsLogin((prev) => !prev);
	};

	return (
		<div className="min-h-screen bg-black text-white font-inter">
			{isLogin ? (
				<LoginPage onToggle={handleToggle} />
			) : (
				<RegisterPage onToggle={handleToggle} />
			)}
		</div>
	);
}
