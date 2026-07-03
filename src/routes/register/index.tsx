import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { RegisterPage } from "#/ui/auth/section/RegisterPage";

export const Route = createFileRoute("/register/")({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();

	const handleNavigateToLogin = () => {
		navigate({ to: "/login" });
	};

	return (
		<div className="min-h-screen bg-black text-white font-inter">
			<RegisterPage onToggle={handleNavigateToLogin} />
		</div>
	);
}
