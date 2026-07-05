import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { getSessionServerFn } from "#/modules/auth/auth.api";
import { RegisterPage } from "#/ui/auth/section/RegisterPage";

export const Route = createFileRoute("/register/")({
	component: RouteComponent,
	beforeLoad: async () => {
		const session = await getSessionServerFn();
		if (session) {
			throw redirect({ to: "/dashboard/admin" });
		}
	},
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
