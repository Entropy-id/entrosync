import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LoginPage } from "#/ui/auth/section/LoginPage";

export const Route = createFileRoute("/login/")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();

	const handleNavigateToRegister = () => {
		navigate({ to: "/register" });
	};

	return (
		<div className="min-h-screen bg-black text-white font-inter">
			<LoginPage onToggle={handleNavigateToRegister} />
		</div>
	);
}
