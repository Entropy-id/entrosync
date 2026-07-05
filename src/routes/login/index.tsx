import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { getSessionServerFn } from "#/modules/auth/auth.api";
import { LoginPage } from "#/ui/auth/section/LoginPage";

export const Route = createFileRoute("/login/")({
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

	const handleNavigateToRegister = () => {
		navigate({ to: "/register" });
	};

	return (
		<div className="min-h-screen bg-black text-white font-inter">
			<LoginPage onToggle={handleNavigateToRegister} />
		</div>
	);
}
